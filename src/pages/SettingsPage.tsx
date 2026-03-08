import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Database, Moon, Sun, Shield, Bell, Upload } from 'lucide-react';
import { useStore } from '../store';
import { dbService } from '../lib/db-service';

export default function SettingsPage() {
  const { tenant, darkMode, setDarkMode, appName, appLogo, updateAppSettings } = useStore();
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [newAppName, setNewAppName] = useState(appName);
  const [logoPreview, setLogoPreview] = useState<string | null>(appLogo);
  const [saved, setSaved] = useState(false);

  const checkDb = async () => {
    setDbStatus('checking');
    try {
      const ok = await dbService.healthCheck();
      setDbStatus(ok ? 'connected' : 'disconnected');
    } catch {
      setDbStatus('disconnected');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      setLogoPreview(url);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (tenant?.role !== 'owner') return;
    updateAppSettings({ appName: newAppName, appLogo: logoPreview || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-slate-600" /> Settings
        </h1>
        <p className="text-slate-500 mt-1">Manage application preferences</p>
      </div>

      {/* App Branding (Owner Only) */}
      {tenant?.role === 'owner' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" /> App Branding
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">App Name</label>
              <input type="text" value={newAppName} onChange={e => setNewAppName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">App Logo</label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-slate-200" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">UV</div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-700">Upload Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {logoPreview && (
                  <button onClick={() => setLogoPreview(null)} className="text-sm text-red-600 hover:text-red-800">Remove</button>
                )}
              </div>
            </div>
            <button onClick={handleSave} className={`px-6 py-2 rounded-xl font-medium transition-all ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" /> Appearance
        </h2>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-blue-600" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <p className="font-medium text-slate-900">Dark Mode</p>
              <p className="text-sm text-slate-500">Switch between light and dark theme</p>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-300'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </motion.div>

      {/* Database Status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" /> Database
        </h2>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-3">
          <div>
            <p className="font-medium text-slate-900">Neon PostgreSQL</p>
            <p className="text-sm text-slate-500">ep-still-bird-a4it1gqw-pooler.us-east-1.aws.neon.tech</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${dbStatus === 'connected' ? 'bg-green-500 animate-pulse' : dbStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
            <span className={`text-sm font-medium capitalize ${dbStatus === 'connected' ? 'text-green-600' : dbStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'}`}>
              {dbStatus}
            </span>
          </div>
        </div>
        <button onClick={checkDb} className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-sm font-medium">
          Check Connection
        </button>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-600" /> Notification Preferences
        </h2>
        <div className="space-y-3">
          {['Birthday Reminders', 'Renewal Alerts', 'Claim Updates', 'New Approvals', 'Payment Due'].map(item => (
            <div key={item} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-700">{item}</span>
              <button className="relative w-10 h-5 bg-blue-600 rounded-full">
                <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* System Info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">System Information</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['App Name', appName],
            ['Version', 'v2.0.0'],
            ['Build', 'Production'],
            ['Database', 'Neon PostgreSQL 15'],
            ['Framework', 'React 18 + Vite 5'],
            ['Logged In As', `${tenant?.name} (${tenant?.role})`],
          ].map(([k, v]) => (
            <div key={k} className="p-3 bg-slate-50 rounded-xl">
              <p className="text-slate-500 text-xs mb-1">{k}</p>
              <p className="font-medium text-slate-900">{v}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
