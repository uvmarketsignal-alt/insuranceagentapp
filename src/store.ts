import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dbService } from './lib/db-service';

import toast from 'react-hot-toast';
import type {
  Tenant, Profile, Customer, Document, AuditLog, Notification,
  CustomerPolicy, Claim, Commission, Lead, Renewal, PremiumPayment,
  FamilyMember, Endorsement, MessageTemplate, ComplianceReport,
  KnowledgeArticle, NewCustomerData, WorkflowAutomation, SecurityEvent,
  TwoFactorAuth, ApiKey, PerformanceMetric, AiInsight
} from './types';

// ─── APP STATE INTERFACE ───────────────────────────────────────────────────────
interface AppState {
  // Auth
  tenant: Tenant | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  sessionStart: Date | null;
  // UI
  darkMode: boolean;
  installPrompt: any | null;
  reAuthRequired: boolean;
  reAuthAttempts: number;
  isInitialLoading: boolean;
  // App Settings (owner can change)
  appName: string;
  appLogo: string | null;
  // Data
  customers: Customer[];
  documents: Document[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  policies: CustomerPolicy[];
  claims: Claim[];
  commissions: Commission[];
  leads: Lead[];
  renewals: Renewal[];
  premiumPayments: PremiumPayment[];
  familyMembers: FamilyMember[];
  endorsements: Endorsement[];
  messageTemplates: MessageTemplate[];
  complianceReports: ComplianceReport[];
  knowledgeArticles: KnowledgeArticle[];
  employees: Array<Tenant & { profile: Profile }>;
  workflowAutomations: WorkflowAutomation[];
  securityEvents: SecurityEvent[];
  twoFactorAuth: TwoFactorAuth | null;
  apiKeys: ApiKey[];
  performanceMetrics: PerformanceMetric[];
  aiInsights: AiInsight[];
  newCustomerData: Partial<NewCustomerData>;
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updatePassword: (tenantId: string, newPassword: string) => Promise<void>;
  updateAppSettings: (settings: { appName?: string; appLogo?: string }) => void;
  addCustomer: (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<Customer>;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (customerId: string) => Promise<void>;
  approveCustomer: (customerId: string, notes?: string) => Promise<void>;
  rejectCustomer: (customerId: string, notes?: string) => Promise<void>;
  requestChanges: (customerId: string, notes: string) => Promise<void>;
  bulkImportCustomers: (customers: Array<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  bulkAddCustomersAndPolicies: (items: Array<{
    customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
    policy?: Omit<CustomerPolicy, 'id' | 'created_at' | 'updated_at' | 'customer_id'>;
  }>) => Promise<void>;
  addDocument: (doc: Omit<Document, 'id' | 'created_at'>) => Promise<Document>;
  uploadFile: (file: File) => Promise<{ url: string; filename: string; size: number; type: string }>;
  addPolicy: (data: Omit<CustomerPolicy, 'id' | 'created_at' | 'updated_at'>) => Promise<CustomerPolicy>;
  updatePolicy: (policyId: string, updates: Partial<CustomerPolicy>) => Promise<CustomerPolicy>;
  deletePolicy: (policyId: string) => Promise<void>;
  addClaim: (data: Omit<Claim, 'id' | 'created_at' | 'updated_at'>) => Promise<Claim>;
  updateClaimStatus: (claimId: string, status: Claim['status']) => Promise<void>;
  addCommission: (data: Omit<Commission, 'id' | 'created_at'>) => Promise<Commission>;
  payCommission: (commissionId: string) => Promise<void>;
  updateCommission: (commissionId: string, updates: Partial<Commission>) => Promise<Commission>;
  deleteCommission: (commissionId: string) => Promise<void>;
  addLead: (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<Lead>;
  updateLead: (leadId: string, updates: Partial<Lead>) => Promise<Lead>;
  deleteLead: (leadId: string) => Promise<void>;
  updateLeadStage: (leadId: string, status: Lead['status']) => Promise<void>;
  addRenewal: (data: Omit<Renewal, 'id' | 'created_at' | 'notified' | 'processed'>) => Promise<Renewal>;
  processRenewal: (renewalId: string) => Promise<void>;
  addPremiumPayment: (data: Omit<PremiumPayment, 'id' | 'created_at'>) => Promise<PremiumPayment>;
  addFamilyMember: (data: Omit<FamilyMember, 'id' | 'created_at'>) => Promise<FamilyMember>;
  addEndorsement: (data: Omit<Endorsement, 'id' | 'created_at' | 'status'>) => Promise<Endorsement>;
  approveEndorsement: (endorsementId: string, approvedBy: string) => Promise<void>;
  addTemplate: (data: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<MessageTemplate>;
  addComplianceReport: (data: Omit<ComplianceReport, 'id' | 'created_at' | 'status'>) => Promise<ComplianceReport>;
  addKnowledgeArticle: (data: Omit<KnowledgeArticle, 'id' | 'created_at' | 'updated_at' | 'view_count'>) => Promise<KnowledgeArticle>;
  addEmployee: (data: Omit<Tenant, 'id' | 'created_at' | 'updated_at'> & { profile: Omit<Profile, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> }) => Promise<Tenant>;
  toggleEmployeeStatus: (tenantId: string, isActive: boolean) => Promise<void>;
  addNotification: (data: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => Promise<Notification>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addAuditLog: (data: Omit<AuditLog, 'id' | 'created_at'>) => Promise<AuditLog>;
  setDarkMode: (enabled: boolean) => void;
  setInstallPrompt: (prompt: any | null) => void;
  setReAuthRequired: (required: boolean) => void;
  incrementReAuthAttempts: () => void;
  resetReAuthAttempts: () => void;
  loadInitialData: (tenantId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setNewCustomerStep: (step: number, data: any) => void;
  clearNewCustomerData: () => void;
  calculateRiskScore: (customerId: string) => Promise<{ riskScore: number; flags: string[] }>;
  addAiInsight: (data: Omit<AiInsight, 'id' | 'created_at' | 'is_reviewed'>) => Promise<AiInsight>;
  executeWorkflow: (triggerType: string, entityId: string, data: any) => Promise<void>;
  addSecurityEvent: (data: Omit<SecurityEvent, 'id' | 'created_at' | 'resolved'>) => Promise<SecurityEvent>;
  recordPerformanceMetric: (data: Omit<PerformanceMetric, 'id' | 'created_at'>) => Promise<PerformanceMetric>;
  updateProfile: (tenantId: string, updates: Partial<Profile>) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────────────────
      tenant: null,
      profile: null,
      isAuthenticated: false,
      sessionStart: null,
      darkMode: false,
      installPrompt: null,
      reAuthRequired: false,
      reAuthAttempts: 0,
      isInitialLoading: false,
      appName: 'UV Insurance Agency',
      appLogo: null,
      customers: [],
      documents: [],
      auditLogs: [],
      notifications: [],
      policies: [],
      claims: [],
      commissions: [],
      leads: [],
      renewals: [],
      premiumPayments: [],
      familyMembers: [],
      endorsements: [],
      messageTemplates: [],
      complianceReports: [],
      knowledgeArticles: [],
      employees: [],
      workflowAutomations: [],
      securityEvents: [],
      twoFactorAuth: null,
      apiKeys: [],
      performanceMetrics: [],
      aiInsights: [],
      newCustomerData: {},

      // ── AUTH ──────────────────────────────────────────────────────────────
      checkAuth: async () => {
        if (!get().isAuthenticated) return;
        try {
          const authData = await dbService.getMe();
          if (!authData) {
            get().logout();
          } else {
            set({ tenant: authData.tenant, profile: authData.profile });
          }
        } catch {
          get().logout();
        }
      },

      login: async (email: string, password: string) => {
        try {
          const normalizedEmail = email.trim().toLowerCase();
          const normalizedPassword = password.trim();

          // Try DB
          try {
            const authResponse = await dbService.login(normalizedEmail, normalizedPassword);
            if (authResponse && authResponse.tenant) {
              set({ tenant: authResponse.tenant, profile: authResponse.profile, isAuthenticated: true, sessionStart: new Date() });
              get().loadInitialData(authResponse.tenant.id).catch(console.error);
              return true;
            }
          } catch (e) {
            console.error('API login failed', e);
          }

          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: () => {
        const { tenant } = get();
        if (tenant) {
          get()
            .addAuditLog({ tenant_id: tenant.id, action: 'logout', entity_type: 'auth' })
            .catch(console.error);
        }
        dbService.logout().catch(console.error);
        set({
          tenant: null, profile: null, isAuthenticated: false,
          sessionStart: null, reAuthRequired: false, reAuthAttempts: 0,
          customers: [], documents: [], auditLogs: [], notifications: [],
          policies: [], claims: [], commissions: [], leads: [], renewals: [],
          premiumPayments: [], familyMembers: [], endorsements: [],
          messageTemplates: [], complianceReports: [], knowledgeArticles: [],
          employees: [], aiInsights: [], newCustomerData: {},
        });
      },

      updatePassword: async (tenantId, newPassword) => {
        await dbService.updateTenantPassword(tenantId, newPassword);
        await get().addAuditLog({ tenant_id: tenantId, action: 'update_password', entity_type: 'auth' });
      },

      updateAppSettings: (settings) => {
        if (settings.appName !== undefined) set({ appName: settings.appName });
        if (settings.appLogo !== undefined) set({ appLogo: settings.appLogo });
      },

      updateProfile: async (tenantId, updates) => {
        const { profile } = get();
        if (!profile) return;
        const updated = { ...profile, ...updates };
        set({ profile: updated });
        // Try to persist to DB
        try {
          await dbService.updateProfile(tenantId, updates);
        } catch {
          // local update is enough for demo
        }
      },

      // ── CUSTOMERS ────────────────────────────────────────────────────────
      addCustomer: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');

        // Owner auto-approves, employee submits pending
        const initialStatus = tenant.role === 'owner' ? 'approved' : 'pending';
        const customer = await dbService.createCustomer({
          ...data,
          tenant_id: tenant.id,
          status: initialStatus,
          assigned_to: tenant.id,
        });
        set((state) => ({ customers: [customer, ...state.customers] }));

        await get().addAuditLog({
          tenant_id: tenant.id, action: 'create',
          entity_type: 'customer', entity_id: customer.id,
        });

        // If employee, notify owner for approval
        if (tenant.role === 'employee') {
          await get().addNotification({
            tenant_id: 'tenant_001', // Default owner id for this demo
            title: '🔔 New Customer Awaiting Approval',
            message: `${tenant.name} submitted customer "${customer.full_name}" for your approval.`,
            type: 'warning', priority: 'high', action_url: 'approvals',
          });
        } else {
          await get().addNotification({
            tenant_id: tenant.id,
            title: '✅ Customer Auto-Approved',
            message: `Customer "${customer.full_name}" has been added and automatically approved.`,
            type: 'success', priority: 'low',
          });
        }
        return customer;
      },

      updateCustomer: async (customerId, updates) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const before = get().customers.find((c) => c.id === customerId);
        const updated = await dbService.updateCustomer(customerId, updates);
        set((state) => ({
          customers: state.customers.map((c) => (c.id === customerId ? updated : c)),
        }));
        await get().addAuditLog({
          tenant_id: tenant.id, action: 'update',
          entity_type: 'customer', entity_id: customerId,
          old_values: JSON.stringify(before), new_values: JSON.stringify(updated),
        });
        return updated;
      },

      deleteCustomer: async (customerId) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        if (tenant.role !== 'owner') throw new Error('Only owner can delete customers');
        await dbService.deleteCustomer(customerId);
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== customerId),
        }));
        await get().addAuditLog({
          tenant_id: tenant.id, action: 'delete',
          entity_type: 'customer', entity_id: customerId,
        });
      },

      approveCustomer: async (customerId, notes) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const updated = await dbService.updateCustomerStatus(customerId, 'approved', tenant.id);
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId ? updated : c
          ),
        }));
        await get().addAuditLog({
          tenant_id: tenant.id, action: 'approve',
          entity_type: 'customer', entity_id: customerId, new_values: notes,
        });
      },

      rejectCustomer: async (customerId, notes) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const updated = await dbService.updateCustomerStatus(customerId, 'rejected', tenant.id);
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId ? updated : c
          ),
        }));
        await get().addAuditLog({
          tenant_id: tenant.id, action: 'reject',
          entity_type: 'customer', entity_id: customerId, new_values: notes,
        });
      },

      requestChanges: async (customerId, notes) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const updated = await dbService.updateCustomerStatus(customerId, 'changes_requested', tenant.id, notes);
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId ? updated : c
          ),
        }));
        await get().addAuditLog({
          tenant_id: tenant.id, action: 'request_changes',
          entity_type: 'customer', entity_id: customerId, new_values: notes,
        });
      },

      bulkImportCustomers: async (customers) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        for (const cd of customers) {
          const c = await dbService.createCustomer({ ...cd, tenant_id: tenant.id });
          set((state) => ({ customers: [c, ...state.customers] }));
          await get().addAuditLog({ tenant_id: tenant.id, action: 'bulk_import', entity_type: 'customer', entity_id: c.id });
        }
      },

      bulkAddCustomersAndPolicies: async (items) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        let successCount = 0;
        let failCount = 0;
        const loadingToast = toast.loading(`Importing ${items.length} records...`);
        
        for (const item of items) {
          try {
            // Create customer first
            const customer = await dbService.createCustomer({ 
              ...item.customer, 
              tenant_id: tenant.id 
            });
            
            // Create associated policy
            let policy: CustomerPolicy | undefined = undefined;
            if (item.policy) {
              policy = await dbService.createPolicy({
                ...item.policy,
                customer_id: customer.id,
                tenant_id: tenant.id
              } as any);
            }
            
            set((state) => ({ 
              customers: [customer, ...state.customers],
              policies: policy ? [policy, ...state.policies] : state.policies
            }));
            
            await get().addAuditLog({ 
              tenant_id: tenant.id, 
              action: 'bulk_import', 
              entity_type: 'customer', 
              entity_id: customer.id,
              new_values: policy ? `Imported with policy ${policy.policy_number}` : `Imported customer only`
            });
            successCount++;
          } catch (err) {
            console.error('Failed to import item:', err);
            failCount++;
            // Continue with others
          }
        }

        toast.dismiss(loadingToast);
        if (failCount === 0) {
          toast.success(`Successfully imported ${successCount} records!`);
        } else {
          toast.error(`Imported ${successCount} records. Failed: ${failCount}`);
        }
      },

      // ── DOCUMENTS ────────────────────────────────────────────────────────
      addDocument: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const doc = await dbService.createDocument({ ...data, tenant_id: tenant.id });
        set((state) => ({ documents: [doc, ...state.documents] }));
        await get().addAuditLog({ tenant_id: tenant.id, action: 'upload', entity_type: 'document', entity_id: doc.id });
        return doc;
      },

      uploadFile: async (file) => {
        return dbService.uploadFile(file);
      },

      // ── POLICIES ─────────────────────────────────────────────────────────
      addPolicy: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const policy = await dbService.createPolicy({ ...data, tenant_id: tenant.id });
        set((state) => ({ policies: [policy, ...state.policies] }));
        await get().addAuditLog({ tenant_id: tenant.id, action: 'create', entity_type: 'policy', entity_id: policy.id });
        return policy;
      },

      updatePolicy: async (policyId, updates) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const updated = await dbService.updatePolicy(policyId, updates);
        set((state) => ({ policies: state.policies.map((p) => (p.id === policyId ? updated : p)) }));
        await get().addAuditLog({ tenant_id: tenant.id, action: 'update', entity_type: 'policy', entity_id: policyId, new_values: JSON.stringify(updates) });
        return updated;
      },

      deletePolicy: async (policyId) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        await dbService.deletePolicy(policyId);
        set((state) => ({ policies: state.policies.filter((p) => p.id !== policyId) }));
        await get().addAuditLog({ tenant_id: tenant.id, action: 'delete', entity_type: 'policy', entity_id: policyId });
      },

      // ── CLAIMS ───────────────────────────────────────────────────────────
      addClaim: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const claim = await dbService.createClaim({ ...data, tenant_id: tenant.id });
        set((state) => ({ claims: [claim, ...state.claims] }));
        await get().addAuditLog({ tenant_id: tenant.id, action: 'create', entity_type: 'claim', entity_id: claim.id });
        return claim;
      },

      updateClaimStatus: async (claimId, status) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        await dbService.updateClaimStatus(claimId, status);
        set((state) => ({ claims: state.claims.map((c) => (c.id === claimId ? { ...c, status } : c)) }));
        await get().addAuditLog({ tenant_id: tenant.id, action: 'update_status', entity_type: 'claim', entity_id: claimId, new_values: status });
      },

      // ── COMMISSIONS ──────────────────────────────────────────────────────
      addCommission: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const commission = await dbService.createCommission({ ...data, tenant_id: tenant.id });
        set((state) => ({ commissions: [commission, ...state.commissions] }));
        return commission;
      },

      payCommission: async (commissionId) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        await dbService.payCommission(commissionId);
        set((state) => ({
          commissions: state.commissions.map((c) =>
            c.id === commissionId ? { ...c, is_paid: true, paid_date: new Date() } : c
          ),
        }));
        await get().addAuditLog({ tenant_id: tenant.id, action: 'pay', entity_type: 'commission', entity_id: commissionId });
      },

      updateCommission: async (commissionId, updates) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const updated = await dbService.updateCommission(commissionId, updates);
        set((state) => ({ commissions: state.commissions.map((c) => (c.id === commissionId ? updated : c)) }));
        return updated;
      },

      deleteCommission: async (commissionId) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        await dbService.deleteCommission(commissionId);
        set((state) => ({ commissions: state.commissions.filter((c) => c.id !== commissionId) }));
      },

      // ── LEADS ────────────────────────────────────────────────────────────
      addLead: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const lead = await dbService.createLead({ ...data, tenant_id: tenant.id });
        set((state) => ({ leads: [lead, ...state.leads] }));
        await get().addAuditLog({ tenant_id: tenant.id, action: 'create', entity_type: 'lead', entity_id: lead.id });
        return lead;
      },

      updateLead: async (leadId, updates) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const updated = await dbService.updateLead(leadId, updates);
        set((state) => ({ leads: state.leads.map((l) => (l.id === leadId ? updated : l)) }));
        return updated;
      },

      deleteLead: async (leadId) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        await dbService.deleteLead(leadId);
        set((state) => ({ leads: state.leads.filter((l) => l.id !== leadId) }));
      },

      updateLeadStage: async (leadId, status) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        await dbService.updateLeadStage(leadId, status);
        set((state) => ({ leads: state.leads.map((l) => (l.id === leadId ? { ...l, status } : l)) }));
      },

      // ── RENEWALS ─────────────────────────────────────────────────────────
      addRenewal: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const renewal = await dbService.createRenewal({ ...data, tenant_id: tenant.id });
        set((state) => ({ renewals: [renewal, ...state.renewals] }));
        return renewal;
      },

      processRenewal: async (renewalId) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        await dbService.processRenewal(renewalId);
        set((state) => ({
          renewals: state.renewals.map((r) =>
            r.id === renewalId ? { ...r, processed: true, processed_at: new Date() } : r
          ),
        }));
      },

      // ── PREMIUM PAYMENTS ─────────────────────────────────────────────────
      addPremiumPayment: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const payment = await dbService.createPremiumPayment({ ...data, tenant_id: tenant.id });
        set((state) => ({ premiumPayments: [payment, ...state.premiumPayments] }));
        return payment;
      },

      // ── FAMILY MEMBERS ───────────────────────────────────────────────────
      addFamilyMember: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const member = await dbService.createFamilyMember({ ...data, tenant_id: tenant.id });
        set((state) => ({ familyMembers: [member, ...state.familyMembers] }));
        return member;
      },

      // ── ENDORSEMENTS ─────────────────────────────────────────────────────
      addEndorsement: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const endorsement = await dbService.createEndorsement({ ...data, tenant_id: tenant.id });
        set((state) => ({ endorsements: [endorsement, ...state.endorsements] }));
        return endorsement;
      },

      approveEndorsement: async (endorsementId, approvedBy) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        await dbService.approveEndorsement(endorsementId, approvedBy);
        set((state) => ({
          endorsements: state.endorsements.map((e) =>
            e.id === endorsementId ? { ...e, status: 'approved', approved_by: approvedBy, approved_at: new Date() } : e
          ),
        }));
      },

      // ── TEMPLATES ────────────────────────────────────────────────────────
      addTemplate: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const template = await dbService.createMessageTemplate({ ...data, tenant_id: tenant.id });
        set((state) => ({ messageTemplates: [template, ...state.messageTemplates] }));
        return template;
      },

      // ── COMPLIANCE ───────────────────────────────────────────────────────
      addComplianceReport: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const report = await dbService.createComplianceReport({ ...data, tenant_id: tenant.id });
        set((state) => ({ complianceReports: [report, ...state.complianceReports] }));
        return report;
      },

      // ── KNOWLEDGE BASE ───────────────────────────────────────────────────
      addKnowledgeArticle: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const article = await dbService.createKnowledgeArticle({ ...data, tenant_id: tenant.id });
        set((state) => ({ knowledgeArticles: [article, ...state.knowledgeArticles] }));
        return article;
      },

      // ── EMPLOYEES ────────────────────────────────────────────────────────
      addEmployee: async (data) => {
        const { tenant } = get();
        if (!tenant || tenant.role !== 'owner') throw new Error('Not authorized');
        const employee = await dbService.createEmployee({ ...data, parent_id: tenant.id });
        const employees = await dbService.getEmployees(tenant.id);
        set({ employees });
        return employee;
      },

      toggleEmployeeStatus: async (tenantId, isActive) => {
        const { tenant } = get();
        if (!tenant || tenant.role !== 'owner') throw new Error('Not authorized');
        await dbService.toggleEmployeeStatus(tenantId, isActive);
        set((state) => ({
          employees: state.employees.map((e) => (e.id === tenantId ? { ...e, is_active: isActive } : e)),
        }));
      },

      // ── NOTIFICATIONS ────────────────────────────────────────────────────
      addNotification: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const notification = await dbService.createNotification({ ...data, tenant_id: data.tenant_id || tenant.id });
        set((state) => ({ notifications: [notification, ...state.notifications] }));
        return notification;
      },

      markNotificationRead: async (notificationId) => {
        await dbService.markNotificationAsRead(notificationId);
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
        }));
      },

      markAllNotificationsRead: async () => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        await dbService.markAllNotificationsAsRead(tenant.id);
        set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, is_read: true })) }));
      },

      // ── AUDIT LOGS ───────────────────────────────────────────────────────
      addAuditLog: async (data) => {
        const { tenant } = get();
        const log = await dbService.createAuditLog({ ...data, tenant_id: data.tenant_id || tenant?.id || 'system' });
        set((state) => ({ auditLogs: [log, ...state.auditLogs] }));
        return log;
      },

      // ── UI ACTIONS ───────────────────────────────────────────────────────
      setDarkMode: (enabled) => {
        set({ darkMode: enabled });
        if (typeof window !== 'undefined') localStorage.setItem('darkMode', String(enabled));
      },
      setInstallPrompt: (prompt) => set({ installPrompt: prompt }),
      setReAuthRequired: (required) => set({ reAuthRequired: required }),
      incrementReAuthAttempts: () => set((state) => ({ reAuthAttempts: state.reAuthAttempts + 1 })),
      resetReAuthAttempts: () => set({ reAuthAttempts: 0 }),

      // ── NEW CUSTOMER WIZARD ──────────────────────────────────────────────
      setNewCustomerStep: (step, data) =>
        set((state) => ({ newCustomerData: { ...state.newCustomerData, [`step${step}`]: data } })),
      clearNewCustomerData: () => set({ newCustomerData: {} }),

      // ── DATA LOADING ─────────────────────────────────────────────────────
      loadInitialData: async (tenantId) => {
        set({ isInitialLoading: true });
        const { tenant } = get();
        const role = tenant?.role;
        const userId = tenant?.id;
        const effectiveTenantId = tenant?.parent_id || tenantId; // Employees see agency data

        try {
          const [
            customers, documents, auditLogs, notifications, policies,
            claims, commissions, leads, renewals, premiumPayments,
            familyMembers, endorsements, messageTemplates, complianceReports,
            knowledgeArticles, employees, aiInsights
          ] = await Promise.all([
            dbService.getCustomers(effectiveTenantId, role, userId),
            dbService.getDocuments(effectiveTenantId, role, userId),
            dbService.getAuditLogs(effectiveTenantId),
            dbService.getNotifications(effectiveTenantId),
            dbService.getPolicies(effectiveTenantId, role, userId),
            dbService.getClaims(effectiveTenantId, role, userId),
            dbService.getCommissions(effectiveTenantId, role, userId),
            dbService.getLeads(effectiveTenantId, role, userId),
            dbService.getRenewals(effectiveTenantId, role, userId),
            dbService.getPremiumPayments(effectiveTenantId),
            dbService.getFamilyMembers(effectiveTenantId),
            dbService.getEndorsements(effectiveTenantId),
            dbService.getMessageTemplates(effectiveTenantId),
            dbService.getComplianceReports(effectiveTenantId),
            dbService.getKnowledgeArticles(effectiveTenantId),
            dbService.getEmployees(effectiveTenantId),
            dbService.getAiInsights(effectiveTenantId),
          ]);
          set({
            customers, documents, auditLogs, notifications, policies,
            claims, commissions, leads, renewals, premiumPayments,
            familyMembers, endorsements, messageTemplates, complianceReports,
            knowledgeArticles, employees, aiInsights,
          });
        } catch (error) {
          console.error('Failed to load initial data:', error);
        } finally {
          set({ isInitialLoading: false });
        }
      },

      refreshData: async () => {
        const { tenant } = get();
        if (!tenant) return;
        await get().loadInitialData(tenant.id);
      },

      // ── AI & AUTOMATION ──────────────────────────────────────────────────
      calculateRiskScore: async (customerId) => {
        const { tenant, customers } = get();
        if (!tenant) throw new Error('Not authenticated');
        const customer = customers.find((c) => c.id === customerId);
        if (!customer) throw new Error('Customer not found');

        let riskScore = 50;
        const flags: string[] = [];

        if (customer.date_of_birth) {
          const age = new Date().getFullYear() - new Date(customer.date_of_birth).getFullYear();
          if (age < 25 || age > 65) { riskScore += 15; flags.push(`Age: ${age}`); }
        }
        if (customer.annual_income) {
          if (customer.annual_income < 300000) { riskScore += 10; flags.push('Low income'); }
          else if (customer.annual_income > 1000000) { riskScore -= 10; flags.push('High income'); }
        }
        if (customer.occupation) {
          const occ = customer.occupation.toLowerCase();
          if (['construction', 'mining', 'fishing', 'military'].some((r) => occ.includes(r))) {
            riskScore += 20; flags.push('High-risk occupation');
          }
        }
        riskScore = Math.max(0, Math.min(100, riskScore));
        return { riskScore, flags };
      },

      addAiInsight: async (data) => {
        const { tenant } = get();
        if (!tenant) throw new Error('Not authenticated');
        const insight = await dbService.createAiInsight({ ...data, tenant_id: tenant.id });
        set((state) => ({ aiInsights: [insight, ...state.aiInsights] }));
        return insight;
      },

      executeWorkflow: async (_triggerType, _entityId, _data) => {
        // Workflow engine placeholder
      },

      addSecurityEvent: async (data) => {
        const { tenant } = get();
        const event = await dbService.createSecurityEvent({
          ...data, tenant_id: tenant?.id || 'system', resolved: false,
        });
        set((state) => ({ securityEvents: [event, ...state.securityEvents] }));
        return event;
      },

      recordPerformanceMetric: async (data) => {
        const { tenant } = get();
        const metric = await dbService.createPerformanceMetric({
          ...data, tenant_id: tenant?.id || 'system',
        });
        set((state) => ({ performanceMetrics: [metric, ...state.performanceMetrics] }));
        return metric;
      },
    }),
    {
      name: 'uv-insurance-v11',
      partialize: (state) => ({
        tenant: state.tenant,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        sessionStart: state.sessionStart,
        darkMode: state.darkMode,
        appName: state.appName,
        appLogo: state.appLogo,
      }),
    }
  )
);
