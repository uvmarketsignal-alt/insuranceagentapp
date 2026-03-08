import { PrismaClient } from './prisma-mock';
import type {
  Tenant,
  Profile,
  Customer,
  Document,
  AuditLog,
  Notification,
  CustomerPolicy,
  Claim,
  Commission,
  Lead,
  Renewal,
  PremiumPayment,
  FamilyMember,
  Endorsement,
  MessageTemplate,
  ComplianceReport,
  KnowledgeArticle
} from '../types';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export class DatabaseService {
  private demoTenants: Tenant[] = [
    {
      id: 'tenant_001',
      name: 'UV',
      email: 'uv@uvinsurance.in',
      password: 'UV@Owner2025',
      role: 'owner',
      is_active: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: 'tenant_002',
      name: 'Raghul',
      email: 'raghul@uvinsurance.in',
      password: 'Raghul@Emp2025',
      role: 'employee',
      is_active: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: 'tenant_003',
      name: 'Vasu',
      email: 'vasu@uvinsurance.in',
      password: 'Vasu@Emp2025',
      role: 'employee',
      is_active: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    }
  ];

  private demoProfiles: Profile[] = [
    {
      id: 'profile_001',
      tenant_id: 'tenant_001',
      full_name: 'UV',
      phone: '+919876543210',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=UV',
      employee_code: 'OWN-001',
      department: 'Management',
      join_date: new Date('2024-01-01'),
      is_active: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: 'profile_002',
      tenant_id: 'tenant_002',
      full_name: 'Raghul',
      phone: '+919876543211',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raghul',
      employee_code: 'EMP-001',
      department: 'Sales',
      join_date: new Date('2024-01-01'),
      is_active: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: 'profile_003',
      tenant_id: 'tenant_003',
      full_name: 'Vasu',
      phone: '+919876543212',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vasu',
      employee_code: 'EMP-002',
      department: 'Operations',
      join_date: new Date('2024-01-01'),
      is_active: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    }
  ];

  // Auth operations
  async getTenantByEmail(email: string): Promise<Tenant | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const tenant = await prisma.tenants.findFirst({
      where: { email: normalizedEmail, is_active: true }
    }) as Promise<Tenant | null>;

    if (tenant) {
      return tenant;
    }

    return this.demoTenants.find(t => t.email.toLowerCase() === normalizedEmail) ?? null;
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    const tenant = await prisma.tenants.findFirst({
      where: { id, is_active: true }
    }) as Promise<Tenant | null>;

    if (tenant) {
      return tenant;
    }

    return this.demoTenants.find(t => t.id === id) ?? null;
  }

  async getProfileByTenantId(tenantId: string): Promise<Profile | null> {
    const profile = await prisma.profiles.findFirst({
      where: { tenant_id: tenantId, is_active: true }
    }) as Promise<Profile | null>;

    if (profile) {
      return profile;
    }

    return this.demoProfiles.find(p => p.tenant_id === tenantId) ?? null;
  }

  async updateTenantPassword(tenantId: string, password: string): Promise<void> {
    await prisma.tenants.update({
      where: { id: tenantId },
      data: { password }
    });
  }

  // Customer operations
  async createCustomer(data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    return prisma.customers.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date()
      }
    }) as Promise<Customer>;
  }

  async getCustomers(tenantId: string): Promise<Customer[]> {
    return prisma.customers.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' }
    }) as Promise<Customer[]>;
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return prisma.customers.findFirst({
      where: { id }
    }) as Promise<Customer | null>;
  }

  async updateCustomerStatus(id: string, status: string, assignedTo?: string): Promise<Customer> {
    return prisma.customers.update({
      where: { id },
      data: {
        status,
        assigned_to: assignedTo,
        updated_at: new Date()
      }
    }) as Promise<Customer>;
  }

  // Policy operations
  async createPolicy(data: Omit<CustomerPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerPolicy> {
    return prisma.customer_policies.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date()
      }
    }) as Promise<CustomerPolicy>;
  }

  async getPolicies(tenantId: string): Promise<CustomerPolicy[]> {
    return prisma.customer_policies.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' }
    }) as Promise<CustomerPolicy[]>;
  }

  // Document operations
  async createDocument(data: Omit<Document, 'id' | 'created_at'>): Promise<Document> {
    return prisma.documents.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date()
      }
    }) as Promise<Document>;
  }

  async getDocuments(tenantId: string): Promise<Document[]> {
    return prisma.documents.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' }
    }) as Promise<Document[]>;
  }

  async getCustomerDocuments(customerId: string): Promise<Document[]> {
    return prisma.documents.findMany({
      where: { customer_id: customerId },
      orderBy: { created_at: 'desc' }
    }) as Promise<Document[]>;
  }

  // Audit log operations
  async createAuditLog(data: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    return prisma.audit_logs.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date()
      }
    }) as Promise<AuditLog>;
  }

  async getAuditLogs(tenantId: string): Promise<AuditLog[]> {
    return prisma.audit_logs.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 100
    }) as Promise<AuditLog[]>;
  }

  // Notification operations
  async createNotification(data: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<Notification> {
    return prisma.notifications.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        is_read: false,
        created_at: new Date()
      }
    }) as Promise<Notification>;
  }

  async getNotifications(tenantId: string): Promise<Notification[]> {
    return prisma.notifications.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 50
    }) as Promise<Notification[]>;
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    return prisma.notifications.update({
      where: { id },
      data: { is_read: true }
    }) as Promise<Notification>;
  }

  async markAllNotificationsAsRead(tenantId: string): Promise<void> {
    await prisma.notifications.updateMany({
      where: { tenant_id: tenantId, is_read: false },
      data: { is_read: true }
    });
  }

  // Claim operations
  async createClaim(data: Omit<Claim, 'id' | 'created_at' | 'updated_at'>): Promise<Claim> {
    return prisma.claims.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date()
      }
    }) as Promise<Claim>;
  }

  async getClaims(tenantId: string): Promise<Claim[]> {
    return prisma.claims.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' }
    }) as Promise<Claim[]>;
  }

  async updateClaimStatus(id: string, status: string): Promise<Claim> {
    return prisma.claims.update({
      where: { id },
      data: {
        status,
        updated_at: new Date()
      }
    }) as Promise<Claim>;
  }

  // Commission operations
  async createCommission(data: Omit<Commission, 'id' | 'created_at'>): Promise<Commission> {
    return prisma.commissions.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date()
      }
    }) as Promise<Commission>;
  }

  async getCommissions(tenantId: string): Promise<Commission[]> {
    return prisma.commissions.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' }
    }) as Promise<Commission[]>;
  }

  async payCommission(id: string): Promise<Commission> {
    return prisma.commissions.update({
      where: { id },
      data: {
        is_paid: true,
        paid_date: new Date()
      }
    }) as Promise<Commission>;
  }

  // Lead operations
  async createLead(data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    return prisma.leads.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date()
      }
    }) as Promise<Lead>;
  }

  async getLeads(tenantId: string): Promise<Lead[]> {
    return prisma.leads.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' }
    }) as Promise<Lead[]>;
  }

  async updateLeadStage(id: string, status: string): Promise<Lead> {
    return prisma.leads.update({
      where: { id },
      data: {
        status,
        updated_at: new Date()
      }
    }) as Promise<Lead>;
  }

  // Renewal operations
  async createRenewal(data: Omit<Renewal, 'id' | 'created_at' | 'notified' | 'processed'>): Promise<Renewal> {
    return prisma.renewals.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        notified: false,
        processed: false,
        created_at: new Date()
      }
    }) as Promise<Renewal>;
  }

  async getRenewals(tenantId: string): Promise<Renewal[]> {
    return prisma.renewals.findMany({
      where: { tenant_id: tenantId },
      orderBy: { renewal_date: 'asc' }
    }) as Promise<Renewal[]>;
  }

  async processRenewal(id: string): Promise<Renewal> {
    return prisma.renewals.update({
      where: { id },
      data: {
        processed: true,
        processed_at: new Date()
      }
    }) as Promise<Renewal>;
  }

  // Premium payment operations
  async createPremiumPayment(data: Omit<PremiumPayment, 'id' | 'created_at'>): Promise<PremiumPayment> {
    return prisma.premium_payments.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date()
      }
    }) as Promise<PremiumPayment>;
  }

  async getPremiumPayments(tenantId: string): Promise<PremiumPayment[]> {
    return prisma.premium_payments.findMany({
      where: { tenant_id: tenantId },
      orderBy: { payment_date: 'desc' }
    }) as Promise<PremiumPayment[]>;
  }

  // Family member operations
  async createFamilyMember(data: Omit<FamilyMember, 'id' | 'created_at'>): Promise<FamilyMember> {
    return prisma.family_members.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date()
      }
    }) as Promise<FamilyMember>;
  }

  async getFamilyMembers(customerId: string): Promise<FamilyMember[]> {
    return prisma.family_members.findMany({
      where: { customer_id: customerId },
      orderBy: { created_at: 'desc' }
    }) as Promise<FamilyMember[]>;
  }

  // Endorsement operations
  async createEndorsement(data: Omit<Endorsement, 'id' | 'created_at' | 'status'>): Promise<Endorsement> {
    return prisma.endorsements.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        status: 'pending',
        created_at: new Date()
      }
    }) as Promise<Endorsement>;
  }

  async getEndorsements(tenantId: string): Promise<Endorsement[]> {
    return prisma.endorsements.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' }
    }) as Promise<Endorsement[]>;
  }

  async approveEndorsement(id: string, approvedBy: string): Promise<Endorsement> {
    return prisma.endorsements.update({
      where: { id },
      data: {
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date()
      }
    }) as Promise<Endorsement>;
  }

  // Message template operations
  async createMessageTemplate(data: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<MessageTemplate> {
    return prisma.message_templates.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date()
      }
    }) as Promise<MessageTemplate>;
  }

  async getMessageTemplates(tenantId: string): Promise<MessageTemplate[]> {
    return prisma.message_templates.findMany({
      where: { tenant_id: tenantId, is_active: true },
      orderBy: { created_at: 'desc' }
    }) as Promise<MessageTemplate[]>;
  }

  // Compliance report operations
  async createComplianceReport(data: Omit<ComplianceReport, 'id' | 'created_at' | 'status'>): Promise<ComplianceReport> {
    return prisma.compliance_reports.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        status: 'draft',
        created_at: new Date()
      }
    }) as Promise<ComplianceReport>;
  }

  async getComplianceReports(tenantId: string): Promise<ComplianceReport[]> {
    return prisma.compliance_reports.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' }
    }) as Promise<ComplianceReport[]>;
  }

  // Knowledge article operations
  async createKnowledgeArticle(data: Omit<KnowledgeArticle, 'id' | 'created_at' | 'updated_at' | 'view_count'>): Promise<KnowledgeArticle> {
    return prisma.knowledge_articles.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        view_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
    }) as Promise<KnowledgeArticle>;
  }

  async getKnowledgeArticles(tenantId: string): Promise<KnowledgeArticle[]> {
    return prisma.knowledge_articles.findMany({
      where: { tenant_id: tenantId, is_published: true },
      orderBy: { created_at: 'desc' }
    }) as Promise<KnowledgeArticle[]>;
  }

  // Employee operations
  async createEmployee(data: Omit<Tenant, 'id' | 'created_at' | 'updated_at'> & { profile: Omit<Profile, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> }): Promise<Tenant> {
    const tenant = await prisma.tenants.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        role: 'employee',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    await prisma.profiles.create({
      data: {
        ...data.profile,
        id: crypto.randomUUID(),
        tenant_id: tenant.id,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return tenant as Tenant;
  }

  async getEmployees(tenantId: string): Promise<Array<Tenant & { profile: Profile }>> {
    console.log('Loading employees for tenant:', tenantId);
    const tenants = await prisma.tenants.findMany({
      where: { role: 'employee' },
      orderBy: { created_at: 'desc' }
    });

    const result = [];
    for (const tenant of tenants) {
      const profile = await prisma.profiles.findFirst({
        where: { tenant_id: tenant.id }
      });
      if (profile) {
        result.push({ ...tenant, profile });
      }
    }

    return result as Array<Tenant & { profile: Profile }>;
  }

  async toggleEmployeeStatus(tenantId: string, isActive: boolean): Promise<Tenant> {
    return prisma.tenants.update({
      where: { id: tenantId },
      data: {
        is_active: isActive,
        updated_at: new Date()
      }
    }) as Promise<Tenant>;
  }

  // Database health check
  async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Premium Feature Methods
  async updateCustomerField(customerId: string, field: string, value: any): Promise<Customer> {
    return prisma.customers.update({
      where: { id: customerId },
      data: { [field]: value, updated_at: new Date() }
    }) as Promise<Customer>;
  }

  async updateCustomerRiskScore(customerId: string, riskScore: number, flags: string[]): Promise<Customer> {
    return prisma.customers.update({
      where: { id: customerId },
      data: { 
        risk_score: riskScore, 
        ai_underwriting_flags: flags,
        updated_at: new Date() 
      }
    }) as Promise<Customer>;
  }

  async createAiInsight(data: Omit<any, 'id' | 'created_at' | 'is_reviewed'>): Promise<any> {
    return prisma.ai_insights.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        is_reviewed: false,
        created_at: new Date()
      }
    });
  }

  async createSecurityEvent(data: Omit<any, 'id' | 'created_at' | 'resolved'>): Promise<any> {
    return prisma.security_events.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        resolved: false,
        created_at: new Date()
      }
    });
  }

  async createPerformanceMetric(data: Omit<any, 'id' | 'created_at'>): Promise<any> {
    return prisma.performance_metrics.create({
      data: {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date()
      }
    });
  }

  async getAiInsights(tenantId: string): Promise<any[]> {
    return prisma.ai_insights.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 50
    });
  }

  async getSecurityEvents(tenantId: string): Promise<any[]> {
    return prisma.security_events.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 50
    });
  }

  async getPerformanceMetrics(tenantId: string): Promise<any[]> {
    return prisma.performance_metrics.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 100
    });
  }

  // Update operations
  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    return prisma.customers.update({
      where: { id: customerId },
      data: {
        ...updates,
        updated_at: new Date()
      }
    }) as Promise<Customer>;
  }

  async deleteCustomer(customerId: string): Promise<void> {
    await prisma.customers.update({
      where: { id: customerId },
      data: {
        status: 'deleted',
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async updatePolicy(policyId: string, updates: Partial<CustomerPolicy>): Promise<CustomerPolicy> {
    return prisma.customer_policies.update({
      where: { id: policyId },
      data: {
        ...updates,
        updated_at: new Date()
      }
    }) as Promise<CustomerPolicy>;
  }

  async deletePolicy(policyId: string): Promise<void> {
    await prisma.customer_policies.update({
      where: { id: policyId },
      data: {
        status: 'deleted',
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async updateLead(leadId: string, updates: Partial<Lead>): Promise<Lead> {
    return prisma.leads.update({
      where: { id: leadId },
      data: {
        ...updates,
        updated_at: new Date()
      }
    }) as Promise<Lead>;
  }

  async deleteLead(leadId: string): Promise<void> {
    await prisma.leads.update({
      where: { id: leadId },
      data: {
        status: 'deleted',
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async updateCommission(commissionId: string, updates: Partial<Commission>): Promise<Commission> {
    return prisma.commissions.update({
      where: { id: commissionId },
      data: {
        ...updates,
        updated_at: new Date()
      }
    }) as Promise<Commission>;
  }

  async deleteCommission(commissionId: string): Promise<void> {
    await prisma.commissions.delete({
      where: { id: commissionId }
    });
  }

  async updateProfile(tenantId: string, updates: Partial<Profile>): Promise<Profile> {
    return prisma.profiles.update({
      where: { tenant_id: tenantId },
      data: { ...updates, updated_at: new Date() }
    }) as Promise<Profile>;
  }
}

export const dbService = new DatabaseService();