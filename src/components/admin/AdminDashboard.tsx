import React, { useState } from 'react';
import {
  ShieldCheck,
  DollarSign,
  Building2,
  Store,
  ShoppingBag,
  Database,
  Layers,
  BarChart3,
  AlertCircle,
  ShieldAlert,
  FolderTree,
  Megaphone,
  FileText,
  Settings,
  Package,
  LifeBuoy,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { SupabaseSchemaViewer } from '../common/SupabaseSchemaViewer';
import { Modal } from '../common/Modal';

import { AdminOverviewTab } from './AdminOverviewTab';
import { BusinessManagementTab } from './BusinessManagementTab';
import { ResellerManagementTab } from './ResellerManagementTab';
import { ProductModerationTab } from './ProductModerationTab';
import { OrderManagementTab } from './OrderManagementTab';
import { CommissionPayoutsTab } from './CommissionPayoutsTab';
import { DisputeCenterTab } from './DisputeCenterTab';
import { ModerationReportsTab } from './ModerationReportsTab';
import { OrderReportsTab } from './OrderReportsTab';
import { CategoryManagerTab } from './CategoryManagerTab';
import { AnnouncementsTab } from './AnnouncementsTab';
import { AuditLogsTab } from './AuditLogsTab';
import { PlatformSettingsTab } from './PlatformSettingsTab';
import { SupportTicketsTab } from './SupportTicketsTab';
import { GlobalAdminSearch } from './GlobalAdminSearch';
import { ReviewModerationTab } from './ReviewModerationTab';

import { Scale, UserCheck, Star } from 'lucide-react';
import { AppealsTab } from './AppealsTab';

interface AdminDashboardProps {
  onNavigate?: (path: string) => void;
  activeTab?: string;
}

export function AdminDashboard({ onNavigate, activeTab: initialTab = 'overview' }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [, setStorageTick] = useState<number>(0);

  // Storage subscription for real-time reactivity without manual refresh
  React.useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setStorageTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [selectedOrderTimelineId, setSelectedOrderTimelineId] = useState<string | null>(null);
  const [selectedProductIdForModeration, setSelectedProductIdForModeration] = useState<string | null>(null);

  const stats = storage.getAdminPlatformStats();
  const disputes = storage.getDisputes();
  const reports = storage.getReports();
  const tickets = storage.getTickets();
  const accountAppeals = storage.getAppeals();
  const productAppeals = storage.getProductAppeals();
  const orderReports = storage.getOrderReports();
  const reviewReports = storage.getReviewReports();
  const payoutStats = storage.getPayoutSummaryStats();

  const openDisputesCount = disputes.filter((d) => d.status === 'open' || d.status === 'investigating').length;
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'Open' || t.status === 'Investigating' || t.status === 'Waiting for Business').length;
  const pendingAccountAppealsCount = accountAppeals.filter((a) => a.status === 'pending').length;
  const pendingProductAppealsCount = productAppeals.filter((a) => a.status === 'pending').length;
  const openOrderReportsCount = orderReports.filter((r) => r.status === 'open' || r.status === 'investigating').length;
  const openReviewReportsCount = reviewReports.filter((r) => r.status === 'open').length;
  const eligiblePayoutsCount = payoutStats.eligibleCreatorsCount;

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'tickets', label: 'Support Tickets', icon: LifeBuoy, badge: openTicketsCount },
    { id: 'businesses', label: 'Businesses', icon: Building2 },
    { id: 'resellers', label: 'Resellers', icon: Store },
    { id: 'products', label: 'Product Moderation', icon: Package },
    { id: 'reviews', label: 'Review Moderation', icon: Star, badge: openReviewReportsCount },
    { id: 'product-appeals', label: 'Product Appeals', icon: Scale, badge: pendingProductAppealsCount },
    { id: 'appeals', label: 'Account Appeals', icon: UserCheck, badge: pendingAccountAppealsCount },
    { id: 'orders', label: 'Orders & Timelines', icon: ShoppingBag },
    { id: 'order-reports', label: 'Order Reports', icon: ShieldAlert, badge: openOrderReportsCount },
    { id: 'commissions', label: 'Creator Payouts', icon: DollarSign, badge: eligiblePayoutsCount },
    { id: 'disputes', label: 'Disputes', icon: AlertCircle, badge: openDisputesCount },
    { id: 'reports', label: 'Moderation Reports', icon: ShieldAlert, badge: pendingReportsCount },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Global Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-emerald-400 font-bold shadow-xs">
            Su<span className="text-emerald-400">k</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h1 className="text-lg font-black text-neutral-900">Platform Operator Console</h1>
            </div>
            <p className="text-xs text-neutral-500">
              Platform administration, brand & reseller trust governance, dispute arbitration, payouts & timeline audit.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Global Admin Search Bar */}
          <GlobalAdminSearch onSelectResult={(tab) => setActiveTab(tab)} />

          <button
            onClick={() => setIsSchemaModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-bold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-colors"
          >
            <Database className="h-4 w-4 text-purple-600" />
            Inspect Supabase & RLS
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-100/70 p-1.5 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-white hover:text-neutral-900'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    isActive ? 'bg-emerald-500 text-neutral-900' : 'bg-red-500 text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab View Area */}
      <div>
        {activeTab === 'overview' && (
          <AdminOverviewTab
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenOrderTimeline={(orderId) => {
              setSelectedOrderTimelineId(orderId);
              setActiveTab('orders');
            }}
          />
        )}

        {activeTab === 'tickets' && <SupportTicketsTab />}

        {activeTab === 'businesses' && <BusinessManagementTab />}

        {activeTab === 'resellers' && <ResellerManagementTab onNavigate={(path) => onNavigate?.(path)} />}

        {activeTab === 'products' && (
          <ProductModerationTab
            onNavigateToAppeals={() => setActiveTab('product-appeals')}
            highlightProductId={selectedProductIdForModeration}
            onClearHighlight={() => setSelectedProductIdForModeration(null)}
          />
        )}

        {activeTab === 'reviews' && <ReviewModerationTab />}

        {activeTab === 'product-appeals' && (
          <AppealsTab
            defaultTab="product"
            onNavigateToProductModeration={(pid) => {
              setSelectedProductIdForModeration(pid);
              setActiveTab('products');
            }}
          />
        )}

        {activeTab === 'appeals' && (
          <AppealsTab
            defaultTab="account"
            onNavigateToProductModeration={(pid) => {
              setSelectedProductIdForModeration(pid);
              setActiveTab('products');
            }}
          />
        )}

        {activeTab === 'orders' && <OrderManagementTab initialOrderId={selectedOrderTimelineId} />}

        {activeTab === 'order-reports' && <OrderReportsTab />}

        {activeTab === 'commissions' && <CommissionPayoutsTab />}

        {activeTab === 'disputes' && <DisputeCenterTab />}

        {activeTab === 'reports' && <ModerationReportsTab />}

        {activeTab === 'categories' && <CategoryManagerTab />}

        {activeTab === 'announcements' && <AnnouncementsTab />}

        {activeTab === 'audit' && <AuditLogsTab />}

        {activeTab === 'settings' && <PlatformSettingsTab />}
      </div>

      {/* Supabase Schema Inspection Modal */}
      {isSchemaModalOpen && (
        <Modal
          isOpen={isSchemaModalOpen}
          onClose={() => setIsSchemaModalOpen(false)}
          title="Supabase PostgreSQL Schema & Security Audit"
          maxWidth="2xl"
        >
          <SupabaseSchemaViewer />
        </Modal>
      )}
    </div>
  );
}
