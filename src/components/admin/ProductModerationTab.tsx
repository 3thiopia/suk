import React, { useState, useEffect } from 'react';
import { CompactFilterSection, FilterChip } from '../common/CompactFilterSection';
import {
  Package,
  Search,
  EyeOff,
  Eye,
  Trash2,
  AlertOctagon,
  Filter,
  Building2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  User,
  Phone,
  Edit3,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Scale,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { Product, ProductAppeal } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { AppealStatusBadge } from '../common/Badge';

interface ProductModerationTabProps {
  onNavigateToAppeals?: () => void;
  highlightProductId?: string | null;
  onClearHighlight?: () => void;
}

export function ProductModerationTab({
  onNavigateToAppeals,
  highlightProductId,
  onClearHighlight,
}: ProductModerationTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<string>('all');
  const [highlightedId, setHighlightedId] = useState<string | null>(highlightProductId || null);

  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [confirmActionModal, setConfirmActionModal] = useState<'approve' | 'reject' | 'request_info' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [hideReasonModalProduct, setHideReasonModalProduct] = useState<Product | null>(null);
  const [hideReasonInput, setHideReasonInput] = useState('');

  const [isEditingReason, setIsEditingReason] = useState<boolean>(false);
  const [editReasonInput, setEditReasonInput] = useState('');

  const [, setStorageTick] = useState(0);

  // Subscribe to storage updates for instant real-time synchronization
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setStorageTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // Handle direct navigation & highlighting from Product Appeals
  useEffect(() => {
    if (highlightProductId) {
      setSearchTerm('');
      setSelectedCategory('all');
      setSelectedBusiness('all');
      setHighlightedId(highlightProductId);

      const matchedProduct = storage.getProductById(highlightProductId);
      if (matchedProduct) {
        setInspectedProduct(matchedProduct);
        setDecisionNote(matchedProduct.adminNotes || '');
      }

      const timer = setTimeout(() => {
        const el = document.getElementById(`product-row-${highlightProductId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [highlightProductId]);

  const products = storage.getProducts();
  const businesses = storage.getBusinesses();
  const productAppeals = storage.getProductAppeals();

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesBiz = selectedBusiness === 'all' || p.businessId === selectedBusiness;
    return matchesSearch && matchesCat && matchesBiz;
  });

  const handleToggleHideConfirm = () => {
    if (!hideReasonModalProduct) return;
    const nextState = !hideReasonModalProduct.isHidden;
    storage.toggleProductHidden(hideReasonModalProduct.id, nextState, hideReasonInput);
    setHideReasonModalProduct(null);
    setHideReasonInput('');
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to permanently delete this product from the platform catalog?')) {
      storage.deleteProductAdmin(productId);
    }
  };

  const handleResolveAppealInModal = (decision: 'approve' | 'reject' | 'request_info') => {
    if (!inspectedProduct) return;

    const matchingAppeal = productAppeals.find((a) => a.productId === inspectedProduct.id);

    if (matchingAppeal) {
      storage.reviewProductAppeal(matchingAppeal.id, decision, decisionNote.trim());
    } else {
      // Direct moderation action if no formal appeal record exists
      if (decision === 'approve') {
        storage.toggleProductHidden(inspectedProduct.id, false, decisionNote.trim());
      } else if (decision === 'reject') {
        storage.updateProduct(inspectedProduct.id, {
          isHidden: true,
          adminNotes: decisionNote.trim(),
          appealStatus: 'rejected',
        });
      }
    }

    setConfirmActionModal(null);
    setErrorMessage(null);
    // Refresh local state of inspected product
    const updatedProd = storage.getProductById(inspectedProduct.id);
    if (updatedProd) {
      setInspectedProduct(updatedProd);
    }
  };

  const handleSaveEditedReason = () => {
    if (!inspectedProduct) return;
    storage.updateProduct(inspectedProduct.id, {
      hiddenReason: editReasonInput.trim() || inspectedProduct.hiddenReason,
      adminNotes: editReasonInput.trim(),
    });
    setIsEditingReason(false);
    const updatedProd = storage.getProductById(inspectedProduct.id);
    if (updatedProd) setInspectedProduct(updatedProd);
  };

  return (
    <div className="space-y-6">
      {/* Moderation Controls Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" /> Platform Catalog Moderation & Appeals
          </h2>
          <p className="text-xs text-neutral-500">
            Inspect supplier products, manage hidden statuses, review moderation appeals, and maintain full compliance transparency.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {highlightedId && (
            <button
              onClick={() => {
                setHighlightedId(null);
                onClearHighlight?.();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <span>Showing Highlighted Target</span>
              <XCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            </button>
          )}
        </div>
      </div>

      <CompactFilterSection
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search title, brand, ID..."
        activeCount={(selectedBusiness !== 'all' ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0)}
        activeChips={[
          ...(selectedBusiness !== 'all' ? [{
            id: 'business',
            label: `Brand: ${businesses.find((b) => b.id === selectedBusiness)?.businessName || selectedBusiness}`,
            onRemove: () => setSelectedBusiness('all'),
          }] : []),
          ...(selectedCategory !== 'all' ? [{
            id: 'category',
            label: `Category: ${selectedCategory}`,
            onRemove: () => setSelectedCategory('all'),
          }] : []),
        ]}
        resultsCount={filtered.length}
        resultsLabel="products"
        onResetAll={() => {
          setSearchTerm('');
          setSelectedBusiness('all');
          setSelectedCategory('all');
        }}
      >
        {/* Business Brand Filter */}
        <div className="space-y-1 w-full sm:w-auto">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase sm:hidden">Brand/Business</label>
          <select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
          >
            <option value="all">All Brands</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.businessName}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-1 w-full sm:w-auto">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase sm:hidden">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </CompactFilterSection>

      {/* Product Grid Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="py-3.5 px-4">Product details</th>
              <th className="py-3.5 px-4">Supplier Brand</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Retail Price</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4">Moderation & Appeal Status</th>
              <th className="py-3.5 px-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-neutral-400">
                  No products found matching the criteria.
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const biz = businesses.find((b) => b.id === p.businessId);
                const isTarget = p.id === highlightedId;
                const matchingAppeal = productAppeals.find((a) => a.productId === p.id);

                return (
                  <tr
                    key={p.id}
                    id={`product-row-${p.id}`}
                    className={`transition-all ${
                      isTarget
                        ? 'ring-2 ring-emerald-500 bg-emerald-50/80 shadow-sm'
                        : p.isHidden
                        ? 'bg-amber-50/40 hover:bg-amber-50/70'
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="h-10 w-10 rounded-xl object-cover border border-neutral-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-neutral-900">{p.title}</p>
                            {isTarget && (
                              <span className="rounded-md bg-emerald-600 px-1.5 py-0.2 text-[9px] font-black text-white uppercase tracking-wider animate-pulse">
                                Target From Appeal
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-400 font-mono">ID: {p.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                        <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                        {biz?.businessName || p.brand}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-neutral-600">{p.category}</td>

                    <td className="py-3.5 px-4 font-bold text-emerald-700">{formatCurrency(p.price)}</td>

                    <td className="py-3.5 px-4 font-semibold">{p.stock} units</td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {p.isHidden ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                            <EyeOff className="h-3 w-3" /> Hidden from Catalog
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            <Eye className="h-3 w-3" /> Active & Visible
                          </span>
                        )}

                        {p.appealStatus && (
                          <div className="pt-0.5">
                            <AppealStatusBadge status={p.appealStatus} />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setInspectedProduct(p);
                            setDecisionNote(p.adminNotes || '');
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-neutral-800 transition-colors shadow-2xs"
                          title="Inspect complete product details, owner info, moderation reason & appeal audit"
                        >
                          <Search className="h-3 w-3" />
                          <span>Inspect & Review</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setHideReasonModalProduct(p);
                            setHideReasonInput(p.hiddenReason || p.adminNotes || '');
                          }}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                            p.isHidden
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {p.isHidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {p.isHidden ? 'Unhide Product' : 'Hide Product'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Permanently Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Comprehensive Product Moderation & Appeal Details Modal */}
      {inspectedProduct && (() => {
        const currentProd = storage.getProductById(inspectedProduct.id) || inspectedProduct;
        const biz = businesses.find((b) => b.id === currentProd.businessId);
        const ownerUser = storage.getUsers().find((u) => u.id === (biz?.ownerId || currentProd.businessId));
        const matchingAppeal = productAppeals.find((a) => a.productId === currentProd.id);

        const ownerPhone = matchingAppeal?.ownerPhone || ownerUser?.phone || biz?.phone || '(555) 234-5678';
        const ownerEmail = matchingAppeal?.ownerEmail || ownerUser?.email || 'owner@business.com';
        const ownerName = matchingAppeal?.ownerName || ownerUser?.name || biz?.businessName || 'Business Owner';

        const hiddenByAdmin = currentProd.hiddenByAdminName || matchingAppeal?.hiddenByAdminName || 'Compliance Operator';

        return (
          <Modal
            isOpen={!!inspectedProduct}
            onClose={() => {
              setInspectedProduct(null);
              setErrorMessage(null);
              setDecisionNote('');
            }}
            title={`Product Moderation & Appeal Details — ${currentProd.title}`}
          >
            <div className="space-y-4 text-xs text-neutral-700 max-h-[75vh] overflow-y-auto pr-1">
              {/* 1. Product Information */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">1. Product Information</span>
                  <span className="text-xs font-mono text-neutral-500">ID: #{currentProd.id}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="shrink-0 space-y-2">
                    <img
                      src={currentProd.images[0]}
                      alt={currentProd.title}
                      className="h-24 w-24 rounded-xl object-cover border border-neutral-200 shadow-2xs"
                    />
                    {currentProd.images.length > 1 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px]">
                        {currentProd.images.map((img, idx) => (
                          <img key={idx} src={img} alt={`Thumb ${idx}`} className="h-7 w-7 rounded-md object-cover border border-neutral-200 shrink-0" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-sm font-black text-neutral-900">{currentProd.title}</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <p><span className="font-bold text-neutral-500">Brand:</span> {currentProd.brand}</p>
                      <p><span className="font-bold text-neutral-500">Category:</span> {currentProd.category}</p>
                      <p><span className="font-bold text-neutral-500">Retail Price:</span> <span className="font-bold text-emerald-700">{formatCurrency(currentProd.price)}</span></p>
                      <p><span className="font-bold text-neutral-500">Stock Inventory:</span> {currentProd.stock} units</p>
                    </div>
                    <p className="text-[11px] text-neutral-600 bg-neutral-50 p-2 rounded-lg border border-neutral-100 mt-2">
                      {currentProd.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Business Owner Details */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block border-b border-neutral-100 pb-1.5">
                  2. Business Owner & Brand Profile
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase">Business / Brand</p>
                    <p className="font-bold text-neutral-900 flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-neutral-400" /> {biz?.businessName || currentProd.brand}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase">Owner Name</p>
                    <p className="font-bold text-neutral-900 flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-neutral-400" /> {ownerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase">Contact Info</p>
                    <p className="font-mono text-emerald-700 text-[11px]">{ownerEmail}</p>
                    <p className="font-mono text-neutral-600 text-[10px] flex items-center gap-1">
                      <Phone className="h-3 w-3 shrink-0" /> {ownerPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Moderation Status */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">3. Moderation Status & Internal Note</span>
                  <div className="flex items-center gap-2">
                    {currentProd.isHidden ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                        <EyeOff className="h-3 w-3" /> Hidden from Catalog
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        <Eye className="h-3 w-3" /> Active & Visible
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingReason(!isEditingReason);
                        setEditReasonInput(currentProd.hiddenReason || currentProd.adminNotes || '');
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
                    >
                      <Edit3 className="h-3 w-3" /> Edit Reason
                    </button>
                  </div>
                </div>

                {isEditingReason ? (
                  <div className="space-y-2 bg-white p-3 rounded-lg border border-neutral-300">
                    <label className="block text-[11px] font-bold text-neutral-800">Update Moderation Reason / Note:</label>
                    <textarea
                      value={editReasonInput}
                      onChange={(e) => setEditReasonInput(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 p-2 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingReason(false)}
                        className="px-2.5 py-1 font-bold text-neutral-600 text-xs hover:bg-neutral-100 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEditedReason}
                        className="px-3 py-1 font-bold text-white bg-neutral-900 text-xs rounded-md shadow-2xs hover:bg-neutral-800"
                      >
                        Save Reason
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] text-amber-800 font-bold uppercase">Hidden Reason</p>
                      <p className="font-semibold text-neutral-900 mt-0.5">{currentProd.hiddenReason || 'Policy & compliance review required.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-amber-800 font-bold uppercase">Restricted By Admin</p>
                      <p className="font-medium text-neutral-800 mt-0.5">{hiddenByAdmin}</p>
                      {currentProd.hiddenAt && (
                        <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{formatDate(currentProd.hiddenAt)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Appeal Information (if submitted) */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">4. Business Owner Appeal Submission</span>
                  <AppealStatusBadge status={currentProd.appealStatus || matchingAppeal?.status || 'pending'} />
                </div>

                {matchingAppeal ? (
                  <div className="space-y-2">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase">Submitted Appeal Statement</p>
                    <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200 text-neutral-800 leading-relaxed font-medium text-xs">
                      "{matchingAppeal.appealMessage}"
                    </div>

                    {matchingAppeal.attachments && matchingAppeal.attachments.length > 0 && (
                      <div className="pt-1">
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mb-1">Uploaded Evidence & Compliance Attachments</p>
                        <div className="flex flex-wrap gap-2">
                          {matchingAppeal.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Compliance Document #{idx + 1}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-neutral-500 italic text-[11px]">No formal appeal message submitted yet by the supplier.</p>
                )}
              </div>

              {/* 5. Complete Appeal Audit Trail & History */}
              {(() => {
                const historyTrail = matchingAppeal?.history && matchingAppeal.history.length > 0
                  ? matchingAppeal.history
                  : [
                      {
                        action: 'Product Hidden',
                        timestamp: currentProd.hiddenAt || currentProd.createdAt,
                        actor: hiddenByAdmin,
                        details: `Hidden reason: ${currentProd.hiddenReason || 'Compliance review'}`,
                      },
                      ...(matchingAppeal
                        ? [
                            {
                              action: 'Appeal Submitted',
                              timestamp: matchingAppeal.createdAt,
                              actor: ownerName,
                              details: matchingAppeal.appealMessage,
                            },
                          ]
                        : []),
                      ...(currentProd.appealStatus && currentProd.appealStatus !== 'pending'
                        ? [
                            {
                              action:
                                currentProd.appealStatus === 'approved'
                                  ? 'Appeal Approved & Product Restored'
                                  : currentProd.appealStatus === 'rejected'
                                  ? 'Appeal Rejected'
                                  : 'More Info Requested',
                              timestamp: currentProd.updatedAt,
                              actor: 'Compliance Operator (Admin)',
                              details: currentProd.adminNotes || 'Appeal reviewed.',
                            },
                          ]
                        : []),
                    ];

                return (
                  <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">5. Complete Moderation Audit Trail & Event Log</span>
                      <span className="text-[10px] font-mono text-neutral-500">{historyTrail.length} Logged Events</span>
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

              {/* 6. Admin Decision Response & Actions */}
              <div>
                <label className="block font-bold text-neutral-900 mb-1.5">Admin Operator Decision Notes / Response Message</label>
                <textarea
                  placeholder="Enter notes explaining your decision (required when rejecting an appeal)..."
                  value={decisionNote}
                  onChange={(e) => {
                    setDecisionNote(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  rows={3}
                />
                {errorMessage && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-rose-600">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setInspectedProduct(null);
                    setErrorMessage(null);
                    setDecisionNote('');
                  }}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!decisionNote.trim()) {
                      setErrorMessage('Please enter notes explaining what additional information is required.');
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
                    if (!decisionNote.trim()) {
                      setErrorMessage('A rejection reason is required before rejecting this appeal.');
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
      {confirmActionModal && inspectedProduct && (
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
                {confirmActionModal === 'reject' && decisionNote && (
                  <p className="text-xs font-medium mt-1.5 bg-white/80 p-2 rounded border border-rose-200">
                    <span className="font-bold block">Recorded Rejection Reason:</span> "{decisionNote}"
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
                onClick={() => handleResolveAppealInModal(confirmActionModal)}
                className={`rounded-xl px-5 py-2 font-bold text-white shadow-xs ${
                  confirmActionModal === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : confirmActionModal === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {confirmActionModal === 'approve'
                  ? 'Confirm & Restore Product'
                  : confirmActionModal === 'reject'
                  ? 'Confirm Rejection'
                  : 'Confirm Request'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Hide / Unhide Quick Confirmation Modal */}
      {hideReasonModalProduct && (
        <Modal
          isOpen={!!hideReasonModalProduct}
          onClose={() => setHideReasonModalProduct(null)}
          title={hideReasonModalProduct.isHidden ? 'Unhide Product' : 'Hide Product from Catalog'}
        >
          <div className="space-y-4 text-xs">
            <p className="text-neutral-600">
              {hideReasonModalProduct.isHidden
                ? `Restore visibility of "${hideReasonModalProduct.title}" to reseller catalogs.`
                : `Hiding "${hideReasonModalProduct.title}" will remove it from all reseller storefronts. Product details will remain untouched for the supplier.`}
            </p>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">Moderation / Internal Reason Note</label>
              <textarea
                value={hideReasonInput}
                onChange={(e) => setHideReasonInput(e.target.value)}
                placeholder="e.g. Policy Violation: Unverified trademark usage or image copyright issue..."
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setHideReasonModalProduct(null)}
                className="rounded-xl border border-neutral-200 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleHideConfirm}
                className={`rounded-xl px-4 py-2 font-bold text-white shadow-sm ${
                  hideReasonModalProduct.isHidden ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Confirm {hideReasonModalProduct.isHidden ? 'Unhide' : 'Hide'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
