import React from 'react';
import { DollarSign, Package, ShoppingBag, Store, AlertTriangle, TrendingUp, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { storage } from '../../lib/storage';
import { StatCard } from '../common/StatCard';
import { formatCurrency, formatDate } from '../../lib/utils';
import { OrderStatusBadge } from '../common/Badge';
import { AccountSetupCard } from '../common/AccountSetupCard';

interface BusinessDashboardProps {
  onNavigate: (path: string, params?: any) => void;
}

export function BusinessDashboard({ onNavigate }: BusinessDashboardProps) {
  const currentUser = storage.getCurrentUser();
  const business = storage.getBusinessByOwnerId(currentUser.id);

  if (!business) {
    return (
      <div className="p-8 text-center text-sm text-neutral-500">
        No business profile found. Please set up your business profile first.
      </div>
    );
  }

  const products = storage.getProductsByBusinessId(business.id);
  const orders = storage.getOrdersByBusinessOwner(business.id);
  const followers = storage.getFollowersByBusinessId(business.id);

  const totalSalesVolume = orders
    .filter((o) => o.status !== 'rejected' && o.status !== 'cancelled')
    .reduce((sum, o) => {
      const itemsSum = o.items
        .filter((i) => i.businessId === business.id)
        .reduce((sub, i) => sub + i.unitPrice * i.quantity, 0);
      return sum + itemsSum;
    }, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockProducts = products.filter((p) => p.stock <= 10);

  // Find storefronts selling this business's products
  const storefrontProducts = storage.getStorefrontProducts();
  const allProducts = storage.getProducts();
  const businessProdIds = new Set(products.map((p) => p.id));
  const activeResellerStoreIds = Array.from(
    new Set(storefrontProducts.filter((sp) => businessProdIds.has(sp.productId)).map((sp) => sp.storefrontId))
  );
  const storefronts = storage.getStorefronts().filter((s) => activeResellerStoreIds.includes(s.id));

  return (
    <div className="space-y-8">
      {/* Account Setup Checklist Progress Card */}
      <AccountSetupCard onNavigate={onNavigate} />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={business.logoUrl}
              alt={business.businessName}
              className="h-16 w-16 rounded-xl object-cover border border-neutral-200 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-neutral-900">{business.businessName}</h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  Verified Brand Owner
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500 max-w-xl">{business.description}</p>
              <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-neutral-600">
                <span>{followers.length} Reseller Followers</span>
                <span>•</span>
                <span>{products.length} Products Live</span>
                <span>•</span>
                <span>{storefronts.length} Active Reseller Storefronts</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('/business/products', { action: 'new' })}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </button>
            <button
              onClick={() => onNavigate('/business/profile')}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 shadow-2xs transition-all hover:bg-neutral-50"
            >
              Edit Brand Profile
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Brand Revenue"
          value={formatCurrency(totalSalesVolume)}
          subtitle="From all reseller storefront sales"
          icon={DollarSign}
          trend="18% this month"
          color="emerald"
        />
        <StatCard
          title="Fulfillment Orders"
          value={orders.length}
          subtitle={`${pendingOrdersCount} pending approval`}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Active Products"
          value={products.length}
          subtitle="Auto-synced to resellers"
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Active Resellers"
          value={storefronts.length}
          subtitle="Distribution storefronts"
          icon={Store}
          color="amber"
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Fulfillment Orders (Left 2 cols) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">Recent Fulfillment Orders</h2>
            <button
              onClick={() => onNavigate('/business/orders')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
            >
              View All Orders ({orders.length}) <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">No orders received yet.</div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {orders.slice(0, 5).map((order) => {
                  const bizItems = order.items.filter((i) => i.businessId === business.id);
                  const bizTotal = bizItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

                  return (
                    <div key={order.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-neutral-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-neutral-900">#{order.id}</span>
                          <OrderStatusBadge status={order.status} />
                          <span className="text-xs text-neutral-400">• {formatDate(order.createdAt)}</span>
                        </div>
                        <p className="text-xs text-neutral-600 font-medium">
                          Placed on <span className="font-semibold text-neutral-900">{order.storefrontName}</span> by {order.customerName}
                        </p>
                        <div className="flex flex-wrap gap-2 text-[11px] text-neutral-500">
                          {bizItems.map((item, idx) => (
                            <span key={idx} className="rounded bg-neutral-100 px-2 py-0.5 font-medium text-neutral-800">
                              {item.quantity}x {item.productTitle}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                        <span className="text-sm font-extrabold text-neutral-900">{formatCurrency(bizTotal)}</span>
                        <button
                          onClick={() => onNavigate('/business/orders', { orderId: order.id })}
                          className="rounded-lg border border-neutral-200 bg-white px-3 py-1 text-xs font-bold text-neutral-700 hover:bg-neutral-100 shadow-2xs"
                        >
                          Fulfill / Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Reseller Distribution & Low Stock Alerts */}
        <div className="space-y-6">
          {/* Low Stock Warning */}
          {lowStockProducts.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Low Inventory Alert ({lowStockProducts.length})</span>
              </div>
              <p className="text-xs text-amber-800">
                The following products are running low. Reseller storefronts will automatically update to out-of-stock when depleted.
              </p>
              <div className="space-y-2">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-white p-2 text-xs border border-amber-200">
                    <span className="font-medium text-neutral-900 truncate max-w-[160px]">{p.title}</span>
                    <span className="font-bold text-rose-600">{p.stock} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Resellers Network */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Distribution Resellers</h3>
              <span className="text-xs text-neutral-400 font-medium">{storefronts.length} Storefronts</span>
            </div>

            <div className="space-y-3">
              {storefronts.map((sf) => (
                <div key={sf.id} className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={sf.logoUrl} alt={sf.storeName} className="h-8 w-8 rounded-lg object-cover border border-neutral-200" />
                    <div>
                      <p className="font-semibold text-neutral-900">{sf.storeName}</p>
                      <p className="text-[10px] text-neutral-500">{sf.totalOrdersCount} Total Orders</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate(`/store/${sf.slug}`)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    View Store →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
