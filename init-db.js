// Crea kohi.db a partir de schema.sql. Idempotente: se puede
// ejecutar sobre una base ya existente sin perder datos.
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'kohi.db');
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

const db = new Database(dbPath);
db.exec(schema);

const { total } = db.prepare('SELECT COUNT(*) AS total FROM waitlist').get();
console.log(`Base lista en ${dbPath} — ${total} registro(s) en waitlist.`);
db.close();
