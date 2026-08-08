import React, { useState, useEffect } from 'react';
import { Scale, Search, CheckCircle2, XCircle, HelpCircle, User, Clock, FileText, ExternalLink, MessageSquare, Package, AlertTriangle, ShieldCheck, Phone } from 'lucide-react';
import { storage } from '../../lib/storage';
import { AccountAppeal, ProductAppeal } from '../../types';
import { formatDate, formatCurrency } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { AppealStatusBadge } from '../common/Badge';

interface AppealsTabProps {
  defaultTab?: 'account' | 'product';
  onNavigateToProductModeration?: (productId: string) => void;
}

export function AppealsTab({ defaultTab = 'product', onNavigateToProductModeration }: AppealsTabProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'product'>(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppeal, setSelectedAppeal] = useState<AccountAppeal | null>(null);
  const [selectedProductAppeal, setSelectedProductAppeal] = useState<ProductAppeal | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [confirmActionModal, setConfirmActionModal] = useState<'approve' | 'reject' | 'request_info' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // Sync with prop when defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Subscribe to storage updates for real-time reactivity without manual refresh
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const accountAppeals = storage.getAppeals();
  const productAppeals = storage.getProductAppeals();

  const filteredAccountAppeals = accountAppeals.filter((a) => {
    const matchesSearch =
      a.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.explanation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredProductAppeals = productAppeals.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.ownerPhone && a.ownerPhone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.appealMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleReviewAccountDecision = (decision: 'approve' | 'reject' | 'request_info') => {
    if (!selectedAppeal) return;
    storage.reviewAppeal(selectedAppeal.id, decision, adminNote.trim());
    setSelectedAppeal(null);
    setAdminNote('');
  };

  const handleReviewProductDecision = (decision: 'approve' | 'reject' | 'request_info') => {
    if (!selectedProductAppeal) return;
    storage.reviewProductAppeal(selectedProductAppeal.id, decision, adminNote.trim());
    setSelectedProductAppeal(null);
    setAdminNote('');
  };

  const pendingProductAppealsCount = productAppeals.filter((a) => a.status === 'pending').length;
  const pendingAccountAppealsCount = accountAppeals.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Scale className="h-5 w-5 text-emerald-600" /> Moderation & Appeals Governance Center
            </h2>
            <p className="text-xs text-neutral-500">
              Review and arbitrate formal appeals for restricted accounts and hidden products submitted by business owners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search appeals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-64 rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="more_info_requested">More Info Requested</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-neutral-100 pt-3">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'account'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Account Restriction Appeals</span>
            {pendingAccountAppealsCount > 0 && (
              <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-extrabold text-white">
                {pendingAccountAppealsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('product')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'product'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Package className="h-3.5 w-3.5" />
            <span>Product Moderation Appeals</span>
            {pendingProductAppealsCount > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-extrabold text-white">
                {pendingProductAppealsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Account Appeals Table */}
      {activeTab === 'account' && (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="py-3.5 px-4">User & Role</th>
                <th className="py-3.5 px-4">Subject & Summary</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filteredAccountAppeals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-neutral-400 font-medium">
                    No account appeals match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredAccountAppeals.map((apl) => (
                  <tr key={apl.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-neutral-900">{apl.userName}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{apl.userEmail}</p>
                        <span className="mt-1 inline-block rounded-md bg-neutral-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-neutral-600">
                          {apl.userRole.replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-bold text-neutral-900 truncate">{apl.subject}</p>
                      <p className="text-neutral-500 text-[11px] line-clamp-2 mt-0.5 leading-snug">{apl.explanation}</p>
                      {apl.attachments && apl.attachments.length > 0 && (
                        <a
                          href={apl.attachments[0]}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:underline mt-1 font-semibold"
                        >
                          <FileText className="h-3 w-3" /> View Supporting Attachment <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-600">{formatDate(apl.createdAt)}</td>

                    <td className="py-3.5 px-4">
                      <AppealStatusBadge status={apl.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedAppeal(apl);
                          setAdminNote(apl.adminNotes || '');
                        }}
                        className="rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition-colors"
                      >
                        Review Appeal
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Moderation Appeals Table */}
      {activeTab === 'product' && (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="py-3.5 px-4">Appeal ID</th>
                <th className="py-3.5 px-4">Product Name & ID</th>
                <th className="py-3.5 px-4">Business Owner & Phone</th>
                <th className="py-3.5 px-4">Appeal Date</th>
                <th className="py-3.5 px-4">Hidden Reason & Message</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filteredProductAppeals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-neutral-400 font-medium">
                    No product appeals match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredProductAppeals.map((apl) => {
                  const phone = apl.ownerPhone || '(555) 234-5678';
                  return (
                    <tr key={apl.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                        #{apl.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onNavigateToProductModeration?.(apl.productId)}
                            className="group flex items-center gap-3 text-left hover:opacity-90 transition-opacity"
                            title="Click to view and moderate this product directly on Product Moderation page"
                          >
                            <img
                              src={apl.productImage}
                              alt={apl.productTitle}
                              className="h-10 w-10 rounded-lg object-cover border border-neutral-200 shrink-0 group-hover:ring-2 group-hover:ring-emerald-500 transition-all"
                            />
                            <div>
                              <p className="font-bold text-neutral-900 max-w-[180px] truncate group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                                {apl.productTitle}
                                <ExternalLink className="h-3 w-3 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </p>
                              <p className="text-[10px] text-neutral-400 font-mono">ID: #{apl.productId}</p>
                            </div>
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-neutral-900">{apl.ownerName}</p>
                          <p className="text-[11px] text-neutral-500">{apl.businessName}</p>
                          <p className="text-[10px] text-emerald-700 font-mono font-medium flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3 shrink-0" /> {phone}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-neutral-600 font-mono whitespace-nowrap">
                        {formatDate(apl.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider truncate">
                          Reason: {apl.hiddenReason}
                        </p>
                        <p className="text-neutral-600 text-[11px] line-clamp-2 mt-0.5 leading-snug">
                          "{apl.appealMessage}"
                        </p>
                        {apl.attachments && apl.attachments.length > 0 && (
                          <div className="mt-1 flex items-center gap-2">
                            <a
                              href={apl.attachments[0]}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:underline font-bold"
                            >
                              <FileText className="h-3 w-3" /> Attachment ({apl.attachments.length})
                            </a>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <AppealStatusBadge status={apl.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onNavigateToProductModeration && (
                            <button
                              type="button"
                              onClick={() => onNavigateToProductModeration(apl.productId)}
                              className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 hover:text-emerald-700 transition-colors shrink-0"
                              title="Go directly to this product on Product Moderation page"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Go to Moderation</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedProductAppeal(apl);
                              setAdminNote(apl.adminNotes || '');
                            }}
                            className="rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
                          >
                            Review Appeal
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Account Appeal Review Modal */}
      {selectedAppeal && (
        <Modal isOpen={!!selectedAppeal} onClose={() => setSelectedAppeal(null)} title={`Review Account Appeal #${selectedAppeal.id}`}>
          <div className="space-y-5 text-xs text-neutral-700">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900 text-sm">{selectedAppeal.userName}</p>
                  <p className="text-[11px] text-neutral-500 font-mono">{selectedAppeal.userEmail} ({selectedAppeal.userRole})</p>
                </div>
                <AppealStatusBadge status={selectedAppeal.status} />
              </div>
              <p className="font-bold text-neutral-900 pt-1">Subject: {selectedAppeal.subject}</p>
              <div className="rounded-lg bg-white p-3 border border-neutral-200 text-neutral-800 leading-relaxed font-normal">
                {selectedAppeal.explanation}
              </div>
              {selectedAppeal.attachments && selectedAppeal.attachments.length > 0 && (
                <div className="pt-1">
                  <span className="font-semibold text-neutral-600">Attachment: </span>
                  <a href={selectedAppeal.attachments[0]} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline font-bold">
                    {selectedAppeal.attachments[0]}
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-neutral-900 mb-1.5">Admin Notes / Decision Explanation</label>
              <textarea
                rows={3}
                placeholder="Enter notes explaining your decision or requesting specific details from the user..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedAppeal(null)}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleReviewAccountDecision('request_info')}
                className="rounded-xl bg-amber-50 px-4 py-2 font-bold text-amber-700 border border-amber-200 hover:bg-amber-100"
              >
                Request More Info
              </button>

              <button
                type="button"
                onClick={() => handleReviewAccountDecision('reject')}
                className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-red-700"
              >
                Reject Appeal
              </button>

              <button
                type="button"
                onClick={() => handleReviewAccountDecision('approve')}
                className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                Approve & Reactivate User
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Product Appeal Review Detailed Modal */}
      {selectedProductAppeal && (() => {
        const linkedProduct = storage.getProductById(selectedProductAppeal.productId);
        const linkedBusiness = storage.getBusinesses().find((b) => b.id === selectedProductAppeal.businessId);
        const linkedUser = storage.getUsers().find((u) => u.id === selectedProductAppeal.ownerId);

        const ownerPhone = selectedProductAppeal.ownerPhone || linkedUser?.phone || linkedBusiness?.phone || '(555) 234-5678';
        const hiddenByAdmin = selectedProductAppeal.hiddenByAdminName || linkedProduct?.hiddenByAdminName || 'Compliance Operator';

        return (
          <Modal
            isOpen={!!selectedProductAppeal}
            onClose={() => setSelectedProductAppeal(null)}
            title={`Review Product Moderation Appeal #${selectedProductAppeal.id}`}
          >
            <div className="space-y-4 text-xs text-neutral-700 max-h-[75vh] overflow-y-auto pr-1">
              {/* 1. Product Information */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">1. Product Information</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-500">Product ID: #{selectedProductAppeal.productId}</span>
                    {onNavigateToProductModeration && (
                      <button
                        type="button"
                        onClick={() => {
                          const pid = selectedProductAppeal.productId;
                          setSelectedProductAppeal(null);
                          onNavigateToProductModeration(pid);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                        title="Open this product in Product Moderation view"
                      >
                        <ExternalLink className="h-3 w-3" /> View in Moderation Page
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Images Gallery */}
                  <div className="shrink-0 space-y-2">
                    <img
                      src={selectedProductAppeal.productImage || linkedProduct?.images[0]}
                      alt={selectedProductAppeal.productTitle}
                      className="h-24 w-24 rounded-xl object-cover border border-neutral-200 shadow-2xs"
                    />
                    {linkedProduct?.images && linkedProduct.images.length > 1 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px]">
                        {linkedProduct.images.map((img, idx) => (
                          <img key={idx} src={img} alt={`Thumb ${idx}`} className="h-7 w-7 rounded-md object-cover border border-neutral-200 shrink-0" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-neutral-900 text-sm">{selectedProductAppeal.productTitle}</h4>
                      <AppealStatusBadge status={selectedProductAppeal.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 pt-1">
                      <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-700">
                        Category: {linkedProduct?.category || 'Electronics'}
                      </span>
                      <span className="font-bold text-emerald-700">
                        Price: {formatCurrency(linkedProduct?.price || 0)}
                      </span>
                      <span className="text-neutral-500">
                        Stock: {linkedProduct?.stock ?? '—'} units
                      </span>
                    </div>
                    <p className="text-neutral-600 text-[11px] leading-relaxed line-clamp-3 pt-1">
                      {linkedProduct?.description || 'High-performance equipment engineered for precision and quality.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Business Owner */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block border-b border-neutral-100 pb-1.5">
                  2. Business Owner Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-semibold">Owner Name</span>
                    <span className="font-bold text-neutral-900">{selectedProductAppeal.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-semibold">Phone Number</span>
                    <span className="font-mono font-bold text-neutral-800">{ownerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-semibold">Business Name</span>
                    <span className="font-bold text-neutral-900">{selectedProductAppeal.businessName}</span>
                    <span className="text-[10px] text-neutral-500 block">{selectedProductAppeal.ownerEmail}</span>
                  </div>
                </div>
              </div>

              {/* 3. Moderation Information */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block border-b border-amber-200/60 pb-1.5">
                  3. Moderation Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-amber-800 block font-semibold">Admin Who Hid Product</span>
                    <span className="font-bold text-amber-950">{hiddenByAdmin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-800 block font-semibold">Date Hidden</span>
                    <span className="font-mono font-bold text-amber-950">{formatDate(selectedProductAppeal.hiddenAt)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-amber-800 block font-semibold mt-1">Hidden Reason</span>
                  <p className="mt-0.5 font-bold text-amber-900 bg-white/80 p-2.5 rounded-lg border border-amber-200 text-xs">
                    {selectedProductAppeal.hiddenReason}
                  </p>
                </div>
              </div>

              {/* 4. Appeal Information */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">4. Appeal Statement & Attachments</span>
                  <span className="text-[11px] font-mono text-neutral-500">Submitted: {formatDate(selectedProductAppeal.createdAt)}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-neutral-600 mb-1">Business Owner Appeal Statement</span>
                  <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200 text-neutral-800 leading-relaxed font-normal whitespace-pre-wrap">
                    {selectedProductAppeal.appealMessage}
                  </div>
                </div>
                {selectedProductAppeal.attachments && selectedProductAppeal.attachments.length > 0 && (
                  <div>
                    <span className="font-bold text-neutral-700 block mb-1">Attached Supporting Documentation</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProductAppeal.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-emerald-700 hover:underline font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-xs"
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate flex-1">{att}</span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Complete Appeal Audit Trail & History */}
              {(() => {
                const historyTrail = selectedProductAppeal.history && selectedProductAppeal.history.length > 0
                  ? selectedProductAppeal.history
                  : [
                      {
                        action: 'Product Hidden',
                        timestamp: selectedProductAppeal.hiddenAt || selectedProductAppeal.createdAt,
                        actor: hiddenByAdmin,
                        details: `Hidden reason: ${selectedProductAppeal.hiddenReason}`,
                      },
                      {
                        action: 'Appeal Submitted',
                        timestamp: selectedProductAppeal.createdAt,
                        actor: selectedProductAppeal.ownerName,
                        details: selectedProductAppeal.appealMessage,
                      },
                      ...(selectedProductAppeal.status !== 'pending' && selectedProductAppeal.reviewedByAdminName
                        ? [
                            {
                              action: selectedProductAppeal.status === 'approved'
                                ? 'Appeal Approved & Product Restored'
                                : selectedProductAppeal.status === 'rejected'
                                ? 'Appeal Rejected'
                                : 'More Info Requested',
                              timestamp: selectedProductAppeal.reviewedAt || selectedProductAppeal.updatedAt,
                              actor: `${selectedProductAppeal.reviewedByAdminName} (Admin)`,
                              details: selectedProductAppeal.adminNotes || selectedProductAppeal.rejectionReason || selectedProductAppeal.requestedInfo || 'Appeal reviewed by compliance operator.',
                            }
                          ]
                        : [])
                    ];

                return (
                  <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">5. Complete Appeal Audit Trail & History</span>
                      <span className="text-[10px] font-mono text-neutral-500">{historyTrail.length} Events Logged</span>
                    </div>
                    <div className="relative pl-4 border-l-2 border-neutral-200 space-y-3 pt-1">
                      {historyTrail.map((item, idx) => (
                        <div key={idx} className="relative group">
                          <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-neutral-900 border-2 border-white" />
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-900">{item.action}</span>
                            <span className="text-[10px] font-mono text-neutral-400">{formatDate(item.timestamp)}</span>
                          </div>
                          <p className="text-[10px] text-neutral-500 font-medium">{item.actor}</p>
                          <p className="text-[11px] text-neutral-700 mt-0.5 bg-neutral-50 p-2 rounded-md border border-neutral-100">
                            {item.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 6. Admin Decision Notes */}
              <div>
                <label className="block font-bold text-neutral-900 mb-1.5">Admin Operator Notes / Decision Response Message</label>
                <textarea
                  rows={3}
                  placeholder="Enter notes explaining your decision (required when rejecting an appeal)..."
                  value={adminNote}
                  onChange={(e) => {
                    setAdminNote(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                {errorMessage && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-rose-600">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProductAppeal(null);
                    setErrorMessage(null);
                    setAdminNote('');
                  }}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!adminNote.trim()) {
                      setErrorMessage("Please enter notes explaining what additional information is required.");
                      return;
                    }
                    setErrorMessage(null);
                    setConfirmActionModal('request_info');
                  }}
                  className="rounded-xl bg-amber-50 px-4 py-2 font-bold text-amber-700 border border-amber-200 hover:bg-amber-100"
                >
                  Request More Info
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!adminNote.trim()) {
                      setErrorMessage("A rejection reason is required before rejecting this appeal.");
                      return;
                    }
                    setErrorMessage(null);
                    setConfirmActionModal('reject');
                  }}
                  className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-red-700"
                >
                  Reject Appeal
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setConfirmActionModal('approve');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Unhide Product (Approve Appeal)</span>
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Confirmation Dialog Modal */}
      {confirmActionModal && selectedProductAppeal && (
        <Modal
          isOpen={!!confirmActionModal}
          onClose={() => setConfirmActionModal(null)}
          title={
            confirmActionModal === 'approve'
              ? 'Confirm Product Restoration & Approval'
              : confirmActionModal === 'reject'
              ? 'Confirm Appeal Rejection'
              : 'Confirm Information Request'
          }
        >
          <div className="space-y-4 text-xs">
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                confirmActionModal === 'approve'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : confirmActionModal === 'reject'
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">
                  {confirmActionModal === 'approve'
                    ? 'Are you sure you want to restore this product? It will immediately become visible to resellers and customers.'
                    : confirmActionModal === 'reject'
                    ? 'Are you sure you want to reject this appeal? The product will remain hidden until a future appeal is approved.'
                    : 'Are you sure you want to request additional details from the business owner?'}
                </p>
                {confirmActionModal === 'reject' && adminNote && (
                  <p className="text-xs font-medium mt-1.5 bg-white/80 p-2 rounded border border-rose-200">
                    <span className="font-bold block">Recorded Rejection Reason:</span> "{adminNote}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
              <button
                type="button"
                onClick={() => setConfirmActionModal(null)}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  handleReviewProductDecision(confirmActionModal);
                  setConfirmActionModal(null);
                }}
                className={`rounded-xl px-5 py-2 font-bold text-white shadow-xs ${
                  confirmActionModal === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : confirmActionModal === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {confirmActionModal === 'approve'
                  ? 'Confirm & Unhide Product'
                  : confirmActionModal === 'reject'
                  ? 'Confirm Rejection'
                  : 'Confirm Request'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
