import React from 'react';
import { Building2, UserX, User, Package, Users, Store } from 'lucide-react';
import { storage } from '../../lib/storage';
import { EmptyState } from '../common/EmptyState';
import { UnfollowConfirmModal } from '../common/UnfollowConfirmModal';
import { useFollow } from '../../hooks/useFollow';

interface FollowingListProps {
  onNavigate: (path: string, params?: any) => void;
}

export function FollowingList({ onNavigate }: FollowingListProps) {
  const users = storage.getUsers();
  const businesses = storage.getBusinesses();
  const {
    followingIds,
    handleToggleFollow,
    unfollowTarget,
    confirmUnfollow,
    cancelUnfollow,
    isProcessing,
    toastMessage,
  } = useFollow();

  const followedBusinesses = businesses.filter((b) => followingIds.has(b.id));

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-neutral-900">Followed Supplier Brands</h1>
        <p className="text-xs text-neutral-500">
          Stay connected with top brand owners. Receive instant notifications whenever followed brands release new products.
        </p>
      </div>

      {followedBusinesses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Not Following Any Brands Yet"
          description="Browse the supplier catalog to follow brand owners and get auto-notified of new releases."
          actionLabel="Explore Global Catalog"
          onAction={() => onNavigate('/reseller/library')}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {followedBusinesses.map((b) => {
            const productCount = storage.getProductsByBusinessId(b.id).filter((p) => p.status === 'active').length;
            const ownerUser = users.find((u) => u.id === b.ownerId);
            const ownerName = ownerUser ? ownerUser.name.split('(')[0].trim() : 'Business Owner';

            return (
              <div
                key={b.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xs transition-all hover:border-neutral-300 hover:shadow-sm"
              >
                <div>
                  {/* Banner */}
                  <div className="relative h-28 bg-neutral-900 overflow-hidden">
                    <img src={b.bannerUrl} alt={b.businessName} className="h-full w-full object-cover opacity-80" />
                    <div className="absolute top-3 right-3">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFollow(b, e)}
                        className="group/btn flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200/80 shadow-2xs backdrop-blur-xs hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all cursor-pointer"
                        title="Click to unfollow this business owner"
                      >
                        <UserX className="h-3.5 w-3.5 text-emerald-600 group-hover/btn:text-red-600 transition-colors" />
                        <span className="group-hover/btn:hidden">Following</span>
                        <span className="hidden group-hover/btn:inline">Unfollow</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.logoUrl}
                        alt={b.businessName}
                        className="h-12 w-12 rounded-xl object-cover border-2 border-white shadow-sm shrink-0 bg-white"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-neutral-900 truncate">{b.businessName}</h3>
                        <p className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1 truncate">
                          <User className="h-3 w-3 text-neutral-400 shrink-0" />
                          Owner: {ownerName}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{b.description}</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-50 p-2.5 text-xs">
                      <div className="flex items-center gap-1.5 text-neutral-700 font-medium">
                        <Package className="h-3.5 w-3.5 text-emerald-600" />
                        <span><strong className="font-bold text-neutral-900">{productCount}</strong> Products</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-700 font-medium">
                        <Users className="h-3.5 w-3.5 text-purple-600" />
                        <span><strong className="font-bold text-neutral-900">{b.followerCount}</strong> Followers</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => onNavigate(`/supplier/${b.id}`)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <Store className="h-3.5 w-3.5" />
                    Visit Store
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unfollow Confirmation Modal */}
      <UnfollowConfirmModal
        isOpen={!!unfollowTarget}
        onClose={cancelUnfollow}
        onConfirm={confirmUnfollow}
        business={unfollowTarget as any}
        isProcessing={isProcessing}
      />
    </div>
  );
}
