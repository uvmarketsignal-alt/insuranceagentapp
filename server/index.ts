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
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const tenant = db.data.tenants.find((t: any) => t.id === decoded.id);
    if (!tenant) {
      res.status(401).json({ error: 'Tenant no longer exists' });
      return;
    }
    
    // Scoped ID for data filtering (Agency ID)
    const agencyId = tenant.parent_id || tenant.id;
    
    (req as any).user = {
      ...decoded,
      agency_id: agencyId,
      parent_id: tenant.parent_id
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'db.json');

interface DbData {
  tenants: any[];
  profiles: any[];
  customers: any[];
  policies: any[];
  documents: any[];
  audit_logs: any[];
  notifications: any[];
  claims: any[];
  commissions: any[];
  leads: any[];
  renewals: any[];
  premium_payments: any[];
  family_members: any[];
  endorsements: any[];
  message_templates: any[];
  compliance_reports: any[];
  knowledge_articles: any[];
  ai_insights: any[];
  security_events: any[];
  performance_metrics: any[];
}

const defaultData: DbData = {
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

const db = await JSONFilePreset<DbData>(DB_PATH, defaultData);

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    res.status(400).send({ status: 400, message: 'Invalid JSON format' });
    return;
  }
  next(err);
});

const PORT = process.env.PORT || 3001;

// --- AI Undewriting Engine ---
const calculateRiskScore = (customer: any) => {
    let score = 50;
    
    // Occupation based
    const highRiskJobs = ['construction', 'mining', 'driver', 'pilot'];
    const lowRiskJobs = ['it', 'software', 'banking', 'teacher', 'doctor'];
    
    if (customer.occupation) {
        const occ = customer.occupation.toLowerCase();
        if (highRiskJobs.some(j => occ.includes(j))) score += 15;
        if (lowRiskJobs.some(j => occ.includes(j))) score -= 10;
    }

    // Income based
    if (customer.annual_income) {
        const income = Number(customer.annual_income);
        if (income < 300000) score += 10;
        if (income > 1500000) score -= 10;
    }

    // Age based
    if (customer.date_of_birth) {
        const age = new Date().getFullYear() - new Date(customer.date_of_birth).getFullYear();
        if (age < 21 || age > 65) score += 10;
    }

    return Math.max(0, Math.min(100, score));
};

const generateAiInsights = (customer: any) => {
    const riskScore = calculateRiskScore(customer);
    const recommendations = [];
    
    if (riskScore > 70) {
        recommendations.push('Require additional medical documentation');
        recommendations.push('Apply 15% loading on premium');
    } else if (riskScore < 30) {
        recommendations.push('Eligible for preferred rates');
        recommendations.push('Offer cross-sell for premium health riders');
    } else {
        recommendations.push('Standard processing recommended');
    }

    return {
        id: crypto.randomUUID(),
        tenant_id: customer.tenant_id,
        insight_type: 'customer_risk',
        entity_type: 'customer',
        entity_id: customer.id,
        confidence_score: 0.92,
        insight_data: {
            risk_score: riskScore,
            risk_level: riskScore > 70 ? 'High' : (riskScore < 30 ? 'Low' : 'Medium'),
            flags: riskScore > 70 ? ['Elevated risk profile'] : []
        },
        actionable_recommendations: recommendations,
        is_reviewed: false,
        created_at: new Date()
    };
};

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
    sameSite: 'lax', // Lax for better dev experience with CORS
    maxAge: 24 * 60 * 60 * 1000
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

