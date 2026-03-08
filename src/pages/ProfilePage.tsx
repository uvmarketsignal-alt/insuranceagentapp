import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Save, Key, Phone, Mail, Building } from 'lucide-react';
import { useStore } from '../store';
import { validatePasswordStrength } from '../utils/password';

export default function ProfilePage() {
  const { tenant, profile, updateProfile, updatePassword } = useStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || tenant?.name || '',
    phone: profile?.phone || '',
    department: profile?.department || '',
    employee_code: profile?.employee_code || '',
  });
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<string[]>([]);
  const [pwSuccess, setPwSuccess] = useState('');
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);

  const handleSave = async () => {
    if (!tenant) return;
    await updateProfile(tenant.id, { ...form, avatar_url: avatarPreview || undefined });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwErrors([]);
    setPwSuccess('');

    if (pwForm.new !== pwForm.confirm) {
      setPwErrors(['New passwords do not match']);
      return;
    }

    const { valid, errors } = validatePasswordStrength(pwForm.new);
    if (!valid) { setPwErrors(errors); return; }

    if (!tenant) return;
    await updatePassword(tenant.id, pwForm.new);
    setPwSuccess('Password updated successfully!');
    setPwForm({ current: '', new: '', confirm: '' });
  };

  if (!tenant) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" /> My Profile
        </h1>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 p-6">
        <div className="flex items-start gap-6 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-200" />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                {(form.full_name || tenant.name)[0]}
              </div>
            )}
            {editing && (
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{form.full_name || tenant.name}</h2>
            <p className="text-slate-500 capitalize">{tenant.role}</p>
            <p className="text-sm text-slate-500 mt-1">{tenant.email}</p>
            {profile?.employee_code && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {profile.employee_code}
              </span>
            )}
          </div>

          <button onClick={() => setEditing(!editing)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${editing ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'full_name', icon: User, type: 'text' },
            { label: 'Phone', key: 'phone', icon: Phone, type: 'tel' },
            { label: 'Department', key: 'department', icon: Building, type: 'text' },
            { label: 'Employee Code', key: 'employee_code', icon: Key, type: 'text' },
          ].map(({ label, key, icon: Icon, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  disabled={!editing}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" value={tenant.email} disabled className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <input type="text" value={tenant.role} disabled className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 capitalize" />
          </div>
        </div>

        {editing && (
          <div className="mt-4 flex gap-3">
            <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Profile'}
            </button>
          </div>
        )}
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-orange-500" /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {pwErrors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              {pwErrors.map(e => <p key={e} className="text-sm text-red-700">{e}</p>)}
            </div>
          )}
          {pwSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-700">{pwSuccess}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
            <input type="password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input type="password" value={pwForm.new} onChange={e => setPwForm({ ...pwForm, new: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Min 8 chars, uppercase, lowercase, number, and special character required</p>
          <button type="submit" className="px-6 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-all">
            Update Password
          </button>
        </form>
      </motion.div>
    </div>
  );
}
