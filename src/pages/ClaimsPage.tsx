import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Search, Filter, ChevronDown, ChevronUp, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  Filed: 'bg-blue-100 text-blue-700',
  Review: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Settled: 'bg-purple-100 text-purple-700',
  Closed: 'bg-slate-100 text-slate-700',
};

export default function ClaimsPage() {
  const { claims, updateClaimStatus, addClaim, tenant, policies } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ policy_id: '', claim_type: '', incident_date: '', claim_amount: '', description: '' });

  const filtered = claims.filter(c => {
    const matchSearch = c.claim_number.toLowerCase().includes(search.toLowerCase()) || c.claim_type.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    await addClaim({
      ...form,
      tenant_id: tenant.id,
      claim_number: `CLM-${Date.now()}`,
      incident_date: new Date(form.incident_date),
      claim_amount: parseFloat(form.claim_amount),
      status: 'Filed',
    });
    setShowForm(false);
    setForm({ policy_id: '', claim_type: '', incident_date: '', claim_amount: '', description: '' });
  };

  const stats = {
    total: claims.length,
    filed: claims.filter(c => c.status === 'Filed').length,
    approved: claims.filter(c => c.status === 'Approved').length,
    settled: claims.filter(c => c.status === 'Settled').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" /> Claims Management
          </h1>
          <p className="text-slate-500 mt-1">Track and manage insurance claims lifecycle</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> New Claim
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims', value: stats.total, icon: FileText, color: 'blue' },
          { label: 'Filed', value: stats.filed, icon: Clock, color: 'yellow' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'green' },
          { label: 'Settled', value: stats.settled, icon: XCircle, color: 'purple' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} whileHover={{ scale: 1.02 }} className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow border border-white/20">
            <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search claims..." className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {['all', 'Filed', 'Review', 'Approved', 'Settled', 'Closed'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === s ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No claims found</p>
          </div>
        ) : filtered.map(claim => (
          <motion.div key={claim.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 overflow-hidden">
            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === claim.id ? null : claim.id)}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{claim.claim_number}</p>
                  <p className="text-sm text-slate-500">{claim.claim_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[claim.status] || 'bg-slate-100 text-slate-700'}`}>{claim.status}</span>
                <p className="font-semibold text-slate-900">₹{claim.claim_amount.toLocaleString()}</p>
                {expandedId === claim.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
            {expandedId === claim.id && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-slate-100 p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div><p className="text-xs text-slate-500">Incident Date</p><p className="font-medium">{format(new Date(claim.incident_date), 'dd MMM yyyy')}</p></div>
                  <div><p className="text-xs text-slate-500">Filed On</p><p className="font-medium">{format(new Date(claim.created_at), 'dd MMM yyyy')}</p></div>
                  <div><p className="text-xs text-slate-500">Amount</p><p className="font-medium">₹{claim.claim_amount.toLocaleString()}</p></div>
                  <div><p className="text-xs text-slate-500">Description</p><p className="font-medium text-sm">{claim.description || '-'}</p></div>
                </div>
                {tenant?.role === 'owner' && (
                  <div className="flex gap-2 flex-wrap">
                    {(['Filed', 'Review', 'Approved', 'Settled', 'Closed'] as const).map(s => (
                      <button key={s} onClick={() => updateClaimStatus(claim.id, s)} disabled={claim.status === s}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${claim.status === s ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                        → {s}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* New Claim Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">File New Claim</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Policy</label>
                <select value={form.policy_id} onChange={e => setForm({ ...form, policy_id: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Policy</option>
                  {policies.map(p => <option key={p.id} value={p.id}>{p.policy_number} - {p.policy_type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Claim Type</label>
                <input type="text" value={form.claim_type} onChange={e => setForm({ ...form, claim_type: e.target.value })} required placeholder="e.g. Accident, Medical, Fire" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Incident Date</label>
                  <input type="date" value={form.incident_date} onChange={e => setForm({ ...form, incident_date: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Claim Amount (₹)</label>
                  <input type="number" value={form.claim_amount} onChange={e => setForm({ ...form, claim_amount: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">File Claim</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
