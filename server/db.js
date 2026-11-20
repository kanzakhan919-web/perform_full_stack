// MongoDB connection, shared by all API requests.
// Every record keeps a numeric `id`, so the website and the links between records
// (owner_id, employee_id, kra_id) keep working.
//
// On Vercel each API call may run in a fresh function, so the connection is cached on
// globalThis and reused while the function stays warm (also survives hot reload in dev).
import { MongoClient } from 'mongodb';
import seed from './seed';
import { collections, validatorFor, countersValidator } from './schema';

export const DB_NAME = process.env.MONGODB_DB || 'perform360';
const COLLECTIONS = Object.keys(collections);

const cache = (globalThis.__perform360Db ??= { promise: null });

// Returns the connected database. Connects (and prepares schemas) only once per server instance.
export function connect() {
  if (!cache.promise) {
    cache.promise = init().catch((e) => {
      cache.promise = null; // retry on the next request
      throw e;
    });
  }
  return cache.promise;
}

async function init() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set. Add it to .env (local) or the Vercel project settings.');
  const client = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 5 });
  await client.connect();
  const db = client.db(DB_NAME);

  for (const name of COLLECTIONS) {
    await applySchema(db, name, validatorFor(name));
    await db.collection(name).createIndex({ id: 1 }, { unique: true });
  }
  await applySchema(db, 'counters', countersValidator);
  // Duplicate employee codes are refused.
  await db.collection('employees').createIndex(
    { code: 1 },
    { unique: true, partialFilterExpression: { code: { $type: 'string', $gt: '' } } }
  );

  if ((await db.collection('employees').countDocuments()) === 0) await seed(db, (c) => nextId(db, c));
  console.log(`Connected to MongoDB database "${DB_NAME}"`);
  return db;
}

// Creates the collection with its schema, or updates the schema if the collection already exists.
async function applySchema(db, name, validator) {
  const options = { validator, validationLevel: 'strict', validationAction: 'error' };
  const exists = (await db.listCollections({ name }, { nameOnly: true }).toArray()).length > 0;
  if (exists) await db.command({ collMod: name, ...options });
  else await db.createCollection(name, options);

  // A new schema is not checked against documents that are already stored, so check them here.
  const invalid = await db.collection(name).countDocuments({ $nor: [validator] });
  if (invalid) console.warn(`⚠ ${invalid} document(s) in "${name}" do not match the schema`);
}

// Next numeric id for a collection (1, 2, 3 …), stored in the `counters` collection.
export async function nextId(db, collection) {
  const r = await db.collection('counters').findOneAndUpdate(
    { _id: collection },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return r.seq;
}
