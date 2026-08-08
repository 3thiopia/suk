import React, { useState } from 'react';
import { Layers, Eye, EyeOff, MoveUp, MoveDown, Trash2, Image as ImageIcon, Check, FolderPlus, Lock, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { storage } from '../../lib/storage';
import { StorefrontProduct, Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { getProductCommission } from '../../lib/commission';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { SingleImageUploader } from '../common/SingleImageUploader';

interface StorefrontProductsManagerProps {
  onNavigate: (path: string) => void;
}

export function StorefrontProductsManager({ onNavigate }: StorefrontProductsManagerProps) {
  const currentUser = storage.getCurrentUser();
  const storefront = storage.getStorefrontByResellerId(currentUser.id);

  const [activeItem, setActiveItem] = useState<StorefrontProduct | null>(null);

  // View Mode Switcher
  const [viewMode, setViewMode] = useState<'card' | 'table'>(() => {
    if (!currentUser) return 'card';
    const saved = localStorage.getItem(`sf_products_view_mode_${currentUser.id}`);
    if (saved === 'card' || saved === 'table') return saved;
    return 'card';
  });

  const handleSetViewMode = (mode: 'card' | 'table') => {
    setViewMode(mode);
    if (currentUser) {
      localStorage.setItem(`sf_products_view_mode_${currentUser.id}`, mode);
    }
  };

  if (!storefront) return null;

  const sProducts = storage.getStorefrontProductsWithDetails(storefront.id);
  const collections = storage.getCollections(storefront.id);

  const handleToggleVisibility = (sp: StorefrontProduct) => {
    storage.updateStorefrontProduct(sp.id, { isVisible: !sp.isVisible });
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sProducts.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;

    const currentSp = sProducts[index];
    const targetSp = sProducts[targetIdx];

    storage.updateStorefrontProduct(currentSp.id, { displayOrder: targetSp.displayOrder });
    storage.updateStorefrontProduct(targetSp.id, { displayOrder: currentSp.displayOrder });
  };

  const handleRemove = (sp: StorefrontProduct) => {
    if (confirm(`Remove "${sp.product?.title}" from your storefront?`)) {
      storage.removeProductFromStorefront(storefront.id, sp.productId);
    }
  };

  const handleSelectCoverImage = (spId: string, imgUrl: string) => {
    storage.updateStorefrontProduct(spId, { customCoverImage: imgUrl });
    if (activeItem) {
      setActiveItem({ ...activeItem, customCoverImage: imgUrl });
    }
  };

  const handleToggleCollection = (spId: string, colId: string, currentCols: string[]) => {
    const updated = currentCols.includes(colId)
      ? currentCols.filter((c) => c !== colId)
      : [...currentCols, colId];
    storage.updateStorefrontProduct(spId, { collectionIds: updated });
    if (activeItem) {
      setActiveItem({ ...activeItem, collectionIds: updated });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Storefront Items & Presentation Manager</h1>
          <p className="text-xs text-neutral-500">
            Control which cover photo displays first, reorder items, hide/show products, and organize into custom collections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle Switcher */}
          <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-1 shadow-2xs">
            <button
              onClick={() => handleSetViewMode('card')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'card'
                  ? 'bg-white text-neutral-900 shadow-2xs border border-neutral-200'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Card View</span>
            </button>
            <button
              onClick={() => handleSetViewMode('table')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-neutral-900 shadow-2xs border border-neutral-200'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table View</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('/reseller/library')}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-neutral-800"
          >
            Add More Products
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-blue-600 shrink-0" />
          <span>
            <strong>White-Label Enforcement:</strong> You cannot edit price, title, stock, or description. Only presentation settings.
          </span>
        </div>
        <button
          onClick={() => onNavigate('/reseller/collections')}
          className="font-bold text-blue-800 hover:underline shrink-0"
        >
          Manage Collections ({collections.length}) →
        </button>
      </div>

      {sProducts.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Products Linked to Storefront"
          description="Your storefront currently has 0 products linked. Browse the global supplier catalog to import items."
          actionLabel="Browse Supplier Catalog"
          onAction={() => onNavigate('/reseller/library')}
        />
      ) : viewMode === 'card' ? (
        /* CARD VIEW FOR RESELLER STOREFRONT MANAGER */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sProducts.map((sp, idx) => {
            const p = sp.product;
            if (!p) return null;

            const business = storage.getBusinessById(p.businessId);
            const comm = getProductCommission(p, business);
            const displayCover = sp.customCoverImage || p.images[0];
            const assignedCols = collections.filter((c) => sp.collectionIds.includes(c.id));

            return (
              <div
                key={sp.id}
                className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 bg-white ${
                  !sp.isVisible ? 'opacity-70 border-neutral-300' : 'border-neutral-200/90 shadow-2xs hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Image & Order Controls */}
                  <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-neutral-100">
                    <img src={displayCover} alt={p.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />

                    {sp.customCoverImage && (
                      <span className="absolute top-3 left-3 rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                        ★ Custom Cover
                      </span>
                    )}

                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-xl bg-white/90 backdrop-blur-md p-1 shadow-sm">
                      <button
                        onClick={() => handleMoveOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="rounded p-1 text-neutral-600 hover:bg-neutral-200 disabled:opacity-30"
                        title="Move Up"
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono text-xs font-extrabold text-neutral-800 px-1">{idx + 1}</span>
                      <button
                        onClick={() => handleMoveOrder(idx, 'down')}
                        disabled={idx === sProducts.length - 1}
                        className="rounded p-1 text-neutral-600 hover:bg-neutral-200 disabled:opacity-30"
                        title="Move Down"
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                      <span>{p.brand}</span>
                      <span className="rounded bg-neutral-100 px-2 py-0.5 font-bold text-[10px]">{p.category}</span>
                    </div>

                    <h3 className="font-bold text-neutral-900 text-sm leading-snug line-clamp-2">{p.title}</h3>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-base font-extrabold text-neutral-900">{formatCurrency(p.price)}</span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                        💰 {comm.formattedAmount}
                      </span>
                    </div>

                    {/* Assigned Collections */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {assignedCols.length === 0 ? (
                        <span className="text-[10px] text-neutral-400 italic">No collections assigned</span>
                      ) : (
                        assignedCols.map((c) => (
                          <span key={c.id} className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                            {c.title}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center justify-between border-t border-neutral-100 p-2.5 bg-neutral-50/50 rounded-b-2xl gap-2">
                  <button
                    onClick={() => handleToggleVisibility(sp)}
                    className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold ${
                      sp.isVisible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {sp.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    <span>{sp.isVisible ? 'Visible' : 'Hidden'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveItem(sp)}
                      className="rounded-xl border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 shadow-2xs"
                    >
                      Cover & Collections
                    </button>
                    <button
                      onClick={() => handleRemove(sp)}
                      className="rounded-xl p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                      title="Remove from Storefront"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Cover Photo & Product</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Your Commission</th>
                  <th className="py-3 px-4">Collections</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Presentation Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-800">
                {sProducts.map((sp, idx) => {
                  const p = sp.product;
                  if (!p) return null;

                  const business = storage.getBusinessById(p.businessId);
                  const comm = getProductCommission(p, business);
                  const displayCover = sp.customCoverImage || p.images[0];
                  const assignedCols = collections.filter((c) => sp.collectionIds.includes(c.id));

                  return (
                    <tr key={sp.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveOrder(idx, 'up')}
                            disabled={idx === 0}
                            className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-900 disabled:opacity-30"
                          >
                            <MoveUp className="h-3.5 w-3.5" />
                          </button>
                          <span className="font-mono text-xs font-bold text-neutral-700 w-4 text-center">{idx + 1}</span>
                          <button
                            onClick={() => handleMoveOrder(idx, 'down')}
                            disabled={idx === sProducts.length - 1}
                            className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-900 disabled:opacity-30"
                          >
                            <MoveDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img src={displayCover} alt={p.title} className="h-12 w-12 rounded-lg object-cover border" />
                            {sp.customCoverImage && (
                              <span
                                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white"
                                title="Custom Reseller Cover Selected"
                              >
                                ★
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900">{p.title}</p>
                            <p className="text-[10px] text-neutral-400">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-700">{p.brand}</td>
                      <td className="py-3 px-4 font-extrabold text-neutral-900">{formatCurrency(p.price)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                          💰 {comm.formattedAmount} <span className="text-[10px] text-emerald-600 font-medium">({comm.rateText})</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {assignedCols.length === 0 ? (
                            <span className="text-[11px] text-neutral-400 italic">Unassigned</span>
                          ) : (
                            assignedCols.map((c) => (
                              <span key={c.id} className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                                {c.title}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleVisibility(sp)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            sp.isVisible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {sp.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {sp.isVisible ? 'Visible' : 'Hidden'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveItem(sp)}
                            className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-bold text-neutral-700 hover:bg-neutral-100 shadow-2xs"
                          >
                            Cover & Collections
                          </button>
                          <button
                            onClick={() => handleRemove(sp)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                            title="Remove from Storefront"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Cover Image & Collections Modal */}
      {activeItem && activeItem.product && (
        <Modal
          isOpen={!!activeItem}
          onClose={() => setActiveItem(null)}
          title={`Presentation Settings: ${activeItem.product.title}`}
          subtitle="Choose which image appears as cover on your storefront & select collections."
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Pick Cover Image */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Select Cover Image (From Brand Gallery)
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {activeItem.product.images.map((imgUrl, idx) => {
                  const isSelected = (activeItem.customCoverImage || activeItem.product?.images[0]) === imgUrl;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectCoverImage(activeItem.id, imgUrl)}
                      className={`relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                        isSelected ? 'border-purple-600 ring-2 ring-purple-500' : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <img src={imgUrl} alt="Cover Option" className="h-28 w-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <SingleImageUploader
                  value={activeItem.customCoverImage || ''}
                  onChange={(dataUrl) => handleSelectCoverImage(activeItem.id, dataUrl)}
                  label="Or Upload Custom Cover Photo"
                  description="Upload a custom cover photo directly from your device or camera."
                  aspectRatio="4:3"
                />
              </div>
            </div>

            {/* Collections Assignment */}
            <div className="space-y-3 pt-3 border-t border-neutral-100">
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Assign to Storefront Collections
              </label>
              {collections.length === 0 ? (
                <p className="text-xs text-neutral-500">
                  No collections created yet. You can create collections under the Collection Manager menu.
                </p>
              ) : (
                <div className="space-y-2">
                  {collections.map((col) => {
                    const isChecked = activeItem.collectionIds.includes(col.id);
                    return (
                      <div
                        key={col.id}
                        onClick={() => handleToggleCollection(activeItem.id, col.id, activeItem.collectionIds)}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-colors ${
                          isChecked ? 'border-purple-300 bg-purple-50/70 text-purple-900 font-bold' : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <div>
                          <p>{col.title}</p>
                          <p className="text-[10px] text-neutral-500 font-normal">{col.description}</p>
                        </div>
                        {isChecked && <Check className="h-4 w-4 text-purple-700" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100">
              <button
                onClick={() => setActiveItem(null)}
                className="rounded-xl bg-neutral-900 px-6 py-2 text-xs font-bold text-white hover:bg-neutral-800"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
