import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';

export default function CommissionsPage() {
  const { commissions, payCommission, tenant, employees } = useStore();
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const filtered = commissions.filter(c => {
    if (filter === 'paid') return c.is_paid;
    if (filter === 'unpaid') return !c.is_paid;
    return true;
  });

  const totalEarned = commissions.reduce((s, c) => s + c.commission_amount, 0);
  const totalPaid = commissions.filter(c => c.is_paid).reduce((s, c) => s + c.commission_amount, 0);
  const totalPending = commissions.filter(c => !c.is_paid).reduce((s, c) => s + c.commission_amount, 0);

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp?.name || id;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-emerald-600" /> Commissions
        </h1>
        <p className="text-slate-500 mt-1">Track agent commissions and payouts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Earned', value: totalEarned, icon: TrendingUp, color: 'blue' },
          { label: 'Total Paid', value: totalPaid, icon: CheckCircle2, color: 'green' },
          { label: 'Pending', value: totalPending, icon: Clock, color: 'orange' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} whileHover={{ scale: 1.02 }} className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow border border-white/20">
            <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">₹{value.toLocaleString()}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'paid', 'unpaid'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all capitalize ${filter === f ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Employee</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Rate</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Amount</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Due Date</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
              {tenant?.role === 'owner' && <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{getEmployeeName(c.employee_id)}</td>
                <td className="px-4 py-3 text-slate-600">{c.commission_rate}%</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">₹{c.commission_amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600">{c.due_date ? format(new Date(c.due_date), 'dd MMM yyyy') : '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {c.is_paid ? `Paid ${c.paid_date ? format(new Date(c.paid_date), 'dd MMM') : ''}` : 'Pending'}
                  </span>
                </td>
                {tenant?.role === 'owner' && (
                  <td className="px-4 py-3">
                    {!c.is_paid && (
                      <button onClick={() => payCommission(c.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all">
                        Pay Now
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">No commissions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
