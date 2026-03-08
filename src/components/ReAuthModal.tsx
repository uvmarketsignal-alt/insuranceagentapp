import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import { useStore } from '../store';

export function ReAuthModal() {
  const { reAuthRequired, tenant, resetReAuthAttempts, logout } = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (reAuthRequired) {
      setPassword('');
      setError('');
      setAttempts(0);
    }
  }, [reAuthRequired]);

  const handleConfirm = () => {
    if (!tenant) return;

    if (password === tenant.password) {
      resetReAuthAttempts();
      useStore.getState().setReAuthRequired(false);
      setPassword('');
      setError('');
      setAttempts(0);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        logout();
      } else {
        setError(`Incorrect password. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  const handleCancel = () => {
    logout();
  };

  return (
    <AnimatePresence>
      {reAuthRequired && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-white/20"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Re-authentication Required</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Please confirm your password to continue
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                    autoFocus
                  />
                </div>

                <p className="text-sm text-slate-600">
                  You have {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining before being logged out.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={!password || attempts >= 3}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Password
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}