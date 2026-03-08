import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, Camera, Upload, FileText, User, Car,
  Heart, Home, Plane, Shield, Clock, AlertCircle, CheckCircle2, X,
  Activity, Droplet, Ruler, Weight, Phone, Mail, MapPin, Briefcase,
  CreditCard, Hash, Building, DollarSign, Calendar, Star
} from 'lucide-react';
import { useStore } from '../store';
import { LiveCamera } from '../components/LiveCamera';

interface NewCustomerPageProps {
  onComplete: () => void;
}

interface DocumentItem {
  type: string;
  label: string;
  file: File | null;
  captured: boolean;
  required: boolean;
  description?: string;
}

// ─── POLICY TYPES ─────────────────────────────────────────────────────────────
const POLICY_TYPES = [
  { id: 'motor',   name: 'Motor Insurance',  icon: Car,     color: 'from-orange-500 to-red-500',    bg: 'bg-orange-50 border-orange-200',   description: 'Vehicle protection — car, bike, commercial' },
  { id: 'life',    name: 'Life Insurance',   icon: Heart,   color: 'from-red-500 to-pink-500',      bg: 'bg-red-50 border-red-200',         description: 'Secure your family\'s financial future' },
  { id: 'health',  name: 'Health Insurance', icon: Activity, color: 'from-green-500 to-teal-500',   bg: 'bg-green-50 border-green-200',     description: 'Medical & hospitalization coverage' },
  { id: 'term',    name: 'Term Insurance',   icon: Clock,   color: 'from-blue-500 to-indigo-500',   bg: 'bg-blue-50 border-blue-200',       description: 'Fixed-term life protection at low cost' },
  { id: 'home',    name: 'Home Insurance',   icon: Home,    color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50 border-purple-200',   description: 'Property & contents coverage' },
  { id: 'travel',  name: 'Travel Insurance', icon: Plane,   color: 'from-cyan-500 to-blue-500',     bg: 'bg-cyan-50 border-cyan-200',       description: 'Domestic & international travel cover' },
  { id: 'others',  name: 'Others',           icon: Shield,  color: 'from-slate-500 to-gray-500',    bg: 'bg-slate-50 border-slate-200',     description: 'Specialized & custom insurance plans' },
];

const MOTOR_SUBTYPES = [
  { id: 'comprehensive', name: 'Comprehensive',  desc: 'Own damage + third party + theft',   color: 'text-green-600 bg-green-50 border-green-200' },
  { id: 'third_party',   name: 'Third Party',    desc: 'Mandatory by law · IDV auto-set',   color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'own_damage',    name: 'Own Damage',     desc: 'Damage to your own vehicle only',   color: 'text-orange-600 bg-orange-50 border-orange-200' },
];

const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];

// ─── REQUIRED DOCUMENTS PER POLICY ──────────────────────────────────────────
function getRequiredDocs(policyType: string, motorSubtype?: string): Array<{ type: string; label: string; required: boolean; description?: string }> {
  const aadhaar = { type: 'aadhaar', label: 'Aadhaar Card', required: true, description: 'Front & back of Aadhaar card' };
  const pan     = { type: 'pan', label: 'PAN Card', required: true, description: 'PAN card for tax records' };
  const photo   = { type: 'photo', label: 'Passport Photo', required: true, description: 'Recent passport-size photograph' };

  switch (policyType) {
    case 'motor': {
      const base = [
        aadhaar, pan, photo,
        { type: 'rc_book', label: 'RC Book', required: true, description: 'Vehicle Registration Certificate' },
        { type: 'driving_license', label: 'Driving License', required: true, description: 'Valid driving license' },
      ];
      if (motorSubtype === 'third_party') {
        // No vehicle photo for third party
        return [...base, { type: 'insurance_quote', label: 'Previous Insurance', required: false, description: 'Previous insurance copy if any' }];
      }
      return [...base,
        { type: 'vehicle_photo', label: 'Vehicle Photo', required: true, description: 'Clear photo of all 4 sides of vehicle' },
        { type: 'insurance_quote', label: 'Previous Insurance', required: false, description: 'Previous insurance copy if any' },
      ];
    }
    case 'life':
      return [aadhaar, pan, photo,
        { type: 'income_proof', label: 'Income Proof', required: true, description: 'Salary slip, IT return or Form 16' },
        { type: 'medical_report', label: 'Medical Report', required: false, description: 'Recent health check-up report' },
        { type: 'bank_statement', label: 'Bank Statement', required: false, description: '3 months bank statement' },
      ];
    case 'health':
      return [aadhaar, pan, photo,
        { type: 'medical_report', label: 'Medical Reports', required: true, description: 'Blood report, sugar, BP, ECG etc.' },
        { type: 'pre_existing_doc', label: 'Pre-existing Condition Docs', required: false, description: 'Documents for any existing illness' },
      ];
    case 'term':
      return [aadhaar, pan, photo,
        { type: 'income_proof', label: 'Income Proof', required: true, description: 'Salary slip, IT return or Form 16' },
        { type: 'medical_report', label: 'Medical Report', required: false, description: 'Recent health check-up report' },
      ];
    case 'home':
      return [aadhaar, pan, photo,
        { type: 'property_doc', label: 'Property Document', required: true, description: 'Sale deed, title deed or property card' },
        { type: 'municipal_tax', label: 'Municipal Tax Receipt', required: true, description: 'Latest property tax receipt' },
        { type: 'property_photo', label: 'Property Photo', required: true, description: 'Exterior & interior photos of property' },
        { type: 'valuation_report', label: 'Valuation Report', required: false, description: 'Property valuation certificate' },
      ];
    case 'travel':
      return [aadhaar, pan, photo,
        { type: 'passport', label: 'Passport', required: true, description: 'Valid passport (all pages)' },
        { type: 'visa', label: 'Visa Copy', required: false, description: 'Visa for destination country' },
        { type: 'travel_itinerary', label: 'Travel Itinerary', required: true, description: 'Flight tickets & hotel bookings' },
      ];
    default:
      return [aadhaar, pan, photo,
        { type: 'other_doc', label: 'Supporting Document', required: false, description: 'Any relevant document' },
      ];
  }
}

