import express from 'express';
import cors from 'cors';
import path from 'path';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import { JSONFilePreset } from 'lowdb/node';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'db.json');

const SALT = process.env.AUTH_SALT || 'UV_INS_2025_SECURE_SALT_FALLBACK';

// Initialize dummy data if file doesn't exist
const defaultData = {
  tenants: [],
  profiles: [],
  customers: [],
  policies: [],
  documents: [],
  audit_logs: [],
  notifications: [],
  claims: [],
  commissions: [],
  leads: [],
  renewals: [],
  premium_payments: [],
  family_members: [],
  endorsements: [],
  message_templates: [],
  compliance_reports: [],
  knowledge_articles: [],
  ai_insights: [],
  security_events: [],
  performance_metrics: []
};

const db = await JSONFilePreset(DB_PATH, defaultData);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Auth
app.get('/api/tenants', (req, res) => {
  const { email } = req.query;
  const tenants = db.data.tenants.filter((t: any) => t.email === email);
  res.json(tenants);
});

app.get('/api/tenants/:id', (req, res) => {
  const tenant = db.data.tenants.find((t: any) => t.id === req.params.id);
  res.json(tenant || null);
});

app.get('/api/profiles/:tenantId', (req, res) => {
  const profile = db.data.profiles.find((p: any) => p.tenant_id === req.params.tenantId);
  res.json(profile || null);
});

app.patch('/api/profiles/:tenantId', async (req, res) => {
  const index = db.data.profiles.findIndex((p: any) => p.tenant_id === req.params.tenantId);
  if (index > -1) {
    db.data.profiles[index] = { ...db.data.profiles[index], ...req.body, updated_at: new Date() };
  } else {
    db.data.profiles.push({ tenant_id: req.params.tenantId, ...req.body, created_at: new Date(), updated_at: new Date() });
  }
  await db.write();
  res.json(db.data.profiles.find((p: any) => p.tenant_id === req.params.tenantId));
});

// Generic CRUD Helper
const handleRequest = (table: any) => {
  app.get(`/api/${table}`, (req, res) => {
    let data = db.data[table];
    Object.keys(req.query).forEach(key => {
      if (req.query[key]) {
        data = data.filter((item: any) => String(item[key]) === String(req.query[key]));
      }
    });
    res.json(data);
  });

  app.post(`/api/${table}`, async (req, res) => {
    const newItem = { id: crypto.randomUUID(), created_at: new Date(), updated_at: new Date(), ...req.body };
    db.data[table].push(newItem);
    await db.write();
    res.status(201).json(newItem);
  });

  app.patch(`/api/${table}/:id`, async (req, res) => {
    const index = db.data[table].findIndex((item: any) => item.id === req.params.id);
    if (index === -1) return res.status(404).send('Not found');
    db.data[table][index] = { ...db.data[table][index], ...req.body, updated_at: new Date() };
    await db.write();
    res.json(db.data[table][index]);
  });

  app.delete(`/api/${table}/:id`, async (req, res) => {
    db.data[table] = db.data[table].filter((item: any) => item.id !== req.params.id);
    await db.write();
    res.status(204).send();
  });
};

const tables = [
  'customers', 'policies', 'documents', 'audit_logs', 'notifications',
  'claims', 'commissions', 'leads', 'renewals', 'premium_payments',
  'family_members', 'endorsements', 'message_templates', 'compliance_reports',
  'knowledge_articles', 'ai_insights', 'security_events', 'performance_metrics'
];

tables.forEach(handleRequest);

// Specifics
app.patch('/api/notifications/mark-read', async (req, res) => {
  const { tenant_id, id } = req.body;
  db.data.notifications.forEach((n: any) => {
    if (id && n.id === id) n.is_read = true;
    else if (!id && n.tenant_id === tenant_id) n.is_read = true;
  });
  await db.write();
  res.json({ success: true });
});

app.get('/api/leads/export', (req, res) => {
  const { tenant_id } = req.query;
  const leads = db.data.leads.filter((l: any) => l.tenant_id === tenant_id);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
  let csv = 'Full Name,Email,Phone,Status,Source\n';
  leads.forEach((l: any) => {
    csv += `${l.full_name},${l.email || ''},${l.phone || ''},${l.status},${l.source || ''}\n`;
  });
  res.send(csv);
});

app.get('/api/customers/export', (req, res) => {
  const { tenant_id } = req.query;
  const customers = db.data.customers.filter((c: any) => c.tenant_id === tenant_id);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
  let csv = 'Full Name,Email,Phone,Status\n';
  customers.forEach((c: any) => {
    csv += `${c.full_name},${c.email || ''},${c.phone || ''},${c.status}\n`;
  });
  res.send(csv);
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', salt_configured: !!process.env.AUTH_SALT }));

// Serve frontend in production
if (fs.existsSync(join(process.cwd(), 'dist'))) {
  app.use(express.static(join(process.cwd(), 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(process.cwd(), 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
