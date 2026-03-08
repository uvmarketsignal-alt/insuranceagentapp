import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const SALT = 'UV_INS_2025_SECURE_SALT';

const hashPassword = (input) => {
  if (!input) return '';
  const salted = SALT + input + SALT;
  let hash = 5381;
  for (let i = 0; i < salted.length; i++) {
    hash = ((hash << 5) + hash) ^ salted.charCodeAt(i);
    hash = hash & hash;
  }
  return `uv_hash_${Math.abs(hash)}`;
};

async function migrate() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const { rows } = await pool.query('SELECT id, password FROM tenants');
    for (const tenant of rows) {
      if (!tenant.password.startsWith('uv_hash_')) {
        const hashed = hashPassword(tenant.password);
        await pool.query('UPDATE tenants SET password = $1 WHERE id = $2', [hashed, tenant.id]);
        console.log(`Updated tenant ${tenant.id}`);
      }
    }
    console.log('Migration complete');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

migrate();
