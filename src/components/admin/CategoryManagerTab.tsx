import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Tag,
  Eye,
  EyeOff,
  Search,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { CategoryWithSubcategories } from '../../data/categoriesData';
import { Modal } from '../common/Modal';

export function CategoryManagerTab() {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>(() =>
    storage.getCategoriesWithSubcategories()
  );
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithSubcategories | null>(null);

  const [activeParentCatId, setActiveParentCatId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);

  // Form State for Category Add/Edit
  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
    icon: 'FolderTree',
  });

  const refreshCategories = () => {
    setCategories(storage.getCategoriesWithSubcategories());
  };

  const products = storage.getProducts();

  const handleCreateCategory = () => {
    if (!catForm.name.trim()) return;
    storage.addCategory({
      name: catForm.name.trim(),
      description: catForm.description.trim(),
      icon: catForm.icon,
    });
    setCatForm({ name: '', description: '', icon: 'FolderTree' });
    setIsAddCatModalOpen(false);
    refreshCategories();
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !catForm.name.trim()) return;
    storage.updateCategory(editingCategory.id, {
      name: catForm.name.trim(),
      description: catForm.description.trim(),
      icon: catForm.icon,
    });
    setEditingCategory(null);
    setCatForm({ name: '', description: '', icon: 'FolderTree' });
    refreshCategories();
  };

  const handleToggleCategoryActive = (id: string) => {
    storage.toggleCategoryActive(id);
    refreshCategories();
  };

  const handleDeleteCategory = (id: string, name: string) => {
    const attachedCount = products.filter((p) => p.category === name).length;
    if (attachedCount > 0) {
      if (confirm(`Category "${name}" has ${attachedCount} active products. Deactivating it instead of deleting to protect catalog data.`)) {
        storage.toggleCategoryActive(id);
        refreshCategories();
      }
    } else {
      if (confirm(`Are you sure you want to remove category "${name}"?`)) {
        storage.deleteCategory(id);
        refreshCategories();
      }
    }
  };

  const handleAddSubcategory = () => {
    if (!activeParentCatId || !newSubName.trim()) return;
    storage.addSubcategory(activeParentCatId, newSubName.trim());
    setNewSubName('');
    setIsAddSubModalOpen(false);
    refreshCategories();
  };

  const handleToggleSubcategoryActive = (catId: string, subId: string, currentActive?: boolean) => {
    storage.updateSubcategory(catId, subId, { isActive: currentActive === false });
    refreshCategories();
  };

  const handleDeleteSubcategory = (catId: string, subId: string, subName: string) => {
    if (confirm(`Are you sure you want to remove subcategory "${subName}"?`)) {
      storage.deleteSubcategory(catId, subId);
      refreshCategories();
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase())) ||
    (c.subcategories && c.subcategories.some((s) => s.name.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Layers className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-neutral-900">Platform Taxonomy Management</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
            SUK platform-controlled category tree. Owners select categories from this standardized hierarchy. Admins manage top-level categories and subcategories here.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCatForm({ name: '', description: '', icon: 'FolderTree' });
              setIsAddCatModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search categories and subcategories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-neutral-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 shadow-2xs"
        />
      </div>

      {/* Category Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((cat) => {
          const productCount = products.filter((p) => p.category === cat.name).length;
          const isOther = cat.name === 'Other';

          return (
            <div
              key={cat.id}
              className={`rounded-2xl border transition-all ${
                cat.isActive === false
                  ? 'border-neutral-200 bg-neutral-50/70 opacity-75'
                  : 'border-neutral-200 bg-white shadow-2xs hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-neutral-100 flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-neutral-900 text-sm truncate">{cat.name}</span>
                    {cat.isActive === false && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Disabled
                      </span>
                    )}
                    {isOther && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                        Default Fallback
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-[11px] text-neutral-500 line-clamp-2">{cat.description}</p>
                  )}
                  <div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-neutral-400">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <Package className="h-3 w-3" /> {productCount} products
                    </span>
                    <span>• {cat.subcategories?.length || 0} subcategories</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleCategoryActive(cat.id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      cat.isActive === false
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                    }`}
                    title={cat.isActive === false ? 'Enable Category' : 'Disable Category'}
                  >
                    {cat.isActive === false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setCatForm({
                        name: cat.name,
                        description: cat.description || '',
                        icon: cat.icon || 'FolderTree',
                      });
                    }}
                    className="p-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {!isOther && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete / Disable Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategories Body */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Subcategories
                  </span>
                  <button
                    onClick={() => {
                      setActiveParentCatId(cat.id);
                      setNewSubName('');
                      setIsAddSubModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <Plus className="h-3 w-3" /> Add Subcategory
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.subcategories && cat.subcategories.length > 0 ? (
                    cat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className={`group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                          sub.isActive === false
                            ? 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through'
                            : 'bg-neutral-50 text-neutral-800 border-neutral-200/80 hover:bg-neutral-100'
                        }`}
                      >
                        <Tag className="h-3 w-3 text-neutral-400" />
                        <span>{sub.name}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-1">
                          <button
                            onClick={() => handleToggleSubcategoryActive(cat.id, sub.id, sub.isActive)}
                            className="text-neutral-400 hover:text-neutral-700"
                            title={sub.isActive === false ? 'Enable' : 'Disable'}
                          >
                            {sub.isActive === false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </button>
                          {sub.name !== 'General' && (
                            <button
                              onClick={() => handleDeleteSubcategory(cat.id, sub.id, sub.name)}
                              className="text-neutral-400 hover:text-red-600"
                              title="Delete Subcategory"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-400 italic">No subcategories created yet.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {(isAddCatModalOpen || editingCategory) && (
        <Modal
          isOpen={isAddCatModalOpen || !!editingCategory}
          onClose={() => {
            setIsAddCatModalOpen(false);
            setEditingCategory(null);
          }}
          title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">Category Title *</label>
              <input
                type="text"
                placeholder="e.g. Smart Wearables or Consumer Electronics"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Brief summary of items in this category"
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddCatModalOpen(false);
                  setEditingCategory(null);
                }}
                className="rounded-xl border border-neutral-200 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                className="rounded-xl bg-neutral-900 px-4 py-2 font-bold text-white shadow-sm hover:bg-neutral-800"
              >
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Subcategory Modal */}
      {isAddSubModalOpen && (
        <Modal
          isOpen={isAddSubModalOpen}
          onClose={() => setIsAddSubModalOpen(false)}
          title="Add Subcategory"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">Subcategory Name *</label>
              <input
                type="text"
                placeholder="e.g. Wireless Noise Canceling Headphones"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddSubModalOpen(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSubcategory}
                className="rounded-xl bg-neutral-900 px-4 py-2 font-bold text-white shadow-sm hover:bg-neutral-800"
              >
                Add Subcategory
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
