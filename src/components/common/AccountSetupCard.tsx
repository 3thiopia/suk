import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ArrowRight, Sparkles, ChevronRight, Building2, Store, User } from 'lucide-react';
import { storage } from '../../lib/storage';
import { UserRole } from '../../types';

interface AccountSetupCardProps {
  onNavigate: (path: string, params?: any) => void;
}

export function AccountSetupCard({ onNavigate }: AccountSetupCardProps) {
  const [, setUpdateTick] = useState(0);

  useEffect(() => {
    // Subscribe to real-time storage updates so that whenever profile, products, storefront,
    // or supplier follow status changes, this component recalculates instantly without page refresh.
    const unsubscribe = storage.subscribe(() => {
      setUpdateTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  const currentUser = storage.getCurrentUser();
  if (!currentUser) return null;

  const isBusinessOwner = currentUser.role === 'business_owner';
  const isReseller = currentUser.role === 'reseller';

  if (!isBusinessOwner && !isReseller) return null;

  let checklistItems: Array<{
    id: string;
    label: string;
    isCompleted: boolean;
    weight: number;
    actionText: string;
    actionPath: string;
    actionParams?: any;
  }> = [];

  if (isBusinessOwner) {
    const business = storage.getBusinessByOwnerId(currentUser.id);
    const products = business ? storage.getProductsByBusinessId(business.id) : [];

    const isLogoUploaded = Boolean(business?.logoUrl && !business.logoUrl.includes('photo-1618005182384'));
    const isBannerUploaded = Boolean(business?.bannerUrl && !business.bannerUrl.includes('photo-1526738549149'));
    const isDescriptionAdded = Boolean(
      business?.description &&
        business.description.trim().length > 20 &&
        !business.description.includes('Official Verified Brand Supplier')
    );
    const isProductAdded = products.length > 0;
    const isStoreCustomized = Boolean(
      business?.website || (business?.category && business.category !== 'General') || business?.phone
    );

    checklistItems = [
      {
        id: 'account_created',
        label: 'Account created',
        isCompleted: true,
        weight: 20,
        actionText: 'Completed',
        actionPath: '#',
      },
      {
        id: 'upload_logo',
        label: 'Upload business logo',
        isCompleted: isLogoUploaded,
        weight: 15,
        actionText: 'Upload Logo',
        actionPath: '/business/profile',
      },
      {
        id: 'upload_banner',
        label: 'Upload banner image',
        isCompleted: isBannerUploaded,
        weight: 15,
        actionText: 'Upload Banner',
        actionPath: '/business/profile',
      },
      {
        id: 'add_description',
        label: 'Add business description',
        isCompleted: isDescriptionAdded,
        weight: 15,
        actionText: 'Add Description',
        actionPath: '/business/profile',
      },
      {
        id: 'add_product',
        label: 'Add your first product',
        isCompleted: isProductAdded,
        weight: 20,
        actionText: 'Add Product',
        actionPath: '/business/products',
        actionParams: { action: 'new' },
      },
      {
        id: 'customize_storefront',
        label: 'Customize your storefront profile',
        isCompleted: isStoreCustomized,
        weight: 15,
        actionText: 'Customize',
        actionPath: '/business/profile',
      },
    ];
  } else {
    // Reseller
    const storefront = storage.getStorefrontByResellerId(currentUser.id);
    const storefrontProducts = storefront
      ? storage.getStorefrontProducts().filter((sp) => sp.storefrontId === storefront.id)
      : [];
    const following = storage.getFollowingByResellerId(currentUser.id);

    const isPhotoUploaded = Boolean(currentUser.avatarUrl && !currentUser.avatarUrl.includes('photo-1507003211169'));
    const isStoreCustomized = Boolean(
      storefront?.bannerTitle &&
        !storefront.bannerTitle.startsWith('Welcome to') &&
        storefront.themeColor
    );
    const isProductAdded = storefrontProducts.length > 0;
    const isSupplierFollowed = following.length > 0;

    checklistItems = [
      {
        id: 'account_created',
        label: 'Account created',
        isCompleted: true,
        weight: 20,
        actionText: 'Completed',
        actionPath: '#',
      },
      {
        id: 'upload_photo',
        label: 'Upload profile photo',
        isCompleted: isPhotoUploaded,
        weight: 20,
        actionText: 'Upload Photo',
        actionPath: '/reseller/settings',
      },
      {
        id: 'customize_store',
        label: 'Customize your storefront',
        isCompleted: isStoreCustomized,
        weight: 20,
        actionText: 'Customize Store',
        actionPath: '/reseller/store-customizer',
      },
      {
        id: 'add_product',
        label: 'Add your first product',
        isCompleted: isProductAdded,
        weight: 20,
        actionText: 'Browse Marketplace',
        actionPath: '/marketplace',
      },
      {
        id: 'follow_supplier',
        label: 'Follow your first supplier',
        isCompleted: isSupplierFollowed,
        weight: 20,
        actionText: 'Explore Suppliers',
        actionPath: '/marketplace',
      },
    ];
  }

  // Compute Total Progress Percentage
  const totalWeight = checklistItems.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = checklistItems
    .filter((item) => item.isCompleted)
    .reduce((sum, item) => sum + item.weight, 0);

  const percentage = Math.min(100, Math.round((completedWeight / totalWeight) * 100));
  const isAllComplete = percentage >= 100;

  // Hide the reminder completely once account reaches 100% completion
  if (isAllComplete) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs transition-all">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-extrabold text-neutral-900">Complete Your Account</h3>
          </div>
          <p className="text-xs text-neutral-500">
            Your account is <strong className="text-neutral-900 font-extrabold">{percentage}% complete</strong>. Finish setting up your account to unlock the best experience.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xl font-black text-emerald-600">{percentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-100 rounded-full h-2.5 mb-6 overflow-hidden">
        <div
          className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              item.isCompleted
                ? 'bg-neutral-50/80 border-neutral-200 text-neutral-500'
                : 'bg-white border-neutral-200 hover:border-emerald-500 hover:shadow-2xs text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {item.isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-neutral-300 shrink-0" />
              )}
              <span
                className={`text-xs font-medium truncate ${
                  item.isCompleted ? 'line-through text-neutral-400' : 'text-neutral-800'
                }`}
              >
                {item.label}
              </span>
            </div>

            {!item.isCompleted && (
              <button
                onClick={() => onNavigate(item.actionPath, item.actionParams)}
                className="ml-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
              >
                <span>{item.actionText}</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
