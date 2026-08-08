import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, FolderTree } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Category } from '../../types';
import { Modal } from '../common/Modal';

export function CategoryManagerTab() {
  const [categories, setCategories] = useState<Category[]>(() => storage.getCategories());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState<string>('');

  const refreshCategories = () => {
    setCategories(storage.getCategories());
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    storage.addCategory({
      name: newCatName.trim(),
      slug: newCatName.trim().toLowerCase().replace(/\s+/g, '-'),
      parentId: newCatParent || undefined,
    });
    setNewCatName('');
    setNewCatParent('');
    setIsAddModalOpen(false);
    refreshCategories();
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category? Products assigned to it will retain their data.')) {
      storage.deleteCategory(id);
      refreshCategories();
    }
  };

  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Platform Taxonomy & Category Management</h2>
          <p className="text-xs text-neutral-500">
            Organize main marketplace product categories and sub-branches used across supplier catalogs and reseller storefronts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Category Branch
        </button>
      </div>

      {/* Category Tree Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rootCategories.map((root) => {
          const subCats = categories.filter((c) => c.parentId === root.id);

          return (
            <div key={root.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-bold text-neutral-900 text-sm">{root.name}</h3>
                </div>

                <button
                  onClick={() => handleDeleteCategory(root.id)}
                  className="rounded-lg p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Subcategories */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Subcategories ({subCats.length})</p>
                {subCats.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No subcategories attached.</p>
                ) : (
                  <div className="space-y-1.5">
                    {subCats.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2 text-xs">
                        <span className="font-semibold text-neutral-800">{sub.name}</span>
                        <button
                          onClick={() => handleDeleteCategory(sub.id)}
                          className="text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Platform Category">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">Category Title</label>
              <input
                type="text"
                placeholder="e.g. Smart Wearables or Outdoor Gear"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">Parent Category (Optional)</label>
              <select
                value={newCatParent}
                onChange={(e) => setNewCatParent(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none bg-white font-semibold text-neutral-700"
              >
                <option value="">None (Top-Level Category)</option>
                {rootCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="rounded-xl bg-neutral-900 px-4 py-2 font-bold text-white shadow-sm hover:bg-neutral-800"
              >
                Create Category
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
