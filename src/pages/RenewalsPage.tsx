import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, AlertTriangle, CheckCircle2, Clock, Plus, Send, LayoutList, CalendarDays, Timer } from 'lucide-react';
import { useStore } from '../store';
import { format, differenceInDays, isSameMonth, isToday, isThisWeek, isAfter } from 'date-fns';

type ViewMode = 'list' | 'monthly' | 'daily';

export default function RenewalsPage() {
  const { renewals, processRenewal, sendRenewalReminder, addRenewal, tenant, policies } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
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

  const sortedRenewals = [...renewals].sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime());

  const renderRenewalItem = (renewal: any) => {
    const urgency = getUrgency(renewal.renewal_date);
    const policy = policies.find(p => p.id === renewal.policy_id);
    const colorMap: Record<string, { border: string, bg: string, text: string }> = {
      red: { border: 'border-red-400', bg: 'bg-red-100', text: 'text-red-600' },
      orange: { border: 'border-orange-400', bg: 'bg-orange-100', text: 'text-orange-600' },
      yellow: { border: 'border-yellow-400', bg: 'bg-yellow-100', text: 'text-yellow-600' },
      green: { border: 'border-green-400', bg: 'bg-green-100', text: 'text-green-600' },
      blue: { border: 'border-blue-400', bg: 'bg-blue-100', text: 'text-blue-600' },
    };
    const colors = colorMap[urgency.color] || colorMap.blue;

    return (
      <motion.div
        key={renewal.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-white/80 backdrop-blur rounded-2xl shadow border-l-4 border border-white/20 p-4 mb-3 flex items-center justify-between ${colors.border} active:scale-[0.98] transition-all`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center shadow-inner`}>
            {urgency.days < 0 ? <AlertTriangle className={`w-5 h-5 ${colors.text}`} /> :
              renewal.processed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                <Clock className={`w-5 h-5 ${colors.text}`} />}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{policy?.policy_number || renewal.policy_id}</p>
            <p className="text-sm text-slate-500 font-medium">{policy?.policy_type || 'Policy'} • {policy?.insurer || ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div className="hidden sm:block">
            <p className="font-semibold text-slate-700">{format(new Date(renewal.renewal_date), 'dd MMM yyyy')}</p>
            <p className={`text-sm font-bold ${colors.text}`}>
              {urgency.days < 0 ? `${Math.abs(urgency.days)}d overdue` : `${urgency.days}d remaining`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            {!renewal.processed && (
              <div className="flex gap-2">
                <button
                  onClick={() => sendRenewalReminder(renewal.id)}
                  title={renewal.notified ? `Last notified: ${format(new Date(renewal.notified_at!), 'dd MMM HH:mm')}` : 'Send Reminder'}
                  className={`p-2 rounded-xl transition-all ${renewal.notified ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white'}`}
                >
                  <Send className="w-4 h-4" />
                </button>
                {tenant?.role === 'owner' && (
                  <button onClick={() => processRenewal(renewal.id)} className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-200 hover:scale-105 transition-all">
                    Process
                  </button>
                )}
              </div>
            )}
            {renewal.processed && (
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Processed
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMonthlyView = () => {
    const months: Record<string, any[]> = {};
    sortedRenewals.forEach(r => {
      const monthKey = format(new Date(r.renewal_date), 'MMMM yyyy');
      if (!months[monthKey]) months[monthKey] = [];
      months[monthKey].push(r);
    });

    return Object.entries(months).map(([month, items]) => (
      <div key={month} className="mb-8">
        <h2 className="text-lg font-bold text-slate-600 mb-4 flex items-center gap-2 px-2">
          <CalendarDays className="w-5 h-5 text-blue-500" /> {month}
          <span className="text-xs font-medium bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{items.length}</span>
        </h2>
        <div className="grid gap-1">
          {items.map(renderRenewalItem)}
        </div>
      </div>
    ));
  };

  const renderDailyView = () => {
    const categories = {
      Overdue: sortedRenewals.filter(r => differenceInDays(new Date(r.renewal_date), new Date()) < 0 && !r.processed),
      Today: sortedRenewals.filter(r => isToday(new Date(r.renewal_date))),
      'This Week': sortedRenewals.filter(r => isThisWeek(new Date(r.renewal_date)) && !isToday(new Date(r.renewal_date)) && differenceInDays(new Date(r.renewal_date), new Date()) >= 0),
      Upcoming: sortedRenewals.filter(r => !isThisWeek(new Date(r.renewal_date)) && isAfter(new Date(r.renewal_date), new Date())),
    };

    return Object.entries(categories).map(([label, items]) => items.length > 0 && (
      <div key={label} className="mb-8">
        <h2 className="text-lg font-bold text-slate-600 mb-4 flex items-center gap-2 px-2">
          <Timer className={`w-5 h-5 ${label === 'Overdue' ? 'text-red-500' : 'text-orange-500'}`} /> {label}
          <span className="text-xs font-medium bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{items.length}</span>
        </h2>
        <div className="grid gap-1">
          {items.map(renderRenewalItem)}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <RefreshCcw className="w-8 h-8 text-green-600 animate-spin-slow" /> Renewals
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Track policy renewal dates and send reminders</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/50 p-1 rounded-2xl border border-white/20 shadow-inner flex items-center">
            {[
              { id: 'list', icon: LayoutList, label: 'List' },
              { id: 'monthly', icon: CalendarDays, label: 'Monthly' },
              { id: 'daily', icon: Timer, label: 'Daily' }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setViewMode(btn.id as ViewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === btn.id ? 'bg-white shadow-xl text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <btn.icon className="w-4 h-4" /> {btn.label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-green-200 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider">
            <Plus className="w-4 h-4 stroke-[3px]" /> Add Renewal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tracked', value: renewals.length, color: 'blue' },
          { label: 'Unprocessed Overdue', value: renewals.filter(r => differenceInDays(new Date(r.renewal_date), new Date()) < 0 && !r.processed).length, color: 'red' },
          { label: 'Due This Month', value: renewals.filter(r => { const d = new Date(r.renewal_date); return isSameMonth(d, new Date()) && !r.processed; }).length, color: 'orange' },
          { label: 'Lifetime Processed', value: renewals.filter(r => r.processed).length, color: 'green' },
        ].map(s => {
          const statsColorMap: Record<string, { bg: string, text: string }> = {
            blue: { bg: 'bg-blue-500/50', text: 'text-blue-600' },
            red: { bg: 'bg-red-500/50', text: 'text-red-600' },
            orange: { bg: 'bg-orange-500/50', text: 'text-orange-600' },
            green: { bg: 'bg-green-500/50', text: 'text-green-600' },
          };
          const colors = statsColorMap[s.color] || statsColorMap.blue;
          return (
            <motion.div key={s.label} whileHover={{ y: -5 }} className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-xl border border-white/20 text-center relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full ${colors.bg} group-hover:w-full transition-all duration-500 opacity-10`} />
              <p className={`text-4xl font-black ${colors.text} relative z-10`}>{s.value}</p>
              <p className="text-xs font-black text-slate-400 mt-2 uppercase tracking-widest relative z-10">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Renewals Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'list' && (
            <div className="space-y-1">
              {sortedRenewals.map(renderRenewalItem)}
            </div>
          )}
          {viewMode === 'monthly' && renderMonthlyView()}
          {viewMode === 'daily' && renderDailyView()}

          {renewals.length === 0 && (
            <div className="text-center py-20 bg-white/40 backdrop-blur rounded-3xl border-2 border-dashed border-slate-200">
              <RefreshCcw className="w-16 h-16 mx-auto mb-4 text-slate-300 opacity-50" />
              <p className="text-xl font-bold text-slate-400">No renewals tracked yet</p>
              <p className="text-slate-400 mt-1">Add your first renewal to start tracking</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 z-0" />
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                New Renewal Tracker
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Policy Association</label>
                  <select value={form.policy_id} onChange={e => setForm({ ...form, policy_id: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium">
                    <option value="">Select a Policy</option>
                    {policies.map(p => <option key={p.id} value={p.id}>{p.policy_number} - {p.policy_type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Next Renewal Date</label>
                  <input type="date" value={form.renewal_date} onChange={e => setForm({ ...form, renewal_date: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 text-slate-500 font-bold hover:text-slate-800 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all">Add Tracker</button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
