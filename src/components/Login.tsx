import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, XCircle, AlertCircle, Shield, Wifi, WifiOff } from 'lucide-react';
import { useStore } from '../store';
import { Logo } from './Logo';
import { InstallButton } from './InstallButton';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showResetFlow, setShowResetFlow] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const animationRef = useRef<number>(0);

  const { login } = useStore();

  useEffect(() => {
    // Network status
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Splash timer
    const timer = setTimeout(() => setShowSplash(false), 3000);

    // Particles
    const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 4 + 1,
      color: ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'][Math.floor(Math.random() * 5)],
    }));
    setParticles(newParticles);

    const animateParticles = () => {
      setParticles(prev =>
        prev.map(p => {
          let x = p.x + p.vx;
          let y = p.y + p.vy;
          let vx = p.vx;
          let vy = p.vy;
          if (x < 0 || x > window.innerWidth) vx *= -1;
          if (y < 0 || y > window.innerHeight) vy *= -1;
          return { ...p, x, y, vx, vy };
        })
      );
      animationRef.current = requestAnimationFrame(animateParticles);
    };
    animationRef.current = requestAnimationFrame(animateParticles);

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 25;
        return next >= 100 ? 100 : next;
      });
    }, 150);

    // Load remembered email
    const remembered = localStorage.getItem('uv_remember_email');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    if (loginAttempts >= 5) {
      setError('Too many failed attempts. Please wait 5 minutes.');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(trimmedEmail, trimmedPassword);

      // Always check the store state after login attempt
      const state = useStore.getState();
      const authenticated = success || (state.isAuthenticated && !!state.tenant);

      if (authenticated) {
        if (rememberMe) {
          localStorage.setItem('uv_remember_email', trimmedEmail);
        } else {
          localStorage.removeItem('uv_remember_email');
        }
        setLoginAttempts(0);
        setError('');
        onLogin();
      } else {
        const attempts = loginAttempts + 1;
        setLoginAttempts(attempts);
        if (attempts >= 5) {
          setError('Account temporarily locked after 5 failed attempts. Please try again in 5 minutes.');
        } else if (attempts >= 3) {
          setError(`Invalid email or password. ${5 - attempts} attempt(s) remaining.`);
        } else {
          setError('Invalid email or password. Please check your credentials.');
        }
      }
    } catch (err) {
      console.error('Login exception:', err);
      setError('Connection error. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 flex items-center justify-center overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-float" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-float-reverse" />
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse-slow" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float" />
        </div>

        {/* Particles */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {particles.map(p => (
            <circle key={p.id} cx={p.x} cy={p.y} r={p.size} fill={p.color} opacity={0.5} />
          ))}
        </svg>

        {/* Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="absolute rounded-full border border-white/10 animate-ping"
              style={{ width: i * 200, height: i * 200, animationDelay: `${i * 0.5}s`, animationDuration: '3s' }}
            />
          ))}
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 text-center px-6"
        >
          <div className="mb-8 flex justify-center">
            <Logo size="large" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">UV Insurance Agency</h1>
            <p className="text-white/70 text-lg mb-2">Professional Insurance Management</p>
            <p className="text-white/50 text-sm">Loading your workspace...</p>
          </motion.div>

          {/* Spinner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="my-8 flex justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 border-4 border-white/20 border-t-white rounded-full"
            />
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="w-72 mx-auto"
          >
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-white/60 to-white rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <p className="text-white/60 text-sm mt-3">{Math.round(progress)}%</p>
          </motion.div>
        </motion.div>

        <InstallButton position="splash" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/15 rounded-full filter blur-3xl animate-float" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-400/15 rounded-full filter blur-3xl animate-float-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-blue-100/20 via-purple-100/20 to-pink-100/20 rounded-full filter blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '50px 50px' }}
        />
      </div>

      {/* Network status */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg">
          <WifiOff className="w-4 h-4" />
          No internet connection
        </div>
      )}
      {isOnline && (
        <div className="fixed top-4 right-4 z-50 text-green-500 flex items-center gap-1 text-xs opacity-50">
          <Wifi className="w-3 h-3" />
          Online
        </div>
      )}

      <AnimatePresence mode="wait">
        {showResetFlow ? (
          <PasswordResetFlow key="reset" onBack={() => setShowResetFlow(false)} />
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
              {/* Top gradient bar */}
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

              <div className="p-8">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-5">
                    <Logo size="large" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome Back</h2>
                  <p className="text-slate-500 text-sm">Sign in to your insurance workspace</p>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700"
                    >
                      <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4" noValidate>
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                        placeholder="you@uvinsurance.in"
                        autoComplete="email"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                        placeholder="••••••••••"
                        autoComplete="current-password"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowResetFlow(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading || loginAttempts >= 5}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 text-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In to Workspace
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Security notice */}
                <div className="mt-5 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Security Notice:</strong> Sessions expire after 15 minutes of inactivity. This system is for authorized UV Insurance staff only.
                  </p>
                </div>

                {/* Role badges */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-100 text-center">
                    <div className="text-lg mb-0.5">👑</div>
                    <div className="text-xs font-semibold text-blue-700">Owner</div>
                    <div className="text-[10px] text-blue-500">Full Access</div>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-100 text-center">
                    <div className="text-lg mb-0.5">👤</div>
                    <div className="text-xs font-semibold text-purple-700">Employee</div>
                    <div className="text-[10px] text-purple-500">Limited Access</div>
                  </div>
                </div>
              </div>

              {/* Install banner */}
              <div className="px-8 pb-6">
                <InstallButton position="login" />
              </div>
            </div>

            {/* Floating install banner */}
            <div className="mt-4">
              <InstallButton position="floating" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PASSWORD RESET FLOW ──────────────────────────────────────────────────────
function PasswordResetFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => { setIsLoading(false); setStep(2); }, 1200);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (code !== '123456') { setError('Invalid code. Use 123456 for demo.'); setIsLoading(false); return; }
    setTimeout(() => { setIsLoading(false); setStep(3); }, 1000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setStep(4); }, 1200);
  };

  const steps = ['Email', 'Verify', 'Reset', 'Done'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 p-8 w-full max-w-md"
    >
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 -mx-8 -mt-8 mb-8 rounded-t-3xl" />

      <button onClick={onBack} className="mb-5 text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm transition-colors">
        <ArrowRight className="w-4 h-4 rotate-180" />
        Back to login
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Reset Password</h2>
        <p className="text-slate-500 text-sm">
          {step === 1 && 'Enter your registered email'}
          {step === 2 && 'Enter verification code (demo: 123456)'}
          {step === 3 && 'Create a new secure password'}
          {step === 4 && 'Password reset successful!'}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
            }`}>
              {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 transition-all ${i + 1 < step ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {step === 1 && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="you@uvinsurance.in" required />
          <button type="submit" disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 text-sm">
            {isLoading ? 'Sending...' : 'Send Code'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <input type="text" value={code} onChange={e => setCode(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm tracking-widest"
            placeholder="Enter 6-digit code" maxLength={6} required />
          <button type="submit" disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 text-sm">
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="New password" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Confirm new password" required />
          <button type="submit" disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 text-sm">
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {step === 4 && (
        <div className="text-center space-y-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
            <CheckCircle className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-slate-600 text-sm">Your password has been reset. You can now sign in with your new password.</p>
          <button onClick={onBack}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl text-sm">
            Back to Sign In
          </button>
        </div>
      )}
    </motion.div>
  );
}
