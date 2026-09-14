const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  host: 'db.fxayhfctallzpckbbtxm.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Fute14120219-',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const sql = fs.readFileSync('./supabase/migrations/003_player_profile_complete.sql', 'utf8');
  const statements = sql.split(';').filter(s => s.trim().length > 0);
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (stmt) {
      try {
        await client.query(stmt);
        console.log(`[${i + 1}] OK`);
      } catch (err) {
        console.log(`[${i + 1}] WARN: ${err.message.substring(0, 120)}`);
      }
    }
  }
  console.log('Migration 003 executada!');
  await client.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
