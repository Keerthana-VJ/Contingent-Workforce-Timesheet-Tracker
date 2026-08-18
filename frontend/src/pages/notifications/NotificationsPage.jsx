import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../api/notificationApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  FileText, 
  Flag, 
  ShieldAlert, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [markingAll, setMarkingAll] = useState(false);
  const navigate = useNavigate();

  const fetchNotificationsList = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      const list = Array.isArray(data) ? data : (data?.content || data?.data?.content || data?.data || []);
      setNotifications(list);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationsList();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const getTypeIcon = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'TIMESHEET') return <Clock className="h-5 w-5 text-blue-500" />;
    if (t === 'INVOICE') return <FileText className="h-5 w-5 text-emerald-500" />;
    if (t === 'MILESTONE') return <Flag className="h-5 w-5 text-indigo-500" />;
    if (t === 'CONTRACTOR') return <UserCheck className="h-5 w-5 text-purple-500" />;
    return <ShieldAlert className="h-5 w-5 text-amber-500" />;
  };

  const getTargetRoute = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'TIMESHEET') return '/timesheets';
    if (t === 'INVOICE') return '/invoices';
    if (t === 'MILESTONE') return '/milestones';
    if (t === 'CONTRACTOR') return '/contractors';
    return '/notifications';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'TIMESHEET') return (n.type || '').toUpperCase() === 'TIMESHEET';
    if (filter === 'INVOICE') return (n.type || '').toUpperCase() === 'INVOICE';
    if (filter === 'MILESTONE') return (n.type || '').toUpperCase() === 'MILESTONE';
    return true;
  });

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Notifications & Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time delivery updates, timesheet submissions, variance alerts, and payment events.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={handleMarkAllRead} 
            isLoading={markingAll}
            className="flex items-center gap-1.5 self-start sm:self-auto text-xs"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { key: 'ALL', label: `All (${notifications.length})` },
          { key: 'UNREAD', label: `Unread (${unreadCount})` },
          { key: 'TIMESHEET', label: 'Timesheets' },
          { key: 'INVOICE', label: 'Invoices' },
          { key: 'MILESTONE', label: 'Milestones' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === tab.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white/50 dark:bg-slate-900/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-3">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No notifications in this view</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            You're all caught up! Automated alerts will appear here when approvals, submissions, or status updates occur.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`group flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 ${
                n.isRead
                  ? 'border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  : 'border-primary-200 bg-primary-50/40 dark:border-primary-900/50 dark:bg-primary-950/20 shadow-sm'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/60 mt-0.5">
                {getTypeIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-semibold truncate ${n.isRead ? 'text-slate-900 dark:text-slate-200' : 'text-primary-950 dark:text-primary-200'}`}>
                    {n.title}
                  </h4>
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400 shrink-0" />
                  )}
                  <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {n.message}
                </p>

                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <button
                    onClick={() => navigate(getTargetRoute(n.type))}
                    className="flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    View details <ArrowRight className="h-3 w-3" />
                  </button>

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
