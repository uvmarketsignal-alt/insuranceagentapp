export interface Tenant {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'owner' | 'employee';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Profile {
  id: string;
  tenant_id: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  employee_code?: string;
  department?: string;
  join_date?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  tenant_id: string;
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth?: Date;
  gender?: string;
  occupation?: string;
  annual_income?: number;
  address?: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'deleted';
  assigned_to?: string;
  risk_score?: number;
  ai_underwriting_flags?: string[];
  document_verification_status?: 'pending' | 'verified' | 'failed';
  ocr_extracted_data?: Record<string, any>;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface WorkflowAutomation {
  id: string;
  tenant_id: string;
  name: string;
  trigger_type: 'customer_status_change' | 'claim_status_change' | 'renewal_due' | 'payment_overdue' | 'lead_stage_change';
  trigger_condition: string;
  actions: Array<{
    type: 'send_notification' | 'send_email' | 'send_sms' | 'update_field' | 'create_task' | 'webhook';
    config: Record<string, any>;
  }>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SecurityEvent {
  id: string;
  tenant_id: string;
  event_type: 'suspicious_login' | 'failed_auth' | 'privilege_escalation' | 'data_exfiltration' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address: string;
  user_agent: string;
  device_fingerprint: string;
  location?: string;
  description: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  created_at: Date;
}

export interface TwoFactorAuth {
  id: string;
  tenant_id: string;
  secret: string;
  is_enabled: boolean;
  backup_codes: string[];
  last_used?: Date;
  created_at: Date;
}

export interface ApiKey {
  id: string;
  tenant_id: string;
  name: string;
  key_hash: string;
  permissions: string[];
  ip_whitelist?: string[];
  last_used?: Date;
  is_active: boolean;
  created_at: Date;
  expires_at?: Date;
}

export interface PerformanceMetric {
  id: string;
  tenant_id: string;
  metric_type: 'page_load' | 'api_response' | 'database_query' | 'document_processing';
  value: number;
  unit: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface AiInsight {
  id: string;
  tenant_id: string;
  insight_type: 'customer_risk' | 'claim_fraud' | 'renewal_prediction' | 'cross_sell_opportunity';
  entity_type: 'customer' | 'policy' | 'claim' | 'lead';
  entity_id: string;
  confidence_score: number;
  insight_data: Record<string, any>;
  actionable_recommendations: string[];
  is_reviewed: boolean;
  created_at: Date;
}

export interface Document {
  id: string;
  customer_id: string;
  tenant_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  is_camera_capture: boolean;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: string;
  new_values?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface Notification {
  id: string;
  tenant_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  created_at: Date;
}

export interface CustomerPolicy {
  id: string;
  customer_id: string;
  tenant_id: string;
  policy_type: string;
  policy_number: string;
  insurer: string;
  sum_assured?: number;
  premium_amount?: number;
  premium_frequency?: string;
  start_date?: Date;
  end_date?: Date;
  status: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface DownloadLog {
  id: string;
  tenant_id: string;
  document_id: string;
  downloaded_by: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface Claim {
  id: string;
  policy_id: string;
  tenant_id: string;
  claim_number: string;
  claim_type: string;
  incident_date: Date;
  claim_amount: number;
  status: 'Filed' | 'Review' | 'Approved' | 'Settled' | 'Closed';
  description?: string;
  documents?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Commission {
  id: string;
  policy_id: string;
  tenant_id: string;
  employee_id: string;
  commission_rate: number;
  commission_amount: number;
  is_paid: boolean;
  paid_date?: Date;
  due_date?: Date;
  created_at: Date;
}

export interface Lead {
  id: string;
  tenant_id: string;
  full_name: string;
  phone: string;
  email?: string;
  source?: string;
  status: 'New' | 'Contacted' | 'Meeting' | 'Proposal' | 'Closed' | 'deleted';
  assigned_to?: string;
  notes?: string;
  next_followup?: Date;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Renewal {
  id: string;
  policy_id: string;
  tenant_id: string;
  renewal_date: Date;
  status: 'pending' | 'completed' | 'cancelled';
  notified: boolean;
  notified_at?: Date;
  processed: boolean;
  processed_at?: Date;
  created_at: Date;
}

export interface PremiumPayment {
  id: string;
  policy_id: string;
  tenant_id: string;
  amount: number;
  payment_date: Date;
  payment_mode: string;
  transaction_id?: string;
  status: string;
  created_at: Date;
}

export interface FamilyMember {
  id: string;
  customer_id: string;
  tenant_id: string;
  full_name: string;
  relationship: string;
  date_of_birth?: Date;
  phone?: string;
  email?: string;
  has_policy: boolean;
  policy_id?: string;
  created_at: Date;
}

export interface Endorsement {
  id: string;
  policy_id: string;
  tenant_id: string;
  endorsement_type: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: Date;
  created_at: Date;
}

export interface MessageTemplate {
  id: string;
  tenant_id: string;
  name: string;
  subject?: string;
  content: string;
  type: 'email' | 'sms' | 'whatsapp';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ComplianceReport {
  id: string;
  tenant_id: string;
  report_type: string;
  period_start: Date;
  period_end: Date;
  data?: string;
  status: 'draft' | 'submitted' | 'approved';
  submitted_at?: Date;
  created_at: Date;
}

export interface KnowledgeArticle {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  category: string;
  tags?: string;
  view_count: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuthState {
  tenant: Tenant | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  sessionStart: Date | null;
}

export type Page =
  | 'login'
  | 'owner-dashboard'
  | 'employee-dashboard'
  | 'approvals'
  | 'customers'
  | 'employees'
  | 'audit-logs'
  | 'new-customer'
  | 'knowledge-base'
  | 'claims'
  | 'leads'
  | 'renewals'
  | 'commissions'
  | 'documents'
  | 'family-tree'
  | 'analytics'
  | 'compliance'
  | 'settings'
  | 'profile';

export interface NewCustomerData {
  step0: {
    full_name: string;
    phone: string;
    email: string;
    date_of_birth: string;
    gender: string;
    occupation: string;
    annual_income: string;
    address: string;
  };
  step1: {
    policy_type: string;
  };
  step2: {
    aadhaar_number: string;
    pan_number: string;
    policy_number: string;
    insurer: string;
    sum_assured: string;
    motor_subtype?: string;
    policy_details: Record<string, any>;
  };
  step3: {
    premium_amount: string;
    premium_frequency: string;
    start_date: string;
    end_date: string;
    payment_mode?: string;
    grace_period?: string;
  };
  step4: {
    documents: Array<{
      type: string;
      file: File | null;
      captured: boolean;
    }>;
  };
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type CustomerStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'deleted';
export type ClaimStatus = 'Filed' | 'Review' | 'Approved' | 'Settled' | 'Closed';
export type LeadStatus = 'New' | 'Contacted' | 'Meeting' | 'Proposal' | 'Closed' | 'deleted';
export type RenewalStatus = 'pending' | 'completed' | 'cancelled';
export type EndorsementStatus = 'pending' | 'approved' | 'rejected';
export type ComplianceStatus = 'draft' | 'submitted' | 'approved';