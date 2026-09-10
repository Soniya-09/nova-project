const fs = require('fs');
const path = require('path');
const db = require('./db');

// schema.sql only uses CREATE TABLE/INDEX IF NOT EXISTS, so running it
// on every boot is safe — first run creates the schema, later runs no-op.
async function migrate() {
  const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await db.query(sql);
}

module.exports = migrate;
