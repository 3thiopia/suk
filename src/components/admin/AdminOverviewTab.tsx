import React from 'react';
import {
  DollarSign,
  Building2,
  Store,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { StatCard } from '../common/StatCard';
import { formatCurrency, formatDate } from '../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

interface AdminOverviewTabProps {
  onNavigateTab: (tab: string) => void;
  onOpenOrderTimeline: (orderId: string) => void;
}

export function AdminOverviewTab({ onNavigateTab, onOpenOrderTimeline }: AdminOverviewTabProps) {
  const stats = storage.getAdminPlatformStats();
  const orders = storage.getOrders();
  const businesses = storage.getBusinesses();
  const storefronts = storage.getStorefronts();
  const disputes = storage.getDisputes();
  const reports = storage.getReports();

  // Mock revenue & order trend data for visual charts
  const revenueData = [
    { month: 'Oct', revenue: 4200, orders: 18, growth: 12 },
    { month: 'Nov', revenue: 5800, orders: 24, growth: 15 },
    { month: 'Dec', revenue: 9400, orders: 42, growth: 28 },
    { month: 'Jan', revenue: 7200, orders: 31, growth: 18 },
    { month: 'Feb', revenue: 8900, orders: 38, growth: 22 },
    { month: 'Mar', revenue: 12450, orders: 54, growth: 35 },
  ];

  const categoryPerformance = [
    { category: 'Electronics & Audio', volume: 6850, count: 24 },
    { category: 'Home & Living', volume: 4200, count: 18 },
    { category: 'Apparel & Accessories', volume: 1400, count: 12 },
  ];

  const topBusinesses = businesses
    .map((b) => {
      const bOrders = orders.filter((o) => o.items.some((i) => i.businessId === b.id));
      const volume = bOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      return { ...b, volume, ordersCount: bOrders.length };
    })
    .sort((a, b) => b.volume - a.volume);

  const topResellers = storefronts
    .map((sf) => {
      const sfOrders = orders.filter((o) => o.storefrontId === sf.id);
      const volume = sfOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      return { ...sf, volume, ordersCount: sfOrders.length };
    })
    .sort((a, b) => b.volume - a.volume);

  return (
    <div className="space-y-8">
      {/* Platform Metric Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gross Volume (GMV)"
          value={formatCurrency(stats.totalVolume)}
          subtitle="Total platform customer transactions"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Reseller Payouts"
          value={formatCurrency(stats.totalCommissionsPaid)}
          subtitle={`Pending: ${formatCurrency(stats.pendingPayoutsAmount)}`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Brand Owners"
          value={stats.businessCount}
          subtitle="Verified product suppliers"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Active Storefronts"
          value={stats.storefrontCount}
          subtitle="White-label reseller portals"
          icon={Store}
          color="amber"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">Order Fulfillment</span>
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black text-neutral-900">{stats.ordersCount}</p>
            <span className="text-xs font-bold text-emerald-600">{stats.completedOrdersCount} Completed</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">{stats.pendingOrdersCount} pending supplier acceptance</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">Catalog Health</span>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black text-neutral-900">{stats.productsCount}</p>
            <span className="text-xs font-bold text-blue-600">{stats.activeProductsCount} Active</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">Available across reseller catalogs</p>
        </div>

        <div
          onClick={() => onNavigateTab('disputes')}
          className="cursor-pointer rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">Dispute Center</span>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black text-neutral-900">{disputes.length}</p>
            <span className={`text-xs font-bold ${stats.openDisputesCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {stats.openDisputesCount} Open
            </span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">Click to inspect active disputes</p>
        </div>

        <div
          onClick={() => onNavigateTab('reports')}
          className="cursor-pointer rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs hover:border-red-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">Policy Moderation</span>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black text-neutral-900">{reports.length}</p>
            <span className={`text-xs font-bold ${stats.pendingReportsCount > 0 ? 'text-red-600' : 'text-neutral-500'}`}>
              {stats.pendingReportsCount} Pending
            </span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">Moderation reports filed</p>
        </div>
      </div>

      {/* Visual Growth Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue & Volume Trend */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Gross Platform Volume & Orders</h3>
              <p className="text-xs text-neutral-500">6-month transaction trajectory</p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">+35% MoM</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#666' }} />
                <YAxis tick={{ fontSize: 11, fill: '#666' }} />
                <Tooltip
                  formatter={(value: any) => [`$${value}`, 'Gross Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories Breakdown */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Category GMV Distribution</h3>
              <p className="text-xs text-neutral-500">Volume by marketplace catalog segment</p>
            </div>
          </div>
          <div className="space-y-4">
            {categoryPerformance.map((cat) => {
              const pct = Math.round((cat.volume / stats.totalVolume) * 100) || 0;
              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-neutral-800">
                    <span>{cat.category}</span>
                    <span className="font-mono text-emerald-700">{formatCurrency(cat.volume)} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performers Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Supplier Brands */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Top Performing Supplier Brands</h3>
            <button
              onClick={() => onNavigateTab('businesses')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Manage Brands →
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {topBusinesses.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <img src={b.logoUrl} alt={b.businessName} className="h-8 w-8 rounded-lg object-cover border" />
                  <div>
                    <p className="text-xs font-bold text-neutral-900">{b.businessName}</p>
                    <p className="text-[10px] text-neutral-500">{b.category} • {b.followerCount} reseller followers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-neutral-900">{formatCurrency(b.volume)}</p>
                  <p className="text-[10px] text-neutral-400">{b.ordersCount} total orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Reseller Storefronts */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Top Performing Resellers</h3>
            <button
              onClick={() => onNavigateTab('resellers')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Manage Resellers →
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {topResellers.map((sf) => (
              <div key={sf.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <img src={sf.logoUrl} alt={sf.storeName} className="h-8 w-8 rounded-lg object-cover border" />
                  <div>
                    <p className="text-xs font-bold text-neutral-900">{sf.storeName}</p>
                    <p className="text-[10px] text-neutral-500">Theme: {sf.themeColor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-700">{formatCurrency(sf.totalEarnings)} Earned</p>
                  <p className="text-[10px] text-neutral-400">Pending Payout: {formatCurrency(sf.pendingPayout)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
