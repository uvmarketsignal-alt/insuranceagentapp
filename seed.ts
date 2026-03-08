import { Pool } from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const sampleTenants = [
  {
    id: crypto.randomUUID(),
    name: 'Tech Insure',
    email: 'contact@techinsure.com',
    password: 'password123',
    role: 'owner',
    is_active: true
  },
  {
    id: crypto.randomUUID(),
    name: 'Global Coverage',
    email: 'info@globalcoverage.net',
    password: 'password123',
    role: 'owner',
    is_active: true
  },
  {
    id: crypto.randomUUID(),
    name: 'SafeHome Agency',
    email: 'hello@safehome.com',
    password: 'password123',
    role: 'owner',
    is_active: true
  },
  {
    id: crypto.randomUUID(),
    name: 'LifeGuard Brokers',
    email: 'support@lifeguard.inc',
    password: 'password123',
    role: 'owner',
    is_active: true
  },
  {
    id: crypto.randomUUID(),
    name: 'Prime Auto Insurance',
    email: 'sales@primeauto.us',
    password: 'password123',
    role: 'owner',
    is_active: true
  }
];

async function seed() {
  try {
    console.log('Connecting to Neon Database...');
    
    // Create the tenants table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Ensured "tenants" table exists.');

    // Clear existing data (optional, or just insert new ones)
    // await pool.query('DELETE FROM tenants;');

    console.log('Inserting 5 sample tenants...');
    let insertedCount = 0;
    
    for (const tenant of sampleTenants) {
      // Check if email already exists
      const { rows } = await pool.query('SELECT * FROM tenants WHERE email = $1', [tenant.email]);
      if (rows.length === 0) {
        await pool.query(
          `INSERT INTO tenants (id, name, email, password, role, is_active, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [tenant.id, tenant.name, tenant.email, tenant.password, tenant.role, tenant.is_active]
        );
        insertedCount++;
      } else {
        console.log(`Skipping ${tenant.email} - already exists.`);
      }
    }
    
    console.log(`Successfully inserted ${insertedCount} sample tenants.`);

    // Verify exactly what is in the database now
    console.log('\n--- Checking Neon Database Content ---');
    const { rows: allTenants } = await pool.query('SELECT * FROM tenants;');
    console.log(`Total rows in "tenants" table: ${allTenants.length}`);
    console.log(allTenants.slice(0, 5)); // Print up to 5
    
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await pool.end();
  }
}

seed();
