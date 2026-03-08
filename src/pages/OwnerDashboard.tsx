import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FileCheck, AlertCircle, TrendingUp, Plus,
  BarChart2, Shield, Bell, ArrowRight, CheckCircle, Clock,
  RefreshCw, Star, Activity, DollarSign, FileText,
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import type { Page } from '../types';

interface Props { onNavigate: (page: Page) => void; }

export default function OwnerDashboard({ onNavigate }: Props) {
  const { customers, claims, leads, commissions, employees, renewals, notifications,
    loadInitialData, tenant, policies } = useStore();

  const [stats, setStats] = useState({
    totalCustomers: 0, pendingCustomers: 0, totalPolicies: 0,
    totalCommission: 0, activeClaims: 0, activeLeads: 0,
    approvedCustomers: 0, rejectedCustomers: 0, dueRenewals: 0,
    unreadNotifications: 0,
  });

  useEffect(() => {
    if (tenant) loadInitialData(tenant.id);
  }, [tenant?.id]);

  useEffect(() => {
    setStats({
      totalCustomers: customers.length,
      pendingCustomers: customers.filter(c => c.status === 'pending').length,
      approvedCustomers: customers.filter(c => c.status === 'approved').length,
      rejectedCustomers: customers.filter(c => c.status === 'rejected').length,
      totalPolicies: policies.length,
      totalCommission: commissions.filter(c => c.is_paid).reduce((s, c) => s + Number(c.commission_amount), 0),
      activeClaims: claims.filter(c => c.status !== 'Closed').length,
      activeLeads: leads.filter(l => l.status !== 'Closed').length,
      dueRenewals: renewals.filter(r => !r.processed).length,
      unreadNotifications: notifications.filter(n => !n.is_read).length,
    });
  }, [customers, commissions, claims, leads, renewals, notifications, policies]);

  const pendingList  = customers.filter(c => c.status === 'pending').slice(0, 5);
  const recentClaims = claims.slice(0, 4);

  const statCards = [
    { label: 'Total Customers', value: stats.totalCustomers,  icon: Users,       color: 'blue',   sub: `${stats.approvedCustomers} approved`,   page: 'customers'    },
    { label: 'Pending Approval',value: stats.pendingCustomers,icon: Clock,        color: 'amber',  sub: 'Awaiting review',                       page: 'approvals'    },
    { label: 'Active Claims',   value: stats.activeClaims,    icon: AlertCircle,  color: 'red',    sub: 'Needs attention',                       page: 'claims'       },
    { label: 'Commission Paid', value: `₹${stats.totalCommission.toLocaleString()}`, icon: DollarSign, color: 'green', sub: 'Total paid out', page: 'commissions' },
    { label: 'Active Leads',    value: stats.activeLeads,     icon: TrendingUp,   color: 'purple', sub: 'In pipeline',                           page: 'leads'        },
    { label: 'Due Renewals',    value: stats.dueRenewals,     icon: RefreshCw,    color: 'cyan',   sub: 'Action needed',                         page: 'renewals'     },
    { label: 'Total Policies',  value: stats.totalPolicies,   icon: FileText,     color: 'indigo', sub: 'Across all customers',                  page: 'customers'    },
    { label: 'Notifications',   value: stats.unreadNotifications, icon: Bell,     color: 'pink',   sub: 'Unread alerts',                         page: 'audit-logs'   },
  ] as const;

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600', amber: 'from-amber-500 to-orange-500',
    red: 'from-red-500 to-red-600', green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-purple-600', cyan: 'from-cyan-500 to-teal-500',
    indigo: 'from-indigo-500 to-indigo-600', pink: 'from-pink-500 to-rose-500',
  };

  const policyMix = [
    { label: 'Motor',  count: policies.filter(p => p.policy_type === 'motor').length,  color: 'bg-blue-500'   },
    { label: 'Life',   count: policies.filter(p => p.policy_type === 'life').length,   color: 'bg-purple-500' },
    { label: 'Health', count: policies.filter(p => p.policy_type === 'health').length, color: 'bg-green-500'  },
    { label: 'Term',   count: policies.filter(p => p.policy_type === 'term').length,   color: 'bg-orange-500' },
    { label: 'Home',   count: policies.filter(p => p.policy_type === 'home').length,   color: 'bg-pink-500'   },
    { label: 'Travel', count: policies.filter(p => p.policy_type === 'travel').length, color: 'bg-cyan-500'   },
    { label: 'Others', count: policies.filter(p => p.policy_type === 'others').length, color: 'bg-slate-500'  },
  ];
  const totalPolicyMix = policyMix.reduce((s, p) => s + p.count, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Owner Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            {format(new Date(), 'EEEE, MMMM d yyyy')} · Welcome back, {tenant?.name}!
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('new-customer')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Customer
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('analytics')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center gap-2 text-sm shadow-sm">
            <BarChart2 className="w-4 h-4" /> Analytics
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => onNavigate(stat.page as Page)}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${colorMap[stat.color]}`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[stat.color]} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="font-semibold text-slate-900">Pending Approvals</h2>
              {stats.pendingCustomers > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                  {stats.pendingCustomers}
                </span>
              )}
            </div>
            <button onClick={() => onNavigate('approvals')} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {pendingList.length > 0 ? pendingList.map(customer => (
              <div key={customer.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{customer.full_name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{customer.full_name}</p>
                    <p className="text-sm text-slate-500 truncate">{customer.phone}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{format(new Date(customer.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => onNavigate('approvals')}
                      className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Review
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="font-medium text-slate-700">All caught up!</p>
                <p className="text-sm text-slate-500 mt-1">No pending approvals</p>
              </div>
            )}
          </div>
        </div>

        {/* Employee Performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Employee Stats</h2>
          </div>
          <div className="p-5 space-y-4">
            {employees.length > 0 ? employees.slice(0, 4).map((emp, i) => {
              const empCustomers = customers.filter(c => c.assigned_to === emp.id).length;
              const empCommission = commissions.filter(c => c.employee_id === emp.id && c.is_paid).reduce((s, c) => s + Number(c.commission_amount), 0);
              return (
                <div key={emp.id} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                    i === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                    i === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                    i === 2 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                    'bg-gradient-to-br from-orange-500 to-orange-600'
                  }`}>
                    {emp.profile.full_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{emp.profile.full_name}</p>
                    <p className="text-xs text-slate-500">{empCustomers} customers · ₹{empCommission.toLocaleString()}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-4">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No employees yet</p>
                <button onClick={() => onNavigate('employees')} className="mt-2 text-xs text-blue-600 hover:underline">Add Employee</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy Mix */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Policy Mix</h2>
          </div>
          <div className="p-5 space-y-3">
            {policyMix.map(p => (
              <div key={p.label} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-14 flex-shrink-0">{p.label}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full transition-all`} style={{ width: `${(p.count / totalPolicyMix) * 100}%` }} />
                </div>
                <span className="text-sm font-semibold text-slate-700 w-6 text-right">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Claims */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-red-600" />
              </div>
              <h2 className="font-semibold text-slate-900">Recent Claims</h2>
            </div>
            <button onClick={() => onNavigate('claims')} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentClaims.length > 0 ? recentClaims.map(claim => (
              <div key={claim.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">#{claim.claim_number}</p>
                  <p className="text-sm text-slate-500">{claim.claim_type} · ₹{Number(claim.claim_amount).toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{format(new Date(claim.incident_date), 'MMM d, yyyy')}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                  claim.status === 'Filed' ? 'bg-yellow-100 text-yellow-700' :
                  claim.status === 'Review' ? 'bg-blue-100 text-blue-700' :
                  claim.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  claim.status === 'Settled' ? 'bg-purple-100 text-purple-700' :
                  'bg-slate-100 text-slate-700'}`}>
                  {claim.status}
                </span>
              </div>
            )) : (
              <div className="p-10 text-center">
                <Shield className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No claims yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Add Customer', icon: Plus, page: 'new-customer', color: 'from-blue-500 to-blue-600' },
          { label: 'View Approvals', icon: FileCheck, page: 'approvals', color: 'from-amber-500 to-orange-500' },
          { label: 'Manage Employees', icon: Users, page: 'employees', color: 'from-purple-500 to-purple-600' },
          { label: 'View Reports', icon: BarChart2, page: 'analytics', color: 'from-green-500 to-emerald-500' },
        ].map(action => {
          const Icon = action.icon;
          return (
            <motion.button key={action.label}
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(action.page as Page)}
              className={`p-4 bg-gradient-to-br ${action.color} text-white rounded-2xl font-medium shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs text-center leading-tight">{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
