import React, { useState, useMemo } from 'react';
import { CompactFilterSection, FilterChip } from '../common/CompactFilterSection';
import {
  ShoppingBag,
  CheckCircle,
  XCircle,
  Truck,
  PackageCheck,
  Eye,
  Search,
  Filter,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Phone,
  User as UserIcon,
  Store,
  DollarSign,
  ArrowUpDown,
  Clock,
  MapPin,
  Mail,
  ListFilter,
  LayoutGrid,
  Table,
  TrendingUp,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { Order, OrderStatus } from '../../types';
import { OrderStatusBadge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { useTranslation } from '../../lib/i18n/LanguageContext';
import { PhoneActionButtons } from '../common/PhoneActionButtons';

type SortOption = 'date_desc' | 'date_asc' | 'total_desc' | 'total_asc' | 'customer_asc';
type ViewMode = 'cards' | 'table';

export function getFinancialSummary(order: Order) {
  const productPrice = order.totalAmount;
  const resellerCommission = order.resellerCommission;
  const netProfit = productPrice - resellerCommission;

  let commissionLabel = '🤝 Expected Commission';
  let netProfitLabel = '📈 Expected Net Profit';

  if (order.status === 'delivered') {
    commissionLabel = '🤝 Commission Owed';
    netProfitLabel = '📈 Net Profit';
  } else if (order.status === 'completed') {
    commissionLabel = '🤝 Commission Paid';
    netProfitLabel = '📈 Final Net Profit';
  } else if (order.status === 'rejected') {
    commissionLabel = '🤝 Reseller Commission';
    netProfitLabel = '📈 Your Net Profit';
  } else if (order.status === 'pending' || order.status === 'accepted' || order.status === 'shipped') {
    commissionLabel = '🤝 Expected Commission';
    netProfitLabel = '📈 Expected Net Profit';
  }

  return {
    productPrice,
    resellerCommission,
    netProfit,
    priceLabel: '💰 Product Price',
    commissionLabel,
    netProfitLabel,
  };
}

export function FinancialSummaryBox({ order, className = '' }: { order: Order; className?: string }) {
  const { t } = useTranslation();
  const {
    productPrice,
    resellerCommission,
    netProfit,
  } = getFinancialSummary(order);

  return (
    <div className={`rounded-xl border border-neutral-200/90 bg-neutral-50/80 p-3.5 space-y-2.5 text-xs ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-200/60 pb-1.5">
        <span>{t('orders.financialSummary', 'Financial Summary')}</span>
        <span className="text-[10px] font-semibold text-neutral-400">
          {order.status === 'completed'
            ? 'Settled / Commission Paid'
            : order.status === 'delivered'
            ? 'Delivered (Payout Eligible)'
            : order.status === 'rejected'
            ? 'Order Rejected'
            : 'Estimated Settlement'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Product Price */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-2.5">
          <p className="text-[11px] font-semibold text-neutral-600">
            💰 {t('orders.productPrice', 'Product Price')}
          </p>
          <p className="text-sm font-extrabold text-neutral-900 mt-1">
            {formatCurrency(productPrice)}
          </p>
        </div>

        {/* Reseller Commission */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-2.5">
          <p className="text-[11px] font-semibold text-amber-900">
            🤝 {t('orders.resellerCommission', 'Reseller Commission')}
          </p>
          <p className="text-sm font-bold text-amber-700 mt-1">
            {formatCurrency(resellerCommission)}
          </p>
        </div>

        {/* Your Net Profit (PROMINENT HIGHLIGHT) */}
        <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-2.5 shadow-2xs relative overflow-hidden">
          <p className="text-[11px] font-extrabold text-emerald-950">
            📈 {t('orders.yourNetProfit', 'Your Net Profit')}
          </p>
          <p className="text-base font-black text-emerald-700 mt-0.5">
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BusinessOrders() {
  const currentUser = storage.getCurrentUser();
  const business = storage.getBusinessByOwnerId(currentUser.id);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [confirmDeliveryOrder, setConfirmDeliveryOrder] = useState<Order | null>(null);
  const [confirmRejectOrder, setConfirmRejectOrder] = useState<Order | null>(null);
  const [rejectionReasonOption, setRejectionReasonOption] = useState<string>('Product out of stock');
  const [customRejectionReason, setCustomRejectionReason] = useState<string>('');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpandCard = (orderId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  if (!business) {
    return <div className="p-8 text-center text-sm text-neutral-500">Business profile not found.</div>;
  }

  const orders = storage.getOrdersByBusinessOwner(business.id);

  // Filter & Search
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        o.id.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.customerPhone.toLowerCase().includes(query) ||
        o.customerEmail.toLowerCase().includes(query) ||
        (o.storefrontName && o.storefrontName.toLowerCase().includes(query)) ||
        o.items.some((i) => i.productTitle.toLowerCase().includes(query));
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
      if (sortBy === 'customer_asc') {
        return a.customerName.localeCompare(b.customerName);
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

  const handleUpdateStatus = (orderId: string, status: OrderStatus, reason?: string) => {
    try {
      storage.updateOrderStatus(orderId, status, currentUser.id, false, reason);
      if (activeOrder && activeOrder.id === orderId) {
        const updated = storage.getOrders().find((o) => o.id === orderId);
        if (updated) setActiveOrder(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Error updating order status');
    }
  };

  const onRequestStatusChange = (order: Order, status: OrderStatus) => {
    if (status === 'delivered') {
      setConfirmDeliveryOrder(order);
    } else if (status === 'rejected') {
      setConfirmRejectOrder(order);
      setRejectionReasonOption('Product out of stock');
      setCustomRejectionReason('');
    } else {
      handleUpdateStatus(order.id, status);
    }
  };

  const executeConfirmDelivery = () => {
    if (!confirmDeliveryOrder) return;
    handleUpdateStatus(confirmDeliveryOrder.id, 'delivered');
    setConfirmDeliveryOrder(null);
  };

  const executeConfirmReject = () => {
    if (!confirmRejectOrder) return;
    const finalReason = rejectionReasonOption === 'Other'
      ? customRejectionReason
      : rejectionReasonOption;
    handleUpdateStatus(confirmRejectOrder.id, 'rejected', finalReason);
    setConfirmRejectOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">Brand Fulfillment Orders</h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Review customer orders placed via reseller storefronts, with complete financial summaries and owner net profit tracking.
        </p>
      </div>

      {/* Filter, Search & Sort Bar */}
      <CompactFilterSection
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search Order ID, customer, phone, storefront..."
        activeCount={selectedStatus !== 'all' ? 1 : 0}
        activeChips={selectedStatus !== 'all' ? [{
          id: 'status',
          label: `Status: ${selectedStatus.toUpperCase()}`,
          onRemove: () => {
            setSelectedStatus('all');
            setCurrentPage(1);
          }
        }] : []}
        resultsCount={sortedOrders.length}
        resultsLabel="orders"
        onResetAll={() => {
          setSelectedStatus('all');
          setSearchQuery('');
          setCurrentPage(1);
        }}
        rightControls={
          <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-1 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-neutral-900 shadow-2xs border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Card View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-neutral-900 shadow-2xs border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Table View"
            >
              <Table className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>
        }
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
              <option value="total_desc">Highest Total</option>
              <option value="total_asc">Lowest Total</option>
              <option value="customer_asc">Customer (A-Z)</option>
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
            <option value="pending">Pending Approval</option>
            <option value="accepted">Accepted</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </CompactFilterSection>

      {/* Orders Content */}
      {sortedOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Match Criteria"
          description="There are currently no fulfillment orders matching your search or status filter."
        />
      ) : (
        <div className="space-y-4">
          {viewMode === 'cards' ? (
            /* ======================================================== */
            /* 1. ORDER CARDS VIEW                                      */
            /* ======================================================== */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedOrders.map((order) => {
                const bizItems = order.items.filter((i) => i.businessId === business.id);
                const isExpanded = !!expandedCards[order.id];

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-neutral-200 bg-white shadow-xs overflow-hidden transition-all hover:border-neutral-300 flex flex-col justify-between"
                  >
                    {/* Collapsed Header - Always Visible */}
                    <div
                      onClick={() => toggleExpandCard(order.id)}
                      className="p-3.5 sm:p-4 cursor-pointer hover:bg-neutral-50/60 transition-colors select-none"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-neutral-900 text-xs sm:text-sm shrink-0">#{order.id}</span>
                          <span className="text-[11px] font-medium text-neutral-400 truncate">• {formatDate(order.createdAt)}</span>
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
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                            {bizItems[0]?.productTitle || 'Order Product'}
                            {bizItems.length > 1 && (
                              <span className="text-xs font-semibold text-neutral-500 ml-1.5">
                                (+{bizItems.length - 1} item{bizItems.length > 2 ? 's' : ''})
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                            Storefront: <strong className="text-neutral-800">{order.storefrontName || 'Direct Store'}</strong> • Amount: <strong className="text-neutral-900 font-extrabold">{formatCurrency(order.totalAmount)}</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content Section */}
                    {isExpanded && (
                      <div className="border-t border-neutral-100 p-3.5 sm:p-4 space-y-3.5 bg-neutral-50/30 animate-fadeIn">
                        {/* Product Details & Image */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Ordered Items</p>
                          {bizItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-neutral-200/80 shadow-2xs">
                              <img
                                src={item.coverImage}
                                alt={item.productTitle}
                                className="h-11 w-11 rounded-lg object-cover border border-neutral-200 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-neutral-900 truncate">{item.productTitle}</p>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                                  <span>Quantity: <strong className="text-neutral-900 font-bold">{item.quantity}</strong></span>
                                  <span>•</span>
                                  <span>Unit Price: {formatCurrency(item.unitPrice)}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-extrabold text-neutral-900">
                                  {formatCurrency(item.unitPrice * item.quantity)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Customer Info (Name & Phone) */}
                        <div className="rounded-xl border border-neutral-200/80 bg-white p-3 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
                          <div className="flex items-center gap-2 text-neutral-900 font-bold">
                            <UserIcon className="h-4 w-4 text-neutral-500 shrink-0" />
                            <span>Customer: {order.customerName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-neutral-800 font-mono text-xs">
                            <PhoneActionButtons phone={order.customerPhone} showNumber size="sm" />
                          </div>
                        </div>

                        {/* Financial Summary Box */}
                        <FinancialSummaryBox order={order} />

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => onRequestStatusChange(order, 'accepted')}
                                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition-colors cursor-pointer"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span>Accept</span>
                                </button>
                                <button
                                  onClick={() => onRequestStatusChange(order, 'rejected')}
                                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {order.status === 'accepted' && (
                              <button
                                onClick={() => onRequestStatusChange(order, 'shipped')}
                                className="inline-flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-purple-700 transition-colors cursor-pointer"
                              >
                                <Truck className="h-3.5 w-3.5" />
                                <span>Mark Shipped</span>
                              </button>
                            )}

                            {order.status === 'shipped' && (
                              <button
                                onClick={() => onRequestStatusChange(order, 'delivered')}
                                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition-colors cursor-pointer"
                              >
                                <PackageCheck className="h-3.5 w-3.5" />
                                <span>Mark Delivered</span>
                              </button>
                            )}

                            {(order.status === 'delivered' || order.status === 'completed' || order.isDeliveredLocked) && (
                              <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Locked</span>
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveOrder(order);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Inspect Details</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ======================================================== */
            /* 2. TABLE VIEW                                            */
            /* ======================================================== */
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Customer Name</th>
                      <th className="py-3.5 px-4">Customer Phone</th>
                      <th className="py-3.5 px-4 text-center">Qty</th>
                      <th className="py-3.5 px-4">💰 Price</th>
                      <th className="py-3.5 px-4">🤝 Comm.</th>
                      <th className="py-3.5 px-4">📈 Your Net Profit</th>
                      <th className="py-3.5 px-4">Order Status</th>
                      <th className="py-3.5 px-4">Order Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-800">
                    {paginatedOrders.map((order) => {
                      const bizItems = order.items.filter((i) => i.businessId === business.id);
                      const totalQty = bizItems.reduce((acc, item) => acc + item.quantity, 0);
                      const { productPrice, resellerCommission, netProfit, netProfitLabel } = getFinancialSummary(order);

                      return (
                        <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                          {/* Order ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 whitespace-nowrap">
                            #{order.id}
                          </td>

                          {/* Product */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1 max-w-xs">
                              {bizItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <img
                                    src={item.coverImage}
                                    alt={item.productTitle}
                                    className="h-7 w-7 rounded-md object-cover border border-neutral-200 shrink-0"
                                  />
                                  <span className="truncate font-medium text-neutral-900" title={item.productTitle}>
                                    {item.productTitle}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Customer Name */}
                          <td className="py-3.5 px-4 font-semibold text-neutral-900 whitespace-nowrap">
                            {order.customerName}
                          </td>

                          {/* Customer Phone */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <PhoneActionButtons phone={order.customerPhone} showNumber size="xs" />
                          </td>

                          {/* Quantity */}
                          <td className="py-3.5 px-4 text-center font-bold text-neutral-900">
                            {totalQty}
                          </td>

                          {/* Total Price */}
                          <td className="py-3.5 px-4 font-extrabold text-neutral-900 whitespace-nowrap">
                            {formatCurrency(productPrice)}
                          </td>

                          {/* Commission */}
                          <td className="py-3.5 px-4 font-bold text-amber-700 whitespace-nowrap">
                            {formatCurrency(resellerCommission)}
                          </td>

                          {/* Your Net Profit (PROMINENT) */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1 rounded-lg bg-emerald-100/80 border border-emerald-300 px-2.5 py-1 text-xs font-black text-emerald-800">
                              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                              <span>{formatCurrency(netProfit)}</span>
                            </div>
                          </td>

                          {/* Order Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <OrderStatusBadge status={order.status} />
                          </td>

                          {/* Order Date */}
                          <td className="py-3.5 px-4 text-[11px] text-neutral-500 whitespace-nowrap">
                            {formatDate(order.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {order.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => onRequestStatusChange(order, 'accepted')}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                                    title="Accept Order"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => onRequestStatusChange(order, 'rejected')}
                                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                    title="Reject Order"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Reject
                                  </button>
                                </>
                              )}

                              {order.status === 'accepted' && (
                                <button
                                  onClick={() => onRequestStatusChange(order, 'shipped')}
                                  className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-purple-700 transition-colors shadow-2xs cursor-pointer"
                                  title="Mark Shipped"
                                >
                                  <Truck className="h-3.5 w-3.5" />
                                  Ship
                                </button>
                              )}

                              {order.status === 'shipped' && (
                                <button
                                  onClick={() => onRequestStatusChange(order, 'delivered')}
                                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                                  title="Mark Delivered"
                                >
                                  <PackageCheck className="h-3.5 w-3.5" />
                                  Deliver
                                </button>
                              )}

                              {(order.status === 'delivered' || order.status === 'completed' || order.isDeliveredLocked) && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                  <Lock className="h-3 w-3 text-emerald-600" />
                                  Locked
                                </span>
                              )}

                              <button
                                onClick={() => setActiveOrder(order)}
                                className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                                title="Inspect Details"
                              >
                                <Eye className="h-4 w-4" />
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
          )}

          {/* Pagination Controls */}
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

      {/* Order Inspect Modal */}
      {activeOrder && (
        <Modal
          isOpen={!!activeOrder}
          onClose={() => setActiveOrder(null)}
          title={`Fulfillment Order #${activeOrder.id}`}
          subtitle={`Placed on reseller storefront ${activeOrder.storefrontName}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div>
                <span className="text-xs font-semibold text-neutral-500">Current Status</span>
                <div className="mt-1">
                  <OrderStatusBadge status={activeOrder.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-neutral-500">Order Placed</span>
                <p className="mt-1 text-xs font-bold text-neutral-900">{formatDate(activeOrder.createdAt)}</p>
              </div>
            </div>

            {/* Financial Summary Box inside Modal */}
            <FinancialSummaryBox order={activeOrder} />

            {/* Customer & Shipping Details */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Customer & Shipping Address</h4>
              <p className="text-sm font-bold text-neutral-900">{activeOrder.customerName}</p>
              <div className="text-xs text-neutral-600 flex items-center gap-2 flex-wrap pt-1">
                <span>Email: <strong className="text-neutral-900">{activeOrder.customerEmail}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>Phone:</span>
                  <PhoneActionButtons phone={activeOrder.customerPhone} showNumber size="sm" />
                </span>
              </div>
              <div className="mt-2 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-800 leading-relaxed font-mono">
                {activeOrder.shippingAddress.street}<br />
                {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} {activeOrder.shippingAddress.zipCode}<br />
                {activeOrder.shippingAddress.country}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Ordered Items</h4>
              <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3">
                      <img src={item.coverImage} alt={item.productTitle} className="h-10 w-10 rounded-lg object-cover border" />
                      <div>
                        <p className="text-xs font-bold text-neutral-900">{item.productTitle}</p>
                        <p className="text-[11px] text-neutral-500">Brand: {item.brand}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold text-neutral-900">{formatCurrency(item.unitPrice * item.quantity)}</p>
                      <p className="text-neutral-500">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Controls */}
            {activeOrder.status === 'rejected' ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span>Order Status: Rejected</span>
                </div>
                {activeOrder.rejectionReason && (
                  <p className="text-rose-900 font-medium">
                    <strong>Reason provided:</strong> "{activeOrder.rejectionReason}"
                  </p>
                )}
                <p className="text-rose-700 text-[11px]">
                  Rejected by {activeOrder.rejectedByName || 'Brand Owner'} on {formatDate(activeOrder.rejectedAt || activeOrder.updatedAt)}.
                </p>
              </div>
            ) : (activeOrder.status === 'delivered' || activeOrder.status === 'completed' || activeOrder.isDeliveredLocked) ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  <span>Order Status: Delivered & Locked</span>
                </div>
                <p className="text-emerald-800 text-xs leading-relaxed">
                  This order was confirmed delivered on {formatDate(activeOrder.deliveredAt || activeOrder.updatedAt)}. The status is now locked and cannot be changed or reverted through the business dashboard.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-neutral-200 bg-neutral-900 p-4 text-white space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Fulfillment Controls (Owner Only)</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onRequestStatusChange(activeOrder, 'accepted')}
                    disabled={activeOrder.status === 'accepted'}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                  >
                    Mark Accepted
                  </button>
                  <button
                    onClick={() => onRequestStatusChange(activeOrder, 'shipped')}
                    disabled={activeOrder.status === 'shipped'}
                    className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                  >
                    Mark Shipped
                  </button>
                  <button
                    onClick={() => onRequestStatusChange(activeOrder, 'delivered')}
                    disabled={activeOrder.status === 'delivered'}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                  >
                    Mark Delivered
                  </button>
                  <button
                    onClick={() => onRequestStatusChange(activeOrder, 'rejected')}
                    disabled={activeOrder.status === 'rejected'}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                  >
                    Reject Order
                  </button>
                </div>
              </div>
            )}

            {/* Audit Logs */}
            {activeOrder.auditLogs && activeOrder.auditLogs.length > 0 && (
              <div className="space-y-2 border-t border-neutral-200 pt-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Order History & Audit Log</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {activeOrder.auditLogs.map((log) => (
                    <div key={log.id} className="rounded-lg bg-neutral-50 p-2.5 text-[11px] border border-neutral-200 flex justify-between items-start gap-2">
                      <div>
                        <span className="font-bold text-neutral-900">{log.action.replace(/_/g, ' ')}</span>
                        <p className="text-neutral-600 mt-0.5">{log.details}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">By: {log.actorName || 'Business Owner'}</p>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 whitespace-nowrap">{formatDate(log.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reject Order Confirmation Modal */}
      {confirmRejectOrder && (
        <Modal
          isOpen={!!confirmRejectOrder}
          onClose={() => setConfirmRejectOrder(null)}
          title="Reject Order?"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-bold text-neutral-900">
                Are you sure you want to reject this order?
              </p>

              <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 space-y-2 text-xs text-rose-900">
                <p className="font-semibold text-rose-950">This action will:</p>
                <ul className="list-disc list-inside space-y-1 text-rose-800">
                  <li>Mark the order as <strong className="font-bold">Rejected</strong>.</li>
                  <li>Notify the reseller that the order has been rejected.</li>
                  <li>Prevent the order from being fulfilled unless a new order is placed.</li>
                </ul>
                <p className="pt-1 text-[11px] font-medium text-rose-900 border-t border-rose-200/60">
                  Please make sure you really want to reject this order before continuing.
                </p>
              </div>
            </div>

            {/* Optional Rejection Reason */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <label className="block text-xs font-bold text-neutral-800">
                Rejection Reason <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <select
                value={rejectionReasonOption}
                onChange={(e) => setRejectionReasonOption(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
              >
                <option value="Product out of stock">Product out of stock</option>
                <option value="Incorrect pricing">Incorrect pricing</option>
                <option value="Customer information incomplete">Customer information incomplete</option>
                <option value="Unable to fulfill the order">Unable to fulfill the order</option>
                <option value="Other">Other</option>
              </select>

              {rejectionReasonOption === 'Other' && (
                <textarea
                  rows={2}
                  placeholder="Specify custom rejection reason..."
                  value={customRejectionReason}
                  onChange={(e) => setCustomRejectionReason(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setConfirmRejectOrder(null)}
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmReject}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
                <span>Yes, Reject Order</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delivery Lock Modal */}
      {confirmDeliveryOrder && (
        <Modal
          isOpen={!!confirmDeliveryOrder}
          onClose={() => setConfirmDeliveryOrder(null)}
          title="Confirm Order Delivery?"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-bold text-neutral-900">
                Are you sure you want to mark Order #{confirmDeliveryOrder.id} as Delivered?
              </p>

              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Important Delivery Lock Notice</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-amber-800">
                  <li>Once marked as Delivered, this order status will be permanently <strong className="font-bold">LOCKED</strong>.</li>
                  <li>Reseller commission of <strong className="font-bold">{formatCurrency(confirmDeliveryOrder.resellerCommission)}</strong> will immediately become eligible for monthly payout.</li>
                  <li>This action <strong className="font-bold">cannot be reversed or undone</strong> from the dashboard.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setConfirmDeliveryOrder(null)}
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmDelivery}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <PackageCheck className="h-4 w-4" />
                <span>Yes, Mark as Delivered & Lock</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
