import React, { useState } from 'react';
import { Building2, Search, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ExternalLink, Package, ShoppingBag, DollarSign, Ban, PauseCircle } from 'lucide-react';
import { storage } from '../../lib/storage';
import { BusinessProfile, UserAccountStatus } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { ResponsiveDataTable, Column } from '../common/ResponsiveDataTable';
import { ViewMode } from '../common/ViewToggle';
import { PhoneActionButtons } from '../common/PhoneActionButtons';

export function BusinessManagementTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [banModalBusiness, setBanModalBusiness] = useState<BusinessProfile | null>(null);
  const [suspendModalBusiness, setSuspendModalBusiness] = useState<BusinessProfile | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [banType, setBanType] = useState<'permanent' | 'temporary'>('permanent');
  const [suspensionEndDate, setSuspensionEndDate] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'cards' : 'table'
  );

  const businesses = storage.getBusinesses();
  const products = storage.getProducts();
  const orders = storage.getOrders();
  const reports = storage.getReports();

  const categories = Array.from(new Set(businesses.map((b) => b.category)));

  const filtered = businesses.filter((b) => {
    const matchesSearch =
      b.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConfirmBan = () => {
    if (!banModalBusiness || !actionReason.trim()) return;
    storage.banUser(banModalBusiness.ownerId, actionReason.trim(), banType);
    setBanModalBusiness(null);
    setActionReason('');
  };

  const handleConfirmSuspend = () => {
    if (!suspendModalBusiness || !actionReason.trim()) return;
    storage.suspendUser(suspendModalBusiness.ownerId, actionReason.trim(), suspensionEndDate || undefined);
    setSuspendModalBusiness(null);
    setActionReason('');
    setSuspensionEndDate('');
  };

  const handleReactivate = (business: BusinessProfile) => {
    storage.reactivateUser(business.ownerId, 'Reactivated by platform administrator');
  };

  const handleToggleVerification = (businessId: string) => {
    storage.toggleBusinessVerification(businessId);
  };

  const businessColumns: Column<BusinessProfile>[] = [
    {
      key: 'brand',
      header: 'Brand / Owner',
      priority: 'primary',
      cell: (b) => {
        const ownerUser = storage.getUsers().find((u) => u.id === b.ownerId);
        const ownerPhone = b.phone || ownerUser?.phone;

        return (
          <div className="flex items-center gap-3">
            <img src={b.logoUrl} alt={b.businessName} className="h-9 w-9 rounded-xl object-cover border shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-900">{b.businessName}</span>
                {b.isVerified && <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" title="Verified Brand" />}
              </div>
              {ownerPhone ? (
                <div className="mt-0.5">
                  <PhoneActionButtons phone={ownerPhone} showNumber size="xs" />
                </div>
              ) : (
                <p className="text-[10px] text-neutral-400">{b.website}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      priority: 'secondary',
      cell: (b) => <span className="text-neutral-600 font-medium">{b.category}</span>,
    },
    {
      key: 'products',
      header: 'Products',
      priority: 'secondary',
      cell: (b) => {
        const count = products.filter((p) => p.businessId === b.id).length;
        return <span className="rounded-lg bg-neutral-100 px-2 py-1 font-mono font-bold text-neutral-800">{count} items</span>;
      },
    },
    {
      key: 'orders',
      header: 'Total Orders',
      priority: 'secondary',
      cell: (b) => {
        const count = orders.filter((o) => o.items.some((i) => i.businessId === b.id)).length;
        return <span className="font-semibold">{count} orders</span>;
      },
    },
    {
      key: 'volume',
      header: 'Gross Volume',
      priority: 'secondary',
      cell: (b) => {
        const grossVolume = orders
          .filter((o) => o.items.some((i) => i.businessId === b.id))
          .reduce((sum, o) => sum + o.totalAmount, 0);
        return <span className="font-bold text-emerald-700">{formatCurrency(grossVolume)}</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      priority: 'secondary',
      cell: (b) => {
        const currentStatus: UserAccountStatus = b.status || 'active';
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              currentStatus === 'active'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : currentStatus === 'suspended'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {currentStatus}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Governance Actions',
      priority: 'optional',
      align: 'right',
      cell: (b) => {
        const currentStatus: UserAccountStatus = b.status || 'active';
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleToggleVerification(b.id)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                b.isVerified ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              }`}
            >
              {b.isVerified ? 'Unverify' : 'Verify Brand'}
            </button>

            {currentStatus === 'active' ? (
              <button
                onClick={() => {
                  setSuspendModalBusiness(b);
                  setActionReason('');
                  setSuspensionEndDate('');
                }}
                className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200 hover:bg-amber-100"
              >
                Suspend
              </button>
            ) : (
              <button
                onClick={() => handleReactivate(b)}
                className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              >
                Reactivate
              </button>
            )}

            {currentStatus !== 'banned' && (
              <button
                onClick={() => {
                  setBanModalBusiness(b);
                  setActionReason('');
                  setBanType('permanent');
                }}
                className="rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 border border-red-200 hover:bg-red-100"
              >
                Ban
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Brand Owner & Supplier Governance</h2>
          <p className="text-xs text-neutral-500">
            Audit verified brand owners, regulate catalog permissions, inspect dispute reports, and manage account statuses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search business or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-64 rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Responsive Business Data Table */}
      <ResponsiveDataTable
        data={filtered}
        columns={businessColumns}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={true}
        emptyTitle="No Businesses Found"
        emptyDescription="No brand or supplier business matches your criteria."
      />

      {/* Ban Business Modal */}
      {banModalBusiness && (
        <Modal isOpen={!!banModalBusiness} onClose={() => setBanModalBusiness(null)} title={`Ban Brand Owner: ${banModalBusiness.businessName}`}>
          <div className="space-y-4 text-xs text-neutral-700">
            <div className="rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3 text-red-800">
              <Ban className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Ban Account Enforcement</p>
                <p className="text-[11px] text-red-700">
                  Banning this business owner will terminate their session immediately, prevent catalog management, block new orders, and display the Account Restricted page to them.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-900 mb-1">Ban Reason (Displayed to User & Audit Log)</label>
              <textarea
                rows={3}
                placeholder="Specify exact reason for ban (e.g., Counterfeit goods violation, counterfeit certification, or fraudulent activity)..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-900 mb-1">Ban Classification</label>
              <select
                value={banType}
                onChange={(e) => setBanType(e.target.value as any)}
                className="w-full h-9 rounded-xl border border-neutral-300 px-3 text-xs font-semibold text-neutral-800"
              >
                <option value="permanent">Permanent Ban (Indefinite)</option>
                <option value="temporary">Temporary Ban (Subject to Appeal)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setBanModalBusiness(null)}
                className="rounded-xl border border-neutral-200 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBan}
                disabled={!actionReason.trim()}
                className="rounded-xl bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Account Ban
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Suspend Business Modal */}
      {suspendModalBusiness && (
        <Modal isOpen={!!suspendModalBusiness} onClose={() => setSuspendModalBusiness(null)} title={`Suspend Brand Owner: ${suspendModalBusiness.businessName}`}>
          <div className="space-y-4 text-xs text-neutral-700">
            <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 flex items-start gap-3 text-amber-800">
              <PauseCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Account Suspension</p>
                <p className="text-[11px] text-amber-700">
                  Suspending this business owner will temporarily restrict their workspace login while keeping existing orders accessible for fulfillment arbitration.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-900 mb-1">Suspension Reason</label>
              <textarea
                rows={3}
                placeholder="Specify reason for temporary suspension (e.g., Pending dispute resolution or inventory verification)..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-900 mb-1">Suspension End Date (Optional)</label>
              <input
                type="date"
                value={suspensionEndDate}
                onChange={(e) => setSuspensionEndDate(e.target.value)}
                className="w-full h-9 rounded-xl border border-neutral-300 px-3 text-xs text-neutral-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setSuspendModalBusiness(null)}
                className="rounded-xl border border-neutral-200 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspend}
                disabled={!actionReason.trim()}
                className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

