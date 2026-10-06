import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCheck, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Notification } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { refreshUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const markAllRead = async () => {
    await api.markAllNotificationsRead();
    await fetchNotifs();
    await refreshUser();
  };

  const markSingleRead = async (id: string, link?: string) => {
    await api.markNotificationRead(id);
    await fetchNotifs();
    await refreshUser();
    if (link) {
      onClose();
      if (link.includes('submissions')) onNavigate('submissions');
      else if (link.includes('wallet')) onNavigate('wallet');
      else if (link.includes('creator')) onNavigate('creator');
      else if (link.includes('referrals')) onNavigate('referrals');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white border border-pink-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pink-100 bg-pink-50/50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-bold text-slate-900">Notifications & Activity</h3>
          </div>

          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {loading ? (
            <div className="py-12 text-center text-pink-600 text-xs">
              <div className="inline-block w-6 h-6 border-2 border-pink-500 border-t-rose-400 rounded-full animate-spin mb-2" />
              <p>Loading activity alerts...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No notifications yet. You'll receive updates when tasks are reviewed or balances change.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markSingleRead(n.id, n.link)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  n.isRead
                    ? 'bg-white border-pink-100 opacity-80 hover:opacity-100'
                    : 'bg-gradient-to-r from-pink-50/90 to-rose-50/90 border-pink-300 shadow-xs'
                }`}
              >
                <div className="mt-0.5">
                  {n.type === 'APPROVAL' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : n.type === 'EARNING' || n.type === 'COMMISSION' ? (
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                      $
                    </div>
                  ) : (
                    <Clock className="w-4 h-4 text-pink-600" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
