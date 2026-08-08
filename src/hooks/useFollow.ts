import React, { useState, useEffect, useCallback } from 'react';
import { storage } from '../lib/storage';
import { BusinessProfile } from '../types';

export function useFollow() {
  const currentUser = storage.getCurrentUser();
  const [followingIds, setFollowingIds] = useState<Set<string>>(() => {
    const list = storage.getFollowingByResellerId(currentUser?.id || '');
    return new Set(list.map((f) => f.businessId));
  });

  const [unfollowTarget, setUnfollowTarget] = useState<
    BusinessProfile | { id: string; businessName?: string; name?: string; logoUrl?: string; followerCount?: number } | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const syncFollows = useCallback(() => {
    const user = storage.getCurrentUser();
    if (user?.id) {
      const list = storage.getFollowingByResellerId(user.id);
      setFollowingIds(new Set(list.map((f) => f.businessId)));
    }
  }, []);

  useEffect(() => {
    syncFollows();
    const unsubscribe = storage.subscribe(() => {
      syncFollows();
    });
    return unsubscribe;
  }, [syncFollows]);

  const isFollowing = useCallback(
    (businessId: string) => followingIds.has(businessId),
    [followingIds]
  );

  const follow = useCallback(
    (businessId: string, businessName?: string) => {
      const user = storage.getCurrentUser();
      if (!user?.id || !businessId) return;
      setIsProcessing(true);
      storage.followBusiness(user.id, businessId);
      setIsProcessing(false);
      const name = businessName || storage.getBusinessById(businessId)?.businessName || 'Supplier';
      showToast(`Now following ${name}`);
    },
    [showToast]
  );

  const requestUnfollow = useCallback(
    (
      business: BusinessProfile | { id: string; businessName?: string; name?: string; logoUrl?: string; followerCount?: number }
    ) => {
      setUnfollowTarget(business);
    },
    []
  );

  const confirmUnfollow = useCallback(() => {
    const user = storage.getCurrentUser();
    if (!unfollowTarget || !user?.id) return;
    const targetId = unfollowTarget.id;
    const targetName =
      'businessName' in unfollowTarget && unfollowTarget.businessName
        ? unfollowTarget.businessName
        : (unfollowTarget as any).name || 'Supplier';

    setIsProcessing(true);
    storage.unfollowBusiness(user.id, targetId);
    setIsProcessing(false);
    setUnfollowTarget(null);
    showToast(`Unfollowed ${targetName}`);
  }, [unfollowTarget, showToast]);

  const cancelUnfollow = useCallback(() => {
    setUnfollowTarget(null);
  }, []);

  const handleToggleFollow = useCallback(
    (
      business:
        | BusinessProfile
        | { id: string; businessName?: string; name?: string; logoUrl?: string; followerCount?: number }
        | string,
      e?: React.MouseEvent
    ) => {
      if (e && e.stopPropagation) e.stopPropagation();
      const bId = typeof business === 'string' ? business : business.id;
      const bizObj = typeof business === 'string' ? storage.getBusinessById(business) : business;
      const bName = bizObj
        ? 'businessName' in bizObj && bizObj.businessName
          ? bizObj.businessName
          : (bizObj as any).name || 'Supplier'
        : 'Supplier';

      if (followingIds.has(bId)) {
        requestUnfollow(
          bizObj || {
            id: bId,
            businessName: bName,
          }
        );
      } else {
        follow(bId, bName);
      }
    },
    [followingIds, follow, requestUnfollow]
  );

  return {
    followingIds,
    isFollowing,
    follow,
    requestUnfollow,
    confirmUnfollow,
    cancelUnfollow,
    handleToggleFollow,
    unfollowTarget,
    isProcessing,
    toastMessage,
    showToast,
  };
}
