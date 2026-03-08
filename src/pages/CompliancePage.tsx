import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Plus, Download } from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';

export default function CompliancePage() {
  const { complianceReports, addComplianceReport, tenant } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ report_type: '', period_start: '', period_end: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    await addComplianceReport({
      tenant_id: tenant.id, report_type: form.report_type,
      period_start: new Date(form.period_start), period_end: new Date(form.period_end),
    });
    setShowForm(false);
    setForm({ report_type: '', period_start: '', period_end: '' });
  };

  const STATUS_COLORS: Record<string, string> = { draft: 'bg-yellow-100 text-yellow-700', submitted: 'bg-blue-100 text-blue-700', approved: 'bg-green-100 text-green-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-teal-600" /> Compliance Reports
          </h1>
          <p className="text-slate-500 mt-1">IRDAI regulatory compliance reporting</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 rounded-xl font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> New Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reports', value: complianceReports.length, color: 'teal' },
          { label: 'Submitted', value: complianceReports.filter(r => r.status === 'submitted').length, color: 'blue' },
          { label: 'Approved', value: complianceReports.filter(r => r.status === 'approved').length, color: 'green' },
        ].map(({ label, value, color }) => (
          <motion.div key={label} whileHover={{ scale: 1.02 }} className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow border border-white/20 text-center">
            <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Reports */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Report Type</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Period</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Created</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complianceReports.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{r.report_type}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">
                  {format(new Date(r.period_start), 'dd MMM yyyy')} – {format(new Date(r.period_end), 'dd MMM yyyy')}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-600 text-sm">{format(new Date(r.created_at), 'dd MMM yyyy')}</td>
                <td className="px-4 py-3">
                  <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                    <Download className="w-4 h-4" /> Export
                  </button>
                </td>
              </tr>
            ))}
            {complianceReports.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">No compliance reports yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">New Compliance Report</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
                <select value={form.report_type} onChange={e => setForm({ ...form, report_type: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select Type</option>
                  <option value="IRDAI Quarterly">IRDAI Quarterly Report</option>
                  <option value="IRDAI Annual">IRDAI Annual Report</option>
                  <option value="AML Report">AML/KYC Report</option>
                  <option value="Grievance Report">Grievance Report</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Period Start</label>
                  <input type="date" value={form.period_start} onChange={e => setForm({ ...form, period_start: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Period End</label>
                  <input type="date" value={form.period_end} onChange={e => setForm({ ...form, period_end: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Create Report</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
