import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Filter, Eye } from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const { auditLogs } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const actions = Array.from(new Set(auditLogs.map(log => log.action)));

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.entity_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'Old Values', 'New Values'].join(','),
      ...filteredLogs.map(log => [
        `"${format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}"`,
        `"${log.action}"`,
        `"${log.entity_type}"`,
        `"${log.entity_id || ''}"`,
        `"${log.old_values || ''}"`,
        `"${log.new_values || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-600 mt-1">Track all system activities and changes</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Activity Logs ({filteredLogs.length})
            </h2>
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Entity Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Entity ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {log.entity_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {log.entity_id ? log.entity_id.substring(0, 8) + '...' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedLog(log.id)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No audit logs found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            {(() => {
              const log = auditLogs.find(l => l.id === selectedLog);
              if (!log) return null;
              return (
                <>
                  <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">Log Details</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Timestamp</label>
                      <p className="text-sm text-slate-900">
                        {format(new Date(log.created_at), 'PPpp')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Action</label>
                      <p className="text-sm text-slate-900">{log.action}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Entity Type</label>
                      <p className="text-sm text-slate-900">{log.entity_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Entity ID</label>
                      <p className="text-sm text-slate-900">{log.entity_id || '-'}</p>
                    </div>
                    {log.old_values && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Old Values</label>
                        <pre className="text-sm text-slate-900 bg-slate-50 p-3 rounded-lg overflow-x-auto">
                          {log.old_values}
                        </pre>
                      </div>
                    )}
                    {log.new_values && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Values</label>
                        <pre className="text-sm text-slate-900 bg-slate-50 p-3 rounded-lg overflow-x-auto">
                          {log.new_values}
                        </pre>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">IP Address</label>
                      <p className="text-sm text-slate-900">{log.ip_address || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">User Agent</label>
                      <p className="text-sm text-slate-900">{log.user_agent || '-'}</p>
                    </div>
                  </div>
                  <div className="p-6 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}
    </div>
  );
}