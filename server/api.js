// All /api logic (MongoDB). Called by the Next.js route handler in app/api/[...path]/route.js,
// so it runs on Vercel as a serverless function and locally with `npm run dev`.
//
//   GET    /api/health              connection status (pings MongoDB)
//   GET    /api/dashboard           summary numbers
//   GET    /api/export/employees    CSV report
//   GET    /api/:table              list records
//   POST   /api/:table              create a record
//   PUT    /api/:table/:id          update a record
//   DELETE /api/:table/:id          delete a record
import { connect, nextId } from './db';
import { collections } from './schema';

// Fields set by the server, never by the client.
const SERVER_FIELDS = new Set(['id', 'created_at', 'final_score', 'rating']);

// Everything below is derived from server/schema.js, so the API and MongoDB always agree.
//   tables[name]   → fields the client may write
//   required[name] → fields that must have a value (period is filled in automatically)
//   kinds[field]   → 'ref' (id of another record), 'number' or 'text'
const tables = {};
const required = {};
const kinds = {};
for (const [name, { fields, required: req }] of Object.entries(collections)) {
  tables[name] = Object.keys(fields).filter((f) => !SERVER_FIELDS.has(f));
  required[name] = req.filter((f) => !SERVER_FIELDS.has(f) && f !== 'period');
  for (const [f, spec] of Object.entries(fields)) {
    const types = [].concat(spec.bsonType || []);
    kinds[f] = f.endsWith('_id') ? 'ref' : types.includes('double') ? 'number' : 'text';
  }
}

// Which collection each reference field points to.
const REFERENCES = { owner_id: 'employees', employee_id: 'employees', kra_id: 'kras' };
// Records that point to an employee / KRA (checked before deleting it).
const REFERENCED_BY = {
  employees: [['kras', 'owner_id'], ['kpis', 'owner_id'], ['okrs', 'owner_id'], ['appraisals', 'employee_id'], ['feedback', 'employee_id']],
  kras: [['kpis', 'kra_id']],
};

const label = (f) => f.replace(/_id$/, '').replace(/_/g, ' ');
const NO_MONGO_ID = { projection: { _id: 0 } };
const ratingFor = (s) =>
  s >= 90 ? 'Excellent' : s >= 80 ? 'Very Good' : s >= 70 ? 'Good' : s >= 60 ? 'Needs Improvement' : 'Unsatisfactory';
const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const round = (n) => (n == null ? null : Math.round(n));
const average = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : null);

const httpError = (status, message) => Object.assign(new Error(message), { status });
const badRequest = (message) => httpError(400, message);
const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

// Converts one value to the type the schema expects, or throws a 400 with a clear message.
function convert(field, value) {
  const kind = kinds[field];
  if (value === null || (typeof value === 'string' && value.trim() === '' && kind !== 'text')) return null;
  if (kind === 'text') {
    if (typeof value === 'object') throw badRequest(`${label(field)} must be text`);
    return String(value).trim();
  }
  const n = Number(value);
  if (typeof value === 'boolean' || !Number.isFinite(n)) throw badRequest(`${label(field)} must be a number`);
  if (n < 0) throw badRequest(`${label(field)} cannot be negative`);
  if (kind === 'ref' && !Number.isInteger(n)) throw badRequest(`${label(field)} is not a valid record`);
  return n;
}

// Builds a clean document from the request body: only schema fields, correct types,
// required fields present, and references pointing to records that exist.
async function readBody(db, table, body, existing) {
  const isNew = !existing;
  const doc = {};
  for (const k of tables[table]) if (body[k] !== undefined) doc[k] = convert(k, body[k]);
  if (!Object.keys(doc).length) throw badRequest('No fields supplied');

  for (const k of required[table]) {
    const value = k in doc ? doc[k] : isNew ? undefined : existing[k];
    if (value == null || value === '') throw badRequest(`${label(k)} is required`);
  }

  for (const [k, target] of Object.entries(REFERENCES)) {
    if (doc[k] == null) continue;
    if (!(await db.collection(target).countDocuments({ id: doc[k] }, { limit: 1 }))) {
      throw badRequest(`Selected ${label(k)} does not exist`);
    }
  }

  if (table === 'appraisals') {
    // Score and rating are always calculated on the server (from the saved values when a field is not sent).
    const all = { ...existing, ...doc };
    doc.final_score = Math.round((all.kpi_score || 0) * 0.5 + (all.competency_score || 0) * 0.25 + (all.goal_score || 0) * 0.25);
    doc.rating = ratingFor(doc.final_score);
    if (isNew && !doc.period) doc.period = 'Q4 2026';
  }
  return doc;
}

async function readJson(request) {
  const text = await request.text();
  if (!text) return {};
  try {
    const body = JSON.parse(text);
    if (body && typeof body === 'object' && !Array.isArray(body)) return body;
  } catch {}
  throw badRequest('Request body must be a JSON object');
}

async function findRecord(db, table, rawId) {
  const id = Number(rawId);
  const record = Number.isInteger(id) && (await db.collection(table).findOne({ id }));
  if (!record) throw httpError(404, 'Record not found');
  return record;
}

// ---------- Route handlers ----------

