const fs = require('fs');
const pg = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const TENANT_ID = 'fe48b618-42d6-4611-b1ca-133634cedae6';

async function runTestImport() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const content = fs.readFileSync('scripts/test-data.csv', 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const customers = lines.slice(1).filter(l => l.trim()).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i];
      return obj;
    }, {});
  });

  try {
    let count = 0;
    for (const customer of customers) {
      const { full_name, email, phone, status, assigned_to } = customer;
      await pool.query(
        'INSERT INTO customers (id, tenant_id, full_name, email, phone, status, assigned_to, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())',
        [crypto.randomUUID(), TENANT_ID, full_name, email, phone, status || 'pending', assigned_to]
      );
      count++;
    }
    console.log(`Successfully imported ${count} customers to PostgreSQL!`);
  } catch (err) {
    console.error('Import failed:', err.message);
  } finally {
    await pool.end();
  }
}

runTestImport();
