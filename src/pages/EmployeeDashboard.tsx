import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, AlertCircle, TrendingUp, Plus, Camera,
  Clock, DollarSign, ArrowRight, CheckCircle, Star,
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import type { Page } from '../types';

interface Props { onNavigate: (page: Page) => void; }

export default function EmployeeDashboard({ onNavigate }: Props) {
  const { customers, claims, leads, commissions, loadInitialData, tenant } = useStore();

  const [stats, setStats] = useState({
    totalCustomers: 0, pendingCustomers: 0,
    activeClaims: 0, totalCommission: 0, activeLeads: 0,
  });

  useEffect(() => {
    if (tenant) loadInitialData(tenant.id);
  }, [tenant?.id]);

  useEffect(() => {
    const myCustomers = customers.filter(c => c.assigned_to === tenant?.id);
    setStats({
      totalCustomers: myCustomers.length,
      pendingCustomers: myCustomers.filter(c => c.status === 'pending').length,
      activeClaims: claims.filter(c => c.status !== 'Closed').length,
      totalCommission: commissions.filter(c => c.employee_id === tenant?.id && c.is_paid)
        .reduce((s, c) => s + Number(c.commission_amount), 0),
      activeLeads: leads.filter(l => l.assigned_to === tenant?.id && l.status !== 'Closed').length,
    });
  }, [customers, commissions, claims, leads, tenant]);

  const recentCustomers = customers.filter(c => c.assigned_to === tenant?.id).slice(0, 5);

  const statCards = [
    { label: 'My Customers',    value: stats.totalCustomers,  icon: Users,       color: 'blue',   sub: 'Total assigned', page: 'customers'   },
    { label: 'Pending Approval',value: stats.pendingCustomers,icon: Clock,        color: 'amber',  sub: 'Awaiting owner', page: 'customers'   },
    { label: 'Active Claims',   value: stats.activeClaims,    icon: AlertCircle,  color: 'red',    sub: 'Open cases',    page: 'claims'      },
    { label: 'My Commission',   value: `₹${stats.totalCommission.toLocaleString()}`, icon: DollarSign, color: 'green', sub: 'Total earned', page: 'commissions' },
  ] as const;

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600', amber: 'from-amber-500 to-orange-500',
    red: 'from-red-500 to-red-600', green: 'from-green-500 to-emerald-500',
  };

  const quickActions = [
    { label: 'New Customer',      icon: Plus,      page: 'new-customer', color: 'bg-blue-600 hover:bg-blue-700'    },
    { label: 'View Customers',    icon: Users,     page: 'customers',    color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'My Leads',          icon: TrendingUp,page: 'leads',        color: 'bg-green-600 hover:bg-green-700'   },
    { label: 'Claims',            icon: AlertCircle,page: 'claims',      color: 'bg-red-600 hover:bg-red-700'       },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-8 text-white shadow-xl"
      >
        {/* Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
              {tenant?.name?.[0] || 'E'}
            </div>
            <div>
              <p className="text-blue-200 text-sm">Welcome back</p>
              <h1 className="text-2xl font-bold">{tenant?.name}!</h1>
            </div>
          </div>
          <p className="text-blue-100 mb-6">{format(new Date(), 'EEEE, MMMM d yyyy')} — Ready to serve your customers?</p>

          <div className="flex flex-wrap gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('new-customer')}
              className="px-4 py-2 bg-white text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg">
              <Plus className="w-4 h-4" /> New Customer
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('documents')}
              className="px-4 py-2 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors flex items-center gap-2">
              <Camera className="w-4 h-4" /> Capture Document
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('leads')}
              className="px-4 py-2 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> My Leads
            </motion.button>
          </div>
        </div>
      </motion.div>

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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <motion.button key={action.label}
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(action.page as Page)}
              className={`${action.color} text-white rounded-2xl p-4 font-medium shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs text-center">{action.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Recent Customers + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Customers */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-semibold text-slate-900">My Recent Customers</h2>
            </div>
            <button onClick={() => onNavigate('customers')} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentCustomers.length > 0 ? recentCustomers.map(customer => (
              <div key={customer.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{customer.full_name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{customer.full_name}</p>
                    <p className="text-sm text-slate-500 truncate">{customer.phone}</p>
                    <p className="text-xs mt-0.5">
                      <span className={`font-semibold ${
                        customer.status === 'approved' ? 'text-green-600' :
                        customer.status === 'pending' ? 'text-amber-600' :
                        customer.status === 'rejected' ? 'text-red-600' : 'text-blue-600'
                      }`}>{customer.status.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 flex-shrink-0">
                    {format(new Date(customer.created_at), 'MMM d')}
                  </p>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No customers assigned yet</p>
                <button onClick={() => onNavigate('new-customer')} className="mt-2 text-sm text-blue-600 hover:underline">
                  Add your first customer →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* My Performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-semibold text-slate-900">My Performance</h2>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'Customers Added',  value: stats.totalCustomers, max: 20, color: 'bg-blue-500' },
              { label: 'Active Leads',     value: stats.activeLeads,    max: 15, color: 'bg-purple-500' },
              { label: 'Claims Handled',   value: stats.activeClaims,   max: 10, color: 'bg-red-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }} />
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Approval Status</p>
              <div className="flex gap-2">
                <div className="flex-1 text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-700">{customers.filter(c => c.assigned_to === tenant?.id && c.status === 'approved').length}</p>
                  <p className="text-xs text-green-600">Approved</p>
                </div>
                <div className="flex-1 text-center p-2 bg-amber-50 rounded-lg">
                  <p className="text-lg font-bold text-amber-700">{stats.pendingCustomers}</p>
                  <p className="text-xs text-amber-600">Pending</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <p className="text-xs text-slate-500 mb-1">Commission Earned</p>
                <p className="text-xl font-bold text-blue-700">₹{stats.totalCommission.toLocaleString()}</p>
                <button onClick={() => onNavigate('commissions')} className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                  View details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending items reminder */}
      {stats.pendingCustomers > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-900">{stats.pendingCustomers} customer(s) awaiting approval</p>
              <p className="text-sm text-amber-700">Your submissions are pending owner review</p>
            </div>
          </div>
          <button onClick={() => onNavigate('customers')}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> View Status
          </button>
        </motion.div>
      )}
    </div>
  );
}
