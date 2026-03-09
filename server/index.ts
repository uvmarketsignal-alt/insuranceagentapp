import express from 'express';
import cors from 'cors';
import path from 'path';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import { JSONFilePreset } from 'lowdb/node';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'UV_INS_2025_JWT_SECRET_SUPER_SECURE_KEY';

const verifyPassword = (plain: string, hashed: string): boolean => {
  if (!plain || !hashed) return false;
  if (!hashed.startsWith('uv_hash_')) return plain === hashed;
  const SALT = 'UV_INS_2025_SECURE_SALT';
  const salted = SALT + plain + SALT;
  let hash = 5381;
  for (let i = 0; i < salted.length; i++) {
    hash = ((hash << 5) + hash) ^ salted.charCodeAt(i);
    hash = hash & hash;
  }
  return `uv_hash_${Math.abs(hash)}` === hashed;
};

const hashPassword = (plain: string): string => {
  if (!plain) return '';
  const SALT = process.env.AUTH_SALT || 'UV_INS_2025_SECURE_SALT';
  const salted = SALT + plain + SALT;
  let hash = 5381;
  for (let i = 0; i < salted.length; i++) {
    hash = ((hash << 5) + hash) ^ salted.charCodeAt(i);
    hash = hash & hash;
  }
  return `uv_hash_${Math.abs(hash)}`;
};

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies.auth_token;
  console.log('requireAuth Check -> Headers:', req.headers.cookie);
  console.log('requireAuth Check -> Parsed Cookies:', req.cookies);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

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
app.use(cookieParser());

// Global JSON error handler to prevent crashes on bad payloads
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    console.error('Bad JSON Payload:', err.message);
    res.status(400).send({ status: 400, message: 'Invalid JSON format' });
    return;
  }
  next(err);
});

const PORT = 3001;

// --- Auth Endpoints ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  const tenant = db.data.tenants.find((t: any) => t.email.toLowerCase() === email.toLowerCase());
  if (!tenant || !verifyPassword(password, tenant.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: tenant.id, role: tenant.role || 'owner' }, JWT_SECRET, { expiresIn: '1d' });
  
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  const profile = db.data.profiles.find((p: any) => p.tenant_id === tenant.id) || null;
  res.json({ tenant, profile });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const tenant = db.data.tenants.find((t: any) => t.id === decoded.id);
    if (!tenant) return res.status(404).json({ error: 'User not found' });
    
    const profile = db.data.profiles.find((p: any) => p.tenant_id === tenant.id) || null;
    res.json({ tenant, profile });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Auth Data Fetching & Tenant Management
app.get('/api/tenants', requireAuth, (req, res) => {
  let data = db.data.tenants;
  Object.keys(req.query).forEach(key => {
    if (req.query[key] !== undefined && key !== 'include_profile') {
      data = data.filter((item: any) => String(item[key]) === String(req.query[key]));
    }
  });

  if (req.query.include_profile === 'true') {
    data = data.map((t: any) => {
      const profile = db.data.profiles.find((p: any) => p.tenant_id === t.id);
      return { ...t, profile };
    });
  }

  res.json(data);
});

app.post('/api/tenants', requireAuth, async (req, res) => {
  const newTenant = { 
    id: crypto.randomUUID(), 
    created_at: new Date(), 
    updated_at: new Date(), 
    ...req.body 
  };
  
  if (newTenant.password) {
    newTenant.password = hashPassword(newTenant.password);
  }
  
  db.data.tenants.push(newTenant);
  await db.write();

  if (req.body.profile) {
    db.data.profiles.push({
      tenant_id: newTenant.id,
      ...req.body.profile,
      created_at: new Date(),
      updated_at: new Date()
    });
    await db.write();
  }

  res.status(201).json(newTenant);
});

app.get('/api/tenants/:id', requireAuth, (req, res) => {
  const tenant = db.data.tenants.find((t: any) => t.id === req.params.id);
  res.json(tenant || null);
});

app.patch('/api/tenants/:id', requireAuth, async (req, res) => {
  const index = db.data.tenants.findIndex((t: any) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Tenant not found' });
  
  const updates = { ...req.body, updated_at: new Date() };
  if (updates.password) {
    updates.password = hashPassword(updates.password);
  }

  db.data.tenants[index] = { ...db.data.tenants[index], ...updates };
  await db.write();
  res.json(db.data.tenants[index]);
});

app.get('/api/profiles/:tenantId', requireAuth, (req, res) => {
  const profile = db.data.profiles.find((p: any) => p.tenant_id === req.params.tenantId);
  res.json(profile || null);
});

app.patch('/api/profiles/:tenantId', requireAuth, async (req, res) => {
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
  app.get(`/api/${table}`, requireAuth, (req, res) => {
    let data = db.data[table];
    Object.keys(req.query).forEach(key => {
      if (req.query[key]) {
        data = data.filter((item: any) => String(item[key]) === String(req.query[key]));
      }
    });
    res.json(data);
  });

  app.post(`/api/${table}`, requireAuth, async (req, res) => {
    const newItem = { id: crypto.randomUUID(), created_at: new Date(), updated_at: new Date(), ...req.body };
    db.data[table].push(newItem);
    await db.write();
    res.status(201).json(newItem);
  });

  app.patch(`/api/${table}/:id`, requireAuth, async (req, res) => {
    const index = db.data[table].findIndex((item: any) => item.id === req.params.id);
    if (index === -1) return res.status(404).send('Not found');
    db.data[table][index] = { ...db.data[table][index], ...req.body, updated_at: new Date() };
    await db.write();
    res.json(db.data[table][index]);
  });

  app.delete(`/api/${table}/:id`, requireAuth, async (req, res) => {
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
app.patch('/api/notifications/mark-read', requireAuth, async (req, res) => {
  const { tenant_id, id } = req.body;
  db.data.notifications.forEach((n: any) => {
    if (id && n.id === id) n.is_read = true;
    else if (!id && n.tenant_id === tenant_id) n.is_read = true;
  });
  await db.write();
  res.json({ success: true });
});

app.get('/api/leads/export', requireAuth, (req, res) => {
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

app.get('/api/customers/export', requireAuth, (req, res) => {
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
  app.get(/^\/(.*)/, (req, res) => {
    res.sendFile(join(process.cwd(), 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
