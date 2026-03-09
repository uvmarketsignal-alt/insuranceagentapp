import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'server', 'db.json');

const hashPassword = (plain) => {
  const SALT = 'UV_INS_2025_SECURE_SALT';
  const salted = SALT + plain + SALT;
  let hash = 5381;
  for (let i = 0; i < salted.length; i++) {
    hash = ((hash << 5) + hash) ^ salted.charCodeAt(i);
    hash = hash & hash;
  }
  return `uv_hash_${Math.abs(hash)}`;
};

const defaultData = {
  tenants: [
    {
      id: "tenant-1",
      email: "uv@uvinsurance.in",
      password: hashPassword("UV@Owner2025"),
      name: "UV Insurance Agency",
      role: "owner",
      created_at: new Date().toISOString()
    },
     {
      id: "employee-1",
      parent_id: "tenant-1",
      email: "raghul@uvinsurance.in",
      password: hashPassword("Raghul@Emp2025"),
      name: "Raghul",
      role: "employee",
      created_at: new Date().toISOString()
    },
     {
      id: "employee-2",
      parent_id: "tenant-1",
      email: "vasu@uvinsurance.in",
      password: hashPassword("Vasu@Emp2025"),
      name: "Vasu",
      role: "employee",
      created_at: new Date().toISOString()
    }
  ],
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

fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
console.log('Database seeded with test accounts successfully!');
