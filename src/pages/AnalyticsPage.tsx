import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Shield, DollarSign, Activity } from 'lucide-react';
import { useStore } from '../store';

export default function AnalyticsPage() {
  const { customers, policies, claims, commissions, leads, renewals } = useStore();

  const policyMix = ['motor', 'life', 'health', 'term', 'home', 'travel', 'others'].map(type => ({
    type, count: policies.filter(p => p.policy_type === type).length,
    revenue: policies.filter(p => p.policy_type === type).reduce((s, p) => s + (p.premium_amount || 0), 0),
  }));

  const maxCount = Math.max(...policyMix.map(p => p.count), 1);
  const conversionRate = leads.length > 0 ? ((leads.filter(l => l.status === 'Closed').length / leads.length) * 100).toFixed(1) : '0';
  const claimApprovalRate = claims.length > 0 ? ((claims.filter(c => c.status === 'Approved' || c.status === 'Settled').length / claims.length) * 100).toFixed(1) : '0';
  const totalPremium = policies.reduce((s, p) => s + (p.premium_amount || 0), 0);
  const totalCommission = commissions.reduce((s, c) => s + c.commission_amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-violet-600" /> Analytics Dashboard
        </h1>
        <p className="text-slate-500 mt-1">Business intelligence and predictive insights</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, icon: Users, color: 'blue', suffix: '' },
          { label: 'Active Policies', value: policies.filter(p => p.status === 'active').length, icon: Shield, color: 'green', suffix: '' },
          { label: 'Total Premium', value: `₹${(totalPremium / 1000).toFixed(0)}K`, icon: DollarSign, color: 'emerald', suffix: '' },
          { label: 'Lead Conversion', value: conversionRate, icon: TrendingUp, color: 'purple', suffix: '%' },
          { label: 'Claim Approval', value: claimApprovalRate, icon: Activity, color: 'orange', suffix: '%' },
          { label: 'Total Commission', value: `₹${(totalCommission / 1000).toFixed(0)}K`, icon: DollarSign, color: 'pink', suffix: '' },
        ].map(({ label, value, icon: Icon, color, suffix }) => (
          <motion.div key={label} whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow border border-white/20 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-50 rounded-full -translate-y-8 translate-x-8`} />
            <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}{suffix}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Policy Mix Chart */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Policy Mix</h2>
        <div className="space-y-4">
          {policyMix.map(({ type, count, revenue }) => (
            <div key={type}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700 capitalize">{type}</span>
                <span className="text-sm text-slate-500">{count} policies • ₹{revenue.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCount) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Customer Status</h2>
          <div className="space-y-3">
            {['approved', 'pending', 'rejected', 'changes_requested'].map(status => {
              const count = customers.filter(c => c.status === status).length;
              const pct = customers.length > 0 ? (count / customers.length * 100).toFixed(0) : 0;
              const colors: Record<string, string> = { approved: 'green', pending: 'yellow', rejected: 'red', changes_requested: 'orange' };
              const color = colors[status] || 'blue';
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full bg-${color}-500`} />
                  <span className="text-sm text-slate-700 capitalize flex-1">{status.replace('_', ' ')}</span>
                  <span className="text-sm font-semibold text-slate-900">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Renewals Overview</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Renewals', value: renewals.length },
              { label: 'Processed', value: renewals.filter(r => r.processed).length },
              { label: 'Pending', value: renewals.filter(r => !r.processed).length },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">{label}</span>
                <span className="font-bold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> AI Predictions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Expected Renewals (30d)', value: Math.ceil(renewals.filter(r => !r.processed).length * 0.7) },
            { label: 'Lead Conversion (30d)', value: `${Math.ceil(leads.filter(l => l.status !== 'Closed' && l.status !== 'deleted').length * 0.3)}` },
            { label: 'Projected Revenue', value: `₹${(totalPremium * 1.15 / 1000).toFixed(0)}K` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/20 backdrop-blur rounded-xl p-4">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-white/80 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
