import React, { useState } from 'react';
import { Bell, CheckCheck, ShoppingBag, DollarSign, Package, AlertCircle, Sparkles, Building2, Store, ArrowRight } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Notification, NotificationType } from '../../types';
import { formatDate } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationDropdownProps {
  userId: string;
  onNavigate?: (path: string) => void;
}

export function NotificationDropdown({ userId, onNavigate }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = storage.getNotifications(userId);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleItemClick = (n: Notification) => {
    storage.markNotificationAsRead(n.id);
    if (n.link && onNavigate) {
      onNavigate(n.link);
    }
    setIsOpen(false);
  };

  const handleSeeAllNotifications = () => {
    setIsOpen(false);
    if (onNavigate) {
      const currentUser = storage.getCurrentUser();
      const path =
        currentUser?.role === 'reseller'
          ? '/reseller/notifications'
          : currentUser?.role === 'admin'
          ? '/admin/notifications'
          : '/notifications';
      onNavigate(path);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'new_order':
        return <ShoppingBag className="h-4 w-4 text-emerald-600" />;
      case 'commission_earned':
      case 'monthly_payout':
        return <DollarSign className="h-4 w-4 text-amber-600" />;
      case 'order_shipped':
      case 'order_delivered':
      case 'product_updated':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'business_updated':
        return <Building2 className="h-4 w-4 text-purple-600" />;
      case 'storefront_updated':
        return <Store className="h-4 w-4 text-emerald-600" />;
      case 'dispute_created':
        return <AlertCircle className="h-4 w-4 text-rose-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-indigo-600" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              className="absolute right-0 z-50 mt-2 w-80 sm:w-96 overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-xl ring-1 ring-black/5"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => storage.markAllNotificationsAsRead(userId)}
                    className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:underline"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500">No notifications yet.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleItemClick(n)}
                      className={`flex cursor-pointer items-start gap-3 p-3.5 text-xs transition-colors hover:bg-neutral-50 ${
                        !n.read ? 'bg-emerald-50/30 font-medium' : ''
                      }`}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-neutral-200 shadow-2xs">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="truncate font-semibold text-neutral-900">{n.title}</p>
                          <span className="text-[10px] text-neutral-400 shrink-0">{formatDate(n.createdAt)}</span>
                        </div>
                        <p className="mt-0.5 text-neutral-600 line-clamp-2 leading-snug">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* See All Notifications Footer */}
              <div className="border-t border-neutral-100 bg-neutral-50/80 p-2 text-center">
                <button
                  onClick={handleSeeAllNotifications}
                  className="flex items-center justify-center gap-1.5 w-full rounded-lg py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100/60 hover:text-emerald-800 transition-colors"
                >
                  <span>See All Notifications</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
