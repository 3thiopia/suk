import React, { useState } from 'react';
import { FolderPlus, Plus, Edit3, Trash2, Layers, Check } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Collection } from '../../types';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { SingleImageUploader } from '../common/SingleImageUploader';

export function CollectionManager() {
  const currentUser = storage.getCurrentUser();
  const storefront = storage.getStorefrontByResellerId(currentUser.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
  });

  if (!storefront) return null;

  const collections = storage.getCollections(storefront.id);
  const sProducts = storage.getStorefrontProductsWithDetails(storefront.id);

  const handleOpenCreate = () => {
    setEditingCollection(null);
    setFormData({ title: '', description: '', coverImage: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: Collection) => {
    setEditingCollection(col);
    setFormData({
      title: col.title,
      description: col.description,
      coverImage: col.coverImage || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCollection) {
      storage.updateCollection(editingCollection.id, formData);
    } else {
      storage.createCollection(storefront.id, formData.title, formData.description, formData.coverImage);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete collection "${title}"? Products in this collection will remain on your storefront.`)) {
      storage.deleteCollection(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Storefront Collection Manager</h1>
          <p className="text-xs text-neutral-500">
            Create custom collections (e.g. "Summer Collection", "Audiophile Favorites", "Trending") to group your storefront products.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          Create Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="No Collections Created"
          description="Grouping products into collections makes your storefront easier to browse for customers."
          actionLabel="Create First Collection"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => {
            const count = sProducts.filter((sp) => sp.collectionIds.includes(col.id)).length;

            return (
              <div
                key={col.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xs transition-all hover:border-neutral-300 hover:shadow-sm"
              >
                {col.coverImage ? (
                  <img src={col.coverImage} alt={col.title} className="h-32 w-full object-cover" />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-purple-50 text-purple-600 font-bold text-sm">
                    {col.title}
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900">{col.title}</h3>
                      <p className="text-[11px] text-neutral-500">{count} Products Assigned</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(col)}
                        className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(col.id, col.title)}
                        className="rounded p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{col.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Collection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCollection ? 'Edit Collection' : 'Create New Collection'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-800">Collection Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Summer Essentials"
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short description of items in this collection..."
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <SingleImageUploader
            value={formData.coverImage}
            onChange={(url) => setFormData({ ...formData, coverImage: url })}
            label="Collection Cover Image (Optional)"
            description="Upload cover banner artwork for this product collection."
            aspectRatio="3:2"
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-neutral-900 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-neutral-800"
            >
              Save Collection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
