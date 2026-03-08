import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileCheck, 
  FileText, 
  AlertCircle, 
  BookOpen, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Bell,
  Search,
  Camera,
  Home,
  Clock,
  DollarSign,
  Users2,
  ClipboardList
} from 'lucide-react';
import { useStore } from '../store';
import { Logo } from './Logo';
import { InstallButton } from './InstallButton';
import { cn } from '../utils/cn';
import type { Page } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (page: Page) => void;
  currentPage: Page;
  onNotificationsToggle: () => void;
}

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  roles: Array<'owner' | 'employee'>;
  category?: string;
}

export default function Layout({ children, onNavigate, currentPage, onNotificationsToggle }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { tenant, profile, notifications } = useStore();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navItems: NavItem[] = [
    // Main
    { id: 'owner-dashboard', label: 'Owner Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['owner'] },
    { id: 'employee-dashboard', label: 'Employee Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['employee'] },
    { id: 'approvals', label: 'Approvals', icon: <FileCheck className="w-5 h-5" />, roles: ['owner'] },
    { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" />, roles: ['owner', 'employee'] },
    { id: 'new-customer', label: 'New Customer', icon: <UserPlus className="w-5 h-5" />, roles: ['owner', 'employee'] },
    
    // Business
    { id: 'claims', label: 'Claims', icon: <AlertCircle className="w-5 h-5" />, roles: ['owner', 'employee'] },
    { id: 'leads', label: 'Leads', icon: <Users2 className="w-5 h-5" />, roles: ['owner', 'employee'] },
    { id: 'renewals', label: 'Renewals', icon: <Clock className="w-5 h-5" />, roles: ['owner', 'employee'] },
    { id: 'commissions', label: 'Commissions', icon: <DollarSign className="w-5 h-5" />, roles: ['owner', 'employee'] },
    
    // Management
    { id: 'employees', label: 'Employees', icon: <Users className="w-5 h-5" />, roles: ['owner'] },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-5 h-5" />, roles: ['owner', 'employee'] },
    { id: 'family-tree', label: 'Family Tree', icon: <Home className="w-5 h-5" />, roles: ['owner', 'employee'] },
    
    // System
    { id: 'audit-logs', label: 'Audit Logs', icon: <ClipboardList className="w-5 h-5" />, roles: ['owner'] },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: <BookOpen className="w-5 h-5" />, roles: ['owner', 'employee'] },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, roles: ['owner'] },
    { id: 'compliance', label: 'Compliance', icon: <ShieldCheck className="w-5 h-5" />, roles: ['owner'] },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, roles: ['owner'] },
  ];

  const groupedNavItems = navItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const handleLogout = () => {
    const { logout } = useStore.getState();
    logout();
  };

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-lg rounded-lg shadow-lg border border-white/20"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -280,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-72 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl z-40 overflow-y-auto"
      >
        <div className="p-6">
          {/* Logo and user info */}
          <div className="flex items-center gap-3 mb-8">
            <Logo size="small" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">UV Insurance</h2>
              <p className="text-xs text-slate-500">
                {tenant?.role === 'owner' ? 'Owner' : 'Employee'}
              </p>
            </div>
          </div>

          <div className="mb-6 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm font-medium text-blue-900">{profile?.full_name || tenant?.name}</p>
            <p className="text-xs text-blue-600">{tenant?.email}</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {Object.entries(groupedNavItems).map(([category, items]) => {
              const filteredItems = items.filter(item => 
                item.roles.includes(tenant?.role as 'owner' | 'employee')
              );
              
              if (filteredItems.length === 0) return null;

              return (
                <div key={category} className="mb-4">
                  <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {filteredItems.map((item) => {
                      const isActive = currentPage === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigate(item.id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            isActive
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                              : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                          )}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-2">
            <InstallButton position="sidebar" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:ml-72 min-h-screen">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-slate-900">
                {navItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => {}}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Ctrl+K</span>
              </button>

              {/* Notifications */}
              <button
                onClick={onNotificationsToggle}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </button>

              {/* Quick actions */}
              {tenant?.role === 'employee' && (
                <button
                  onClick={() => onNavigate('new-customer')}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}

              <InstallButton position="topbar" />

              {/* User avatar */}
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(profile?.full_name || tenant?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}