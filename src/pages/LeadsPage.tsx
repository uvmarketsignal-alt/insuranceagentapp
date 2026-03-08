import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Phone, Mail, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';

const STAGES = ['New', 'Contacted', 'Meeting', 'Proposal', 'Closed'] as const;
const STAGE_COLORS: Record<string, string> = {
  New: 'bg-blue-500', Contacted: 'bg-yellow-500', Meeting: 'bg-orange-500', Proposal: 'bg-purple-500', Closed: 'bg-green-500',
};

export default function LeadsPage() {
  const { leads, addLead, updateLeadStage, deleteLead, tenant } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', source: '', notes: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    await addLead({ ...form, tenant_id: tenant.id, status: 'New', assigned_to: tenant.id });
    setShowForm(false);
    setForm({ full_name: '', phone: '', email: '', source: '', notes: '' });
  };

  const activeLeads = leads.filter(l => l.status !== 'deleted');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" /> Lead Pipeline
          </h1>
          <p className="text-slate-500 mt-1">Manage your sales pipeline and convert leads</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto">
        {STAGES.map(stage => {
          const stageLeads = activeLeads.filter(l => l.status === stage);
          return (
            <div key={stage} className="bg-slate-50 rounded-2xl p-3 min-w-48">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage]}`} />
                <span className="font-semibold text-slate-700 text-sm">{stage}</span>
                <span className="ml-auto bg-white text-slate-600 text-xs px-2 py-0.5 rounded-full">{stageLeads.length}</span>
              </div>
              <div className="space-y-2">
                {stageLeads.map(lead => (
                  <motion.div key={lead.id} layout whileHover={{ scale: 1.02 }} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                    <p className="font-semibold text-slate-900 text-sm">{lead.full_name}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <Phone className="w-3 h-3" /> {lead.phone}
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                        <Mail className="w-3 h-3" /> {lead.email}
                      </div>
                    )}
                    {lead.source && <p className="text-xs text-slate-400 mt-1">Source: {lead.source}</p>}
                    <p className="text-xs text-slate-400">{format(new Date(lead.created_at), 'dd MMM')}</p>
                    {/* Move to next stage */}
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {STAGES.filter(s => s !== stage).map(s => (
                        <button key={s} onClick={() => updateLeadStage(lead.id, s)}
                          className="text-xs px-2 py-0.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded transition-all">
                          {s} <ChevronRight className="w-3 h-3 inline" />
                        </button>
                      ))}
                      {tenant?.role === 'owner' && (
                        <button onClick={() => deleteLead(lead.id)} className="text-xs px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-all">Delete</button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {stageLeads.length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-xs">No leads in this stage</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add New Lead</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Source</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Online">Online</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Advertisement">Advertisement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add Lead</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
