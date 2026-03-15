import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { runInSandbox } from './sandbox.js';
import { browserService } from './browser.js';
import multer from 'multer';
import path from 'path';
import { put } from '@vercel/blob';
import { autonomaService } from './autonoma.js';

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'UV_INS_2025_JWT_SECRET_SUPER_SECURE_KEY';

if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not set. Database operations will fail.');
}

// --- Audit Log Helper ---
const createAuditLog = async (tenant_id: string, action: string, entity_type: string, entity_id?: string, old_values?: any, new_values?: any, req?: express.Request) => {
  try {
    await prisma.audit_logs.create({
      data: {
        tenant_id,
        action,
        entity_type,
        entity_id,
        old_values: old_values ? JSON.stringify(old_values) : null,
        new_values: new_values ? JSON.stringify(new_values) : null,
        ip_address: req?.ip || null,
        user_agent: req?.get('user-agent') || null,
      }
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
};

const verifyPassword = (plain: string, hashed: string): boolean => {
  if (!plain || !hashed) return false;
  if (!hashed.startsWith('uv_hash_')) return plain === hashed;
  const SALT = process.env.AUTH_SALT || 'UV_INS_2025_SECURE_SALT';
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

const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies.auth_token;
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const tenant = await prisma.tenants.findUnique({ where: { id: decoded.id } });
    if (!tenant) {
      res.status(401).json({ error: 'Tenant no longer exists' });
      return;
    }
    if (!tenant.is_active) {
      res.status(401).json({ error: 'Account is disabled' });
      return;
    }

    const agencyId = (tenant as any).parent_id || tenant.id;

    (req as any).user = {
      ...decoded,
      agency_id: agencyId,
      parent_id: (tenant as any).parent_id
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// --- Multer Configuration for Vercel (Memory Storage) ---
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const PORT = process.env.PORT || 3001;

// --- AI Underwriting Engine ---
const calculateRiskScore = (customer: any) => {
  let score = 50;
  const highRiskJobs = ['construction', 'mining', 'driver', 'pilot'];
  const lowRiskJobs = ['it', 'software', 'banking', 'teacher', 'doctor'];

  if (customer.occupation) {
    const occ = customer.occupation.toLowerCase();
    if (highRiskJobs.some(j => occ.includes(j))) score += 15;
    if (lowRiskJobs.some(j => occ.includes(j))) score -= 10;
  }

  if (customer.annual_income) {
    const income = Number(customer.annual_income);
    if (income < 300000) score += 10;
    if (income > 1500000) score -= 10;
  }

  return Math.max(0, Math.min(100, score));
};

// --- Auth Endpoints ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  try {
    const tenant = await prisma.tenants.findUnique({ where: { email: email.toLowerCase() } });
    if (!tenant || !verifyPassword(password, tenant.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign({ id: tenant.id, role: tenant.role || 'owner' }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    const profile = await prisma.profiles.findFirst({ where: { tenant_id: tenant.id } });
    await createAuditLog(tenant.id, 'login', 'tenant', tenant.id, null, null, req);
    res.json({ tenant, profile });
  } catch (err) {
    console.error(`[Auth] Database error during login for ${email}:`, err);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Database connection failed. Please check your DATABASE_URL.',
      details: process.env.NODE_ENV === 'development' ? String(err) : undefined
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

app.get('/api/auth/me', async (req, res) => {
  let token = req.cookies.auth_token;
  if (!token) {
    const authHeader = req.headers['authorization'] as string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const tenant = await prisma.tenants.findUnique({ where: { id: decoded.id } });
    if (!tenant) return res.status(404).json({ error: 'User not found' });
    const profile = await prisma.profiles.findFirst({ where: { tenant_id: tenant.id } });
    res.json({ tenant, profile });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// --- Unified Resource Handlers ---
app.get('/api/customers', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { role, userId } = req.query;

  const where: any = { tenant_id: user.agency_id };
  
  // If explicitly requested for a specific user or restricted by role
  if (role === 'employee' && userId) {
    where.assigned_to = String(userId);
  }

  const data = await prisma.customers.findMany({
    where,
    include: { customer_policies: true, documents: true },
    orderBy: { created_at: 'desc' }
  });
  res.json(data);
});

app.post('/api/customers', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const data = req.body;
  
  const customer = await prisma.customers.create({
    data: {
      ...data,
      tenant_id: user.agency_id,
      assigned_to: data.assigned_to || user.id,
      annual_income: data.annual_income ? parseFloat(data.annual_income) : null,
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null
    }
  });

  await createAuditLog(user.agency_id, 'create', 'customer', customer.id, null, customer, req);
  
  // --- Autonoma AI Insight Generation ---
  try {
    const insight = await autonomaService.generateInsight('customer', customer.id, customer);
    if (insight) {
      await prisma.ai_insights.create({
        data: {
          tenant_id: user.agency_id,
          insight_type: insight.insight_type,
          entity_type: 'customer',
          entity_id: customer.id,
          confidence_score: insight.confidence_score,
          insight_data: insight.insight_data,
          actionable_recommendations: insight.recommendations
        }
      });
    }
  } catch (err) {
    console.error('Failed to generate Autonoma insight for new customer:', err);
  }

  res.status(201).json(customer);
});

app.patch('/api/customers/:id', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  const updates = req.body;

  const before = await prisma.customers.findUnique({ where: { id: String(id) } });
  const customer = await prisma.customers.update({
    where: { id: String(id) },
    data: {
      ...updates,
      annual_income: updates.annual_income ? parseFloat(String(updates.annual_income)) : undefined,
      date_of_birth: updates.date_of_birth ? new Date(String(updates.date_of_birth)) : undefined
    }
  });

  await createAuditLog(user.agency_id, 'update', 'customer', String(id), before, customer, req);
  res.json(customer);
});

app.delete('/api/customers/:id', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  
  const before = await prisma.customers.findUnique({ where: { id: String(id) } });
  await prisma.customers.delete({ where: { id: String(id) } });
  
  await createAuditLog(user.agency_id, 'delete', 'customer', String(id), before, null, req);
  res.json({ success: true });
});

app.get('/api/policies', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { role, userId, customerId } = req.query;

  const where: any = { tenant_id: user.agency_id };
  if (role === 'employee' && userId) {
    where.customer = { assigned_to: String(userId) };
  }
  if (customerId) {
    where.customer_id = String(customerId);
  }

  const data = await prisma.customer_policies.findMany({
    where,
    include: { customer: true },
    orderBy: { created_at: 'desc' }
  });
  res.json(data);
});

app.post('/api/policies', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const policy = await prisma.customer_policies.create({
    data: {
      ...req.body,
      tenant_id: user.agency_id,
      sum_assured: req.body.sum_assured ? parseFloat(String(req.body.sum_assured)) : null,
      premium_amount: req.body.premium_amount ? parseFloat(String(req.body.premium_amount)) : null,
      start_date: req.body.start_date ? new Date(String(req.body.start_date)) : null,
      end_date: req.body.end_date ? new Date(String(req.body.end_date)) : null,
    }
  });
  await createAuditLog(user.agency_id, 'create', 'policy', policy.id, null, policy, req);
  
  // --- Autonoma AI Insight Generation for Policy ---
  try {
    const insight = await autonomaService.generateInsight('policy', policy.id, policy);
    if (insight) {
      await prisma.ai_insights.create({
        data: {
          tenant_id: user.agency_id,
          insight_type: insight.insight_type,
          entity_type: 'policy',
          entity_id: policy.id,
          confidence_score: insight.confidence_score,
          insight_data: insight.insight_data,
          actionable_recommendations: insight.recommendations
        }
      });
    }
  } catch (err) {
    console.error('Failed to generate Autonoma insight for new policy:', err);
  }

  res.status(201).json(policy);
});

app.get('/api/audit_logs', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const data = await prisma.audit_logs.findMany({
    where: { tenant_id: user.agency_id },
    orderBy: { created_at: 'desc' },
    take: 200
  });
  res.json(data);
});

// --- File Storage Endpoints ---

app.post('/api/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const user = (req as any).user;
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const fileName = `${user.agency_id}-${uniqueSuffix}${path.extname(req.file.originalname)}`;

  try {
    const blob = await put(fileName, req.file.buffer, {
      access: 'public', // Documents are handled via signed URLs or redirects if private, but Vercel Blob access is usually URL-based
    });

    res.json({
      file_name: fileName,
      original_name: req.file.originalname,
      file_url: blob.url,
      file_size: req.file.size,
      file_type: req.file.mimetype
    });
  } catch (err) {
    console.error('Vercel Blob upload failed:', err);
    res.status(500).json({ error: 'Failed to upload file to storage' });
  }
});

app.get('/api/documents/file/:filename', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { filename } = req.params;
  
  // Security check: filename must belong to the user's agency
  if (typeof filename !== 'string' || !filename.startsWith(user.agency_id)) {
    return res.status(403).json({ error: 'Access denied: File does not belong to your agency' });
  }

  // Find document in database to get the Vercel Blob URL
  const doc = await prisma.documents.findFirst({
    where: { file_name: filename as string }
  });

  if (!doc) {
    return res.status(404).json({ error: 'Document record not found' });
  }

  // Security check: if not owner, must be uploader
  if (user.role !== 'owner' && doc.uploaded_by !== user.id) {
    return res.status(403).json({ error: 'Access denied: You are not authorized to view this document' });
  }

  // Redirect to the actual Vercel Blob URL (the file_url stored in DB)
  res.redirect(doc.file_url);
});

// --- Dynamic Table Handlers ---
const tables = ['documents', 'notifications', 'claims', 'commissions', 'leads', 'renewals', 'premium_payments', 'family_members', 'endorsements', 'message_templates', 'compliance_reports', 'knowledge_articles', 'employees', 'ai_insights'];

tables.forEach(table => {
  app.get(`/api/${table}`, requireAuth, async (req, res) => {
    const user = (req as any).user;
    try {
      const data = await (prisma as any)[table].findMany({
        where: { tenant_id: user.agency_id },
        orderBy: { created_at: 'desc' }
      });
      res.json(data);
    } catch (err) {
      // Some tables might not have created_at or legacy schema issues
      const data = await (prisma as any)[table].findMany({
        where: { tenant_id: user.agency_id }
      });
      res.json(data);
    }
  });

  app.post(`/api/${table}`, requireAuth, async (req, res) => {
    const user = (req as any).user;
    const item = await (prisma as any)[table].create({
      data: { ...req.body, tenant_id: user.agency_id }
    });
    await createAuditLog(user.agency_id, 'create', table, item.id, null, item, req);
    res.status(201).json(item);
  });

  app.patch(`/api/${table}/:id`, requireAuth, async (req, res) => {
    const user = (req as any).user;
    const { id } = req.params;
    const before = await (prisma as any)[table].findFirst({ where: { id: String(id), tenant_id: user.agency_id } });
    if (!before) return res.status(404).json({ error: 'Item not found' });
    
    const item = await (prisma as any)[table].update({
      where: { id: String(id) },
      data: { ...req.body }
    });
    await createAuditLog(user.agency_id, 'update', table, String(id), before, item, req);
    res.json(item);
  });

  app.delete(`/api/${table}/:id`, requireAuth, async (req, res) => {
    const user = (req as any).user;
    const { id } = req.params;
    const before = await (prisma as any)[table].findFirst({ where: { id: String(id), tenant_id: user.agency_id } });
    if (!before) return res.status(404).json({ error: 'Item not found' });
    
    await (prisma as any)[table].delete({ where: { id: String(id) } });
    await createAuditLog(user.agency_id, 'delete', table, String(id), before, null, req);
    res.json({ success: true });
  });
});

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      db: 'connected', 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    });
  } catch (err) {
    console.error('[Health] DB Health check failed:', err);
    res.status(503).json({ 
      status: 'error', 
      db: 'disconnected', 
      error: String(err) 
    });
  }
});

// Static assets for local development
if (process.env.NODE_ENV !== 'production' && fs.existsSync(join(process.cwd(), 'dist'))) {
  app.use(express.static(join(process.cwd(), 'dist')));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(join(process.cwd(), 'dist', 'index.html'));
  });
}

export default app;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}