import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react';
import { useStore } from '../store';
import { format, differenceInDays } from 'date-fns';

export default function RenewalsPage() {
  const { renewals, processRenewal, addRenewal, tenant, policies } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ policy_id: '', renewal_date: '' });

  const getUrgency = (date: Date) => {
    const days = differenceInDays(new Date(date), new Date());
    if (days < 0) return { label: 'Overdue', color: 'red', days };
    if (days <= 7) return { label: 'Critical', color: 'red', days };
    if (days <= 30) return { label: 'Urgent', color: 'orange', days };
    if (days <= 60) return { label: 'Due Soon', color: 'yellow', days };
    return { label: 'Upcoming', color: 'green', days };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    await addRenewal({ ...form, tenant_id: tenant.id, renewal_date: new Date(form.renewal_date), status: 'pending' });
    setShowForm(false);
    setForm({ policy_id: '', renewal_date: '' });
  };

  const sorted = [...renewals].sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-green-600" /> Renewals
          </h1>
          <p className="text-slate-500 mt-1">Track policy renewal dates and send reminders</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-xl font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Renewal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: renewals.length, color: 'blue' },
          { label: 'Overdue', value: renewals.filter(r => differenceInDays(new Date(r.renewal_date), new Date()) < 0 && !r.processed).length, color: 'red' },
          { label: 'Due This Month', value: renewals.filter(r => { const d = differenceInDays(new Date(r.renewal_date), new Date()); return d >= 0 && d <= 30; }).length, color: 'orange' },
          { label: 'Processed', value: renewals.filter(r => r.processed).length, color: 'green' },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ scale: 1.02 }} className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow border border-white/20 text-center">
            <p className={`text-3xl font-bold text-${s.color}-600`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Renewals List */}
      <div className="space-y-3">
        {sorted.map(renewal => {
          const urgency = getUrgency(renewal.renewal_date);
          const policy = policies.find(p => p.id === renewal.policy_id);
          return (
            <motion.div key={renewal.id} layout className={`bg-white/80 backdrop-blur rounded-2xl shadow border-l-4 border border-white/20 p-4 flex items-center justify-between border-${urgency.color}-400`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 bg-${urgency.color}-100 rounded-xl flex items-center justify-center`}>
                  {urgency.days < 0 ? <AlertTriangle className={`w-5 h-5 text-${urgency.color}-600`} /> :
                    renewal.processed ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                      <Clock className={`w-5 h-5 text-${urgency.color}-600`} />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{policy?.policy_number || renewal.policy_id}</p>
                  <p className="text-sm text-slate-500">{policy?.policy_type || 'Policy'} • {policy?.insurer || ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="font-semibold">{format(new Date(renewal.renewal_date), 'dd MMM yyyy')}</p>
                  <p className={`text-sm font-medium text-${urgency.color}-600`}>
                    {urgency.days < 0 ? `${Math.abs(urgency.days)}d overdue` : `${urgency.days}d remaining`}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${urgency.color}-100 text-${urgency.color}-700`}>{urgency.label}</span>
                {!renewal.processed && tenant?.role === 'owner' && (
                  <button onClick={() => processRenewal(renewal.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all">
                    Process
                  </button>
                )}
                {renewal.processed && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">✓ Processed</span>}
              </div>
            </motion.div>
          );
        })}
        {sorted.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No renewals tracked yet</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add Renewal Tracker</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Policy</label>
                <select value={form.policy_id} onChange={e => setForm({ ...form, policy_id: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Policy</option>
                  {policies.map(p => <option key={p.id} value={p.id}>{p.policy_number} - {p.policy_type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Renewal Date</label>
                <input type="date" value={form.renewal_date} onChange={e => setForm({ ...form, renewal_date: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Add</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
