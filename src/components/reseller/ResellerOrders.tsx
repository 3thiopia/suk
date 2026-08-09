import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  Lock,
  ShieldAlert,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ListFilter,
  Building2,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { Order, OrderReport } from '../../types';
import { OrderStatusBadge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { getOrderCommissionStatus } from '../../lib/commission';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { OrderReportModal } from './OrderReportModal';

type SortOption = 'date_desc' | 'date_asc' | 'total_desc' | 'total_asc' | 'comm_desc';

export function ResellerOrders() {
  const currentUser = storage.getCurrentUser();
  const storefront = storage.getStorefrontByResellerId(currentUser.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [reportingOrder, setReportingOrder] = useState<Order | null>(null);
  const [expandedMobileCards, setExpandedMobileCards] = useState<Record<string, boolean>>({});

  if (!storefront) return null;

  const orders = storage.getOrdersByStorefront(storefront.id);
  const reports = storage.getOrderReportsByResellerId(currentUser.id);

  const getOrderReport = (orderId: string): OrderReport | undefined => {
    return reports.find((r) => r.orderId === orderId);
  };

  // Filter & Search
  // NOTE: Strictly exclude customer PII (Customer name/phone/email) from filter & display
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesStatus;

      const matchesSearch =
        o.id.toLowerCase().includes(query) ||
        o.items.some(
          (i) => i.productTitle.toLowerCase().includes(query) || (i.brand && i.brand.toLowerCase().includes(query))
        );

      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, searchQuery]);

  // Sort
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'total_desc') {
        return b.totalAmount - a.totalAmount;
      }
      if (sortBy === 'total_asc') {
        return a.totalAmount - b.totalAmount;
      }
      if (sortBy === 'comm_desc') {
        return b.resellerCommission - a.resellerCommission;
      }
      return 0;
    });
  }, [filteredOrders, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedOrders.slice(start, start + itemsPerPage);
  }, [sortedOrders, currentPage, itemsPerPage]);

  const toggleExpandCard = (orderId: string) => {
    setExpandedMobileCards((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Storefront Sales & Commission History
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Track customer orders generated on your storefront. View order status updates in real-time.
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-2.5 text-xs text-blue-900 flex items-center gap-2">
          <Lock className="h-4 w-4 text-blue-600 shrink-0" />
          <span>Fulfillment & status updates are handled directly by Brand Owners</span>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by Order ID, product title, or brand owner..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status Filter */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 pr-8 text-xs font-semibold text-neutral-700 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <ListFilter className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-auto appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 pr-8 text-xs font-semibold text-neutral-700 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors cursor-pointer"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="total_desc">Highest Total</option>
                <option value="total_asc">Lowest Total</option>
                <option value="comm_desc">Highest Commission</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Storefront Orders Found"
          description="Share your storefront link with customers to start generating sales and accumulating commissions."
        />
      ) : (
        <div className="space-y-4">
          {/* ======================================================== */}
          {/* 1. DESKTOP VIEW (lg breakpoint and up)                   */}
          {/* Prompt columns: Order ID, Product, Business Owner, Status, Total Price, Commission, Order Date, Actions */}
          {/* NO CUSTOMER INFORMATION SHOWN TO RESELLERS               */}
          {/* ======================================================== */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Business Owner</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Total Price</th>
                    <th className="py-3.5 px-4">Your Commission</th>
                    <th className="py-3.5 px-4">Order Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {paginatedOrders.map((order) => {
                    const existingReport = getOrderReport(order.id);
                    const brandOwner = order.items[0]?.brand || 'Brand Owner';

                    return (
                      <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                        {/* Order ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 whitespace-nowrap">
                          #{order.id}
                        </td>

                        {/* Product */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 max-w-xs">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <img
                                  src={item.coverImage}
                                  alt={item.productTitle}
                                  className="h-6 w-6 rounded object-cover border border-neutral-200 shrink-0"
                                />
                                <span className="truncate font-medium text-neutral-900" title={item.productTitle}>
                                  {item.quantity}x {item.productTitle}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Business Owner */}
                        <td className="py-3.5 px-4 font-semibold text-neutral-900 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <span>{brandOwner}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <OrderStatusBadge status={order.status} />
                            {existingReport && (
                              <div className="flex items-center gap-1">
                                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800">
                                  <ShieldAlert className="h-3 w-3" />
                                  <span>Reported</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Total Price */}
                        <td className="py-3.5 px-4 font-extrabold text-neutral-900 whitespace-nowrap">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        {/* Commission */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {(() => {
                            const commStatus = getOrderCommissionStatus(order);
                            return (
                              <div className="space-y-1">
                                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${commStatus.badgeBg} ${commStatus.badgeText}`}>
                                  💰 {commStatus.label}
                                </span>
                                <p className="font-extrabold text-neutral-900 text-xs">
                                  {formatCurrency(order.resellerCommission)}
                                </p>
                              </div>
                            );
                          })()}
                        </td>

                        {/* Order Date */}
                        <td className="py-3.5 px-4 text-[11px] text-neutral-500 whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setActiveOrder(order)}
                              className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-700 hover:bg-neutral-100 shadow-2xs transition-colors"
                              title="View Receipt"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => setReportingOrder(order)}
                              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 px-2.5 py-1.5 text-xs font-bold transition-colors shadow-2xs"
                              title="Report Issue"
                            >
                              <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                              <span>Report Issue</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. TABLET VIEW (sm to lg breakpoint)                      */}
          {/* ======================================================== */}
          <div className="hidden sm:block lg:hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="py-3 px-3.5">Order Ref</th>
                    <th className="py-3 px-3.5">Product</th>
                    <th className="py-3 px-3.5">Business Owner</th>
                    <th className="py-3 px-3.5">Total / Comm</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {paginatedOrders.map((order) => {
                    const brandOwner = order.items[0]?.brand || 'Brand Owner';

                    return (
                      <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-3.5">
                          <span className="font-mono font-bold text-neutral-900">#{order.id}</span>
                          <p className="text-[10px] text-neutral-400">{formatDate(order.createdAt)}</p>
                        </td>

                        <td className="py-3 px-3.5">
                          <p className="font-semibold text-neutral-900 truncate max-w-[160px]">
                            {order.items[0]?.productTitle || 'Product'}
                          </p>
                          {order.items.length > 1 && (
                            <p className="text-[10px] text-neutral-500">+{order.items.length - 1} items</p>
                          )}
                        </td>

                        <td className="py-3 px-3.5 font-bold text-neutral-900">
                          {brandOwner}
                        </td>

                        <td className="py-3 px-3.5">
                          <p className="font-extrabold text-neutral-900">{formatCurrency(order.totalAmount)}</p>
                          <p className="text-[10px] text-emerald-700 font-bold">Comm: {formatCurrency(order.resellerCommission)}</p>
                        </td>

                        <td className="py-3 px-3.5">
                          <OrderStatusBadge status={order.status} />
                        </td>

                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveOrder(order)}
                              className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-700 hover:bg-neutral-100"
                              title="View Receipt"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setReportingOrder(order)}
                              className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100"
                              title="Report Issue"
                            >
                              <ShieldAlert className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. MOBILE VIEW (under sm breakpoint) - RESPONSIVE CARDS  */}
          {/* Prompt explicit card items for Reseller: Product, Business Owner, Status, Total Price, Commission, Action button */}
          {/* NO CUSTOMER PII SHOWN TO RESELLER                          */}
          {/* ======================================================== */}
          <div className="block sm:hidden space-y-3">
            {paginatedOrders.map((order) => {
              const brandOwner = order.items[0]?.brand || 'Brand Owner';
              const isExpanded = !!expandedMobileCards[order.id];
              const existingReport = getOrderReport(order.id);

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-neutral-200 bg-white shadow-xs overflow-hidden transition-all hover:border-neutral-300"
                >
                  {/* Collapsed Header - Always Visible */}
                  <div
                    onClick={() => toggleExpandCard(order.id)}
                    className="p-3.5 cursor-pointer hover:bg-neutral-50/60 transition-colors select-none"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-neutral-900 text-xs">#{order.id}</span>
                        <span className="text-[10px] text-neutral-400 truncate">• {formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <OrderStatusBadge status={order.status} />
                        <button
                          type="button"
                          aria-label={isExpanded ? "Collapse order" : "Expand order"}
                          className="p-1 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Product Title in Collapsed Header */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-neutral-900 truncate">
                          {order.items[0]?.productTitle || 'Storefront Item'}
                          {order.items.length > 1 && (
                            <span className="text-[11px] font-semibold text-neutral-500 ml-1.5">
                              (+{order.items.length - 1} item{order.items.length > 2 ? 's' : ''})
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Total: <strong className="text-neutral-900 font-extrabold">{formatCurrency(order.totalAmount)}</strong> • Comm: <strong className="text-emerald-700 font-extrabold">{formatCurrency(order.resellerCommission)}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content Section */}
                  {isExpanded && (
                    <div className="border-t border-neutral-100 p-3.5 space-y-3 bg-neutral-50/30 animate-fadeIn">
                      {/* Product details */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Ordered Items</p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-neutral-200/80 shadow-2xs">
                            <img
                              src={item.coverImage}
                              alt={item.productTitle}
                              className="h-10 w-10 rounded-lg object-cover border border-neutral-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-neutral-900 truncate">{item.productTitle}</p>
                              <p className="text-[10px] text-neutral-500">Qty: {item.quantity} • {formatCurrency(item.unitPrice)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Business Owner */}
                      <div className="rounded-xl border border-neutral-200/80 bg-white p-2.5 flex items-center justify-between text-xs shadow-2xs">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Business Owner</span>
                        <span className="font-bold text-neutral-900 flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-neutral-500" />
                          {brandOwner}
                        </span>
                      </div>

                      {/* Pricing & Commission Breakdown */}
                      <div className="rounded-xl border border-neutral-200/80 bg-white p-3 flex items-center justify-between text-xs shadow-2xs">
                        <div>
                          <span className="text-[10px] text-neutral-400 block uppercase tracking-wider font-bold">Total Price</span>
                          <span className="font-extrabold text-neutral-900 text-sm">{formatCurrency(order.totalAmount)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-400 block uppercase tracking-wider font-bold">Your Commission</span>
                          <span className="font-extrabold text-emerald-700 text-xs">{formatCurrency(order.resellerCommission)}</span>
                        </div>
                      </div>

                      {/* Payout Eligibility */}
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-neutral-500">Payout Status:</span>
                        <span className="font-bold text-emerald-700">
                          {order.status === 'delivered' || order.status === 'completed' || order.commissionEligibleForPayout ? 'Eligible for Payout' : 'Pending Delivery'}
                        </span>
                      </div>

                      {/* Report Banner */}
                      {existingReport && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs flex items-center gap-2 text-amber-900 font-bold">
                          <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
                          <span>Issue Reported ({existingReport.status.replace(/_/g, ' ')})</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveOrder(order)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors shadow-2xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Receipt</span>
                        </button>

                        <button
                          onClick={() => setReportingOrder(order)}
                          className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 text-xs font-bold transition-colors shadow-2xs"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                          <span>Report Issue</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-neutral-500">
                Page <strong className="text-neutral-900">{currentPage}</strong> of <strong className="text-neutral-900">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-neutral-900 text-white shadow-2xs'
                          : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal - NO CUSTOMER PII */}
      {activeOrder && (
        <Modal
          isOpen={!!activeOrder}
          onClose={() => setActiveOrder(null)}
          title={`Storefront Order #${activeOrder.id}`}
          subtitle="Read-only order tracking view for resellers"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-4 border border-neutral-200">
              <div>
                <span className="text-xs text-neutral-500 font-semibold">Fulfillment Status</span>
                <div className="mt-1">
                  <OrderStatusBadge status={activeOrder.status} />
                </div>
              </div>
              {(() => {
                const commStatus = getOrderCommissionStatus(activeOrder);
                return (
                  <div className="text-right">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${commStatus.badgeBg} ${commStatus.badgeText}`}>
                      💰 {commStatus.label}
                    </span>
                    <p className="text-lg font-black text-emerald-800 mt-0.5">{formatCurrency(activeOrder.resellerCommission)}</p>
                  </div>
                );
              })()}
            </div>

            {/* Rejection Details Banner for Reseller */}
            {activeOrder.status === 'rejected' && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 space-y-1.5 text-xs text-rose-900">
                <div className="flex items-center justify-between font-bold text-rose-950">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                    <span>Order Rejected by Supplier Brand</span>
                  </div>
                  {activeOrder.rejectedAt && (
                    <span className="text-[10px] text-rose-700 font-normal">
                      {formatDate(activeOrder.rejectedAt)}
                    </span>
                  )}
                </div>
                <p className="text-rose-800">
                  <span className="font-semibold">Reason:</span>{' '}
                  {activeOrder.rejectionReason || 'No reason specified by brand owner.'}
                </p>
              </div>
            )}

            {/* Existing Report Banner */}
            {(() => {
              const rpt = getOrderReport(activeOrder.id);
              if (rpt) {
                return (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-amber-700" />
                        <span>Active Report: #{rpt.id}</span>
                      </div>
                      <span className="uppercase text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                        {rpt.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-amber-800"><span className="font-semibold">Category:</span> {rpt.category}</p>
                    <p className="text-amber-800 text-[11px]"><span className="font-semibold">Description:</span> {rpt.description}</p>
                  </div>
                );
              }
              return (
                <div className="flex items-center justify-between rounded-xl bg-red-50/60 p-3 border border-red-100">
                  <div className="text-xs text-neutral-700">
                    <p className="font-bold text-red-900">Encountering an issue with this order?</p>
                    <p className="text-[11px] text-neutral-500">Report delays, status errors, missing commission or unresponsiveness directly to admin.</p>
                  </div>
                  <button
                    onClick={() => {
                      const target = activeOrder;
                      setActiveOrder(null);
                      setReportingOrder(target);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-xs shrink-0"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Report Issue</span>
                  </button>
                </div>
              );
            })()}

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Ordered Items</h4>
              <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <img src={item.coverImage} alt={item.productTitle} className="h-9 w-9 rounded object-cover border border-neutral-200" />
                      <div>
                        <p className="text-xs font-bold text-neutral-900">{item.productTitle}</p>
                        <p className="text-[10px] text-neutral-500">Brand Owner: {item.brand}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-900">{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Report Issue Modal */}
      {reportingOrder && (
        <OrderReportModal
          order={reportingOrder}
          isOpen={!!reportingOrder}
          onClose={() => setReportingOrder(null)}
          onSubmitted={() => {
            // refresh page state automatically
          }}
        />
      )}
    </div>
  );
}
