import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, AlertCircle, Info, XCircle } from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';

interface NotificationPanelProps {
  onClose: () => void;
  onMarkAllRead: () => void;
}

export function NotificationPanel({ onClose, onMarkAllRead }: NotificationPanelProps) {
  const { notifications, markNotificationRead } = useStore();
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await onMarkAllRead();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start justify-end z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-white/20 mt-16"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="w-6 h-6 text-slate-600" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
                  <p className="text-sm text-slate-600">
                    {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark all read
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {sortedNotifications.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {sortedNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.is_read) {
                        handleMarkAsRead(notification.id);
                      }
                      setSelectedNotification(notification.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-slate-500">
                            {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No notifications yet</p>
                <p className="text-sm mt-1">Your notifications will appear here</p>
              </div>
            )}
          </div>

          {selectedNotification && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-slate-50 border-t border-slate-200"
            >
              {(() => {
                const notification = notifications.find(n => n.id === selectedNotification);
                if (!notification) return null;
                return (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Selected: {notification.title}
                    </p>
                    <button
                      onClick={() => setSelectedNotification(null)}
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      Clear selection
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}