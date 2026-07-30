import React from 'react';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { notificationService } from '../../services/notificationService';
import { Badge } from '../../components/common/Badge';

export const ResidentNotifications: React.FC = () => {
  const { notifications, markAsRead } = useNotifications();

  const handleDelete = async (id: string) => {
    await notificationService.deleteNotification(id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gate pass arrivals, security alerts, and system notifications
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start gap-4 transition-colors ${
                !n.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
              }`}
            >
              <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Bell className="w-5 h-5" />
              </div>

              <div className="grow space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {n.title}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {n.message}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!n.read && n.id && (
                  <button
                    onClick={() => markAsRead(n.id!)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Mark read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {n.id && (
                  <button
                    onClick={() => handleDelete(n.id!)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
