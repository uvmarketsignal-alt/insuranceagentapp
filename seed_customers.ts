import { Pool } from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { faker } from '@faker-js/faker';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runSeed() {
  try {
    console.log('Connecting to Neon Database...');
    
    // 1. Let's make sure the tables exist
    // We created 'tenants' already, now create customers and customer_policies
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        date_of_birth TIMESTAMP,
        gender VARCHAR(50),
        occupation VARCHAR(255),
        annual_income DECIMAL,
        address TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        assigned_to VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_policies (
        id VARCHAR(255) PRIMARY KEY,
        customer_id VARCHAR(255) NOT NULL,
        tenant_id VARCHAR(255) NOT NULL,
        policy_type VARCHAR(100) NOT NULL,
        policy_number VARCHAR(100) NOT NULL UNIQUE,
        insurer VARCHAR(255) NOT NULL,
        sum_assured DECIMAL,
        premium_amount DECIMAL,
        premium_frequency VARCHAR(50),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      );
    `);
    
    console.log('Ensured customers and customer_policies tables exist.');

    // 2. We need a tenant to attach these customers to
    const { rows: tenants } = await pool.query('SELECT * FROM tenants LIMIT 1;');
    if (tenants.length === 0) {
      console.log('No tenants found. Please run the original seed.ts script first.');
      return;
    }
    const tenantId = tenants[0].id;
    console.log(`Using Tenant ID: ${tenantId} (${tenants[0].name})`);

    // 3. Generate 5 random customers with Faker
    console.log('Generating 5 dummy customers with policies...');
    let insertedCount = 0;

    for (let i = 0; i < 5; i++) {
        const customerId = crypto.randomUUID();
        
        // Insert Customer
        await pool.query(
            `INSERT INTO customers (id, tenant_id, full_name, phone, email, date_of_birth, gender, occupation, annual_income, address, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
            [
                customerId,
                tenantId,
                faker.person.fullName(),
                faker.phone.number(),
                faker.internet.email(),
                faker.date.birthdate(),
                faker.person.sex(),
                faker.person.jobTitle(),
                faker.number.int({ min: 40000, max: 250000 }),
                faker.location.streetAddress(),
                faker.helpers.arrayElement(['active', 'pending', 'inactive'])
            ]
        );

        // Generate 1 to 2 random policies for each customer
        const policyCount = faker.number.int({ min: 1, max: 2 });
        for (let p = 0; p < policyCount; p++) {
            const startDate = faker.date.past();
            const endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1); // 1 year policy
            
            await pool.query(
                `INSERT INTO customer_policies (id, customer_id, tenant_id, policy_type, policy_number, insurer, sum_assured, premium_amount, premium_frequency, start_date, end_date, status, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
                [
                    crypto.randomUUID(),
                    customerId,
                    tenantId,
                    faker.helpers.arrayElement(['Life', 'Health', 'Auto', 'Home', 'Travel']),
                    `POL-${faker.string.alphanumeric(8).toUpperCase()}`,
                    faker.company.name() + ' Insurance',
                    faker.number.int({ min: 10000, max: 1000000 }), // Sum assured
                    faker.number.int({ min: 50, max: 1000 }), // Premium
                    faker.helpers.arrayElement(['Monthly', 'Quarterly', 'Annually']),
                    startDate,
                    endDate,
                    faker.helpers.arrayElement(['active', 'expired', 'cancled'])
                ]
            );
        }
        
        insertedCount++;
    }

    console.log(`Successfully generated and inserted ${insertedCount} customers with their policies!`);
    
    console.log('\n--- Checking Neon Database Content ---');
    const { rows: allCustomers } = await pool.query('SELECT * FROM customers;');
    const { rows: allPolicies } = await pool.query('SELECT * FROM customer_policies;');
    console.log(`Total rows in "customers" table: ${allCustomers.length}`);
    console.log(`Total rows in "customer_policies" table: ${allPolicies.length}`);

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await pool.end();
  }
}

runSeed();
