import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Edit, Trash2, X, Save,
  User, Phone, Mail, MapPin, Briefcase, DollarSign,
  CheckCircle2, Clock, XCircle, AlertCircle, Download,
  ChevronDown, ChevronUp, Calendar,
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import type { Page, Customer } from '../types';

interface Props { onNavigate: (page: Page) => void; }

const STATUS_CONFIG = {
  approved:          { label: 'Approved',           color: 'bg-green-100 text-green-700 border-green-200',  icon: CheckCircle2 },
  pending:           { label: 'Pending',             color: 'bg-amber-100 text-amber-700 border-amber-200',  icon: Clock       },
  rejected:          { label: 'Rejected',            color: 'bg-red-100 text-red-700 border-red-200',        icon: XCircle     },
  changes_requested: { label: 'Changes Requested',   color: 'bg-blue-100 text-blue-700 border-blue-200',     icon: AlertCircle },
  deleted:           { label: 'Deleted',             color: 'bg-slate-100 text-slate-500 border-slate-200',  icon: Trash2      },
};

export default function CustomersPage({ onNavigate }: Props) {
  const { customers, tenant, updateCustomer, deleteCustomer, addAuditLog } = useStore();
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editForm, setEditForm]           = useState<Partial<Customer>>({});
  const [saving, setSaving]               = useState(false);
  const [expandedId, setExpandedId]       = useState<string | null>(null);

  const filtered = customers.filter(c => {
    if (c.status === 'deleted') return false;
    const q = search.toLowerCase();
    const matchSearch = !q || c.full_name.toLowerCase().includes(q) || c.phone.includes(q) || c.email?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    if (tenant?.role === 'employee' && c.assigned_to !== tenant.id) return false;
    return matchSearch && matchStatus;
  });

  const startEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setEditForm({ ...customer });
    setExpandedId(customer.id);
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editingId || !editForm) return;
    setSaving(true);
    try {
      await updateCustomer(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (customerId: string) => {
    try {
      await deleteCustomer(customerId);
      setDeleteConfirmId(null);
      if (selectedId === customerId) setSelectedId(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleBulkExport = async () => {
    if (!tenant) return;
    
    const params = new URLSearchParams({
      tenant_id: tenant.id,
      role: tenant.role,
      assigned_to: tenant.id
    });

    try {
      const response = await fetch(`/api/customers/export?${params.toString()}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await addAuditLog({ 
        tenant_id: tenant.id, 
        action: 'export_all_customers', 
        entity_type: 'bulk_export',
        new_values: `Bulk exported customers from backend` 
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const exportCustomer = async (customer: Customer) => {
    if (!tenant) return;
    const csv = [
      ['Field', 'Value'],
      ['Name', customer.full_name],
      ['Phone', customer.phone],
      ['Email', customer.email || ''],
      ['Status', customer.status],
      ['Address', customer.address || ''],
      ['Occupation', customer.occupation || ''],
      ['Annual Income', String(customer.annual_income || '')],
      ['Date of Birth', customer.date_of_birth ? format(new Date(customer.date_of_birth), 'dd/MM/yyyy') : ''],
      ['Gender', customer.gender || ''],
      ['Created At', format(new Date(customer.created_at), 'dd/MM/yyyy')],
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${customer.full_name.replace(/\s+/g, '_')}.csv`; a.click();
    URL.revokeObjectURL(url);
    await addAuditLog({ tenant_id: tenant.id, action: 'export', entity_type: 'customer', entity_id: customer.id });
  };

  const statusCounts = {
    all: customers.filter(c => c.status !== 'deleted').length,
    pending: customers.filter(c => c.status === 'pending').length,
    approved: customers.filter(c => c.status === 'approved').length,
    rejected: customers.filter(c => c.status === 'rejected').length,
    changes_requested: customers.filter(c => c.status === 'changes_requested').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 mt-1">Manage all customer records and policies</p>
        </div>
        <div className="flex gap-2">
          {tenant?.role === 'owner' && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleBulkExport}
              className="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 text-sm">
              <Download className="w-4 h-4 text-blue-600" /> Export CSV
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('new-customer')}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Customer
          </motion.button>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {Object.entries({ all: 'All', pending: 'Pending', approved: 'Approved', rejected: 'Rejected', changes_requested: 'Changes Requested' }).map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              statusFilter === val
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
            }`}>
            {label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${statusFilter === val ? 'bg-blue-500' : 'bg-slate-100 text-slate-500'}`}>
              {statusCounts[val as keyof typeof statusCounts] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <button className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="font-semibold text-slate-900">
            {filtered.length} customer{filtered.length !== 1 ? 's' : ''} found
          </p>
          <p className="text-xs text-slate-500">{tenant?.role === 'owner' ? 'All customers visible' : 'Showing your customers only'}</p>
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-600">No customers found</p>
              <p className="text-sm text-slate-400 mt-1">Try a different search or add a new customer</p>
              <button onClick={() => onNavigate('new-customer')} className="mt-4 text-sm text-blue-600 hover:underline">Add Customer →</button>
            </div>
          ) : filtered.map(customer => {
            const statusCfg = STATUS_CONFIG[customer.status] || STATUS_CONFIG['pending'];
            const StatusIcon = statusCfg.icon;
            const isExpanded = expandedId === customer.id;
            const isEditing  = editingId === customer.id;

            return (
              <motion.div key={customer.id} layout className="overflow-hidden">
                {/* Row */}
                <div className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white font-bold text-sm">{customer.full_name[0]?.toUpperCase()}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900">{customer.full_name}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusCfg.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-sm text-slate-500"><Phone className="w-3 h-3" />{customer.phone}</span>
                        {customer.email && <span className="flex items-center gap-1 text-sm text-slate-500"><Mail className="w-3 h-3" />{customer.email}</span>}
                        {customer.occupation && <span className="flex items-center gap-1 text-sm text-slate-500"><Briefcase className="w-3 h-3" />{customer.occupation}</span>}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Added {format(new Date(customer.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setExpandedId(isExpanded ? null : customer.id)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button onClick={() => startEdit(customer)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      {tenant?.role === 'owner' && (
                        <button onClick={() => exportCustomer(customer)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Export">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      {tenant?.role === 'owner' && (
                        <button onClick={() => setDeleteConfirmId(customer.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
                    >
                      <div className="px-5 py-5">
                        {isEditing ? (
                          /* EDIT FORM */
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-slate-900">Edit Customer</h3>
                              <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {[
                                { key: 'full_name', label: 'Full Name', type: 'text', icon: User },
                                { key: 'phone', label: 'Phone', type: 'tel', icon: Phone },
                                { key: 'email', label: 'Email', type: 'email', icon: Mail },
                                { key: 'occupation', label: 'Occupation', type: 'text', icon: Briefcase },
                                { key: 'annual_income', label: 'Annual Income (₹)', type: 'number', icon: DollarSign },
                                { key: 'address', label: 'Address', type: 'text', icon: MapPin },
                              ].map(({ key, label, type, icon: Icon }) => (
                                <div key={key}>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                                  <div className="relative">
                                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type={type}
                                      value={String((editForm as any)[key] ?? '')}
                                      onChange={e => setEditForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                                  </div>
                                </div>
                              ))}
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                                <select value={editForm.gender || ''} onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                  <option value="">Select Gender</option>
                                  <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                              <button onClick={saveEdit} disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Saving...' : 'Save Changes'}
                              </button>
                              <button onClick={cancelEdit} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* VIEW DETAILS */
                          <div className="space-y-6">
                            {customer.status === 'changes_requested' && (
                              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2 mb-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Feedback from Owner
                                </h4>
                                <p className="text-sm text-blue-800 italic">
                                  "{customer.request_changes_notes || 'Please review your application and update the necessary details.'}"
                                </p>
                              </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {[
                                { label: 'Full Name',       value: customer.full_name,     icon: User        },
                                { label: 'Phone',           value: customer.phone,          icon: Phone       },
                                { label: 'Email',           value: customer.email || '—',   icon: Mail        },
                                { label: 'Gender',          value: customer.gender || '—',  icon: User        },
                                { label: 'Occupation',      value: customer.occupation || '—', icon: Briefcase },
                                { label: 'Annual Income',   value: customer.annual_income ? `₹${Number(customer.annual_income).toLocaleString()}` : '—', icon: DollarSign },
                                { label: 'Address',         value: customer.address || '—', icon: MapPin      },
                                { label: 'Date of Birth',   value: customer.date_of_birth ? format(new Date(customer.date_of_birth), 'dd MMM yyyy') : '—', icon: Calendar },
                                { label: 'Risk Score',      value: customer.risk_score ? `${customer.risk_score}/100` : '—', icon: AlertCircle },
                              ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="flex items-start gap-2">
                                  <div className="w-7 h-7 bg-white rounded-lg border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
                                    <p className="text-sm font-semibold text-slate-900 mt-0.5">{value}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Delete Customer?</h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                This action cannot be undone. The customer record will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={() => confirmDelete(deleteConfirmId)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
