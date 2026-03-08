import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';
import { useStore } from '../store';

export function SessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { isAuthenticated, sessionStart, logout } = useStore();

  const SESSION_DURATION = 15 * 60 * 1000; // 15 minutes
  const WARNING_TIME = 2 * 60 * 1000; // 2 minutes before expiration

  useEffect(() => {
    if (!isAuthenticated || !sessionStart) return;

    const checkSession = () => {
      const now = new Date().getTime();
      const sessionStartTime = new Date(sessionStart).getTime();
      const elapsed = now - sessionStartTime;
      const remaining = SESSION_DURATION - elapsed;

      if (remaining <= 0) {
        // Session expired
        logout();
        window.location.reload();
      } else if (remaining <= WARNING_TIME) {
        // Show warning
        setTimeRemaining(Math.ceil(remaining / 1000));
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSession();

    // Check every second
    const interval = setInterval(checkSession, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, sessionStart, logout]);

  const handleExtendSession = () => {
    // Reset session start time
    useStore.setState({ sessionStart: new Date() });
    setShowWarning(false);
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Timeout Warning</h2>
              <p className="text-slate-600">
                Your session will expire in <span className="font-bold text-amber-600">{formatTime(timeRemaining)}</span>
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium mb-1">Why this matters:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Unsaved changes will be lost</li>
                    <li>You'll need to login again</li>
                    <li>Your secure session will be terminated</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Logout Now
              </button>
              <button
                onClick={handleExtendSession}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Extend Session
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}