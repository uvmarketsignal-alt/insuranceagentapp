import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../utils/cn';

type InstallPosition = 'splash' | 'login' | 'sidebar' | 'topbar' | 'floating';

interface InstallButtonProps {
  position: InstallPosition;
  className?: string;
}

export function InstallButton({ position, className }: InstallButtonProps) {
  const { installPrompt, setInstallPrompt } = useStore();
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Show banner after 2 seconds on splash/login
    if (position === 'splash' || position === 'login') {
      const timer = setTimeout(() => {
        if (!isInstalled) {
          setShowBanner(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [installPrompt, position, isInstalled]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      const result = await (installPrompt as any).prompt();
      if (result?.outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (isInstalled) {
    return null;
  }

  // Floating button (shows in bottom-right corner of the app)
  if (position === 'floating') {
    return (
      <AnimatePresence>
        {installPrompt && !sessionStorage.getItem('pwa-banner-dismissed') && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInstall}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg shadow-blue-200 flex items-center gap-2 font-medium hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Install App</span>
          </motion.button>
        )}
      </AnimatePresence>
    );
  }

  // Banner for splash/login screens
  if ((position === 'splash' || position === 'login') && showBanner) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'absolute top-6 left-1/2 -translate-x-1/2 z-50',
          position === 'splash' ? 'top-6' : 'top-4',
          className
        )}
      >
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-4 flex items-center gap-4 max-w-md">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Install UV Insurance App</h3>
            <p className="text-xs text-slate-600 mt-1">
              Get faster access, offline support, and native app experience
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Install
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Button for sidebar/topbar
  if (position === 'sidebar' || position === 'topbar') {
    return (
      <AnimatePresence>
        {installPrompt && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleInstall}
            className={cn(
              'flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors',
              position === 'topbar' && 'p-2 rounded-lg hover:bg-slate-100',
              className
            )}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Install App</span>
          </motion.button>
        )}
      </AnimatePresence>
    );
  }

  return null;
}