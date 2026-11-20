// MongoDB schema for every collection. Applied as a $jsonSchema validator in server/db.js,
// so MongoDB itself refuses documents with missing required fields, wrong types or unknown fields.
//
// Field helpers:
//   text      → string (may be empty)
//   textReq   → non-empty string, required
//   num       → number ≥ 0, or null
//   ref       → id of another record (whole number ≥ 1), or null
//   timestamp → "YYYY-MM-DD HH:MM:SS"

const text = { bsonType: ['string', 'null'] };
const textReq = { bsonType: 'string', minLength: 1 };
const num = { bsonType: ['int', 'long', 'double', 'decimal', 'null'], minimum: 0 };
const ref = { bsonType: ['int', 'long', 'null'], minimum: 1 };
const id = { bsonType: ['int', 'long'], minimum: 1, description: 'Numeric record id used by the website' };
const timestamp = { bsonType: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$' };
const RATINGS = ['Excellent', 'Very Good', 'Good', 'Needs Improvement', 'Unsatisfactory'];

// For each collection: field types, and which fields are required.
const collections = {
  employees: {
    required: ['id', 'code', 'name', 'department', 'created_at'],
    fields: {
      id,
      code: textReq,
      name: textReq,
      department: textReq,
      designation: text,
      manager: text,
      email: text,
      created_at: timestamp,
    },
  },
  job_descriptions: {
    required: ['id', 'title', 'department'],
    fields: {
      id,
      title: textReq,
      department: textReq,
      reports_to: text,
      education: text,
      experience: text,
      responsibilities: text,
      skills: text,
    },
  },
  kras: {
    required: ['id', 'title', 'department'],
    fields: { id, title: textReq, department: textReq, description: text, owner_id: ref },
  },
  kpis: {
    required: ['id', 'title', 'department'],
    fields: {
      id,
      title: textReq,
      department: textReq,
      target: text,
      actual: text,
      progress: num,
      weight: num,
      owner_id: ref,
      kra_id: ref,
    },
  },
  okrs: {
    required: ['id', 'objective', 'department'],
    fields: { id, objective: textReq, key_result: text, department: textReq, progress: num, owner_id: ref },
  },
  appraisals: {
    required: ['id', 'employee_id', 'period', 'final_score', 'rating', 'created_at'],
    fields: {
      id,
      employee_id: { ...ref, bsonType: ['int', 'long'] },
      period: textReq,
      kpi_score: num,
      competency_score: num,
      goal_score: num,
      final_score: { bsonType: ['int', 'long', 'double'], minimum: 0 },
      rating: { enum: RATINGS },
      comments: text,
      created_at: timestamp,
    },
  },
  feedback: {
    required: ['id', 'employee_id', 'created_at'],
    fields: {
      id,
      employee_id: { ...ref, bsonType: ['int', 'long'] },
      category: text,
      comments: text,
      created_at: timestamp,
    },
  },
  training: {
    required: ['id', 'title'],
    fields: { id, title: textReq, audience: text, status: text, notes: text },
  },
};

// Builds the $jsonSchema validator for one collection.
function validatorFor(name) {
  const { required, fields } = collections[name];
  return {
    $jsonSchema: {
      bsonType: 'object',
      title: name,
      required,
      additionalProperties: false,
      properties: { _id: { bsonType: 'objectId' }, ...fields },
    },
  };
}

// Counter documents: { _id: '<collection>', seq: <last id> }
const countersValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['_id', 'seq'],
    additionalProperties: false,
    properties: { _id: { enum: Object.keys(collections) }, seq: { bsonType: ['int', 'long'], minimum: 0 } },
  },
};

export { collections, validatorFor, countersValidator };
