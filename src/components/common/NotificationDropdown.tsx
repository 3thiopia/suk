import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, ShoppingBag, DollarSign, Package, AlertCircle, Sparkles, Building2, Store, ArrowRight, X } from 'lucide-react';
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
      {/* Compact, touch-friendly Notification Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-neutral-200/90 bg-white text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 active:scale-95 transition-all shadow-2xs focus:outline-none"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for tap-away */}
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-2xs sm:bg-transparent sm:backdrop-blur-none"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Panel - Fixed full-width padded card on mobile, right-aligned dropdown on desktop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-x-3 top-16 z-50 max-w-md mx-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-2xl ring-1 ring-black/5"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => storage.markAllNotificationsAsRead(userId)}
                      className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Mark all read</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors sm:hidden"
                    aria-label="Close notifications"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Notification Items List */}
              <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto divide-y divide-neutral-100 touch-pan-y">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs font-medium text-neutral-500">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleItemClick(n)}
                      className={`flex cursor-pointer items-start gap-3 p-3.5 text-xs transition-colors hover:bg-neutral-50 ${
                        !n.read ? 'bg-emerald-50/40 font-medium' : ''
                      }`}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-neutral-200/80 shadow-2xs">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-bold text-neutral-900">{n.title}</p>
                          <span className="text-[10px] text-neutral-400 shrink-0 font-medium">
                            {formatDate(n.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-neutral-600 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer: See All Notifications button */}
              <div className="border-t border-neutral-100 bg-neutral-50/80 p-2.5 text-center">
                <button
                  type="button"
                  onClick={handleSeeAllNotifications}
                  className="flex items-center justify-center gap-1.5 w-full rounded-xl py-2 px-3 text-xs font-bold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/80 hover:text-emerald-800 transition-colors"
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
