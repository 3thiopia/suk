import React, { useState, useMemo } from 'react';
import { CompactFilterSection, FilterChip } from '../common/CompactFilterSection';
import {
  ShoppingBag,
  Search,
  Clock,
  ExternalLink,
  Filter,
  Calendar,
  Phone,
  User as UserIcon,
  Store,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ListFilter,
  Eye,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { OrderTimelineModal } from './OrderTimelineModal';
import { OrderStatusBadge } from '../common/Badge';

interface OrderManagementTabProps {
  initialOrderId?: string | null;
}

type SortOption = 'date_desc' | 'date_asc' | 'total_desc' | 'total_asc' | 'comm_desc';

export function OrderManagementTab({ initialOrderId }: OrderManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [selectedOrderForTimeline, setSelectedOrderForTimeline] = useState<Order | null>(() => {
    if (initialOrderId) {
      return storage.getOrders().find((o) => o.id === initialOrderId) || null;
    }
    return null;
  });

  const orders = storage.getOrders();
  const storefronts = storage.getStorefronts();
  const businesses = storage.getBusinesses();
  const users = storage.getUsers();

  // Helper to resolve Business Owner Phone Number for Admin view
  const getBusinessOwnerInfo = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      return { ownerName: 'Brand Owner', phone: '+1 (555) 000-0000' };
    }
    const firstItem = order.items[0];
    const biz = businesses.find(
      (b) => b.id === firstItem.businessId || b.businessName.toLowerCase() === (firstItem.brand || '').toLowerCase()
    );
    const ownerUser = biz ? users.find((u) => u.id === biz.ownerId) : null;

    const ownerName = biz?.businessName || firstItem.brand || 'Brand Owner';
    const phone = biz?.phone || ownerUser?.phone || '+1 (555) 382-9102';

    return { ownerName, phone };
  };

  // Filter & Search
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
      const query = searchTerm.toLowerCase().trim();
      if (!query) return matchesStatus;

      const { ownerName, phone: ownerPhone } = getBusinessOwnerInfo(o);

      const matchesSearch =
        o.id.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.customerPhone.toLowerCase().includes(query) ||
        o.customerEmail.toLowerCase().includes(query) ||
        ownerName.toLowerCase().includes(query) ||
        ownerPhone.toLowerCase().includes(query) ||
        (o.storefrontName && o.storefrontName.toLowerCase().includes(query)) ||
        o.items.some((i) => i.productTitle.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, searchTerm, businesses, users]);

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
    setExpandedCards((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
            Platform Orders & Transaction Audit
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Full cross-marketplace visibility. Inspect order items, customer & business owner contact phone numbers, commission calculations, and complete event timelines.
          </p>
        </div>

        <CompactFilterSection
          searchQuery={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          searchPlaceholder="Search order ref, buyer name/phone, owner name/phone, storefront..."
          activeCount={selectedStatus !== 'all' ? 1 : 0}
          activeChips={selectedStatus !== 'all' ? [{
            id: 'status',
            label: `Status: ${selectedStatus.toUpperCase()}`,
            onRemove: () => {
              setSelectedStatus('all');
              setCurrentPage(1);
            }
          }] : []}
          resultsCount={filteredOrders.length}
          resultsLabel="orders"
          onResetAll={() => {
            setSelectedStatus('all');
            setSearchTerm('');
            setCurrentPage(1);
          }}
          sortControl={
            <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-semibold text-neutral-800 w-full sm:w-auto">
              <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent font-semibold text-neutral-800 focus:outline-none text-xs w-full cursor-pointer"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="total_desc">Highest Amount</option>
                <option value="total_asc">Lowest Amount</option>
                <option value="comm_desc">Highest Commission</option>
              </select>
            </div>
          }
        >
          {/* Status Filter */}
          <div className="space-y-1 w-full sm:w-auto">
            <label className="block text-[11px] font-bold text-neutral-400 uppercase sm:hidden">Order Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CompactFilterSection>
      </div>

      {/* Orders Content */}
      {sortedOrders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-sm text-neutral-500">
          <ShoppingBag className="mx-auto h-10 w-10 text-neutral-300 mb-2" />
          <p className="font-bold text-neutral-800">No Orders Match Criteria</p>
          <p className="text-xs text-neutral-500 mt-1">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* ======================================================== */}
          {/* 1. DESKTOP VIEW (lg breakpoint and up)                   */}
          {/* ================================================= structure as per prompt: Order ID, Product, Business Owner, Business Owner Phone Number, Reseller, Customer Name, Customer Phone Number, Total Price, Commission, Order Status, Order Date, Actions */}
          {/* ======================================================== */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Business Owner</th>
                    <th className="py-3.5 px-4">Owner Phone</th>
                    <th className="py-3.5 px-4">Reseller</th>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Customer Phone</th>
                    <th className="py-3.5 px-4">Total Price</th>
                    <th className="py-3.5 px-4">Commission</th>
                    <th className="py-3.5 px-4">Order Status</th>
                    <th className="py-3.5 px-4">Order Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {paginatedOrders.map((o) => {
                    const sf = storefronts.find((s) => s.id === o.storefrontId);
                    const { ownerName, phone: ownerPhone } = getBusinessOwnerInfo(o);

                    return (
                      <tr key={o.id} className="hover:bg-neutral-50/80 transition-colors">
                        {/* Order ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 whitespace-nowrap">
                          #{o.id}
                        </td>

                        {/* Product */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 max-w-xs">
                            {o.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <img
                                  src={item.coverImage}
                                  alt={item.productTitle}
                                  className="h-6 w-6 rounded object-cover border border-neutral-200 shrink-0"
                                />
                                <span className="truncate font-medium text-neutral-800" title={item.productTitle}>
                                  {item.quantity}x {item.productTitle}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Business Owner */}
                        <td className="py-3.5 px-4 font-semibold text-neutral-900 whitespace-nowrap">
                          {ownerName}
                        </td>

                        {/* Business Owner Phone Number */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-neutral-700">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <span>{ownerPhone}</span>
                          </div>
                        </td>

                        {/* Reseller */}
                        <td className="py-3.5 px-4 font-medium text-neutral-700 whitespace-nowrap">
                          {sf?.storeName || o.storefrontName || 'Direct'}
                        </td>

                        {/* Customer Name */}
                        <td className="py-3.5 px-4 font-bold text-neutral-900 whitespace-nowrap">
                          {o.customerName}
                        </td>

                        {/* Customer Phone Number */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-neutral-700">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="font-semibold">{o.customerPhone}</span>
                          </div>
                        </td>

                        {/* Total Price */}
                        <td className="py-3.5 px-4 font-extrabold text-neutral-900 whitespace-nowrap">
                          {formatCurrency(o.totalAmount)}
                        </td>

                        {/* Commission */}
                        <td className="py-3.5 px-4 font-bold text-emerald-700 whitespace-nowrap">
                          {formatCurrency(o.resellerCommission)}
                        </td>

                        {/* Order Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <OrderStatusBadge status={o.status} />
                        </td>

                        {/* Order Date */}
                        <td className="py-3.5 px-4 text-[11px] text-neutral-500 whitespace-nowrap">
                          {formatDate(o.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedOrderForTimeline(o)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-neutral-800 transition-colors"
                          >
                            <Clock className="h-3.5 w-3.5 text-emerald-400" />
                            <span>View Timeline</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. TABLET VIEW (sm to lg)                                */}
          {/* ======================================================== */}
          <div className="hidden sm:block lg:hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="py-3 px-3.5">Order Ref</th>
                    <th className="py-3 px-3.5">Product</th>
                    <th className="py-3 px-3.5">Owner & Phone</th>
                    <th className="py-3 px-3.5">Customer & Phone</th>
                    <th className="py-3 px-3.5">Total / Comm</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {paginatedOrders.map((o) => {
                    const { ownerName, phone: ownerPhone } = getBusinessOwnerInfo(o);

                    return (
                      <tr key={o.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-3.5">
                          <span className="font-mono font-bold text-neutral-900">#{o.id}</span>
                          <p className="text-[10px] text-neutral-400">{formatDate(o.createdAt)}</p>
                        </td>

                        <td className="py-3 px-3.5">
                          <p className="font-medium text-neutral-900 truncate max-w-[150px]">
                            {o.items[0]?.productTitle || 'Product'}
                          </p>
                          {o.items.length > 1 && (
                            <p className="text-[10px] text-neutral-500">+{o.items.length - 1} items</p>
                          )}
                        </td>

                        <td className="py-3 px-3.5">
                          <p className="font-bold text-neutral-900">{ownerName}</p>
                          <p className="text-[10px] font-mono text-neutral-600 flex items-center gap-1">
                            <Phone className="h-3 w-3 text-neutral-400 shrink-0" />
                            {ownerPhone}
                          </p>
                        </td>

                        <td className="py-3 px-3.5">
                          <p className="font-bold text-neutral-900">{o.customerName}</p>
                          <p className="text-[10px] font-mono text-emerald-800 font-semibold flex items-center gap-1">
                            <Phone className="h-3 w-3 text-emerald-600 shrink-0" />
                            {o.customerPhone}
                          </p>
                        </td>

                        <td className="py-3 px-3.5">
                          <p className="font-extrabold text-neutral-900">{formatCurrency(o.totalAmount)}</p>
                          <p className="text-[10px] text-emerald-700 font-semibold">Comm: {formatCurrency(o.resellerCommission)}</p>
                        </td>

                        <td className="py-3 px-3.5">
                          <OrderStatusBadge status={o.status} />
                        </td>

                        <td className="py-3 px-3.5 text-right">
                          <button
                            onClick={() => setSelectedOrderForTimeline(o)}
                            className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-neutral-800"
                          >
                            <Clock className="h-3.5 w-3.5 text-emerald-400" />
                            Timeline
                          </button>
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
          {/* Prompt explicit card items: Product, Business Owner Phone Number, Customer Name, Customer Phone Number, Status, Total Price, Commission, Action button */}
          {/* ======================================================== */}
          <div className="block sm:hidden space-y-3">
            {paginatedOrders.map((o) => {
              const { ownerName, phone: ownerPhone } = getBusinessOwnerInfo(o);
              const isExpanded = !!expandedCards[o.id];

              return (
                <div
                  key={o.id}
                  className="rounded-2xl border border-neutral-200 bg-white shadow-xs overflow-hidden transition-all hover:border-neutral-300"
                >
                  {/* Collapsed Header - Always Visible */}
                  <div
                    onClick={() => toggleExpandCard(o.id)}
                    className="p-3.5 cursor-pointer hover:bg-neutral-50/60 transition-colors select-none"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-neutral-900 text-xs">#{o.id}</span>
                        <span className="text-[10px] text-neutral-400 truncate">• {formatDate(o.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <OrderStatusBadge status={o.status} />
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
                          {o.items[0]?.productTitle || 'Order Item'}
                          {o.items.length > 1 && (
                            <span className="text-[11px] font-semibold text-neutral-500 ml-1.5">
                              (+{o.items.length - 1} item{o.items.length > 2 ? 's' : ''})
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Amount: <strong className="text-neutral-900 font-extrabold">{formatCurrency(o.totalAmount)}</strong> • Customer: <strong className="text-neutral-800">{o.customerName}</strong>
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
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-neutral-200/80 shadow-2xs">
                            <img
                              src={item.coverImage}
                              alt={item.productTitle}
                              className="h-10 w-10 rounded-lg object-cover border border-neutral-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-neutral-900 truncate">{item.productTitle}</p>
                              <p className="text-[10px] text-neutral-500">Brand: {item.brand} • Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-extrabold text-neutral-900">{formatCurrency(item.unitPrice * item.quantity)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Business Owner Phone Number & Name */}
                      <div className="rounded-xl border border-neutral-200/80 bg-purple-50/40 p-2.5 space-y-1 text-xs shadow-2xs">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-purple-900 block">Business Owner</span>
                        <p className="font-bold text-neutral-900">{ownerName}</p>
                        <p className="font-mono text-purple-950 font-semibold flex items-center gap-1.5 text-xs">
                          <Phone className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                          <span>{ownerPhone}</span>
                        </p>
                      </div>

                      {/* Customer Name & Phone Number */}
                      <div className="rounded-xl border border-neutral-200/80 bg-emerald-50/40 p-2.5 space-y-1 text-xs shadow-2xs">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-900 block">Customer Contact</span>
                        <p className="font-bold text-neutral-900">{o.customerName}</p>
                        <p className="font-mono text-emerald-950 font-bold flex items-center gap-1.5 text-xs">
                          <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{o.customerPhone}</span>
                        </p>
                      </div>

                      {/* Total Price & Commission */}
                      <div className="rounded-xl border border-neutral-200/80 bg-white p-3 flex items-center justify-between text-xs shadow-2xs">
                        <div>
                          <span className="text-[10px] text-neutral-400 block uppercase tracking-wider font-bold">Total Price</span>
                          <span className="font-extrabold text-neutral-900 text-sm">{formatCurrency(o.totalAmount)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-400 block uppercase tracking-wider font-bold">Commission</span>
                          <span className="font-bold text-emerald-700 text-xs">{formatCurrency(o.resellerCommission)}</span>
                        </div>
                      </div>

                      {/* Shipping & Storefront Info */}
                      <div className="space-y-1.5 text-xs text-neutral-700 bg-white p-2.5 rounded-xl border border-neutral-200/80 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Storefront:</span>
                          <span className="font-semibold text-neutral-900">{o.storefrontName || 'Direct'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Customer Email:</span>
                          <span className="font-medium text-neutral-900">{o.customerEmail}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-neutral-500">Shipping Address:</span>
                          <span className="font-mono text-[11px] text-right text-neutral-900">
                            {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.zipCode}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedOrderForTimeline(o)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          <Clock className="h-3.5 w-3.5 text-emerald-400" />
                          <span>View Timeline</span>
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

      {/* Order Timeline Modal */}
      <OrderTimelineModal
        order={selectedOrderForTimeline}
        onClose={() => setSelectedOrderForTimeline(null)}
      />
    </div>
  );
}
