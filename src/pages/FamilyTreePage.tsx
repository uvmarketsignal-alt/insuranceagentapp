import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Heart } from 'lucide-react';
import { useStore } from '../store';

export default function FamilyTreePage() {
  const { familyMembers, addFamilyMember, customers, tenant } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_id: '', full_name: '', relationship: '', phone: '', date_of_birth: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    await addFamilyMember({
      ...form, tenant_id: tenant.id, has_policy: false,
      date_of_birth: form.date_of_birth ? new Date(form.date_of_birth) : undefined,
    });
    setShowForm(false);
    setForm({ customer_id: '', full_name: '', relationship: '', phone: '', date_of_birth: '' });
  };

  const grouped = customers.reduce<Record<string, typeof familyMembers>>((acc, c) => {
    const members = familyMembers.filter(m => m.customer_id === c.id);
    if (members.length > 0) acc[c.id] = members;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-pink-600" /> Family Tree
          </h1>
          <p className="text-slate-500 mt-1">Manage family members and relationships</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 py-2 rounded-xl font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow border border-white/20 text-center">
          <p className="text-3xl font-bold text-pink-600">{familyMembers.length}</p>
          <p className="text-sm text-slate-500">Total Members</p>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow border border-white/20 text-center">
          <p className="text-3xl font-bold text-blue-600">{Object.keys(grouped).length}</p>
          <p className="text-sm text-slate-500">Families</p>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow border border-white/20 text-center">
          <p className="text-3xl font-bold text-green-600">{familyMembers.filter(m => m.has_policy).length}</p>
          <p className="text-sm text-slate-500">With Policy</p>
        </div>
      </div>

      {/* Family Groups */}
      <div className="space-y-4">
        {customers.map(customer => {
          const members = familyMembers.filter(m => m.customer_id === customer.id);
          if (members.length === 0) return null;
          return (
            <motion.div key={customer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur rounded-2xl shadow border border-white/20 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {customer.full_name[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{customer.full_name}</p>
                  <p className="text-sm text-slate-500">Primary Policy Holder</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {members.map(member => (
                  <div key={member.id} className="bg-pink-50 border border-pink-100 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{member.full_name}</p>
                      <p className="text-xs text-slate-500 capitalize">{member.relationship}</p>
                      {member.phone && <p className="text-xs text-slate-400">{member.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
        {familyMembers.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No family members added yet</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add Family Member</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer (Primary Holder)</label>
                <select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Customer</option>
                  {customers.filter(c => c.status === 'approved').map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                  <select value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                <input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">Add Member</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
