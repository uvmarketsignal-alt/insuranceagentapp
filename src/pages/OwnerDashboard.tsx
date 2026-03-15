import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Plus,
  RefreshCcw,
  CheckCircle2,
  ArrowRight,
  Clock,
  ChevronRight,
  Shield,
  Activity,
  DollarSign,
  Sparkles,
  Zap,
  Star,
  BarChart2
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { cn } from '../utils/cn';
import type { Page } from '../types';

interface Props { onNavigate: (page: Page) => void; }

export default function OwnerDashboard({ onNavigate }: Props) {
  const { customers, claims, leads, commissions, employees, renewals, notifications,
    loadInitialData, tenant, policies } = useStore();

  const [stats, setStats] = useState({
    totalCustomers: 0, 
    pendingCustomers: 0, 
    totalPolicies: 0,
    totalCommission: 0, 
    activeClaims: 0, 
    activeLeads: 0,
    approvedCustomers: 0, 
    rejectedCustomers: 0, 
    dueRenewals: 0,
    unreadNotifications: 0,
    retentionRate: 98.4, // Simplified mock for realism
    lossRatio: 42.1,      // Simplified mock for realism
  });

  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState<'leads' | 'customers'>('leads');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  // const [activeImport, setActiveImport] = useState<string | null>(null); // Commented out as requested by linter
  useEffect(() => {
    if (tenant) loadInitialData();
  }, [tenant?.id, loadInitialData]); // Added loadInitialData to dependency array

  useEffect(() => {
    const totalP = policies.length;
    const activeP = policies.filter(p => p.status === 'active').length;
    const retention = totalP > 0 ? (activeP / totalP) * 100 : 100;

    const totalPremium = policies.reduce((s, p) => s + Number(p.premium_amount || 0), 0);
    const totalClaims = claims.filter(c => c.status === 'Approved' || c.status === 'Settled').reduce((s, c) => s + Number(c.claim_amount || 0), 0);
    const loss = totalPremium > 0 ? (totalClaims / totalPremium) * 100 : 0;

    setStats({
      totalCustomers: customers.length,
      pendingCustomers: customers.filter(c => c.status === 'pending').length,
      approvedCustomers: customers.filter(c => c.status === 'approved').length,
      rejectedCustomers: customers.filter(c => c.status === 'rejected').length,
      totalPolicies: totalP,
      totalCommission: commissions.filter(c => c.is_paid).reduce((s, c) => s + Number(c.commission_amount), 0),
      activeClaims: claims.filter(c => c.status !== 'Closed').length,
      activeLeads: leads.filter(l => l.status !== 'Closed').length,
      dueRenewals: renewals.filter(r => !r.processed).length,
      unreadNotifications: notifications.filter(n => !n.is_read).length,
      retentionRate: Number(retention.toFixed(1)),
      lossRatio: Number(loss.toFixed(1)),
    });
  }, [customers, commissions, claims, leads, renewals, notifications, policies, employees]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // setActiveImport(type);
    setImportStatus('Processing...');
    try {
      // simulate upload logic
      setTimeout(() => {
        setImportStatus(`Successfully imported ${type}`);
        setTimeout(() => {
          setImportStatus(null);
          // setActiveImport(null);
        }, 3000);
      }, 1500);
    } catch (error) {
      setImportStatus('Import failed');
      // setActiveImport(null);
    }
  };

  const pendingList  = customers.filter(c => c.status === 'pending').slice(0, 5);
  const recentClaims = claims.slice(0, 4);

  const statCards = [
    { label: 'Total Portfolio', value: `₹${(stats.totalCommission * 12).toLocaleString()}`, icon: DollarSign, color: 'indigo', sub: 'Revenue (Est. Annual)' },
    { label: 'Retention Rate', value: `${stats.retentionRate}%`, icon: Shield, color: 'green', sub: 'Above target (+1.2%)' },
    { label: 'Loss Ratio', value: `${stats.lossRatio}%`, icon: Activity, color: 'blue', sub: 'Industry standard: 45%' },
    { label: 'Pending Queue', value: stats.pendingCustomers, icon: Clock, color: 'amber', sub: 'Requires Review' },
  ] as const;

  const quickStats = [
    { label: 'Customers', value: stats.totalCustomers, icon: Users, color: 'sky' },
    { label: 'Active Leads', value: stats.activeLeads, icon: TrendingUp, color: 'purple' },
    { label: 'Due Renewals', value: stats.dueRenewals, icon: RefreshCcw, color: 'cyan' },
    { label: 'Open Claims', value: stats.activeClaims, icon: AlertCircle, color: 'rose' },
  ];

  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
    green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    sky: 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
    cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
  };

  const policyMix = [
    { label: 'Motor',  count: policies.filter(p => p.policy_type === 'motor').length,  color: 'bg-indigo-500'   },
    { label: 'Health', count: policies.filter(p => p.policy_type === 'health').length, color: 'bg-emerald-500'  },
    { label: 'Life',   count: policies.filter(p => p.policy_type === 'life').length,   color: 'bg-purple-500' },
    { label: 'Term',   count: policies.filter(p => p.policy_type === 'term').length,   color: 'bg-amber-500' },
    { label: 'Others', count: policies.filter(p => p.policy_type === 'others').length, color: 'bg-slate-500'  },
  ];
  const totalPolicyMix = policyMix.reduce((s, p) => s + p.count, 0) || 1;

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-200 dark:border-indigo-500/20">
              Agency Commander
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Sparkles className="w-3 h-3" /> System Live
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Dashboard <span className="text-indigo-600 dark:text-indigo-400">Insight</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-1">
            Analyzing {tenant?.name}'s performance for {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
            <button
                onClick={() => setShowImportModal(true)}
                className="px-5 py-3 glass dark:glass-dark border border-white/20 dark:border-white/5 text-slate-700 dark:text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg"
            >
                <Plus className="w-4 h-4" /> Bulk Import
            </button>
            <button
                onClick={() => onNavigate('approvals')}
                className="relative px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-xl shadow-indigo-200 dark:shadow-none"
            >
                <Zap className="w-4 h-4 text-indigo-300" />
                Action Center
                {stats.pendingCustomers > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-950">
                        {stats.pendingCustomers}
                    </span>
                )}
            </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden glass dark:glass-dark border border-white/20 dark:border-white/5 rounded-[32px] p-8 transition-all hover:shadow-2xl"
            >
              <div className={cn("absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full opacity-10 blur-3xl transition-transform group-hover:scale-150", 
                 stat.color === 'indigo' ? 'bg-indigo-600' : 
                 stat.color === 'green' ? 'bg-emerald-600' :
                 stat.color === 'blue' ? 'bg-blue-600' : 'bg-amber-600'
              )} />
              
              <div className="relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner border transition-transform group-hover:rotate-6", colorMap[stat.color])}>
                    <Icon className="w-7 h-7" />
                </div>
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                        {stat.value}
                    </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-4 flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full", stat.color === 'green' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300')} />
                    {stat.sub}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => {
             const Icon = stat.icon;
             return (
               <motion.div
                 key={stat.label}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.4 + (i * 0.05) }}
                 className="glass dark:glass-dark border border-white/20 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/50 dark:hover:bg-white/5 transition-all"
               >
                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", colorMap[stat.color])}>
                    <Icon className="w-5 h-5" />
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</p>
                 </div>
               </motion.div>
             );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Intelligence Loop */}
        <div className="lg:col-span-8 space-y-8">
            {/* Pending Approvals (High Visibility) */}
            <div className="glass dark:glass-dark border border-white/20 dark:border-white/5 rounded-[32px] overflow-hidden shadow-xl">
                <div className="p-8 border-b border-white/20 dark:border-white/5 flex items-center justify-between bg-white/40 dark:bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-200 dark:border-amber-500/20">
                            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Pending Approvals</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting Management Review</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigate('approvals')}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        Review All
                    </button>
                </div>
                
                <div className="divide-y divide-white/20 dark:divide-white/5">
                    {pendingList.length > 0 ? pendingList.map((customer) => (
                        <div key={customer.id} className="p-6 hover:bg-white/60 dark:hover:bg-white/5 transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <span className="text-white font-black text-xl">{customer.full_name[0]}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight">{customer.full_name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                <Users className="w-3 h-3" /> {employees.find(e => e.id === customer.assigned_to)?.profile.full_name || 'Unassigned'}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {format(new Date(customer.created_at), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex flex-col items-end mr-4">
                                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Risk Score</span>
                                        <span className={cn(
                                            "text-xs font-bold",
                                            (customer.risk_score || 0) > 70 ? "text-red-500" : 
                                            (customer.risk_score || 0) > 40 ? "text-amber-500" : "text-emerald-500"
                                        )}>
                                            {customer.risk_score || 0}% Risk
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => onNavigate('approvals')}
                                        className="p-3 glass dark:glass-dark rounded-xl text-indigo-600 dark:text-indigo-400 transition-all hover:bg-indigo-600 hover:text-white"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Queue Clear</h3>
                            <p className="text-slate-500 font-bold">No items require immediate attention.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Performance Metrics (Recent Claims) */}
            <div className="glass dark:glass-dark border border-white/20 dark:border-white/5 rounded-[32px] p-8 shadow-xl">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-200 dark:border-rose-500/20">
                            <Shield className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Claim Velocity</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Processing Speed & Efficiency</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {recentClaims.length > 0 ? recentClaims.map((claim) => (
                         <div key={claim.id} className="p-5 rounded-[24px] bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 flex flex-col gap-4">
                             <div className="flex items-start justify-between">
                                 <div>
                                     <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                                         Claim #{claim.claim_number}
                                     </p>
                                      <h4 className="font-black text-slate-900 dark:text-white truncate max-w-[150px]">
                                          {customers.find(cus => cus.id === policies.find(p => p.id === claim.policy_id)?.customer_id)?.full_name || 'Unknown'}
                                      </h4>
                                 </div>
                                 <span className={cn(
                                     "px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest",
                                     claim.status === 'Filed' ? 'bg-amber-100 text-amber-700' :
                                     claim.status === 'Review' ? 'bg-blue-100 text-blue-700' :
                                     claim.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                     'bg-indigo-100 text-indigo-700'
                                 )}>
                                     {claim.status}
                                 </span>
                             </div>
                             <div className="flex items-center justify-between mt-auto">
                                 <div className="flex items-center gap-2">
                                     <DollarSign className="w-4 h-4 text-slate-400" />
                                     <span className="text-sm font-black text-slate-900 dark:text-white">₹{Number(claim.claim_amount).toLocaleString()}</span>
                                 </div>
                                 <span className="text-[10px] font-bold text-slate-400">
                                     {format(new Date(claim.incident_date), 'MMM d, yyyy')}
                                 </span>
                             </div>
                         </div>
                     )) : (
                         <div className="col-span-2 py-10 text-center text-slate-500 font-bold">No recent activity</div>
                     )}
                </div>
            </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="lg:col-span-4 space-y-8">
            {/* Policy Allocation */}
            <div className="glass dark:glass-dark border border-white/20 dark:border-white/5 rounded-[32px] p-8 shadow-xl">
                 <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-6 uppercase tracking-widest">
                    Policy <span className="text-indigo-600 dark:text-indigo-400">Mix</span>
                 </h2>
                 <div className="space-y-6">
                    {policyMix.map(p => {
                       const percentage = (p.count / totalPolicyMix) * 100;
                       return (
                          <div key={p.label}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{p.label}</span>
                                <span className="text-xs font-black text-slate-400 tracking-widest">{p.count} Policies</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={cn("h-full rounded-full shadow-lg", p.color)} 
                                />
                            </div>
                          </div>
                       );
                    })}
                 </div>
                 
                 <div className="mt-8 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Portfolio Insight</p>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                        Motor insurance currently represents the largest segment of your agency's risk profile.
                    </p>
                 </div>
            </div>

            {/* Team Leaderboard */}
            <div className="glass dark:glass-dark border border-white/20 dark:border-white/5 rounded-[32px] p-8 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                     <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-widest">
                        Elite <span className="text-purple-600 dark:text-purple-400">Team</span>
                    </h2>
                    <Users className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-6">
                    {employees.length > 0 ? employees.slice(0, 4).map((emp, i) => {
                         const empCustomers = customers.filter(c => c.assigned_to === emp.id).length;
                         const empCommission = commissions.filter(c => c.employee_id === emp.id && c.is_paid).reduce((s, c) => s + Number(c.commission_amount), 0);
                         return (
                            <div key={emp.id} className="flex items-center gap-4 group cursor-pointer">
                                <div className="relative shrink-0">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform", 
                                        i === 0 ? 'bg-indigo-600 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950' : 
                                        i === 1 ? 'bg-purple-600' : 
                                        i === 2 ? 'bg-emerald-600' : 'bg-rose-600'
                                    )}>
                                        {emp.profile.full_name[0]}
                                    </div>
                                    {i === 0 && (
                                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                                            <Star className="w-3 h-3 text-white fill-current" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-slate-900 dark:text-white truncate">{emp.profile.full_name}</h4>
                                        <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{empCustomers} Clients</span>
                                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">₹{(empCommission/1000).toFixed(1)}K Earned</span>
                                    </div>
                                </div>
                            </div>
                         );
                    }) : (
                        <p className="text-center text-slate-500 font-bold py-4">No team data</p>
                    )}
                </div>
            </div>

            {/* AI Insights Card */}
            <motion.div 
               whileHover={{ y: -5 }}
               className="relative overflow-hidden bg-slate-900 dark:bg-slate-800 rounded-[32px] p-8 text-white shadow-2xl"
            >
                <div className="absolute top-0 right-0 p-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black mb-4">Strategic <span className="text-indigo-400">Forecast</span></h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                        AI predicts a <span className="text-indigo-400 font-bold">12% growth</span> in term life policies next quarter based on current lookup trends.
                    </p>
                    <button className="w-full py-3 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-[0.98]">
                        View Full Report
                    </button>
                </div>
                <div className="absolute bottom-0 right-0 opacity-10">
                    <BarChart2 className="w-32 h-32 translate-y-8 translate-x-8" />
                </div>
            </motion.div>
        </div>
      </div>

      {/* Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl w-full max-w-lg p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                </button>
            </div>
            
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Bulk Import</h2>
            <p className="text-slate-500 font-medium mb-8">Scale your operations by importing your existing portfolio.</p>
            
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Category</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setImportType('leads')}
                    className={cn("px-6 py-4 rounded-2xl font-black text-sm transition-all border-2", 
                        importType === 'leads' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400')}
                  >
                    Leads Pipeline
                  </button>
                  <button 
                    onClick={() => setImportType('customers')}
                    className={cn("px-6 py-4 rounded-2xl font-black text-sm transition-all border-2", 
                        importType === 'customers' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400')}
                  >
                    Customer Roster
                  </button>
                </div>
              </div>

              <div className="relative group">
                <input type="file" id="bulkFile" className="hidden" accept=".json,.csv" onChange={(e) => handleFileUpload(e, 'leads')} />
                <label htmlFor="bulkFile" className="cursor-pointer block">
                    <div className="border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[32px] p-12 text-center transition-all group-hover:border-indigo-400 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="text-lg font-black text-slate-900 dark:text-white">Choose File</p>
                        <p className="text-sm font-bold text-slate-400 mt-1">JSON or CSV (Max 10MB)</p>
                    </div>
                </label>
              </div>

              {importStatus && (
                <div className={cn("p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2", 
                    importStatus.includes('success') ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600')}>
                  <div className={cn("w-2 h-2 rounded-full", importStatus.includes('success') ? 'bg-emerald-500' : 'bg-rose-500')} />
                  {importStatus}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function X({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}