// ─── FIELD COMPONENTS ─────────────────────────────────────────────────────────
function Field({ label, icon: Icon, required, children }: { label: string; icon?: any; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all text-sm";
const selectCls = inputCls;

// ─── STEP 0: BASIC INFO ──────────────────────────────────────────────────────
function Step0Form({ data, onSubmit }: { data: any; onSubmit: (d: any) => void }) {
  const [form, setForm] = useState({
    full_name: data?.full_name || '',
    phone: data?.phone || '',
    email: data?.email || '',
    date_of_birth: data?.date_of_birth || '',
    gender: data?.gender || '',
    occupation: data?.occupation || '',
    annual_income: data?.annual_income || '',
    address: data?.address || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = 'Name is required';
    if (!form.phone.trim() || !/^\+?[0-9]{10,15}$/.test(form.phone.trim())) e.phone = 'Valid phone required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSubmit(form);
  };

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Basic Information</h2>
          <p className="text-sm text-slate-500">Customer personal details (NO Aadhaar/PAN here)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Full Name" icon={User} required>
          <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
            className={`${inputCls} ${errors.full_name ? 'border-red-400 ring-1 ring-red-400' : ''}`}
            placeholder="Enter full name as per Aadhaar" />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
        </Field>

        <Field label="Phone Number" icon={Phone} required>
          <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
            className={`${inputCls} ${errors.phone ? 'border-red-400 ring-1 ring-red-400' : ''}`}
            placeholder="+91 XXXXX XXXXX" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </Field>

        <Field label="Email Address" icon={Mail}>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            className={`${inputCls} ${errors.email ? 'border-red-400 ring-1 ring-red-400' : ''}`}
            placeholder="customer@example.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </Field>

        <Field label="Date of Birth" icon={Calendar}>
          <input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)}
            className={inputCls} max={new Date().toISOString().split('T')[0]} />
        </Field>

        <Field label="Gender" icon={User}>
          <select value={form.gender} onChange={e => set('gender', e.target.value)} className={selectCls}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label="Occupation" icon={Briefcase}>
          <input type="text" value={form.occupation} onChange={e => set('occupation', e.target.value)}
            className={inputCls} placeholder="e.g. Software Engineer, Farmer" />
        </Field>

        <Field label="Annual Income (₹)" icon={DollarSign}>
          <input type="number" value={form.annual_income} onChange={e => set('annual_income', e.target.value)}
            className={inputCls} placeholder="e.g. 500000" min="0" />
        </Field>

        <div className="md:col-span-2">
          <Field label="Full Address" icon={MapPin}>
            <textarea value={form.address} onChange={e => set('address', e.target.value)}
              className={inputCls} rows={3} placeholder="Door No, Street, City, State, PIN" />
          </Field>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleSubmit}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── STEP 1: POLICY TYPE ──────────────────────────────────────────────────────
function Step1Form({ onSubmit }: { onSubmit: (p: string) => void }) {
  const [selected, setSelected] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Select Policy Type</h2>
          <p className="text-sm text-slate-500">Choose the insurance product</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {POLICY_TYPES.map(pt => {
          const Icon = pt.icon;
          const isSel = selected === pt.id;
          return (
            <motion.button
              key={pt.id}
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(pt.id)}
              className={`relative p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                isSel
                  ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {isSel && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pt.color} flex items-center justify-center mb-3 shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className={`font-bold text-sm mb-1 ${isSel ? 'text-blue-700' : 'text-slate-900'}`}>{pt.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{pt.description}</p>
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={() => selected && onSubmit(selected)} disabled={!selected}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── STEP 2: ID & POLICY DETAILS ─────────────────────────────────────────────
function Step2Form({ data, policyType, onSubmit }: { data: any; policyType: string; onSubmit: (d: any) => void }) {
  const [form, setForm] = useState({
    aadhaar_number: data?.aadhaar_number || '',
    pan_number: data?.pan_number || '',
    policy_number: data?.policy_number || `POL-${Date.now()}`,
    insurer: data?.insurer || '',
    sum_assured: data?.sum_assured || '',
    motor_subtype: data?.motor_subtype || 'comprehensive',
    policy_details: data?.policy_details || {},
  });

  const isThirdParty = policyType === 'motor' && form.motor_subtype === 'third_party';

  const setDetail = (k: string, v: string) =>
    setForm(f => ({ ...f, policy_details: { ...f.policy_details, [k]: v } }));

  // Auto-set sum assured from IDV for third party
  const effectiveSumAssured = isThirdParty && form.policy_details?.idv
    ? String(form.policy_details.idv)
    : form.sum_assured;

  const pt = POLICY_TYPES.find(p => p.id === policyType);
  const Icon = pt?.icon || Shield;

  const renderPolicyFields = () => {
    switch (policyType) {
      case 'motor':
        return (
          <div className="space-y-5">
            {/* Motor subtype selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                Motor Policy Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MOTOR_SUBTYPES.map(mt => (
                  <button key={mt.id} type="button"
                    onClick={() => setForm(f => ({ ...f, motor_subtype: mt.id }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.motor_subtype === mt.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                    <div className={`text-xs font-bold mb-1 ${form.motor_subtype === mt.id ? 'text-blue-700' : 'text-slate-700'}`}>{mt.name}</div>
                    <div className="text-xs text-slate-500">{mt.desc}</div>
                  </button>
                ))}
              </div>
              {isThirdParty && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-700">Third Party: Sum Assured is auto-set to the IDV value you enter below.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Vehicle Registration Number" icon={Hash} required>
                <input type="text" value={form.policy_details.vehicle_number || ''}
                  onChange={e => setDetail('vehicle_number', e.target.value.toUpperCase())}
                  className={inputCls} placeholder="MH01AB1234" />
              </Field>
              <Field label="Vehicle Make & Model" icon={Car} required>
                <input type="text" value={form.policy_details.vehicle_model || ''}
                  onChange={e => setDetail('vehicle_model', e.target.value)}
                  className={inputCls} placeholder="e.g. Maruti Suzuki Swift" />
              </Field>
              <Field label="Manufacturing Year" icon={Calendar} required>
                <input type="number" value={form.policy_details.mfg_year || ''}
                  onChange={e => setDetail('mfg_year', e.target.value)}
                  className={inputCls} placeholder="e.g. 2020" min="1990" max={new Date().getFullYear()} />
              </Field>
              <Field label="Fuel Type" icon={Droplet}>
                <select value={form.policy_details.fuel_type || ''} onChange={e => setDetail('fuel_type', e.target.value)} className={selectCls}>
                  <option value="">Select Fuel</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="cng">CNG</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </Field>
              <Field label="Engine Number" icon={Hash}>
                <input type="text" value={form.policy_details.engine_number || ''}
                  onChange={e => setDetail('engine_number', e.target.value.toUpperCase())}
                  className={inputCls} placeholder="Engine number" />
              </Field>
              <Field label="Chassis Number" icon={Hash}>
                <input type="text" value={form.policy_details.chassis_number || ''}
                  onChange={e => setDetail('chassis_number', e.target.value.toUpperCase())}
                  className={inputCls} placeholder="Chassis number" />
              </Field>
              <Field label="CC / Seating Capacity" icon={Car}>
                <input type="text" value={form.policy_details.cc_capacity || ''}
                  onChange={e => setDetail('cc_capacity', e.target.value)}
                  className={inputCls} placeholder="e.g. 1200cc / 5 seater" />
              </Field>
              <Field label={`IDV — Insured Declared Value (₹) ${isThirdParty ? '→ sets Sum Assured' : ''}`} icon={DollarSign} required>
                <input type="number" value={form.policy_details.idv || ''}
                  onChange={e => {
                    setDetail('idv', e.target.value);
                    if (isThirdParty) setForm(f => ({ ...f, sum_assured: e.target.value }));
                  }}
                  className={inputCls} placeholder="Current market value" />
              </Field>
            </div>
          </div>
        );

      case 'health':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Height (cm)" icon={Ruler} required>
              <input type="number" value={form.policy_details.height_cm || ''}
                onChange={e => setDetail('height_cm', e.target.value)}
                className={inputCls} placeholder="e.g. 170" min="50" max="250" />
            </Field>
            <Field label="Weight (kg)" icon={Weight} required>
              <input type="number" value={form.policy_details.weight_kg || ''}
                onChange={e => setDetail('weight_kg', e.target.value)}
                className={inputCls} placeholder="e.g. 70" min="10" max="300" />
            </Field>
            <Field label="Blood Group" icon={Droplet} required>
              <select value={form.policy_details.blood_group || ''} onChange={e => setDetail('blood_group', e.target.value)} className={selectCls}>
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </Field>
            <Field label="Smoker / Tobacco User" icon={AlertCircle}>
              <select value={form.policy_details.smoker || ''} onChange={e => setDetail('smoker', e.target.value)} className={selectCls}>
                <option value="">Select</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
                <option value="ex">Ex-smoker</option>
              </select>
            </Field>
            <Field label="Pre-existing Conditions" icon={Activity}>
              <input type="text" value={form.policy_details.pre_existing_conditions || ''}
                onChange={e => setDetail('pre_existing_conditions', e.target.value)}
                className={inputCls} placeholder="e.g. Diabetes, Hypertension (None if healthy)" />
            </Field>
            <Field label="Family Medical History" icon={Heart}>
              <input type="text" value={form.policy_details.family_history || ''}
                onChange={e => setDetail('family_history', e.target.value)}
                className={inputCls} placeholder="e.g. Heart disease, Cancer" />
            </Field>
            <Field label="Floater / Individual Plan" icon={Shield}>
              <select value={form.policy_details.plan_type || ''} onChange={e => setDetail('plan_type', e.target.value)} className={selectCls}>
                <option value="">Select Plan</option>
                <option value="individual">Individual</option>
                <option value="floater">Family Floater</option>
                <option value="senior">Senior Citizen</option>
              </select>
            </Field>
            <Field label="Number of Members (Floater)" icon={User}>
              <input type="number" value={form.policy_details.member_count || ''}
                onChange={e => setDetail('member_count', e.target.value)}
                className={inputCls} placeholder="e.g. 4" min="1" max="10" />
            </Field>
          </div>
        );

      case 'life':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Height (cm)" icon={Ruler} required>
              <input type="number" value={form.policy_details.height_cm || ''}
                onChange={e => setDetail('height_cm', e.target.value)}
                className={inputCls} placeholder="e.g. 170" />
            </Field>
            <Field label="Weight (kg)" icon={Weight} required>
              <input type="number" value={form.policy_details.weight_kg || ''}
                onChange={e => setDetail('weight_kg', e.target.value)}
                className={inputCls} placeholder="e.g. 70" />
            </Field>
            <Field label="Blood Group" icon={Droplet} required>
              <select value={form.policy_details.blood_group || ''} onChange={e => setDetail('blood_group', e.target.value)} className={selectCls}>
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </Field>
            <Field label="Smoker / Tobacco User" icon={AlertCircle}>
              <select value={form.policy_details.smoker || ''} onChange={e => setDetail('smoker', e.target.value)} className={selectCls}>
                <option value="">Select</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
                <option value="ex">Ex-smoker</option>
              </select>
            </Field>
            <Field label="Nominee Name" icon={User} required>
              <input type="text" value={form.policy_details.nominee_name || ''}
                onChange={e => setDetail('nominee_name', e.target.value)}
                className={inputCls} placeholder="Full name of nominee" />
            </Field>
            <Field label="Nominee Relationship" icon={Heart} required>
              <select value={form.policy_details.nominee_relation || ''} onChange={e => setDetail('nominee_relation', e.target.value)} className={selectCls}>
                <option value="">Select Relationship</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Nominee Date of Birth" icon={Calendar}>
              <input type="date" value={form.policy_details.nominee_dob || ''}
                onChange={e => setDetail('nominee_dob', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Pre-existing Conditions" icon={Activity}>
              <input type="text" value={form.policy_details.pre_existing_conditions || ''}
                onChange={e => setDetail('pre_existing_conditions', e.target.value)}
                className={inputCls} placeholder="None if healthy" />
            </Field>
          </div>
        );

      case 'term':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Height (cm)" icon={Ruler} required>
              <input type="number" value={form.policy_details.height_cm || ''}
                onChange={e => setDetail('height_cm', e.target.value)} className={inputCls} placeholder="e.g. 170" />
            </Field>
            <Field label="Weight (kg)" icon={Weight} required>
              <input type="number" value={form.policy_details.weight_kg || ''}
                onChange={e => setDetail('weight_kg', e.target.value)} className={inputCls} placeholder="e.g. 70" />
            </Field>
            <Field label="Blood Group" icon={Droplet} required>
              <select value={form.policy_details.blood_group || ''} onChange={e => setDetail('blood_group', e.target.value)} className={selectCls}>
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </Field>
            <Field label="Smoker / Tobacco User" icon={AlertCircle}>
              <select value={form.policy_details.smoker || ''} onChange={e => setDetail('smoker', e.target.value)} className={selectCls}>
                <option value="">Select</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </Field>
            <Field label="Nominee Name" icon={User} required>
              <input type="text" value={form.policy_details.nominee_name || ''}
                onChange={e => setDetail('nominee_name', e.target.value)} className={inputCls} placeholder="Full name" />
            </Field>
            <Field label="Nominee Relationship" icon={Heart} required>
              <select value={form.policy_details.nominee_relation || ''} onChange={e => setDetail('nominee_relation', e.target.value)} className={selectCls}>
                <option value="">Select Relationship</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Policy Term (Years)" icon={Calendar} required>
              <input type="number" value={form.policy_details.policy_term || ''}
                onChange={e => setDetail('policy_term', e.target.value)} className={inputCls} placeholder="e.g. 20" min="5" max="40" />
            </Field>
            <Field label="Return of Premium?" icon={DollarSign}>
              <select value={form.policy_details.return_of_premium || ''} onChange={e => setDetail('return_of_premium', e.target.value)} className={selectCls}>
                <option value="">Select</option>
                <option value="yes">Yes (TROP)</option>
                <option value="no">No (Pure Term)</option>
              </select>
            </Field>
          </div>
        );

      case 'home':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Property Type" icon={Home} required>
              <select value={form.policy_details.property_type || ''} onChange={e => setDetail('property_type', e.target.value)} className={selectCls}>
                <option value="">Select Type</option>
                <option value="apartment">Apartment / Flat</option>
                <option value="independent">Independent House / Villa</option>
                <option value="rowhouse">Row House</option>
                <option value="commercial">Commercial Property</option>
              </select>
            </Field>
            <Field label="Construction Year" icon={Calendar} required>
              <input type="number" value={form.policy_details.construction_year || ''}
                onChange={e => setDetail('construction_year', e.target.value)}
                className={inputCls} placeholder="e.g. 2010" min="1900" max={new Date().getFullYear()} />
            </Field>
            <Field label="Built-up Area (sq. ft.)" icon={Ruler} required>
              <input type="number" value={form.policy_details.area_sqft || ''}
                onChange={e => setDetail('area_sqft', e.target.value)} className={inputCls} placeholder="e.g. 1200" />
            </Field>
            <Field label="Number of Floors" icon={Building}>
              <input type="number" value={form.policy_details.floors || ''}
                onChange={e => setDetail('floors', e.target.value)} className={inputCls} placeholder="e.g. 2" min="1" />
            </Field>
            <Field label="Property Address" icon={MapPin} required>
              <input type="text" value={form.policy_details.property_address || ''}
                onChange={e => setDetail('property_address', e.target.value)} className={inputCls} placeholder="Full address of property" />
            </Field>
            <Field label="Ownership Type" icon={User} required>
              <select value={form.policy_details.ownership || ''} onChange={e => setDetail('ownership', e.target.value)} className={selectCls}>
                <option value="">Select Ownership</option>
                <option value="owned">Self-owned</option>
                <option value="rented">Rented (Tenant's policy)</option>
                <option value="mortgaged">Mortgaged (Home Loan)</option>
              </select>
            </Field>
            <Field label="Structure Value (₹)" icon={DollarSign} required>
              <input type="number" value={form.policy_details.structure_value || ''}
                onChange={e => setDetail('structure_value', e.target.value)} className={inputCls} placeholder="Replacement cost of structure" />
            </Field>
            <Field label="Contents Value (₹)" icon={DollarSign}>
              <input type="number" value={form.policy_details.contents_value || ''}
                onChange={e => setDetail('contents_value', e.target.value)} className={inputCls} placeholder="Value of household contents" />
            </Field>
          </div>
        );

      case 'travel':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Travel Type" icon={Plane} required>
              <select value={form.policy_details.travel_type || ''} onChange={e => setDetail('travel_type', e.target.value)} className={selectCls}>
                <option value="">Select</option>
                <option value="individual">Individual</option>
                <option value="family">Family</option>
                <option value="student">Student</option>
                <option value="corporate">Corporate / Business</option>
              </select>
            </Field>
            <Field label="Trip Type" icon={Calendar} required>
              <select value={form.policy_details.trip_type || ''} onChange={e => setDetail('trip_type', e.target.value)} className={selectCls}>
                <option value="">Select</option>
                <option value="single">Single Trip</option>
                <option value="multi">Multi-Trip (Annual)</option>
              </select>
            </Field>
            <Field label="Destination Country" icon={MapPin} required>
              <input type="text" value={form.policy_details.destination || ''}
                onChange={e => setDetail('destination', e.target.value)} className={inputCls} placeholder="e.g. USA, UK, Singapore" />
            </Field>
            <Field label="Trip Duration (Days)" icon={Clock} required>
              <input type="number" value={form.policy_details.trip_duration || ''}
                onChange={e => setDetail('trip_duration', e.target.value)} className={inputCls} placeholder="e.g. 14" min="1" max="365" />
            </Field>
            <Field label="Travel Start Date" icon={Calendar} required>
              <input type="date" value={form.policy_details.travel_start || ''}
                onChange={e => setDetail('travel_start', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Travel End Date" icon={Calendar} required>
              <input type="date" value={form.policy_details.travel_end || ''}
                onChange={e => setDetail('travel_end', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Passport Number" icon={Hash} required>
              <input type="text" value={form.policy_details.passport_number || ''}
                onChange={e => setDetail('passport_number', e.target.value.toUpperCase())} className={inputCls} placeholder="e.g. A1234567" />
            </Field>
            <Field label="Number of Travellers" icon={User}>
              <input type="number" value={form.policy_details.traveller_count || ''}
                onChange={e => setDetail('traveller_count', e.target.value)} className={inputCls} placeholder="e.g. 2" min="1" max="10" />
            </Field>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Coverage Type" icon={Shield}>
              <input type="text" value={form.policy_details.coverage_type || ''}
                onChange={e => setDetail('coverage_type', e.target.value)} className={inputCls} placeholder="Describe coverage" />
            </Field>
            <Field label="Coverage Details" icon={FileText}>
              <textarea value={form.policy_details.coverage_details || ''}
                onChange={e => setDetail('coverage_details', e.target.value)} className={inputCls} rows={3} placeholder="Additional coverage details" />
            </Field>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pt?.color || 'from-slate-500 to-gray-600'} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">ID & Policy Details</h2>
          <p className="text-sm text-slate-500">Aadhaar, PAN & {pt?.name} specific fields</p>
        </div>
      </div>

      {/* ID Section */}
      <div className="p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-600" />
          Identity Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Aadhaar Number" icon={CreditCard} required>
            <input type="text" value={form.aadhaar_number}
              onChange={e => setForm(f => ({ ...f, aadhaar_number: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
              className={inputCls} placeholder="XXXX XXXX XXXX" maxLength={12} />
          </Field>
          <Field label="PAN Number" icon={CreditCard} required>
            <input type="text" value={form.pan_number}
              onChange={e => setForm(f => ({ ...f, pan_number: e.target.value.toUpperCase().slice(0, 10) }))}
              className={inputCls} placeholder="ABCDE1234F" maxLength={10} />
          </Field>
        </div>
      </div>

      {/* Common Policy Fields */}
      <div className="p-5 bg-gradient-to-r from-slate-50 to-purple-50 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-600" />
          Policy Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Policy Number" icon={Hash}>
            <input type="text" value={form.policy_number}
              onChange={e => setForm(f => ({ ...f, policy_number: e.target.value }))}
              className={inputCls} placeholder="Auto-generated or enter manually" />
          </Field>
          <Field label="Insurer / Insurance Company" icon={Building} required>
            <input type="text" value={form.insurer}
              onChange={e => setForm(f => ({ ...f, insurer: e.target.value }))}
              className={inputCls} placeholder="e.g. LIC, HDFC ERGO, New India" />
          </Field>
          {!isThirdParty && (
            <Field label="Sum Assured (₹)" icon={DollarSign} required>
              <input type="number" value={form.sum_assured}
                onChange={e => setForm(f => ({ ...f, sum_assured: e.target.value }))}
                className={inputCls} placeholder="Coverage amount" />
            </Field>
          )}
          {isThirdParty && (
            <Field label="Sum Assured (₹) — Auto from IDV" icon={DollarSign}>
              <input type="text" value={effectiveSumAssured}
                className={`${inputCls} bg-blue-50 cursor-not-allowed`} readOnly
                placeholder="Will be set from IDV" />
              <p className="text-xs text-blue-600 mt-1">Auto-set to IDV for Third Party coverage</p>
            </Field>
          )}
        </div>
      </div>

      {/* Policy-specific fields */}
      <div className="p-5 bg-gradient-to-r from-slate-50 to-green-50 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-green-600" />
          {pt?.name} — Specific Details
        </h3>
        {renderPolicyFields()}
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={() => onSubmit({ ...form, sum_assured: isThirdParty ? effectiveSumAssured : form.sum_assured })}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3: PREMIUM & DATES ──────────────────────────────────────────────────
function Step3Form({ data, onSubmit }: { data: any; onSubmit: (d: any) => void }) {
  const [form, setForm] = useState({
    premium_amount: data?.premium_amount || '',
    premium_frequency: data?.premium_frequency || 'yearly',
    start_date: data?.start_date || new Date().toISOString().split('T')[0],
    end_date: data?.end_date || '',
    payment_mode: data?.payment_mode || 'online',
    grace_period: data?.grace_period || '30',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Premium & Policy Dates</h2>
          <p className="text-sm text-slate-500">Set payment terms and policy period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Premium Amount (₹)" icon={DollarSign} required>
          <input type="number" value={form.premium_amount} onChange={e => setForm(f => ({ ...f, premium_amount: e.target.value }))}
            className={inputCls} placeholder="Annual premium amount" min="0" />
        </Field>
        <Field label="Premium Frequency" icon={Clock} required>
          <select value={form.premium_frequency} onChange={e => setForm(f => ({ ...f, premium_frequency: e.target.value }))} className={selectCls}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="half_yearly">Half Yearly</option>
            <option value="yearly">Yearly</option>
            <option value="single">Single Premium</option>
          </select>
        </Field>
        <Field label="Policy Start Date" icon={Calendar} required>
          <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className={inputCls} />
        </Field>
        <Field label="Policy End Date" icon={Calendar} required>
          <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className={inputCls} min={form.start_date} />
        </Field>
        <Field label="Payment Mode" icon={CreditCard}>
          <select value={form.payment_mode} onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))} className={selectCls}>
            <option value="online">Online / UPI</option>
            <option value="cheque">Cheque</option>
            <option value="cash">Cash</option>
            <option value="ecs">ECS / Auto-debit</option>
            <option value="neft">NEFT / RTGS</option>
          </select>
        </Field>
        <Field label="Grace Period (Days)" icon={Clock}>
          <select value={form.grace_period} onChange={e => setForm(f => ({ ...f, grace_period: e.target.value }))} className={selectCls}>
            <option value="15">15 Days</option>
            <option value="30">30 Days</option>
            <option value="60">60 Days</option>
          </select>
        </Field>
      </div>

      {form.premium_amount && form.start_date && form.end_date && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Premium Summary
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Premium:</span> <strong className="text-slate-800">₹{parseInt(form.premium_amount).toLocaleString()}</strong></div>
            <div><span className="text-slate-500">Frequency:</span> <strong className="text-slate-800 capitalize">{form.premium_frequency}</strong></div>
            <div><span className="text-slate-500">Start:</span> <strong className="text-slate-800">{new Date(form.start_date).toLocaleDateString('en-IN')}</strong></div>
            <div><span className="text-slate-500">End:</span> <strong className="text-slate-800">{form.end_date ? new Date(form.end_date).toLocaleDateString('en-IN') : '—'}</strong></div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button onClick={() => onSubmit(form)}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── STEP 4: DOCUMENTS ────────────────────────────────────────────────────────
function Step4Form({ documents, onSubmit, onCameraOpen, onDocumentUpdate }: {
  documents: DocumentItem[];
  onSubmit: (docs: DocumentItem[]) => void;
  onCameraOpen: (type: string) => void;
  onDocumentUpdate: (type: string, update: Partial<DocumentItem>) => void;
}) {
  const uploaded = documents.filter(d => d.file).length;
  const required = documents.filter(d => d.required).length;
  const requiredUploaded = documents.filter(d => d.required && d.file).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upload Documents</h2>
            <p className="text-sm text-slate-500">Camera capture or file upload supported</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-blue-600">{uploaded}/{documents.length}</div>
          <div className="text-xs text-slate-500">documents uploaded</div>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <motion.div
          className="h-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${documents.length ? (uploaded / documents.length) * 100 : 0}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="space-y-3">
        {documents.map((doc) => (
          <motion.div
            key={doc.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border-2 transition-all ${
              doc.file
                ? 'border-green-300 bg-green-50'
                : doc.required
                ? 'border-amber-200 bg-amber-50/50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  doc.file ? 'bg-green-500' : doc.required ? 'bg-amber-400' : 'bg-slate-300'
                }`}>
                  {doc.file
                    ? <CheckCircle2 className="w-5 h-5 text-white" />
                    : <FileText className="w-5 h-5 text-white" />
                  }
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm">{doc.label}</h3>
                    {doc.required && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">Required</span>
                    )}
                    {doc.captured && doc.file && (
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">📷 Camera</span>
                    )}
                  </div>
                  {doc.file ? (
                    <p className="text-xs text-green-700 truncate mt-0.5">✓ {doc.file.name}</p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {doc.file && (
                  <button onClick={() => onDocumentUpdate(doc.type, { file: null, captured: false })}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => onCameraOpen(doc.type)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium">
                  <Camera className="w-3.5 h-3.5" />
                  Camera
                </button>
                <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-medium cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                  <input type="file" className="hidden" accept="image/*,.pdf"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) onDocumentUpdate(doc.type, { file, captured: false, label: doc.label });
                      e.target.value = '';
                    }} />
                </label>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {requiredUploaded < required && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            {required - requiredUploaded} required document(s) missing. You can proceed but the application may be held for review.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button onClick={() => onSubmit(documents)}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── STEP 5: REVIEW & SUBMIT ──────────────────────────────────────────────────
function Step5Review({ data, documents, onSubmit, submissionError, isSubmitting }: {
  data: any; documents: DocumentItem[];
  onSubmit: () => void; submissionError: string; isSubmitting: boolean;
}) {
  const policyType = data.step1?.policy_type || '';
  const pt = POLICY_TYPES.find(p => p.id === policyType);
  const Icon = pt?.icon || Shield;

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-slate-800 text-sm font-semibold text-right max-w-[60%] truncate">{value || '—'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Review & Submit</h2>
          <p className="text-sm text-slate-500">Verify all details before final submission</p>
        </div>
      </div>

      {submissionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Submission Error</p>
            <p className="text-sm text-red-600 mt-1">{submissionError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Info */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-blue-500" /> Personal Information
          </h3>
          <InfoRow label="Full Name" value={data.step0?.full_name} />
          <InfoRow label="Phone" value={data.step0?.phone} />
          <InfoRow label="Email" value={data.step0?.email} />
          <InfoRow label="Date of Birth" value={data.step0?.date_of_birth} />
          <InfoRow label="Gender" value={data.step0?.gender} />
          <InfoRow label="Occupation" value={data.step0?.occupation} />
          <InfoRow label="Annual Income" value={data.step0?.annual_income ? `₹${parseInt(data.step0.annual_income).toLocaleString()}` : ''} />
        </div>

        {/* Policy Info */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
            <Icon className="w-4 h-4 text-purple-500" /> Policy Details
          </h3>
          <InfoRow label="Policy Type" value={pt?.name || policyType} />
          {data.step2?.motor_subtype && <InfoRow label="Motor Type" value={data.step2.motor_subtype.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} />}
          <InfoRow label="Policy Number" value={data.step2?.policy_number} />
          <InfoRow label="Insurer" value={data.step2?.insurer} />
          <InfoRow label="Aadhaar" value={data.step2?.aadhaar_number ? `XXXX XXXX ${data.step2.aadhaar_number.slice(-4)}` : ''} />
          <InfoRow label="PAN" value={data.step2?.pan_number} />
          <InfoRow label="Sum Assured" value={data.step2?.sum_assured ? `₹${parseInt(data.step2.sum_assured).toLocaleString()}` : ''} />
        </div>

        {/* Premium */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-500" /> Premium & Dates
          </h3>
          <InfoRow label="Premium Amount" value={data.step3?.premium_amount ? `₹${parseInt(data.step3.premium_amount).toLocaleString()}` : ''} />
          <InfoRow label="Frequency" value={data.step3?.premium_frequency} />
          <InfoRow label="Payment Mode" value={data.step3?.payment_mode} />
          <InfoRow label="Start Date" value={data.step3?.start_date ? new Date(data.step3.start_date).toLocaleDateString('en-IN') : ''} />
          <InfoRow label="End Date" value={data.step3?.end_date ? new Date(data.step3.end_date).toLocaleDateString('en-IN') : ''} />
          <InfoRow label="Grace Period" value={data.step3?.grace_period ? `${data.step3.grace_period} days` : ''} />
        </div>

        {/* Documents */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-amber-500" /> Documents ({documents.filter(d => d.file).length}/{documents.length})
          </h3>
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.type} className="flex items-center gap-2 text-sm">
                {doc.file
                  ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  : <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                }
                <span className={doc.file ? 'text-slate-700' : 'text-red-500'}>{doc.label}</span>
                {doc.file && <span className="text-xs text-slate-400 truncate ml-auto">{doc.captured ? '📷 Camera' : '📁 File'}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={onSubmit} disabled={isSubmitting}
          className="px-10 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base">
          {isSubmitting ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
          ) : (
            <><Check className="w-5 h-5" /> Submit Application</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function NewCustomerPage({ onComplete }: NewCustomerPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraDocType, setCameraDocType] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [submissionError, setSubmissionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { newCustomerData, setNewCustomerStep, clearNewCustomerData, addCustomer, addPolicy, addDocument, tenant } = useStore();

  const steps = [
    { title: 'Basic Info',       icon: User,         desc: 'Personal details' },
    { title: 'Policy Type',      icon: Shield,       desc: 'Insurance type' },
    { title: 'ID & Details',     icon: CreditCard,   desc: 'ID & policy info' },
    { title: 'Premium',          icon: DollarSign,   desc: 'Payment terms' },
    { title: 'Documents',        icon: Upload,       desc: 'Upload files' },
    { title: 'Review',           icon: CheckCircle2, desc: 'Final review' },
  ];

  const selectedPolicyType = newCustomerData.step1?.policy_type || '';
  const selectedMotorSubtype = (newCustomerData.step2 as any)?.motor_subtype || 'comprehensive';

  const requiredDocs = useMemo<DocumentItem[]>(() => {
    if (!selectedPolicyType) return [];
    return getRequiredDocs(selectedPolicyType, selectedMotorSubtype).map(d => ({ ...d, file: null, captured: false }));
  }, [selectedPolicyType, selectedMotorSubtype]);

  const mergedDocuments = useMemo<DocumentItem[]>(() => {
    return requiredDocs.map(rd => {
      const existing = documents.find(d => d.type === rd.type);
      return existing ? { ...rd, file: existing.file, captured: existing.captured } : rd;
    });
  }, [requiredDocs, documents]);

  const updateDocument = useCallback((type: string, update: Partial<DocumentItem>) => {
    setDocuments(prev => {
      const idx = prev.findIndex(d => d.type === type);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...update };
        return next;
      }
      return [...prev, { type, label: type, file: null, captured: false, required: false, ...update }];
    });
  }, []);

  const handleSubmit = async () => {
    if (!tenant) return;
    setSubmissionError('');
    setIsSubmitting(true);

    try {
      // Build customer object
      const customerData = {
        tenant_id: tenant.id,
        full_name: newCustomerData.step0?.full_name || '',
        phone: newCustomerData.step0?.phone || '',
        email: newCustomerData.step0?.email,
        date_of_birth: newCustomerData.step0?.date_of_birth ? new Date(newCustomerData.step0.date_of_birth) : undefined,
        gender: newCustomerData.step0?.gender,
        occupation: newCustomerData.step0?.occupation,
        annual_income: newCustomerData.step0?.annual_income ? parseFloat(newCustomerData.step0.annual_income) : undefined,
        address: newCustomerData.step0?.address,
        status: 'pending' as const,
      };

      const customer = await addCustomer(customerData);

      const step2 = newCustomerData.step2 as any;
      const isThirdParty = selectedPolicyType === 'motor' && selectedMotorSubtype === 'third_party';
      const sumAssured = isThirdParty
        ? (step2?.policy_details?.idv ? Number(step2.policy_details.idv) : undefined)
        : (step2?.sum_assured ? Number(step2.sum_assured) : undefined);

      await addPolicy({
        customer_id: customer.id,
        tenant_id: tenant.id,
        policy_type: selectedPolicyType,
        policy_number: step2?.policy_number || `POL-${Date.now()}`,
        insurer: step2?.insurer || '',
        sum_assured: sumAssured,
        premium_amount: newCustomerData.step3?.premium_amount ? Number(newCustomerData.step3.premium_amount) : undefined,
        premium_frequency: newCustomerData.step3?.premium_frequency,
        start_date: newCustomerData.step3?.start_date ? new Date(newCustomerData.step3.start_date) : undefined,
        end_date: newCustomerData.step3?.end_date ? new Date(newCustomerData.step3.end_date) : undefined,
        status: 'active',
        metadata: {
          aadhaar_number: step2?.aadhaar_number,
          pan_number: step2?.pan_number,
          motor_subtype: step2?.motor_subtype,
          policy_details: step2?.policy_details || {},
          payment_mode: newCustomerData.step3?.payment_mode,
          grace_period: newCustomerData.step3?.grace_period,
        },
      } as any);

      // Upload documents
      for (const doc of mergedDocuments) {
        if (!doc.file) continue;
        // Create a persistent object URL for the file
        const fileUrl = doc.captured
          ? doc.file as unknown as string  // camera blob URL already set
          : URL.createObjectURL(doc.file);

        await addDocument({
          customer_id: customer.id,
          tenant_id: tenant.id,
          document_type: doc.type,
          file_name: doc.file instanceof File ? doc.file.name : doc.type,
          file_url: typeof fileUrl === 'string' ? fileUrl : '',
          file_type: doc.file instanceof File ? doc.file.type : 'image/jpeg',
          file_size: doc.file instanceof File ? doc.file.size : 0,
          uploaded_by: tenant.id,
          is_camera_capture: doc.captured,
        });
      }

      // Notification
      await useStore.getState().addNotification({
        tenant_id: tenant.id,
        title: tenant.role === 'owner' ? '✅ Customer Added & Approved' : '📋 Application Submitted',
        message: tenant.role === 'owner'
          ? `Customer "${customer.full_name}" added and auto-approved successfully.`
          : `Customer "${customer.full_name}" submitted for owner approval.`,
        type: 'success',
        priority: 'medium',
      });

      clearNewCustomerData();
      setDocuments([]);
      onComplete();
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <Step0Form data={newCustomerData.step0} onSubmit={d => { setNewCustomerStep(0, d); setCurrentStep(1); }} />;
      case 1: return <Step1Form onSubmit={p => { setNewCustomerStep(1, { policy_type: p }); setDocuments([]); setCurrentStep(2); }} />;
      case 2: return <Step2Form data={newCustomerData.step2} policyType={selectedPolicyType} onSubmit={d => { setNewCustomerStep(2, d); setCurrentStep(3); }} />;
      case 3: return <Step3Form data={newCustomerData.step3} onSubmit={d => { setNewCustomerStep(3, d); setCurrentStep(4); }} />;
      case 4: return (
        <Step4Form
          documents={mergedDocuments}
          onSubmit={docs => { setNewCustomerStep(4, { documents: docs }); setCurrentStep(5); }}
          onCameraOpen={type => { setCameraDocType(type); setShowCamera(true); }}
          onDocumentUpdate={updateDocument}
        />
      );
      case 5: return (
        <Step5Review
          data={newCustomerData}
          documents={mergedDocuments}
          onSubmit={handleSubmit}
          submissionError={submissionError}
          isSubmitting={isSubmitting}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">New Customer</h1>
          <p className="text-slate-500 mt-1">Complete all 6 steps to add a new customer</p>
        </div>
        <button onClick={() => { clearNewCustomerData(); onComplete(); }}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-sm border border-white/40 p-6">
        <div className="flex items-center justify-between overflow-x-auto">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;
            return (
              <div key={step.title} className="flex items-center min-w-0">
                <button
                  onClick={() => idx < currentStep && setCurrentStep(idx)}
                  disabled={idx > currentStep}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all font-bold shadow-sm ${
                    isDone ? 'bg-green-500 text-white shadow-green-200' :
                    isActive ? 'bg-blue-600 text-white shadow-blue-200 scale-110 shadow-lg' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isDone ? <Check className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] font-semibold whitespace-nowrap ${
                    isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-slate-400'
                  }`}>{step.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mt-[-12px] min-w-4 transition-all ${idx < currentStep ? 'bg-green-400' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-center">
          <span className="text-xs text-slate-400">Step {currentStep + 1} of {steps.length} — </span>
          <span className="text-xs font-semibold text-blue-600">{steps[currentStep].desc}</span>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-sm border border-white/40 p-6 md:p-8"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0}
          className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed">
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`rounded-full transition-all ${i === currentStep ? 'w-6 h-2 bg-blue-600' : i < currentStep ? 'w-2 h-2 bg-green-400' : 'w-2 h-2 bg-slate-200'}`} />
          ))}
        </div>

        {currentStep < steps.length - 1 ? (
          <button onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 text-sm font-semibold shadow-lg shadow-blue-500/20">
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 text-sm font-semibold shadow-lg shadow-green-500/20 disabled:opacity-50">
            <Check className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <LiveCamera
                onCapture={(file) => {
                  updateDocument(cameraDocType, { file, captured: true });
                  setShowCamera(false);
                }}
                onClose={() => setShowCamera(false)}
                documentType={cameraDocType}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