async function health() {
  const started = Date.now();
  try {
    const db = await connect();
    await db.command({ ping: 1 });
    return json({ backend: 'connected', db: 'connected', database: db.databaseName, pingMs: Date.now() - started });
  } catch (e) {
    return json({ backend: 'connected', db: 'disconnected', error: e.message }, 503);
  }
}

async function dashboard(db) {
  const [employees, appraisals, kpis] = await Promise.all([
    db.collection('employees').find({}, NO_MONGO_ID).toArray(),
    db.collection('appraisals').find({}, NO_MONGO_ID).toArray(),
    db.collection('kpis').find({}, NO_MONGO_ID).toArray(),
  ]);
  const scores = (list) => list.map((a) => a.final_score).filter((s) => typeof s === 'number');

  const depts = [...new Set(employees.map((e) => e.department))].sort();
  const byDept = depts.map((department) => {
    const ids = new Set(employees.filter((e) => e.department === department).map((e) => e.id));
    return {
      department,
      employees: ids.size,
      score: round(average(scores(appraisals.filter((a) => ids.has(a.employee_id))))),
    };
  });

  return json({
    employees: employees.length,
    avg: round(average(scores(appraisals))) || 0,
    kpi: round(average(kpis.map((k) => k.progress).filter((p) => typeof p === 'number'))) || 0,
    appraisals: appraisals.length,
    byDept,
  });
}

async function exportEmployees(db) {
  const employees = await db.collection('employees').find({}, NO_MONGO_ID).sort({ id: 1 }).toArray();
  const appraisals = await db.collection('appraisals').find({}, NO_MONGO_ID).sort({ id: 1 }).toArray();
  const cols = ['code', 'name', 'department', 'designation', 'manager', 'period', 'kpi_score', 'competency_score', 'goal_score', 'final_score', 'rating'];
  const rows = [];
  for (const e of employees) {
    const own = appraisals.filter((a) => a.employee_id === e.id);
    (own.length ? own : [{}]).forEach((a) => rows.push({ ...a, ...e }));
  }
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => '"' + String(r[c] ?? '').replaceAll('"', '""') + '"').join(','))].join('\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="Perform360_Report.csv"',
      'Cache-Control': 'no-store',
    },
  });
}

async function list(db, t) {
  const rows = await db.collection(t).find({}, NO_MONGO_ID).sort({ id: 1 }).toArray();
  if (['kpis', 'kras', 'okrs', 'appraisals', 'feedback'].includes(t)) {
    // Add the employee's name (and department, used by the website's filters). Not stored in MongoDB.
    const emps = await db.collection('employees').find({}, { projection: { _id: 0, id: 1, name: 1, department: 1 } }).toArray();
    const byId = Object.fromEntries(emps.map((e) => [e.id, e]));
    rows.forEach((r) => {
      if (r.owner_id) r.owner = byId[r.owner_id]?.name;
      if (r.employee_id) {
        r.employee = byId[r.employee_id]?.name;
        r.employee_department = byId[r.employee_id]?.department;
      }
    });
  }
  return json(rows);
}

async function create(db, t, request) {
  const doc = await readBody(db, t, await readJson(request), null);
  if ('created_at' in collections[t].fields) doc.created_at = now();
  const id = await nextId(db, t);
  await db.collection(t).insertOne({ id, ...doc });
  return json({ id, success: true });
}

async function update(db, t, rawId, request) {
  const existing = await findRecord(db, t, rawId);
  const doc = await readBody(db, t, await readJson(request), existing);
  await db.collection(t).updateOne({ id: existing.id }, { $set: doc });
  return json({ success: true });
}

async function remove(db, t, rawId) {
  const existing = await findRecord(db, t, rawId);
  // Do not leave KPIs, appraisals, etc. pointing to a record that no longer exists.
  for (const [other, field] of REFERENCED_BY[t] || []) {
    const n = await db.collection(other).countDocuments({ [field]: existing.id });
    if (n) throw badRequest(`Cannot delete: ${n} record(s) in ${other.replace('_', ' ')} still use it. Delete or change those first.`);
  }
  await db.collection(t).deleteOne({ id: existing.id });
  return json({ success: true });
}

// ---------- Router ----------

// Picks the handler for a request. `path` is the URL after /api/, split into parts.
export async function handleApi(request, path = []) {
  const method = request.method;
  const [first, second, ...rest] = path;

  try {
    if (method === 'GET' && first === 'health' && !second) return await health();

    const db = await connect();
    if (method === 'GET' && first === 'dashboard' && !second) return await dashboard(db);
    if (method === 'GET' && first === 'export' && second === 'employees' && !rest.length) return await exportEmployees(db);

    if (!first || rest.length) return json({ error: 'Not found' }, 404);
    if (!tables[first]) return json({ error: 'Unknown resource' }, 404);

    if (!second) {
      if (method === 'GET') return await list(db, first);
      if (method === 'POST') return await create(db, first, request);
    } else {
      if (method === 'PUT') return await update(db, first, second, request);
      if (method === 'DELETE') return await remove(db, first, second);
    }
    return json({ error: 'Method not allowed' }, 405);
  } catch (e) {
    if (e.code === 11000) return json({ error: 'Employee code already exists' }, 400);
    if (e.code === 121) {
      console.error('Schema validation failed:', JSON.stringify(e.errInfo?.details));
      return json({ error: 'Data does not match the database schema' }, 400);
    }
    if (e.status) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: e.message }, 500);
  }
}
