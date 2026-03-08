import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Neon prefers a direct connection or the pooled URL depending on the connection string
// pg Pool will work with the standard Neon connection string given
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// Root endpoint just to show the server is running
app.get('/', (req, res) => {
  res.send('Insurance Agency API is running! Access endpoints at /api/...');
});

// Simple health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT version();');
    res.json({ status: 'ok', message: 'Successfully connected to Neon DB via Express Backend!', version: rows[0].version });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Example endpoint: Fetch all tenants
app.get('/api/tenants', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tenants;');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Example endpoint: Create a new tenant
app.post('/api/tenants', async (req, res) => {
  try {
    const { name, email, password, role, is_active } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO tenants (id, name, email, password, role, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
      [crypto.randomUUID(), name, email, password, role, is_active]
    );
    res.status(201).json(rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const tenantId = req.query.tenant_id;
    let query = 'SELECT * FROM customers';
    let params: string[] = [];
    
    if (tenantId) {
      query += ' WHERE tenant_id = $1';
      params.push(tenantId as string);
    }
    
    // Fetch customers
    const { rows: customers } = await pool.query(query, params);
    
    // For each customer, fetch their policies
    for (let customer of customers) {
      const { rows: policies } = await pool.query(
          'SELECT * FROM customer_policies WHERE customer_id = $1',
          [customer.id]
      );
      customer.policies = policies;
    }
    
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
