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
  ComplianceReport,
  KnowledgeArticle,
  SecurityEvent,
  PerformanceMetric,
  AiInsight
} from '../types';

export class DatabaseService {


  // Auth operations
  async getTenantByEmail(email: string): Promise<Tenant | null> {
    const response = await fetch(`/api/tenants?email=${email.trim().toLowerCase()}`);
    if (!response.ok) return null;
    const tenants = await response.json();
    return tenants[0] || null;
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    const response = await fetch(`/api/tenants/${id}`);
    if (!response.ok) return null;
    return response.json();
  }

  async getProfileByTenantId(tenantId: string): Promise<Profile | null> {
    const response = await fetch(`/api/profiles/${tenantId}`);
    if (!response.ok) return null;
    return response.json();
  }

  async updateTenantPassword(tenantId: string, password: string): Promise<void> {
    const response = await fetch(`/api/tenants/${tenantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!response.ok) throw new Error('Failed to update password');
  }

  // Customer operations
  async createCustomer(data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const response = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create customer');
    return response.json();
  }

  async getCustomers(tenantId: string, role?: string, assignedTo?: string): Promise<Customer[]> {
    const response = await fetch(`/api/customers?tenant_id=${tenantId}&role=${role || ''}&assigned_to=${assignedTo || ''}`);
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
  }

  async exportCustomers(tenantId: string): Promise<void> {
    window.location.href = `/api/customers/export?tenant_id=${tenantId}`;
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const response = await fetch(`/api/customers/${id}`);
    if (!response.ok) return null;
    return response.json();
  }

  async updateCustomerStatus(id: string, status: string, assignedTo?: string, requestChangesNotes?: string): Promise<Customer> {
    const response = await fetch(`/api/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, assigned_to: assignedTo, request_changes_notes: requestChangesNotes })
    });
    if (!response.ok) throw new Error('Failed to update customer status');
    return response.json();
  }

  // Policy operations
  async createPolicy(data: Omit<CustomerPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerPolicy> {
    const response = await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create policy');
    return response.json();
  }

  async getPolicies(tenantId: string, role?: string, assignedTo?: string, customerId?: string): Promise<CustomerPolicy[]> {
    const response = await fetch(`/api/policies?tenant_id=${tenantId}&role=${role || ''}&assigned_to=${assignedTo || ''}&customer_id=${customerId || ''}`);
    if (!response.ok) throw new Error('Failed to fetch policies');
    return response.json();
  }

  // Document operations
  async createDocument(data: Omit<Document, 'id' | 'created_at'>): Promise<Document> {
    const response = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create document');
    return response.json();
  }

  async uploadFile(file: File): Promise<{ url: string; filename: string; size: number; type: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload file');
    return response.json();
  }

  async getDocuments(tenantId: string, role?: string, assignedTo?: string, customerId?: string): Promise<Document[]> {
    const response = await fetch(`/api/documents?tenant_id=${tenantId}&role=${role || ''}&assigned_to=${assignedTo || ''}&customer_id=${customerId || ''}`);
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  }

  async getCustomerDocuments(tenantId: string, role: string, assignedTo: string, customerId: string): Promise<Document[]> {
    return this.getDocuments(tenantId, role, assignedTo, customerId);
  }

  // Audit log operations
  async createAuditLog(data: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    const response = await fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create audit log');
    return response.json();
  }

  async getAuditLogs(tenantId: string): Promise<AuditLog[]> {
    const response = await fetch(`/api/audit-logs?tenant_id=${tenantId}`);
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  }

  // Notification operations
  async createNotification(data: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<Notification> {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getNotifications(tenantId: string): Promise<Notification[]> {
    const response = await fetch(`/api/notifications?tenant_id=${tenantId}`);
    return response.json();
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const response = await fetch(`/api/notifications/mark-read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return response.json();
  }

  async markAllNotificationsAsRead(tenantId: string): Promise<void> {
    await fetch(`/api/notifications/mark-read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId })
    });
  }

  // Claim operations
  async createClaim(data: any): Promise<any> {
    const response = await fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async updateClaimStatus(id: string, status: string): Promise<Claim> {
    const response = await fetch(`/api/claims/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  }

  // Commission operations
  async createCommission(data: Omit<Commission, 'id' | 'created_at'>): Promise<Commission> {
    const response = await fetch('/api/commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create commission');
    return response.json();
  }

  async getCommissions(tenantId: string, role?: string, assignedTo?: string): Promise<Commission[]> {
    const response = await fetch(`/api/commissions?tenant_id=${tenantId}&role=${role || ''}&assigned_to=${assignedTo || ''}`);
    if (!response.ok) throw new Error('Failed to fetch commissions');
    return response.json();
  }

  async payCommission(id: string): Promise<Commission> {
    const response = await fetch(`/api/commissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_paid: true, paid_date: new Date() })
    });
    return response.json();
  }

  // Lead operations
  async createLead(data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create lead');
    return response.json();
  }

  async getLeads(tenantId: string, role?: string, assignedTo?: string): Promise<Lead[]> {
    const response = await fetch(`/api/leads?tenant_id=${tenantId}&role=${role || ''}&assigned_to=${assignedTo || ''}`);
    if (!response.ok) throw new Error('Failed to fetch leads');
    return response.json();
  }

  async exportLeads(tenantId: string): Promise<void> {
    window.location.href = `/api/leads/export?tenant_id=${tenantId}`;
  }

  async updateLeadStage(id: string, status: string): Promise<Lead> {
    const response = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  }

  // Renewal operations
  async createRenewal(data: Omit<Renewal, 'id' | 'created_at' | 'notified' | 'processed'>): Promise<Renewal> {
    const response = await fetch('/api/renewals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getRenewals(tenantId: string, role?: string, assignedTo?: string): Promise<Renewal[]> {
    const response = await fetch(`/api/renewals?tenant_id=${tenantId}&role=${role || ''}&assigned_to=${assignedTo || ''}`);
    if (!response.ok) throw new Error('Failed to fetch renewals');
    return response.json();
  }

  async processRenewal(id: string): Promise<Renewal> {
    const response = await fetch(`/api/renewals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ processed: true, processed_at: new Date() })
    });
    return response.json();
  }

  // Premium payment operations
  async createPremiumPayment(data: Omit<PremiumPayment, 'id' | 'created_at'>): Promise<PremiumPayment> {
    const response = await fetch('/api/premium-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getPremiumPayments(tenantId: string): Promise<PremiumPayment[]> {
    const response = await fetch(`/api/premium-payments?tenant_id=${tenantId}`);
    return response.json();
  }

  async createFamilyMember(data: Omit<FamilyMember, 'id' | 'created_at'>): Promise<FamilyMember> {
    const response = await fetch('/api/family-members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getFamilyMembers(customerId: string): Promise<FamilyMember[]> {
    const response = await fetch(`/api/family-members?customer_id=${customerId}`);
    return response.json();
  }

  // Endorsement operations
  async createEndorsement(data: any): Promise<any> {
    const response = await fetch('/api/endorsements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getEndorsements(tenantId: string): Promise<any[]> {
    const response = await fetch(`/api/endorsements?tenant_id=${tenantId}`);
    return response.json();
  }

  async approveEndorsement(id: string, approvedBy: string): Promise<any> {
    const response = await fetch(`/api/endorsements/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved', approved_by: approvedBy, approved_at: new Date() })
    });
    return response.json();
  }

  async createMessageTemplate(data: any): Promise<any> {
    const response = await fetch('/api/message-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getMessageTemplates(tenantId: string): Promise<any[]> {
    const response = await fetch(`/api/message-templates?tenant_id=${tenantId}`);
    return response.json();
  }

  async createComplianceReport(data: any): Promise<any> {
    const response = await fetch('/api/compliance-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getComplianceReports(tenantId: string): Promise<ComplianceReport[]> {
    const response = await fetch(`/api/compliance-reports?tenant_id=${tenantId}`);
    return response.json();
  }

  async createKnowledgeArticle(data: any): Promise<any> {
    const response = await fetch('/api/knowledge-articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getKnowledgeArticles(_tenantId: string): Promise<any[]> {
    const response = await fetch(`/api/knowledge-articles`);
    return response.json();
  }

  // Employee operations
  async createEmployee(data: any): Promise<any> {
    const response = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, role: 'employee' })
    });
    return response.json();
  }

  async getEmployees(_tenantId: string): Promise<any[]> {
    const response = await fetch(`/api/tenants?role=employee&include_profile=true`);
    return response.json();
  }

  async toggleEmployeeStatus(tenantId: string, isActive: boolean): Promise<any> {
    const response = await fetch(`/api/tenants/${tenantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: isActive })
    });
    return response.json();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/api/health');
      return response.ok;
    } catch { return false; }
  }

  // Premium Feature Methods
  async updateCustomerField(customerId: string, field: string, value: any): Promise<any> {
    const response = await fetch(`/api/customers/${customerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value })
    });
    return response.json();
  }

  async updateCustomerRiskScore(customerId: string, riskScore: number, flags: string[]): Promise<any> {
    const response = await fetch(`/api/customers/${customerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ risk_score: riskScore, ai_underwriting_flags: flags })
    });
    return response.json();
  }

  async getSecurityEvents(tenantId: string): Promise<SecurityEvent[]> {
    const response = await fetch(`/api/security-events?tenant_id=${tenantId}`);
    return response.json();
  }

  async getPerformanceMetrics(tenantId: string): Promise<PerformanceMetric[]> {
    const response = await fetch(`/api/performance-metrics?tenant_id=${tenantId}`);
    return response.json();
  }

  // Update operations
  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    const response = await fetch(`/api/customers/${customerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update customer');
    return response.json();
  }

  async deleteCustomer(customerId: string): Promise<void> {
    const response = await fetch(`/api/customers/${customerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'deleted', deleted_at: new Date() })
    });
    if (!response.ok) throw new Error('Failed to delete customer');
  }

  async updatePolicy(policyId: string, updates: Partial<CustomerPolicy>): Promise<CustomerPolicy> {
    const response = await fetch(`/api/policies/${policyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update policy');
    return response.json();
  }

  async deletePolicy(policyId: string): Promise<void> {
    const response = await fetch(`/api/policies/${policyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'deleted', deleted_at: new Date() })
    });
    if (!response.ok) throw new Error('Failed to delete policy');
  }

  async updateLead(leadId: string, updates: Partial<Lead>): Promise<Lead> {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update lead');
    return response.json();
  }

  async deleteLead(leadId: string): Promise<void> {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'deleted', deleted_at: new Date() })
    });
    if (!response.ok) throw new Error('Failed to delete lead');
  }

  async updateCommission(commissionId: string, updates: Partial<Commission>): Promise<Commission> {
    const response = await fetch(`/api/commissions/${commissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update commission');
    return response.json();
  }

  async deleteCommission(commissionId: string): Promise<void> {
    // Delete for commissions might be a real delete or soft delete. 
    // Given the previous code used .delete, I'll use DELETE if I had it, but I added PATCH.
    // I'll stick to DELETE for commissions if I add it to server, or PATCH if I prefer soft delete.
    // The previous code was: await prisma.commissions.delete({ where: { id: commissionId } });
    // Let's add DELETE to server too.
    const response = await fetch(`/api/commissions/${commissionId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete commission');
  }

  async updateProfile(tenantId: string, updates: Partial<Profile>): Promise<Profile> {
    const response = await fetch(`/api/profiles/${tenantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }
}

export const dbService = new DatabaseService();