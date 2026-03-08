import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Users, FileCheck, AlertCircle, BookOpen, BarChart3, ShieldCheck, Settings, LogOut, Camera, FileText, Home, Clock, DollarSign, Users2, ClipboardList, TrendingUp } from 'lucide-react';
import { useStore } from '../store';

type Page =
  | 'owner-dashboard'
  | 'employee-dashboard'
  | 'approvals'
  | 'customers'
  | 'employees'
  | 'audit-logs'
  | 'new-customer'
  | 'knowledge-base'
  | 'claims'
  | 'leads'
  | 'renewals'
  | 'commissions'
  | 'documents'
  | 'family-tree'
  | 'analytics'
  | 'compliance'
  | 'settings';

interface Command {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  roles: Array<'owner' | 'employee'>;
}

interface CommandPaletteProps {
  onClose: () => void;
  onNavigate: (page: Page) => void;
}

export function CommandPalette({ onClose, onNavigate }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { tenant, logout } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands: Command[] = [
    // Navigation commands
    { id: 'dashboard', name: 'Go to Dashboard', icon: <TrendingUp className="w-4 h-4" />, action: () => onNavigate(tenant?.role === 'owner' ? 'owner-dashboard' : 'employee-dashboard'), keywords: ['dashboard', 'home', 'main'], roles: ['owner', 'employee'] },
    { id: 'customers', name: 'View Customers', icon: <Users className="w-4 h-4" />, action: () => onNavigate('customers'), keywords: ['customers', 'clients', 'people'], roles: ['owner', 'employee'] },
    { id: 'new-customer', name: 'Add New Customer', icon: <Users className="w-4 h-4" />, action: () => onNavigate('new-customer'), keywords: ['new customer', 'add customer', 'create customer'], roles: ['owner', 'employee'] },
    { id: 'approvals', name: 'Customer Approvals', icon: <FileCheck className="w-4 h-4" />, action: () => onNavigate('approvals'), keywords: ['approvals', 'pending', 'review'], roles: ['owner'] },
    { id: 'claims', name: 'Manage Claims', icon: <AlertCircle className="w-4 h-4" />, action: () => onNavigate('claims'), keywords: ['claims', 'complaints', 'issues'], roles: ['owner', 'employee'] },
    { id: 'leads', name: 'View Leads', icon: <Users2 className="w-4 h-4" />, action: () => onNavigate('leads'), keywords: ['leads', 'prospects', 'opportunities'], roles: ['owner', 'employee'] },
    { id: 'renewals', name: 'Policy Renewals', icon: <Clock className="w-4 h-4" />, action: () => onNavigate('renewals'), keywords: ['renewals', 'expiring', 'renew'], roles: ['owner', 'employee'] },
    { id: 'commissions', name: 'Commissions', icon: <DollarSign className="w-4 h-4" />, action: () => onNavigate('commissions'), keywords: ['commissions', 'earnings', 'payouts'], roles: ['owner', 'employee'] },
    { id: 'employees', name: 'Manage Employees', icon: <Users2 className="w-4 h-4" />, action: () => onNavigate('employees'), keywords: ['employees', 'team', 'staff'], roles: ['owner'] },
    { id: 'documents', name: 'View Documents', icon: <FileText className="w-4 h-4" />, action: () => onNavigate('documents'), keywords: ['documents', 'files', 'uploads'], roles: ['owner', 'employee'] },
    { id: 'family-tree', name: 'Family Tree', icon: <Home className="w-4 h-4" />, action: () => onNavigate('family-tree'), keywords: ['family', 'dependents', 'members'], roles: ['owner', 'employee'] },
    { id: 'audit-logs', name: 'Audit Logs', icon: <ClipboardList className="w-4 h-4" />, action: () => onNavigate('audit-logs'), keywords: ['audit', 'logs', 'history', 'tracking'], roles: ['owner'] },
    { id: 'knowledge-base', name: 'Knowledge Base', icon: <BookOpen className="w-4 h-4" />, action: () => onNavigate('knowledge-base'), keywords: ['knowledge', 'articles', 'help', 'docs'], roles: ['owner', 'employee'] },
    { id: 'analytics', name: 'Analytics Dashboard', icon: <BarChart3 className="w-4 h-4" />, action: () => onNavigate('analytics'), keywords: ['analytics', 'reports', 'insights', 'data'], roles: ['owner'] },
    { id: 'compliance', name: 'Compliance Reports', icon: <ShieldCheck className="w-4 h-4" />, action: () => onNavigate('compliance'), keywords: ['compliance', 'irdai', 'regulations'], roles: ['owner'] },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-4 h-4" />, action: () => onNavigate('settings'), keywords: ['settings', 'configuration', 'preferences'], roles: ['owner'] },
    
    // Action commands
    { id: 'capture-document', name: 'Capture Document', icon: <Camera className="w-4 h-4" />, action: () => { console.log('Open camera'); onClose(); }, keywords: ['camera', 'capture', 'photo', 'document'], roles: ['owner', 'employee'] },
    { id: 'logout', name: 'Logout', icon: <LogOut className="w-4 h-4" />, action: () => { logout(); onClose(); }, keywords: ['logout', 'sign out', 'exit'], roles: ['owner', 'employee'] },
  ];

  const filteredCommands = commands.filter(command => {
    const matchesSearch = command.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         command.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = command.roles.includes(tenant?.role as 'owner' | 'employee');
    return matchesSearch && matchesRole;
  });

  const handleSelectCommand = (command: Command) => {
    command.action();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onKeyDown={handleKeyDown}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="w-full pl-10 pr-10 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                autoFocus
              />
              <button
                onClick={onClose}
                className="absolute right-2 top-2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Commands ({filteredCommands.length})
            </div>

            <div className="max-h-96 overflow-y-auto space-y-1">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((command) => (
                  <motion.button
                    key={command.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ backgroundColor: 'rgb(59 130 246 / 0.1)' }}
                    onClick={() => handleSelectCommand(command)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {command.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                        {command.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {command.keywords.slice(0, 3).join(', ')}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      Press Enter
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No commands found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <div>
                <kbd className="px-2 py-1 bg-slate-100 rounded">Ctrl</kbd> + 
                <kbd className="px-2 py-1 bg-slate-100 rounded ml-1">K</kbd> to close
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}