import { useEffect, useState, lazy, Suspense } from 'react';
import { useStore } from './store';
import type { Page } from './types';
import Login from './components/Login';
import Layout from './components/Layout';
import { SessionTimeout } from './components/SessionTimeout';
import { ReAuthModal } from './components/ReAuthModal';
import { CommandPalette } from './components/CommandPalette';
import { NotificationPanel } from './components/NotificationPanel';
import { InstallButton } from './components/InstallButton';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load all pages
const OwnerDashboard    = lazy(() => import('./pages/OwnerDashboard'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));
const ApprovalsPage     = lazy(() => import('./pages/ApprovalsPage'));
const CustomersPage     = lazy(() => import('./pages/CustomersPage'));
const EmployeesPage     = lazy(() => import('./pages/EmployeesPage'));
const AuditLogsPage     = lazy(() => import('./pages/AuditLogsPage'));
const NewCustomerPage   = lazy(() => import('./pages/NewCustomerPage'));
const KnowledgeBasePage = lazy(() => import('./pages/KnowledgeBasePage'));
const DocumentsPage     = lazy(() => import('./pages/DocumentsPage'));
const ClaimsPage        = lazy(() => import('./pages/ClaimsPage'));
const LeadsPage         = lazy(() => import('./pages/LeadsPage'));
const RenewalsPage      = lazy(() => import('./pages/RenewalsPage'));
const CommissionsPage   = lazy(() => import('./pages/CommissionsPage'));
const FamilyTreePage    = lazy(() => import('./pages/FamilyTreePage'));
const AnalyticsPage     = lazy(() => import('./pages/AnalyticsPage'));
const CompliancePage    = lazy(() => import('./pages/CompliancePage'));
const SettingsPage      = lazy(() => import('./pages/SettingsPage'));
const ProfilePage       = lazy(() => import('./pages/ProfilePage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Preparing your workspace...</p>
      </div>
    </div>
  );
}

export function App() {
  const [currentPage, setCurrentPage]           = useState<Page>('login');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { isAuthenticated, tenant, setDarkMode, darkMode, checkAuth } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Dark mode
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') setDarkMode(true);
    else if (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches)
      setDarkMode(true);
  }, [setDarkMode]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else          document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Service Worker + PWA + Keyboard shortcuts
  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      useStore.getState().setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(p => !p);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Auth → page redirect
  useEffect(() => {
    if (isAuthenticated && tenant) {
      if (currentPage === 'login') {
        setCurrentPage(tenant.role === 'owner' ? 'owner-dashboard' : 'employee-dashboard');
      }
    } else {
      setCurrentPage('login');
    }
  }, [isAuthenticated, tenant]);

  const navigate = (page: Page) => setCurrentPage(page);

  const handleLogin = () => {
    const t = useStore.getState().tenant;
    navigate(t?.role === 'owner' ? 'owner-dashboard' : 'employee-dashboard');
  };

  const handleNewCustomerComplete = () => {
    navigate(tenant?.role === 'owner' ? 'owner-dashboard' : 'employee-dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'owner-dashboard':    return <OwnerDashboard    onNavigate={navigate} />;
      case 'employee-dashboard': return <EmployeeDashboard onNavigate={navigate} />;
      case 'approvals':          return <ApprovalsPage />;
      case 'customers':          return <CustomersPage     onNavigate={navigate} />;
      case 'employees':          return <EmployeesPage />;
      case 'audit-logs':         return <AuditLogsPage />;
      case 'new-customer':       return <NewCustomerPage   onComplete={handleNewCustomerComplete} />;
      case 'knowledge-base':     return <KnowledgeBasePage />;
      case 'documents':          return <DocumentsPage />;
      case 'claims':             return <ClaimsPage />;
      case 'leads':              return <LeadsPage />;
      case 'renewals':           return <RenewalsPage />;
      case 'commissions':        return <CommissionsPage />;
      case 'family-tree':        return <FamilyTreePage />;
      case 'analytics':          return <AnalyticsPage />;
      case 'compliance':         return <CompliancePage />;
      case 'settings':           return <SettingsPage />;
      case 'profile':            return <ProfilePage />;
      default:
        return tenant?.role === 'owner'
          ? <OwnerDashboard onNavigate={navigate} />
          : <EmployeeDashboard onNavigate={navigate} />;
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.99 },
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen selection:bg-indigo-100 relative overflow-hidden">
         {/* Aurora Background Effect */}
         <div className="absolute inset-0 -z-10 bg-slate-50">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px] animate-aurora" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] animate-aurora" style={{ animationDelay: '-5s' }} />
        </div>
        
        <Toaster position="top-right" />
        <Login onLogin={handleLogin} />
        {showCommandPalette && (
          <CommandPalette onClose={() => setShowCommandPalette(false)} onNavigate={navigate} />
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen selection:bg-indigo-100 ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'} relative overflow-hidden transition-colors duration-500`}>
      {/* Aurora Background Effect */}
      {!darkMode && (
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px] animate-aurora" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/40 rounded-full blur-[120px] animate-aurora" style={{ animationDelay: '-5s' }} />
        </div>
      )}

      <Layout
        onNavigate={navigate}
        currentPage={currentPage}
        onNotificationsToggle={() => setShowNotifications(p => !p)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'circOut' }}
            className="w-full"
          >
            <Suspense fallback={<PageLoader />}>
              {renderPage()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </Layout>

      <Toaster position="top-right" />
      <SessionTimeout />
      <ReAuthModal />

      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} onNavigate={navigate} />
      )}
      {showNotifications && (
        <NotificationPanel
          onClose={() => setShowNotifications(false)}
          onMarkAllRead={() => useStore.getState().markAllNotificationsRead()}
        />
      )}
      <InstallButton position="floating" />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