app.get('/api/tenants', requireAuth, (req, res) => {
  const user = (req as any).user;
  // Owners see their employees, Employees only see themselves
  let data = db.data.tenants.filter((t: any) => {
    if (user.role === 'owner') {
      return t.id === user.id || t.parent_id === user.id;
    }
    return t.id === user.id;
  });

  Object.keys(req.query).forEach(key => {
    if (req.query[key] !== undefined && !['include_profile', 'tenant_id'].includes(key)) {
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
  const user = (req as any).user;
  if (user.role !== 'owner') return res.status(403).json({ error: 'Only owners can create tenants' });

  const newTenant = { 
    id: crypto.randomUUID(), 
    created_at: new Date(), 
    updated_at: new Date(), 
    parent_id: user.id, // Force link to agency
    ...req.body 
  };
  if (newTenant.password) newTenant.password = hashPassword(newTenant.password);
  db.data.tenants.push(newTenant);
  await db.write();
  if (req.body.profile) {
    db.data.profiles.push({ tenant_id: newTenant.id, ...req.body.profile, created_at: new Date(), updated_at: new Date() });
    await db.write();
  }
  res.status(201).json(newTenant);
});

app.get('/api/tenants/:id', requireAuth, (req, res) => {
  const user = (req as any).user;
  const tenant = db.data.tenants.find((t: any) => t.id === req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Not found' });
  
  // Guard
  if (user.role !== 'owner' && tenant.id !== user.id) return res.status(403).json({ error: 'Unauthorized' });
  if (user.role === 'owner' && tenant.id !== user.id && tenant.parent_id !== user.id) return res.status(403).json({ error: 'Unauthorized' });

  res.json(tenant);
});

app.patch('/api/tenants/:id', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const index = db.data.tenants.findIndex((t: any) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Tenant not found' });
  
  // Guard
  const target = db.data.tenants[index];
  if (user.role !== 'owner' && target.id !== user.id) return res.status(403).json({ error: 'Unauthorized' });

  const updates = { ...req.body, updated_at: new Date() };
  if (updates.password) updates.password = hashPassword(updates.password);
  
  // Never allow changing role or parent_id from client
  delete updates.role;
  delete updates.parent_id;

  db.data.tenants[index] = { ...db.data.tenants[index], ...updates };
  await db.write();
  res.json(db.data.tenants[index]);
});

app.get('/api/profiles/:tenantId', requireAuth, (req, res) => {
  const user = (req as any).user;
  if (user.id !== req.params.tenantId && user.role !== 'owner') return res.status(403).json({ error: 'Unauthorized' });
  
  const profile = db.data.profiles.find((p: any) => p.tenant_id === req.params.tenantId);
  res.json(profile || null);
});

app.patch('/api/profiles/:tenantId', requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (user.id !== req.params.tenantId && user.role !== 'owner') return res.status(403).json({ error: 'Unauthorized' });

  const index = db.data.profiles.findIndex((p: any) => p.tenant_id === req.params.tenantId);
  if (index > -1) {
    db.data.profiles[index] = { ...db.data.profiles[index], ...req.body, updated_at: new Date() };
  } else {
    db.data.profiles.push({ tenant_id: req.params.tenantId, ...req.body, created_at: new Date(), updated_at: new Date() });
  }
  await db.write();
  res.json(db.data.profiles.find((p: any) => p.tenant_id === req.params.tenantId));
});

const handleRequest = (table: any) => {
  app.get(`/api/${table}`, requireAuth, (req, res) => {
    const user = (req as any).user;
    let data = (db.data as any)[table].filter((item: any) => item.tenant_id === user.agency_id);
    
    // Optional: Filter by specific user if role is employee and it's a personal entity
    if (user.role === 'employee' && ['customers', 'leads'].includes(table)) {
        // If agency wide sharing is disabled, we would filter by assigned_to here
        // For now, employees see agency data as per requirements
    }

    Object.keys(req.query).forEach(key => {
      if (req.query[key] && key !== 'tenant_id') {
        data = data.filter((item: any) => String(item[key]) === String(req.query[key]));
      }
    });
    res.json(data);
  });

  app.post(`/api/${table}`, requireAuth, async (req, res) => {
    const user = (req as any).user;
    const newItem = { 
      id: crypto.randomUUID(), 
      created_at: new Date(), 
      updated_at: new Date(), 
      tenant_id: user.agency_id, // Always bind to agency
      ...req.body 
    };

    // AI Underwriting Hook for Customers
    if (table === 'customers') {
        const insight = generateAiInsights(newItem);
        (db.data as any).ai_insights.push(insight);
        newItem.risk_score = insight.insight_data.risk_score;
        newItem.ai_underwriting_flags = insight.insight_data.flags;
    }

    (db.data as any)[table].push(newItem);
    await db.write();
    res.status(201).json(newItem);
  });

  app.patch(`/api/${table}/:id`, requireAuth, async (req, res) => {
    const user = (req as any).user;
    const index = (db.data as any)[table].findIndex((item: any) => item.id === req.params.id && item.tenant_id === user.agency_id);
    if (index === -1) return res.status(404).send('Not found or unauthorized');
    
    const updatedItem = { ...(db.data as any)[table][index], ...req.body, updated_at: new Date() };

    // AI Underwriting Hook for Customer Updates
    if (table === 'customers') {
        const insight = generateAiInsights(updatedItem);
        // Find and update or add new insight
        const insightIndex = db.data.ai_insights.findIndex(i => i.entity_id === updatedItem.id && i.insight_type === 'customer_risk');
        if (insightIndex > -1) {
            db.data.ai_insights[insightIndex] = insight;
        } else {
            db.data.ai_insights.push(insight);
        }
        updatedItem.risk_score = insight.insight_data.risk_score;
        updatedItem.ai_underwriting_flags = insight.insight_data.flags;
    }

    (db.data as any)[table][index] = updatedItem;
    await db.write();
    res.json((db.data as any)[table][index]);
  });

  app.delete(`/api/${table}/:id`, requireAuth, async (req, res) => {
    const user = (req as any).user;
    // Only owner can delete important things? 
    // if (user.role !== 'owner' && table !== 'notifications') return res.status(403).json({ error: 'Forbidden' });

    const exists = (db.data as any)[table].some((item: any) => item.id === req.params.id && item.tenant_id === user.agency_id);
    if (!exists) return res.status(404).send('Not found');

    (db.data as any)[table] = (db.data as any)[table].filter((item: any) => !(item.id === req.params.id && item.tenant_id === user.agency_id));
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

app.patch('/api/notifications/mark-read', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.body;
  
  db.data.notifications.forEach((n: any) => {
    if (n.tenant_id === user.agency_id) {
        if (id && n.id === id) n.is_read = true;
        else if (!id) n.is_read = true;
    }
  });
  await db.write();
  res.json({ success: true });
});

app.get('/api/leads/export', requireAuth, (req, res) => {
  const user = (req as any).user;
  const leads = (db.data as any).leads.filter((l: any) => l.tenant_id === user.agency_id);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
  let csv = 'Full Name,Email,Phone,Status,Source\n';
  leads.forEach((l: any) => { csv += `${l.full_name},${l.email || ''},${l.phone || ''},${l.status},${l.source || ''}\n`; });
  res.send(csv);
});

app.get('/api/customers/export', requireAuth, (req, res) => {
  const user = (req as any).user;
  const customers = (db.data as any).customers.filter((c: any) => c.tenant_id === user.agency_id);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
  let csv = 'Full Name,Email,Phone,Status\n';
  customers.forEach((c: any) => { csv += `${c.full_name},${c.email || ''},${c.phone || ''},${c.status}\n`; });
  res.send(csv);
});

// --- Workflow Engine ---
const processWorkflows = async () => {
    console.log('🔄 Running Workflow Engine...');
    let changes = 0;
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // 1. Check for policies expiring within 30 days
    (db.data as any).policies.forEach((policy: any) => {
        const endDate = new Date(policy.end_date);
        if (endDate > now && endDate <= thirtyDaysFromNow && policy.status === 'active') {
            // Check if notification already exists
            const exists = (db.data as any).notifications.some((n: any) => n.title.includes(policy.policy_number) && !n.is_read);
            if (!exists) {
                (db.data as any).notifications.push({
                    id: crypto.randomUUID(),
                    created_at: new Date(),
                    updated_at: new Date(),
                    tenant_id: policy.tenant_id,
                    title: `Policy Renewal Due: ${policy.policy_number}`,
                    message: `Policy for ${policy.policy_type} is expiring on ${policy.end_date}. Please contact the customer.`,
                    type: 'warning',
                    priority: 'high',
                    is_read: false
                });
                changes++;
            }
        }
    });

    // 2. Auto-mark expired policies
    (db.data as any).policies.forEach((policy: any) => {
        const endDate = new Date(policy.end_date);
        if (endDate < now && policy.status === 'active') {
            policy.status = 'expired';
            policy.updated_at = new Date();
            changes++;
        }
    });

    if (changes > 0) {
        await db.write();
        console.log(`✅ Workflow completed. ${changes} changes made.`);
    } else {
        console.log('ℹ️ No automation triggers found.');
    }
    return changes;
};

// Auto-run every 10 minutes (in production) or shorter for demo
const WORKFLOW_INTERVAL = 10 * 60 * 1000;
setInterval(processWorkflows, WORKFLOW_INTERVAL);

app.post('/api/admin/run-workflows', requireAuth, async (req, res) => {
    const changes = await processWorkflows();
    res.json({ success: true, changes });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', salt_configured: !!process.env.AUTH_SALT }));

if (fs.existsSync(join(process.cwd(), 'dist'))) {
  app.use(express.static(join(process.cwd(), 'dist')));
  app.get(/^\/(.*)/, (req, res) => {
    res.sendFile(join(process.cwd(), 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});