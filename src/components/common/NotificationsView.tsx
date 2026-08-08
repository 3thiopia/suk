import React, { useState } from 'react';
import { Bell, Check, CheckCircle2, Trash2, ShoppingBag, DollarSign, Package, ShieldAlert, Sparkles } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Notification } from '../../types';
import { formatDate } from '../../lib/utils';
import { EmptyState } from './EmptyState';

interface NotificationsViewProps {
  userId: string;
  onNavigate?: (path: string) => void;
}

export function NotificationsView({ userId, onNavigate }: NotificationsViewProps) {
  const notifications = storage.getNotifications(userId);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const handleMarkAllRead = () => {
    storage.markAllNotificationsAsRead(userId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
      case 'order_accepted':
      case 'order_shipped':
      case 'order_delivered':
        return <ShoppingBag className="h-4 w-4 text-emerald-600" />;
      case 'commission_earned':
      case 'payout_processed':
        return <DollarSign className="h-4 w-4 text-emerald-600" />;
      case 'dispute_created':
        return <ShieldAlert className="h-4 w-4 text-rose-600" />;
      default:
        return <Bell className="h-4 w-4 text-neutral-600" />;
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-black text-neutral-900">Notifications & Activity Feed</h1>
          </div>
          <p className="text-xs text-neutral-500">
            Real-time fulfillment alerts, order updates, commission deposits, and system announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-1">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                filter === 'all' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                filter === 'unread' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Unread ({notifications.filter((n) => !n.read).length})
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications Found"
          description="Your inbox is clear! Check back later for order and payout updates."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                storage.markNotificationAsRead(notif.id);
                if (notif.link && onNavigate) {
                  onNavigate(notif.link);
                }
              }}
              className={`cursor-pointer group flex items-start gap-4 rounded-2xl border p-4 transition-all ${
                notif.read
                  ? 'border-neutral-200 bg-white hover:bg-neutral-50/80'
                  : 'border-emerald-200 bg-emerald-50/30 shadow-xs hover:bg-emerald-50/50'
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  notif.read ? 'border-neutral-200 bg-neutral-100' : 'border-emerald-200 bg-white shadow-2xs'
                }`}
              >
                {getNotificationIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                    {notif.title}
                  </h3>
                  <span className="text-[10px] font-medium text-neutral-400">{formatDate(notif.createdAt)}</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.read && (
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0 self-center" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
