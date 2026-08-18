import React, { useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Store,
  Eye,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Layers,
  Palette,
  Globe,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Settings,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { StatCard } from '../common/StatCard';
import { formatCurrency, formatDate } from '../../lib/utils';
import { getProductCommission } from '../../lib/commission';
import { OrderStatusBadge } from '../common/Badge';
import { AccountSetupCard } from '../common/AccountSetupCard';
import { getStorefrontFullDomain, getStorefrontUrl } from '../../lib/subdomain';
import { ShareStoreModal } from '../storefront/ShareStoreModal';
import { ManageStoreSlugModal } from '../storefront/ManageStoreSlugModal';

interface ResellerDashboardProps {
  onNavigate: (path: string, params?: any) => void;
}

export function ResellerDashboard({ onNavigate }: ResellerDashboardProps) {
  const currentUser = storage.getCurrentUser();
  const [storefront, setStorefront] = useState(() =>
    storage.getStorefrontByResellerId(currentUser.id)
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isManageSlugModalOpen, setIsManageSlugModalOpen] = useState(false);

  if (!storefront) {
    return <div className="p-8 text-center text-sm text-neutral-500">Storefront not found.</div>;
  }

  const fullDomain = getStorefrontFullDomain(storefront.slug);
  const fullUrl = getStorefrontUrl(storefront.slug);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleOpenStore = () => {
    // Open in new tab or navigate
    window.open(`/store/${storefront.slug}`, '_blank');
  };

  const storefrontProducts = storage.getStorefrontProductsWithDetails(storefront.id);
  const orders = storage.getOrdersByStorefront(storefront.id);
  const payouts = storage.getPayoutsByReseller(currentUser.id);
  const collections = storage.getCollections(storefront.id);

  const pendingCommission = storefront.pendingPayout;
  const totalEarnings = storefront.totalEarnings;

  // Detailed Analytics Metrics
  const totalExpectedCommission = orders
    .filter((o) => ['pending', 'accepted', 'shipped'].includes(o.status))
    .reduce((sum, o) => sum + o.resellerCommission, 0);

  const totalEarnedCommission = orders
    .filter((o) => ['delivered', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + o.resellerCommission, 0);

  const totalPaidCommission = payouts
    .filter((p) => p.status === 'processed')
    .reduce((sum, p) => sum + p.amount, 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyCommission = orders
    .filter((o) => {
      const isDelivered = o.status === 'delivered' || o.status === 'completed' || o.commissionEligibleForPayout;
      if (!isDelivered) return false;
      const d = new Date(o.deliveredAt || o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, o) => sum + o.resellerCommission, 0);

  // Commission by product breakdown (only counts completed/delivered units)
  const productCommissions = storefrontProducts
    .map((sp) => {
      const p = sp.product;
      if (!p) return null;
      const biz = storage.getBusinessById(p.businessId);
      const comm = getProductCommission(p, biz);

      const deliveredProductOrders = orders.filter(
        (o) =>
          (o.status === 'delivered' || o.status === 'completed' || o.commissionEligibleForPayout) &&
          o.items.some((item) => item.productId === p.id)
      );
      const unitsSold = deliveredProductOrders.reduce((sum, o) => {
        const matchingItems = o.items.filter((item) => item.productId === p.id);
        return sum + matchingItems.reduce((iSum, item) => iSum + item.quantity, 0);
      }, 0);

      const totalProductComm = unitsSold * comm.amount;

      return {
        product: p,
        comm,
        unitsSold,
        totalProductComm,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="space-y-8">
      {/* Account Setup Checklist Progress Card */}
      <AccountSetupCard onNavigate={onNavigate} />

      {/* Storefront Subdomain Action Card */}
      <div className="rounded-2xl border border-emerald-200/80 bg-linear-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Your Live Storefront Subdomain
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
              Active
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono font-black text-lg text-neutral-900 truncate">
            {fullDomain}
          </div>
          <p className="text-xs text-neutral-500">
            Customers visiting this address see your customized white-label storefront and orders route directly to your dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-xs ${
              isCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {isCopied ? 'Link Copied!' : 'Copy Link'}
          </button>

          <button
            onClick={handleOpenStore}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
            Open Store
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share Store
          </button>

          <button
            onClick={() => setIsManageSlugModalOpen(true)}
            className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 transition-colors"
            title="Edit Storefront URL Slug"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Share Store Modal */}
      <ShareStoreModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        storefront={storefront}
      />

      {/* Manage Store Slug Modal */}
      <ManageStoreSlugModal
        isOpen={isManageSlugModalOpen}
        onClose={() => setIsManageSlugModalOpen(false)}
        storefront={storefront}
        onUpdated={(updated) => setStorefront(updated)}
      />
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={storefront.logoUrl}
              alt={storefront.storeName}
              className="h-16 w-16 rounded-xl object-cover border border-neutral-200 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-neutral-900">{storefront.storeName}</h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  Creator Storefront
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500 max-w-xl">{storefront.bannerSubtitle}</p>
              <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-neutral-600">
                <span>{storefrontProducts.length} Products Linked</span>
                <span>•</span>
                <span>{collections.length} Collections</span>
                <span>•</span>
                <span>{orders.length} Storefront Sales</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate(`/store/${storefront.slug}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-neutral-800"
            >
              <Eye className="h-4 w-4" />
              Preview Public Store
            </button>
            <button
              onClick={() => onNavigate('/reseller/customize')}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 shadow-2xs transition-all hover:bg-neutral-50"
            >
              <Palette className="h-4 w-4 text-emerald-600" />
              Customize Branding
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Stat Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900">Commission & Revenue Analytics</h2>
          <span className="text-xs text-neutral-500">Updated automatically with storefront activity</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Expected"
            value={formatCurrency(totalExpectedCommission)}
            subtitle="Pending delivery"
            icon={TrendingUp}
            color="amber"
          />
          <StatCard
            title="Total Earned"
            value={formatCurrency(totalEarnedCommission)}
            subtitle="Delivered sales"
            icon={DollarSign}
            color="emerald"
          />
          <StatCard
            title="Total Paid"
            value={formatCurrency(totalPaidCommission)}
            subtitle="Completed payouts"
            icon={CheckCircle2}
            color="purple"
          />
          <StatCard
            title="Pending Payout"
            value={formatCurrency(pendingCommission)}
            subtitle={`Min threshold: ${formatCurrency(storefront.minPayoutThreshold)}`}
            icon={Sparkles}
            color="blue"
          />
          <StatCard
            title="Monthly Earnings"
            value={formatCurrency(monthlyCommission)}
            subtitle="Current month"
            icon={ShoppingBag}
            color="emerald"
          />
        </div>
      </div>

      {/* Quick Action Hub & Recent Orders */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Orders Table (2 cols) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">Recent Storefront Orders</h2>
            <button
              onClick={() => onNavigate('/reseller/orders')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
            >
              View Order History <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">No orders placed on your storefront yet.</div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-neutral-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-neutral-900">#{order.id}</span>
                        <OrderStatusBadge status={order.status} />
                        <span className="text-xs text-neutral-400">• {formatDate(order.createdAt)}</span>
                      </div>
                      <p className="text-xs text-neutral-600 font-medium">
                        Customer: <span className="font-semibold text-neutral-900">{order.customerName}</span> ({order.items.length} items)
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <span className="text-xs font-semibold text-neutral-500">Commission:</span>
                        <strong className="text-sm font-bold text-emerald-700">{formatCurrency(order.resellerCommission)}</strong>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                            order.status === 'delivered' || order.status === 'completed' || order.commissionEligibleForPayout
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'rejected' || order.status === 'cancelled'
                              ? 'bg-neutral-100 text-neutral-500'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status === 'delivered' || order.status === 'completed' || order.commissionEligibleForPayout
                            ? 'Earned'
                            : order.status === 'rejected' || order.status === 'cancelled'
                            ? 'Cancelled'
                            : 'Pending'}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400">Order Total: {formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Creator Toolkit */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Creator Toolkit</h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('/reseller/marketplace')}
                className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                    <Store className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-neutral-900">Business Marketplace</p>
                    <p className="text-[10px] text-neutral-500">Discover verified brands & products</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400" />
              </button>

              <button
                onClick={() => onNavigate('/reseller/store-products')}
                className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-800">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-neutral-900">Storefront Items & Covers</p>
                    <p className="text-[10px] text-neutral-500">Choose cover images & display order</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400" />
              </button>

              <button
                onClick={() => onNavigate('/reseller/commissions')}
                className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-neutral-900">Commission & Payouts</p>
                    <p className="text-[10px] text-neutral-500">Payout threshold & history</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Commission by Product Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Commission Rate & Earnings by Product</h2>
            <p className="text-xs text-neutral-500">Detailed breakdown of expected earnings per product in your active catalog</p>
          </div>
          <button
            onClick={() => onNavigate('/reseller/store-products')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Manage Catalog →
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
          {productCommissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">No products linked to your storefront catalog yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Brand Supplier</th>
                    <th className="py-3 px-4">Selling Price</th>
                    <th className="py-3 px-4">Commission Rate / Unit</th>
                    <th className="py-3 px-4">Units Sold</th>
                    <th className="py-3 px-4 text-right">Total Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {productCommissions.map((item) => (
                    <tr key={item.product.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img src={item.product.images[0]} alt={item.product.title} className="h-10 w-10 rounded-lg object-cover border" />
                          <div>
                            <p className="font-bold text-neutral-900 line-clamp-1">{item.product.title}</p>
                            <p className="text-[10px] text-neutral-400">{item.product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-700">{item.product.brand}</td>
                      <td className="py-3 px-4 font-mono font-extrabold text-neutral-900">{formatCurrency(item.product.price)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                          💰 {item.comm.formattedAmount} <span className="text-[10px] text-emerald-600 font-medium">({item.comm.rateText})</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-700">{item.unitsSold} units</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-800 font-mono">
                        {formatCurrency(item.totalProductComm)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
