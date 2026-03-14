import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'server', 'db.json');

const AGENCY_ID = 'tenant-1';
const EMPLOYEES = ['employee-1', 'employee-2'];
const USERS = [AGENCY_ID, ...EMPLOYEES];

const hashPassword = (plain: string) => {
  const SALT = 'UV_INS_2025_SECURE_SALT';
  const salted = SALT + plain + SALT;
  let hash = 5381;
  for (let i = 0; i < salted.length; i++) {
    hash = ((hash << 5) + hash) ^ salted.charCodeAt(i);
    hash = hash & hash;
  }
  return `uv_hash_${Math.abs(hash)}`;
};

const INSURERS = ['HDFC ERGO', 'ICICI Lombard', 'Star Health', 'TATA AIG', 'New India Assurance'];
const POLICY_TYPES = ['health', 'life', 'motor', 'property', 'travel'];

async function generateData() {
  console.log('🚀 Starting Premium Data Generation...');

  const customers = [];
  const policies = [];
  const claims = [];
  const leads = [];
  const notifications = [];
  const audit_logs = [];
  const ai_insights = [];
  const commissions = [];
  const renewals = [];

  // 1. Generate Customers
  for (let i = 0; i < 60; i++) {
    const id = crypto.randomUUID();
    const assignedTo = faker.helpers.arrayElement(USERS);
    const riskScore = faker.number.int({ min: 10, max: 90 });
    const flags = riskScore > 75 ? ['High loss potential', 'Policy history mismatch'] : [];

    customers.push({
      id,
      created_at: faker.date.past({ years: 1 }).toISOString(),
      updated_at: new Date().toISOString(),
      tenant_id: AGENCY_ID,
      full_name: faker.person.fullName(),
      phone: faker.phone.number({ style: 'international' }),
      email: faker.internet.email(),
      date_of_birth: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }).toISOString(),
      gender: faker.helpers.arrayElement(['male', 'female', 'other']),
      occupation: faker.person.jobTitle(),
      annual_income: faker.number.int({ min: 300000, max: 5000000 }),
      address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.zipCode()}`,
      status: faker.helpers.arrayElement(['approved', 'approved', 'approved', 'pending', 'rejected']),
      assigned_to: assignedTo,
      risk_score: riskScore,
      ai_underwriting_flags: flags
    });

    // 2. Generate Policies for some customers
    if (faker.datatype.boolean(0.85)) {
      const numPolicies = faker.number.int({ min: 1, max: 2 });
      for (let j = 0; j < numPolicies; j++) {
        const pId = crypto.randomUUID();
        const policyType = faker.helpers.arrayElement(POLICY_TYPES);
        const insurer = faker.helpers.arrayElement(INSURERS);

        // Mix of active and expired for retention calculation
        const isExpired = faker.datatype.boolean(0.15);
        const now = new Date();
        const startDate = isExpired
          ? faker.date.past({ years: 2 })
          : faker.date.between({
            from: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
            to: now
          });

        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);

        const premiumAmount = faker.number.int({ min: 8000, max: 80000 });
        policies.push({
          id: pId,
          created_at: startDate.toISOString(),
          updated_at: startDate.toISOString(),
          customer_id: id,
          tenant_id: AGENCY_ID,
          policy_type: policyType,
          policy_number: `POL-${faker.string.alphanumeric(10).toUpperCase()}`,
          insurer,
          sum_assured: faker.number.int({ min: 200000, max: 10000000 }),
          premium_amount: premiumAmount,
          premium_frequency: faker.helpers.arrayElement(['monthly', 'quarterly', 'yearly']),
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: endDate < new Date() ? 'expired' : 'active',
          metadata: {
            payment_mode: faker.helpers.arrayElement(['online', 'check', 'cash']),
            grace_period: '30'
          }
        });

        // 3. Generate Claims for some policies
        if (faker.datatype.boolean(0.12)) {
          claims.push({
            id: crypto.randomUUID(),
            created_at: faker.date.recent().toISOString(),
            updated_at: new Date().toISOString(),
            policy_id: pId,
            customer_id: id,
            tenant_id: AGENCY_ID,
            claim_number: `CLM-${faker.string.numeric(8)}`,
            amount: faker.number.int({ min: 50000, max: 500000 }),
            status: faker.helpers.arrayElement(['Filed', 'Review', 'Approved', 'Settled']),
            description: faker.lorem.sentence(),
            incident_date: faker.date.recent().toISOString()
          });
        }

        // Generate Commissions 
        commissions.push({
          id: crypto.randomUUID(),
          policy_id: pId,
          tenant_id: AGENCY_ID,
          employee_id: assignedTo,
          commission_rate: 15,
          commission_amount: premiumAmount * 0.15,
          is_paid: faker.datatype.boolean(0.7),
          created_at: startDate.toISOString()
        });

        // Generate Renewals for active policies
        if (endDate > new Date() && endDate < faker.date.future({ years: 0.1 })) {
          renewals.push({
            id: crypto.randomUUID(),
            policy_id: pId,
            tenant_id: AGENCY_ID,
            renewal_date: endDate.toISOString(),
            status: 'pending',
            notified: faker.datatype.boolean(),
            processed: false,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    // 4. Generate AI Insights for some
    if (faker.datatype.boolean(0.4)) {
      ai_insights.push({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        customer_id: id,
        tenant_id: AGENCY_ID,
        risk_score: faker.number.int({ min: 20, max: 95 }),
        sentiment: faker.helpers.arrayElement(['positive', 'neutral', 'negative']),
        recommendations: [
          `Suggest ${faker.helpers.arrayElement(POLICY_TYPES)} top-up`,
          `Cross-sell ${faker.helpers.arrayElement(POLICY_TYPES)} insurance`
        ]
      });
    }
  }

  // 5. Generate Leads
  for (let i = 0; i < 30; i++) {
    leads.push({
      id: crypto.randomUUID(),
      created_at: faker.date.recent({ days: 30 }).toISOString(),
      updated_at: new Date().toISOString(),
      tenant_id: AGENCY_ID,
      full_name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      status: faker.helpers.arrayElement(['new', 'contacted', 'qualified', 'converted', 'lost']),
      source: faker.helpers.arrayElement(['website', 'referral', 'cold_call', 'ad_campaign']),
      interest_type: faker.helpers.arrayElement(POLICY_TYPES),
      assigned_to: faker.helpers.arrayElement(USERS)
    });
  }

  // 6. Generate Notifications
  for (let i = 0; i < 15; i++) {
    notifications.push({
      id: crypto.randomUUID(),
      created_at: faker.date.recent().toISOString(),
      updated_at: new Date().toISOString(),
      tenant_id: faker.helpers.arrayElement(USERS),
      title: faker.helpers.arrayElement(['New Lead Assigned', 'Policy Renewal Due', 'Claim Approved', 'System Update']),
      message: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['info', 'warning', 'success', 'error']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
      is_read: faker.datatype.boolean(0.3)
    });
  }

  const data = {
    tenants: [
      {
        id: "tenant-1",
        email: "uvmarketsignal@gmail.com",
        password: hashPassword("UVT@Owner2026"),
        name: "UV Insurance Agency",
        role: "owner",
        created_at: "2026-01-01T00:00:00.000Z"
      },
      {
        id: "employee-1",
        parent_id: "tenant-1",
        email: "vasusiva78@gmail.com",
        password: hashPassword("Vasu@Emp2026"),
        name: "Raghul",
        role: "employee",
        created_at: "2026-01-02T00:00:00.000Z"
      },
      {
        id: "employee-2",
        parent_id: "tenant-1",
        email: "employee2@uvinsurance.in",
        password: hashPassword("Vasu@Emp2026"),
        name: "Vasu",
        role: "employee",
        created_at: "2026-01-03T00:00:00.000Z"
      }
    ],
    profiles: USERS.map(u => ({
      tenant_id: u,
      full_name: u === 'tenant-1' ? 'Agency Owner' : (u === 'employee-1' ? 'Raghul Employee' : 'Vasu Employee'),
      phone: faker.phone.number(),
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })),
    customers,
    policies,
    claims,
    leads,
    notifications,
    ai_insights,
    audit_logs: [],
    documents: [],
    commissions,
    renewals,
    premium_payments: [],
    family_members: [],
    endorsements: [],
    message_templates: [],
    compliance_reports: [],
    knowledge_articles: [],
    security_events: [],
    performance_metrics: []
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  console.log(`✅ Success! Seeded:
    - ${customers.length} Customers
    - ${policies.length} Policies
    - ${claims.length} Claims
    - ${leads.length} Leads
    - ${ai_insights.length} AI Insights
  `);
}

generateData().catch(console.error);
