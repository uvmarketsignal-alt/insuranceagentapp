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
  Home,
  Clock,
  DollarSign,
  Users2,
  ClipboardList,
  ChevronRight
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
  category: 'Core' | 'Business' | 'Management' | 'Intelligence' | 'System';
}

export default function Layout({ children, onNavigate, currentPage, onNotificationsToggle }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { appName, tenant, profile, notifications } = useStore();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navItems: NavItem[] = [
    // Core
    { id: 'owner-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['owner'], category: 'Core' },
    { id: 'employee-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['employee'], category: 'Core' },
    { id: 'approvals', label: 'Approvals', icon: <FileCheck className="w-5 h-5" />, roles: ['owner'], category: 'Core' },
    
    // Business
    { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" />, roles: ['owner', 'employee'], category: 'Business' },
    { id: 'leads', label: 'Leads', icon: <Users2 className="w-5 h-5" />, roles: ['owner', 'employee'], category: 'Business' },
    { id: 'claims', label: 'Claims', icon: <AlertCircle className="w-5 h-5" />, roles: ['owner', 'employee'], category: 'Business' },
    { id: 'renewals', label: 'Renewals', icon: <Clock className="w-5 h-5" />, roles: ['owner', 'employee'], category: 'Business' },
    
    // Management
    { id: 'employees', label: 'Employees', icon: <Users className="w-5 h-5" />, roles: ['owner'], category: 'Management' },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-5 h-5" />, roles: ['owner', 'employee'], category: 'Management' },
    { id: 'commissions', label: 'Commissions', icon: <DollarSign className="w-5 h-5" />, roles: ['owner', 'employee'], category: 'Management' },
    
    // Intelligence
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, roles: ['owner'], category: 'Intelligence' },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: <BookOpen className="w-5 h-5" />, roles: ['owner', 'employee'], category: 'Intelligence' },
    { id: 'family-tree', label: 'Family Tree', icon: <Home className="w-5 h-5" />, roles: ['owner', 'employee'], category: 'Intelligence' },
    
    // System
    { id: 'audit-logs', label: 'Audit Logs', icon: <ClipboardList className="w-5 h-5" />, roles: ['owner'], category: 'System' },
    { id: 'compliance', label: 'Compliance', icon: <ShieldCheck className="w-5 h-5" />, roles: ['owner'], category: 'System' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, roles: ['owner'], category: 'System' },
  ];

  const groupedNavItems = navItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<NavItem['category'], NavItem[]>);

  const handleLogout = () => {
    const { logout } = useStore.getState();
    logout();
  };

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setSidebarOpen(false);
  };

  const categories: NavItem['category'][] = ['Core', 'Business', 'Management', 'Intelligence', 'System'];

  return (
    <div className="min-h-screen">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass dark:glass-dark rounded-xl shadow-lg border border-white/20 dark:border-white/5"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 glass dark:glass-dark border-r border-white/20 dark:border-white/5 shadow-2xl z-40 overflow-hidden flex flex-col transition-transform duration-500 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
              <Logo size="small" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight uppercase">
                {appName.split(' ')[0]} <span className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  {appName.split(' ').slice(1).join(' ')}
                </span>
              </h2>
            </div>
          </div>

          <div className="group relative mt-6 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/10 transition-all hover:bg-white dark:hover:bg-indigo-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                {(profile?.full_name || tenant?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {profile?.full_name || tenant?.name}
                </p>
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  {tenant?.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          <nav className="space-y-6">
            {categories.map((category) => {
              const items = groupedNavItems[category] || [];
              const filteredItems = items.filter(item => 
                item.roles.includes(tenant?.role as 'owner' | 'employee')
              );
              
              if (filteredItems.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">
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
                            'w-full group flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300',
                            isActive
                              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "transition-transform group-hover:scale-110",
                              isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-600"
                            )}>
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </div>
                          {isActive && (
                            <motion.div layoutId="nav-indicator">
                              <ChevronRight className="w-4 h-4 opacity-70" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/10 backdrop-blur-sm">
          <InstallButton position="sidebar" />
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 glass dark:glass-dark border-b border-white/20 dark:border-white/5 shadow-sm px-8 flex items-center justify-between whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-indigo-50 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {navItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-slate-400 group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <Search className="w-4 h-4 group-focus-within:text-indigo-500" />
                <span className="text-xs font-bold">Search (⌘K)</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                {/* Notifications */}
                <button
                    onClick={onNotificationsToggle}
                    className="relative p-2.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/5 rounded-xl transition-all active:scale-95"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 text-[10px] font-black text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900"
                    >
                        {unreadCount}
                    </motion.span>
                    )}
                </button>

                {/* Quick actions */}
                {tenant?.role === 'employee' && (
                    <button
                        onClick={() => handleNavigate('new-customer')}
                        className="p-2.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/5 rounded-xl transition-all active:scale-95"
                    >
                        <UserPlus className="w-5 h-5" />
                    </button>
                )}

                <InstallButton position="topbar" />

                <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 sm:mx-2" />

                <div className="flex items-center gap-3">
                   <div className="hidden sm:block text-right overflow-hidden max-w-[120px]">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {profile?.full_name?.split(' ')[0] || tenant?.name}
                        </p>
                   </div>
                   <button
                    onClick={() => handleNavigate('profile')}
                    className="w-10 h-10 rounded-2xl p-0.5 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-200 dark:shadow-none transition-transform hover:scale-105 active:scale-95"
                   >
                        <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center">
                            <span className="text-xs font-black bg-gradient-to-tr from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {(profile?.full_name || tenant?.name || 'U').charAt(0).toUpperCase()}
                            </span>
                        </div>
                   </button>
                </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
            {children}
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}