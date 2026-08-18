import {
  generateUniqueSlug,
  getStorefrontFullDomain,
  normalizeSlug,
  resolveSlugWithAliasCheck,
} from './subdomain';
import {
  User,
  BusinessProfile,
  Product,
  Storefront,
  StorefrontProduct,
  Collection,
  Order,
  CommissionPayout,
  CreatorPayout,
  CreatorCommissionBalance,
  PayoutSummaryStats,
  CreatorPayoutStatus,
  PayoutPaymentMethod,
  Notification,
  Follower,
  Category,
  UserRole,
  OrderStatus,
  Dispute,
  ModerationReport,
  AuditLog,
  Announcement,
  PlatformSettings,
  OrderTimelineEvent,
  UserAccountStatus,
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketNote,
  AccountAppeal,
  ProductAppeal,
  AppealStatus,
  StorefrontSocialLink,
  OrderReport,
  OrderReportCategory,
  OrderReportStatus,
  OrderReportNote,
  OrderAuditLog,
  ProductReview,
  ReviewReply,
  ReviewReport,
  ReviewReportStatus,
  RatingStats,
  ReviewSortOption,
  PayoutBank,
  CreatorPayoutAccount,
  PayoutMethodType,
} from '../types';
import { OFFICIAL_ETHIOPIAN_BANKS } from '../data/ethiopianBanks';
import { generateInitialSocialLinks } from './socialPlatforms';
import { INITIAL_PLATFORM_CATEGORIES, normalizeCategoryName, CategoryWithSubcategories } from '../data/categoriesData';
import {
  initialUsers,
  initialBusinesses,
  initialProducts,
  initialStorefronts,
  initialCollections,
  initialStorefrontProducts,
  initialOrders,
  initialFollowers,
  initialNotifications,
  initialPayouts,
  initialCreatorPayouts,
  initialCreatorPayoutAccounts,
  initialCategories,
  initialDisputes,
  initialReports,
  initialAuditLogs,
  initialAnnouncements,
  initialPlatformSettings,
  initialTickets,
  initialAppeals,
  initialProductAppeals,
  initialOrderReports,
  initialReviews,
  initialReviewReports,
} from '../data/mockData';
import { generateId } from './utils';
import { supabaseDbService } from './supabase/database';
import { isSupabaseConfigured } from './supabase/client';
import { signInWithSupabase, signUpWithSupabase, signOutSupabase } from './supabase/auth';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'wl_current_user_id',
  IS_AUTHENTICATED: 'wl_is_authenticated',
  REMEMBERED_SIGNIN_INFO: 'wl_remembered_signin',
  USERS: 'wl_users',
  BUSINESSES: 'wl_businesses',
  PRODUCTS: 'wl_products',
  STOREFRONTS: 'wl_storefronts',
  COLLECTIONS: 'wl_collections',
  STOREFRONT_PRODUCTS: 'wl_storefront_products',
  ORDERS: 'wl_orders',
  PAYOUTS: 'wl_payouts',
  CREATOR_PAYOUTS: 'wl_creator_payouts',
  CREATOR_PAYOUT_ACCOUNTS: 'wl_creator_payout_accounts',
  PAYOUT_BANKS: 'wl_payout_banks',
  CREATOR_MIN_PAYOUT: 'wl_creator_min_payout',
  NOTIFICATIONS: 'wl_notifications',
  FOLLOWERS: 'wl_followers',
  CATEGORIES: 'wl_categories',
  DISPUTES: 'wl_disputes',
  REPORTS: 'wl_reports',
  AUDIT_LOGS: 'wl_audit_logs',
  ANNOUNCEMENTS: 'wl_announcements',
  PLATFORM_SETTINGS: 'wl_platform_settings',
  TICKETS: 'wl_tickets',
  APPEALS: 'wl_appeals',
  PRODUCT_APPEALS: 'wl_product_appeals',
  SOCIAL_LINKS: 'wl_social_links',
  ORDER_REPORTS: 'wl_order_reports',
  REVIEWS: 'wl_product_reviews',
  REVIEW_REPORTS: 'wl_review_reports',
};

type StorageListener = () => void;

class MarketplaceStorageService {
  private listeners: Set<StorageListener> = new Set();

  constructor() {
    this.initializeDefaultData();
    if (isSupabaseConfigured()) {
      this.syncWithSupabase();
    }
  }

  public async syncWithSupabase() {
    if (!isSupabaseConfigured()) return;
    try {
      const [
        remoteUsers,
        remoteBusinesses,
        remoteProducts,
        remoteStorefronts,
        remoteOrders,
        remoteStorefrontProducts,
        remoteCollections,
      ] = await Promise.all([
        supabaseDbService.getUsers(),
        supabaseDbService.getBusinesses(),
        supabaseDbService.getProducts(),
        supabaseDbService.getStorefronts(),
        supabaseDbService.getOrders(),
        supabaseDbService.getStorefrontProducts(),
        supabaseDbService.getCollections(),
      ]);

      if (remoteUsers.length > 0) this.setItem(STORAGE_KEYS.USERS, remoteUsers);
      if (remoteBusinesses.length > 0) this.setItem(STORAGE_KEYS.BUSINESSES, remoteBusinesses);
      if (remoteProducts.length > 0) this.setItem(STORAGE_KEYS.PRODUCTS, remoteProducts);
      if (remoteStorefronts.length > 0) this.setItem(STORAGE_KEYS.STOREFRONTS, remoteStorefronts);
      if (remoteOrders.length > 0) this.setItem(STORAGE_KEYS.ORDERS, remoteOrders);
      if (remoteStorefrontProducts.length > 0) this.setItem(STORAGE_KEYS.STOREFRONT_PRODUCTS, remoteStorefrontProducts);
      if (remoteCollections.length > 0) this.setItem(STORAGE_KEYS.COLLECTIONS, remoteCollections);
      this.notify();
    } catch (err) {
      console.warn('Supabase sync warning:', err);
    }
  }

  public subscribe(listener: StorageListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e: any) {
      console.warn('Quota limit reached on localStorage setItem, attempting pruning:', key, e);
      try {
        // Prune non-critical historical logs & notifications to free up space
        const keysToTrim = [
          STORAGE_KEYS.AUDIT_LOGS,
          STORAGE_KEYS.NOTIFICATIONS,
          STORAGE_KEYS.REPORTS,
          STORAGE_KEYS.DISPUTES,
          STORAGE_KEYS.TICKETS,
          STORAGE_KEYS.ORDER_REPORTS,
        ];
        keysToTrim.forEach((k) => {
          if (k !== key) {
            const raw = localStorage.getItem(k);
            if (raw) {
              try {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr) && arr.length > 5) {
                  localStorage.setItem(k, JSON.stringify(arr.slice(-5)));
                }
              } catch {
                localStorage.removeItem(k);
              }
            }
          }
        });

        // Retry setting target key
        localStorage.setItem(key, JSON.stringify(value));
        this.notify();
      } catch (retryErr) {
        console.error('Failed to save to localStorage after pruning:', retryErr);
        this.notify();
      }
    }
  }

  public initializeDefaultData(forceReset: boolean = false) {
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify('usr_biz_1'));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
      localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(initialBusinesses));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
      localStorage.setItem(STORAGE_KEYS.STOREFRONTS, JSON.stringify(initialStorefronts));
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(initialCollections));
      localStorage.setItem(STORAGE_KEYS.STOREFRONT_PRODUCTS, JSON.stringify(initialStorefrontProducts));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
      localStorage.setItem(STORAGE_KEYS.FOLLOWERS, JSON.stringify(initialFollowers));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
      localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(initialPayouts));
      localStorage.setItem(STORAGE_KEYS.CREATOR_PAYOUTS, JSON.stringify(initialCreatorPayouts));
      localStorage.setItem(STORAGE_KEYS.CREATOR_MIN_PAYOUT, JSON.stringify(1000));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
      localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(initialDisputes));
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(initialReports));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(initialAnnouncements));
      localStorage.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(initialPlatformSettings));
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(initialTickets));
      localStorage.setItem(STORAGE_KEYS.APPEALS, JSON.stringify(initialAppeals));
      localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(generateInitialSocialLinks('sf_usr_reseller_1')));
      localStorage.setItem(STORAGE_KEYS.ORDER_REPORTS, JSON.stringify(initialOrderReports));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(initialReviews));
      localStorage.setItem(STORAGE_KEYS.REVIEW_REPORTS, JSON.stringify(initialReviewReports));
      this.notify();
    } else {
      if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
        localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(initialTickets));
      }
      if (!localStorage.getItem(STORAGE_KEYS.APPEALS)) {
        localStorage.setItem(STORAGE_KEYS.APPEALS, JSON.stringify(initialAppeals));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SOCIAL_LINKS)) {
        localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(generateInitialSocialLinks('sf_usr_reseller_1')));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ORDER_REPORTS)) {
        localStorage.setItem(STORAGE_KEYS.ORDER_REPORTS, JSON.stringify(initialOrderReports));
      }
      if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(initialReviews));
      }
      if (!localStorage.getItem(STORAGE_KEYS.REVIEW_REPORTS)) {
        localStorage.setItem(STORAGE_KEYS.REVIEW_REPORTS, JSON.stringify(initialReviewReports));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CREATOR_PAYOUTS)) {
        localStorage.setItem(STORAGE_KEYS.CREATOR_PAYOUTS, JSON.stringify(initialCreatorPayouts));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CREATOR_MIN_PAYOUT)) {
        localStorage.setItem(STORAGE_KEYS.CREATOR_MIN_PAYOUT, JSON.stringify(1000));
      }
      // Ensure Ethiopian creator users, storefronts, collections, and products exist in local storage
      try {
        const storedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]') as User[];
        const missingUsers = initialUsers.filter((iu) => !storedUsers.some((su) => su.id === iu.id));
        if (missingUsers.length > 0) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([...storedUsers, ...missingUsers]));
        }

        const storedStorefronts = JSON.parse(localStorage.getItem(STORAGE_KEYS.STOREFRONTS) || '[]') as Storefront[];
        const missingStorefronts = initialStorefronts.filter((is) => !storedStorefronts.some((ss) => ss.id === is.id));
        if (missingStorefronts.length > 0) {
          localStorage.setItem(STORAGE_KEYS.STOREFRONTS, JSON.stringify([...storedStorefronts, ...missingStorefronts]));
        }

        const storedCollections = JSON.parse(localStorage.getItem(STORAGE_KEYS.COLLECTIONS) || '[]') as Collection[];
        const missingCollections = initialCollections.filter((ic) => !storedCollections.some((sc) => sc.id === ic.id));
        if (missingCollections.length > 0) {
          localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify([...storedCollections, ...missingCollections]));
        }

        const storedStorefrontProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.STOREFRONT_PRODUCTS) || '[]') as StorefrontProduct[];
        const missingStorefrontProducts = initialStorefrontProducts.filter((isp) => !storedStorefrontProducts.some((ssp) => ssp.id === isp.id));
        if (missingStorefrontProducts.length > 0) {
          localStorage.setItem(STORAGE_KEYS.STOREFRONT_PRODUCTS, JSON.stringify([...storedStorefrontProducts, ...missingStorefrontProducts]));
        }
      } catch (e) {
        console.error('Failed to sync initial entities', e);
      }
    }
  }

  // --- CURRENT USER / AUTH SIMULATION ---
  public isAuthenticated(): boolean {
    return localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
  }

  public login(userId: string) {
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    this.setCurrentUser(userId);
    const user = this.getUsers().find((u) => u.id === userId);
    if (user) {
      this.saveRememberedSignInInfo({
        email: user.email,
        phone: user.phone,
        name: user.name,
      });
    }
    this.notify();
  }

  public async logout() {
    try {
      await signOutSupabase();
    } catch {
      // Ignore Supabase network errors if offline
    }
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'false');
    this.notify();
  }

  public getRememberedSignInInfo(): { email?: string; phone?: string; name?: string } | null {
    return this.getItem<{ email?: string; phone?: string; name?: string } | null>(
      STORAGE_KEYS.REMEMBERED_SIGNIN_INFO,
      null
    );
  }

  public saveRememberedSignInInfo(info: { email?: string; phone?: string; name?: string }) {
    // Save non-sensitive identifiers only for sign-in prefill convenience - NEVER PASSWORDS
    this.setItem(STORAGE_KEYS.REMEMBERED_SIGNIN_INFO, {
      email: info.email || '',
      phone: info.phone || '',
      name: info.name || '',
    });
  }

  public clearRememberedSignInInfo() {
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_SIGNIN_INFO);
    this.notify();
  }

  public getCurrentUser(): User {
    const userId = this.getItem<string>(STORAGE_KEYS.CURRENT_USER_ID, 'usr_biz_1');
    const users = this.getUsers();
    return users.find((u) => u.id === userId) || users[0];
  }

  public setCurrentUser(userId: string) {
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  public setCurrentUserId(userId: string) {
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, initialUsers);
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt'> & { id?: string }): User {
    const users = this.getUsers();
    const newUser: User = {
      id: userData.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.status || 'active',
      createdAt: new Date().toISOString(),
      avatarUrl: userData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };
    this.setItem(STORAGE_KEYS.USERS, [newUser, ...users]);
    return newUser;
  }

  public updateUser(userId: string, updates: Partial<User>): User | undefined {
    const users = this.getUsers();
    let updatedUser: User | undefined;
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        updatedUser = { ...u, ...updates };
        return updatedUser;
      }
      return u;
    });
    this.setItem(STORAGE_KEYS.USERS, updatedUsers);
    return updatedUser;
  }

  public createBusiness(bizData: Partial<BusinessProfile> & { ownerId: string; businessName: string }): BusinessProfile {
    const businesses = this.getBusinesses();
    const newBiz: BusinessProfile = {
      id: bizData.id || `biz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ownerId: bizData.ownerId,
      businessName: bizData.businessName,
      slug: bizData.slug || bizData.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: bizData.category || 'General',
      logoUrl: bizData.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      bannerUrl: bizData.bannerUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80',
      description: bizData.description || 'Verified Supplier on TradeHub Platform',
      website: bizData.website || '',
      rating: bizData.rating || 5.0,
      followerCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.BUSINESSES, [newBiz, ...businesses]);
    return newBiz;
  }

  public createStorefront(sfData: Partial<Storefront> & { resellerId: string; storeName: string; slug: string }): Storefront {
    const storefronts = this.getStorefronts();
    const newSf: Storefront = {
      id: sfData.id || `sf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      resellerId: sfData.resellerId,
      storeName: sfData.storeName,
      slug: sfData.slug,
      logoUrl: sfData.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      bannerUrl: sfData.bannerUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80',
      bannerTitle: sfData.bannerTitle || `Welcome to ${sfData.storeName}`,
      bannerSubtitle: sfData.bannerSubtitle || 'Curated high quality products',
      themeColor: sfData.themeColor || 'emerald',
      layoutMode: sfData.layoutMode || 'grid',
      minPayoutThreshold: 50,
      totalEarnings: 0,
      pendingPayout: 0,
      totalOrdersCount: 0,
      createdAt: new Date().toISOString(),
      customization: sfData.customization,
    };
    this.setItem(STORAGE_KEYS.STOREFRONTS, [newSf, ...storefronts]);
    return newSf;
  }

  // --- CATEGORIES ---
  public getCategoriesWithSubcategories(): CategoryWithSubcategories[] {
    const data = this.getItem<CategoryWithSubcategories[]>(STORAGE_KEYS.CATEGORIES, INITIAL_PLATFORM_CATEGORIES);
    if (!data || data.length === 0 || !data[0].subcategories) {
      return INITIAL_PLATFORM_CATEGORIES;
    }
    return data;
  }

  public getCategories(): Category[] {
    return this.getCategoriesWithSubcategories();
  }

  // --- BUSINESS PROFILES ---
  public getBusinesses(): BusinessProfile[] {
    return this.getItem<BusinessProfile[]>(STORAGE_KEYS.BUSINESSES, initialBusinesses);
  }

  public getBusinessByOwnerId(ownerId: string): BusinessProfile | undefined {
    return this.getBusinesses().find((b) => b.ownerId === ownerId);
  }

  public getBusinessById(id: string): BusinessProfile | undefined {
    return this.getBusinesses().find((b) => b.id === id);
  }

  public updateBusinessProfile(id: string, updates: Partial<BusinessProfile>, skipNotification: boolean = false) {
    const businesses = this.getBusinesses();
    const updated = businesses.map((b) => {
      if (b.id === id) {
        return { ...b, ...updates };
      }
      return b;
    });
    this.setItem(STORAGE_KEYS.BUSINESSES, updated);

    // Create notification unless skipped
    if (!skipNotification) {
      const business = businesses.find((b) => b.id === id);
      if (business) {
        this.createNotification({
          userId: business.ownerId,
          userRole: 'business_owner',
          type: 'business_updated',
          title: 'Business Profile Updated',
          message: `Your business profile "${business.businessName}" was updated.`,
          link: '/business/profile',
        });
      }
    }
  }

  // --- PRODUCTS (BUSINESS OWNER EXCLUSIVE EDITING) ---
  public getProducts(): Product[] {
    const raw = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    return raw.map((p) => {
      const normCat = normalizeCategoryName(p.category);
      if (normCat !== p.category) {
        return { ...p, category: normCat };
      }
      return p;
    });
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  public getProductsByBusinessId(businessId: string): Product[] {
    return this.getProducts().filter((p) => p.businessId === businessId);
  }

  public createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: generateId('prod'),
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newProduct, ...products];
    this.setItem(STORAGE_KEYS.PRODUCTS, updated);

    // Notify followers
    const followers = this.getFollowersByBusinessId(productData.businessId);
    followers.forEach((f) => {
      this.createNotification({
        userId: f.resellerId,
        userRole: 'reseller',
        type: 'product_updated',
        title: 'New Product Available!',
        message: `${productData.businessName || 'A business you follow'} released a new product: "${newProduct.title}".`,
        link: '/reseller/library',
      });
    });

    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>) {
    const products = this.getProducts();
    const now = new Date().toISOString();
    let updatedProduct: Product | undefined;

    const updated = products.map((p) => {
      if (p.id === id) {
        updatedProduct = { ...p, ...updates, updatedAt: now };
        return updatedProduct;
      }
      return p;
    });

    this.setItem(STORAGE_KEYS.PRODUCTS, updated);

    // AUTOMATIC RESELLER SYNC:
    // Notify all resellers who have added this product to their storefront
    if (updatedProduct) {
      const storefrontProducts = this.getStorefrontProducts();
      const affectedStorefrontIds = new Set(
        storefrontProducts.filter((sp) => sp.productId === id).map((sp) => sp.storefrontId)
      );
      const storefronts = this.getStorefronts();

      affectedStorefrontIds.forEach((sId) => {
        const sf = storefronts.find((s) => s.id === sId);
        if (sf) {
          this.createNotification({
            userId: sf.resellerId,
            userRole: 'reseller',
            type: 'product_updated',
            title: 'Product Auto-Synced',
            message: `"${updatedProduct?.title}" was updated by ${updatedProduct?.businessName}. Changes are live on your storefront automatically.`,
            link: '/reseller/store-products',
          });
        }
      });
    }
  }

  public deleteProduct(id: string) {
    const products = this.getProducts().filter((p) => p.id !== id);
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // Clean up storefront references
    const storefrontProducts = this.getStorefrontProducts().filter((sp) => sp.productId !== id);
    this.setItem(STORAGE_KEYS.STOREFRONT_PRODUCTS, storefrontProducts);
  }

  // --- STOREFRONTS (RESELLER) ---
  public getStorefronts(): Storefront[] {
    return this.getItem<Storefront[]>(STORAGE_KEYS.STOREFRONTS, initialStorefronts);
  }

  /**
   * Universal storefront resolver that finds storefronts across:
   * 1. Exact ID match (sf_..., store_...)
   * 2. Direct slug match (e.g. techtrends, abebe-store)
   * 3. Creator/Reseller user ID match (usr_reseller_1, usr_creator_abebe)
   * 4. Previous/historical slug aliases
   * 5. Store custom domain / subdomain prefix match
   * 6. Case-insensitive slug / store name match
   */
  public getStorefront(identifier?: string | null): Storefront | undefined {
    if (!identifier) return undefined;
    const raw = identifier.trim();
    if (!raw) return undefined;
    const clean = normalizeSlug(raw);
    const storefronts = this.getStorefronts();

    // 1. Direct ID match
    let match = storefronts.find((s) => s.id === raw || (clean && s.id === clean));
    if (match) return match;

    // 2. Direct Slug match
    if (clean) {
      match = storefronts.find((s) => s.slug === clean || s.slug.toLowerCase() === clean.toLowerCase());
      if (match) return match;
    }

    // 3. Reseller / Creator User ID match
    match = storefronts.find((s) => s.resellerId === raw || (clean && s.resellerId === clean));
    if (match) return match;

    // 4. Historical slug aliases
    if (clean) {
      match = storefronts.find((s) => s.previousSlugs && s.previousSlugs.some((ps) => ps === clean || ps.toLowerCase() === clean.toLowerCase()));
      if (match) return match;
    }

    // 5. Store domain match (e.g. techtrends.mystore.et or techtrends)
    match = storefronts.find((s) => s.storeDomain && (
      s.storeDomain.toLowerCase() === raw.toLowerCase() ||
      s.storeDomain.toLowerCase().startsWith(raw.toLowerCase() + '.') ||
      (clean && s.storeDomain.toLowerCase().startsWith(clean.toLowerCase() + '.'))
    ));
    if (match) return match;

    // 6. Case-insensitive store name match
    match = storefronts.find((s) => s.storeName.toLowerCase() === raw.toLowerCase());
    if (match) return match;

    return undefined;
  }

  public getStorefrontById(id: string): Storefront | undefined {
    return this.getStorefront(id);
  }

  public getStorefrontBySlug(slug: string): Storefront | undefined {
    return this.getStorefront(slug);
  }

  public getStorefrontByResellerId(resellerId: string): Storefront {
    const storefronts = this.getStorefronts();
    let sf = storefronts.find((s) => s.resellerId === resellerId || s.id === resellerId);

    if (!sf) {
      const user = this.getUsers().find((u) => u.id === resellerId);
      const rawName = user ? user.name.split('(')[0].trim() : 'Creator';
      const storeName = `${rawName}'s Storefront`;
      const slug = generateUniqueSlug(storeName);
      const storeDomain = getStorefrontFullDomain(slug);

      sf = {
        id: `sf_${resellerId}`,
        resellerId: resellerId,
        storeName: storeName,
        slug: slug,
        storeDomain: storeDomain,
        previousSlugs: [],
        logoUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80',
        bannerTitle: storeName,
        bannerSubtitle: 'Hand-selected quality products curated with passion.',
        themeColor: 'emerald',
        layoutMode: 'grid',
        minPayoutThreshold: 1000.0,
        totalEarnings: 0,
        pendingPayout: 0,
        totalOrdersCount: 0,
        createdAt: new Date().toISOString(),
        status: 'active',
      };

      this.setItem(STORAGE_KEYS.STOREFRONTS, [...storefronts, sf]);

      // Automatically seed default storefront products so creator preview and catalog are never empty
      const availableProducts = this.getProducts().filter((p) => p.status === 'active' && !p.isHidden);
      if (availableProducts.length > 0) {
        const initialSps: StorefrontProduct[] = availableProducts.slice(0, 4).map((p, idx) => ({
          id: `stp_${sf!.id}_${p.id}`,
          storefrontId: sf!.id,
          productId: p.id,
          isVisible: true,
          displayOrder: idx + 1,
          customCoverImage: p.images?.[0],
          collectionIds: [],
          addedAt: new Date().toISOString(),
        }));
        const existingSps = this.getStorefrontProducts();
        this.setItem(STORAGE_KEYS.STOREFRONT_PRODUCTS, [...initialSps, ...existingSps]);
      }
    } else if (!sf.storeDomain) {
      // Backfill storeDomain if missing
      sf.storeDomain = getStorefrontFullDomain(sf.slug);
      this.updateStorefront(sf.id, { storeDomain: sf.storeDomain });
    }

    return sf;
  }

  public updateStorefront(id: string, updates: Partial<Storefront>) {
    const storefronts = this.getStorefronts();
    const updated = storefronts.map((s) => {
      if (s.id === id) {
        // Enforce min threshold constraint
        if (updates.minPayoutThreshold !== undefined && updates.minPayoutThreshold < 50) {
          updates.minPayoutThreshold = 50;
        }

        // If slug is changing, archive previous slug to historical aliases list
        let previousSlugs = s.previousSlugs || [];
        if (updates.slug && updates.slug !== s.slug) {
          const newSlug = normalizeSlug(updates.slug);
          if (s.slug && !previousSlugs.includes(s.slug)) {
            previousSlugs = [...previousSlugs, s.slug];
          }
          updates.slug = newSlug;
          updates.storeDomain = getStorefrontFullDomain(newSlug);
          updates.previousSlugs = previousSlugs;
        }

        return { ...s, ...updates };
      }
      return s;
    });
    this.setItem(STORAGE_KEYS.STOREFRONTS, updated);
  }

  // --- STOREFRONT PRODUCTS (RESELLER PRESENTATION ONLY) ---
  public getStorefrontProducts(): StorefrontProduct[] {
    return this.getItem<StorefrontProduct[]>(STORAGE_KEYS.STOREFRONT_PRODUCTS, initialStorefrontProducts);
  }

  public getStorefrontProductsWithDetails(storefrontId: string): StorefrontProduct[] {
    const sProducts = this.getStorefrontProducts().filter((sp) => sp.storefrontId === storefrontId);
    const allProducts = this.getProducts().filter((p) => p.status === 'active' && !p.isHidden);

    if (sProducts.length > 0) {
      const detailed = sProducts
        .map((sp) => {
          const product = allProducts.find((p) => p.id === sp.productId);
          return {
            ...sp,
            product,
          };
        })
        .filter((sp) => sp.product !== undefined && !sp.product.isHidden)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      if (detailed.length > 0) return detailed;
    }

    // Fallback: If storefront has no explicit items assigned yet, surface curated active products
    return allProducts.slice(0, 8).map((p, idx) => ({
      id: `stp_curated_${storefrontId}_${p.id}`,
      storefrontId,
      productId: p.id,
      isVisible: true,
      displayOrder: idx + 1,
      customCoverImage: p.images?.[0],
      collectionIds: [],
      addedAt: new Date().toISOString(),
      product: p,
    }));
  }

  public addProductToStorefront(storefrontId: string, productId: string): StorefrontProduct {
    const sProducts = this.getStorefrontProducts();
    const existing = sProducts.find((sp) => sp.storefrontId === storefrontId && sp.productId === productId);
    if (existing) return existing;

    const count = sProducts.filter((sp) => sp.storefrontId === storefrontId).length;
    const newSp: StorefrontProduct = {
      id: generateId('stp'),
      storefrontId,
      productId,
      isVisible: true,
      displayOrder: count + 1,
      collectionIds: [],
      addedAt: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.STOREFRONT_PRODUCTS, [newSp, ...sProducts]);
    return newSp;
  }

  public removeProductFromStorefront(storefrontId: string, productId: string) {
    const sProducts = this.getStorefrontProducts().filter(
      (sp) => !(sp.storefrontId === storefrontId && sp.productId === productId)
    );
    this.setItem(STORAGE_KEYS.STOREFRONT_PRODUCTS, sProducts);
  }

  public updateStorefrontProduct(id: string, updates: Partial<StorefrontProduct>) {
    const sProducts = this.getStorefrontProducts();
    const updated = sProducts.map((sp) => {
      if (sp.id === id) {
        return { ...sp, ...updates };
      }
      return sp;
    });
    this.setItem(STORAGE_KEYS.STOREFRONT_PRODUCTS, updated);
  }

  // --- COLLECTIONS ---
  public getCollections(storefrontId: string): Collection[] {
    return this.getItem<Collection[]>(STORAGE_KEYS.COLLECTIONS, initialCollections).filter(
      (c) => c.storefrontId === storefrontId
    );
  }

  public createCollection(storefrontId: string, title: string, description: string, coverImage?: string): Collection {
    const collections = this.getItem<Collection[]>(STORAGE_KEYS.COLLECTIONS, initialCollections);
    const newCol: Collection = {
      id: generateId('col'),
      storefrontId,
      title,
      slug: title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'),
      description,
      coverImage,
      createdAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.COLLECTIONS, [newCol, ...collections]);
    return newCol;
  }

  public updateCollection(id: string, updates: Partial<Collection>) {
    const collections = this.getItem<Collection[]>(STORAGE_KEYS.COLLECTIONS, initialCollections);
    const updated = collections.map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.setItem(STORAGE_KEYS.COLLECTIONS, updated);
  }

  public deleteCollection(id: string) {
    const collections = this.getItem<Collection[]>(STORAGE_KEYS.COLLECTIONS, initialCollections).filter(
      (c) => c.id !== id
    );
    this.setItem(STORAGE_KEYS.COLLECTIONS, collections);

    // Remove collection ID from storefront products
    const sProducts = this.getStorefrontProducts().map((sp) => ({
      ...sp,
      collectionIds: sp.collectionIds.filter((cId) => cId !== id),
    }));
    this.setItem(STORAGE_KEYS.STOREFRONT_PRODUCTS, sProducts);
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    return this.getItem<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
  }

  public getOrdersByStorefront(storefrontId: string): Order[] {
    return this.getOrders().filter((o) => o.storefrontId === storefrontId);
  }

  public getOrdersByBusinessOwner(businessId: string): Order[] {
    return this.getOrders().filter((o) => o.items.some((item) => item.businessId === businessId));
  }

  public placeOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Order {
    const orders = this.getOrders();
    const now = new Date().toISOString();

    const storefront = this.getStorefronts().find((s) => s.id === orderData.storefrontId);

    const newOrder: Order = {
      ...orderData,
      id: `ord_${Math.floor(1000 + Math.random() * 9000)}`,
      storefrontName: storefront?.storeName || 'Storefront',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    this.setItem(STORAGE_KEYS.ORDERS, [newOrder, ...orders]);

    // Update product stock
    const products = this.getProducts();
    orderData.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const newStock = Math.max(0, prod.stock - item.quantity);
        this.updateProduct(prod.id, {
          stock: newStock,
          status: newStock === 0 ? 'out_of_stock' : prod.status,
        });
      }
    });

    // Update storefront stats (Do NOT add to totalEarnings or pendingPayout yet; commissions are pending until delivered)
    if (storefront) {
      this.updateStorefront(storefront.id, {
        totalOrdersCount: storefront.totalOrdersCount + 1,
      });

      // Notify Creator of new pending order without indicating premature earnings
      this.createNotification({
        userId: storefront.resellerId,
        userRole: 'reseller',
        type: 'new_order',
        title: 'New Storefront Order Received',
        message: `Order #${newOrder.id} placed for $${newOrder.totalAmount.toFixed(2)}. Status is currently Pending owner fulfillment.`,
        link: '/reseller/orders',
      });
    }

    // Notify Business Owners involved
    const businessIds = Array.from(new Set(newOrder.items.map((i) => i.businessId)));
    const businesses = this.getBusinesses();

    businessIds.forEach((bId) => {
      const biz = businesses.find((b) => b.id === bId);
      if (biz) {
        this.createNotification({
          userId: biz.ownerId,
          userRole: 'business_owner',
          type: 'new_order',
          title: 'New Customer Order Received',
          message: `Order #${newOrder.id} placed on ${newOrder.storefrontName} requires your fulfillment approval.`,
          link: '/business/orders',
        });
      }
    });

    // Notify Admin
    this.createNotification({
      userId: 'usr_admin',
      userRole: 'admin',
      type: 'new_order',
      title: 'Platform Order Created',
      message: `Order #${newOrder.id} ($${newOrder.totalAmount.toFixed(2)}) placed on ${newOrder.storefrontName}.`,
      link: '/admin',
    });

    return newOrder;
  }

  // ORDER STATUS UPDATE (BUSINESS OWNER ONLY PERMISSION WITH LOCK RULES)
  public updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    updatedByUserId: string,
    isAdminOverride: boolean = false,
    rejectionReason?: string
  ) {
    const orders = this.getOrders();
    const now = new Date().toISOString();
    let updatedOrder: Order | undefined;
    const users = this.getUsers();
    const updatingUser = users.find((u) => u.id === updatedByUserId) || this.getCurrentUser();

    let shouldCreditCommission = false;

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        // Business rule: Once an order is marked Delivered, the business owner cannot revert or modify the order status.
        if ((o.status === 'delivered' || o.isDeliveredLocked) && !isAdminOverride && updatingUser?.role === 'business_owner') {
          throw new Error('Order is already marked as Delivered and locked. Status cannot be modified through the business dashboard.');
        }

        const wasPreviouslyEarned = o.status === 'delivered' || o.status === 'completed' || o.commissionEligibleForPayout;
        const isDeliveringNow = status === 'delivered' || status === 'completed';
        const isRejectingNow = status === 'rejected';
        const isCancelledNow = status === 'cancelled';

        // Only credit commission if transitioning into delivered/completed for the first time
        if (isDeliveringNow && !wasPreviouslyEarned) {
          shouldCreditCommission = true;
        }

        const existingLogs: OrderAuditLog[] = o.auditLogs || [];
        const newLog: OrderAuditLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          action: `ORDER_${status.toUpperCase()}`,
          timestamp: now,
          actorId: updatedByUserId,
          actorName: updatingUser?.name || 'Business Owner',
          actorRole: updatingUser?.role || 'business_owner',
          details: isRejectingNow
            ? rejectionReason?.trim()
              ? `Order rejected. Reason: ${rejectionReason.trim()}`
              : 'Order rejected without reason specified.'
            : isCancelledNow
            ? `Order cancelled.`
            : `Order status updated to ${status}.`,
          rejectionReason: isRejectingNow ? (rejectionReason?.trim() || undefined) : undefined,
        };

        updatedOrder = {
          ...o,
          status,
          updatedAt: now,
          ...(isDeliveringNow ? {
            deliveredAt: o.deliveredAt || now,
            commissionEligibleForPayout: true,
            isDeliveredLocked: true,
          } : {}),
          ...((isRejectingNow || isCancelledNow) ? {
            commissionEligibleForPayout: false,
            ...(isRejectingNow ? {
              rejectedAt: now,
              rejectedBy: updatedByUserId,
              rejectedByName: updatingUser?.name || 'Business Owner',
              rejectionReason: rejectionReason?.trim() || '',
            } : {}),
          } : {}),
          auditLogs: [newLog, ...existingLogs],
        };
        return updatedOrder;
      }
      return o;
    });

    this.setItem(STORAGE_KEYS.ORDERS, updated);

    if (updatedOrder) {
      const storefront = this.getStorefronts().find((s) => s.id === updatedOrder?.storefrontId);
      if (storefront) {
        // If order transitioned to delivered/completed status for the first time, credit storefront totalEarnings and pendingPayout
        if (shouldCreditCommission) {
          this.updateStorefront(storefront.id, {
            totalEarnings: (storefront.totalEarnings || 0) + (updatedOrder.resellerCommission || 0),
            pendingPayout: (storefront.pendingPayout || 0) + (updatedOrder.resellerCommission || 0),
          });
        }

        const statusMapTitle: Record<string, string> = {
          accepted: 'Order Accepted by Brand',
          rejected: 'Order Rejected by Brand',
          shipped: 'Order Shipped!',
          delivered: 'Order Delivered & Commission Earned',
          completed: 'Order Completed & Commission Earned',
          cancelled: 'Order Cancelled',
        };

        const notifType: any =
          status === 'accepted'
            ? 'order_accepted'
            : status === 'rejected'
            ? 'order_rejected'
            : status === 'shipped'
            ? 'order_shipped'
            : (status === 'delivered' || status === 'completed')
            ? 'commission_earned'
            : 'new_order';

        const resellerMsg = (status === 'delivered' || status === 'completed')
          ? `Order #${updatedOrder.id} has been delivered! Your commission of $${updatedOrder.resellerCommission.toFixed(2)} is now officially earned and added to your unpaid balance.`
          : status === 'rejected'
          ? `Order #${updatedOrder.id} was rejected by the brand owner${updatedOrder.rejectionReason ? ` (Reason: "${updatedOrder.rejectionReason}")` : ''}.`
          : `Order #${updatedOrder.id} status changed to ${status.toUpperCase()}.`;

        this.createNotification({
          userId: storefront.resellerId,
          userRole: 'reseller',
          type: notifType,
          title: statusMapTitle[status] || `Order ${status}`,
          message: resellerMsg,
          link: '/reseller/orders',
        });
      }

      // Notify Admin for rejection or delivery tracking
      if (status === 'rejected') {
        this.createNotification({
          userId: 'usr_admin',
          userRole: 'admin',
          type: 'order_rejected' as any,
          title: `Order #${updatedOrder.id} Rejected`,
          message: `Order #${updatedOrder.id} was rejected by ${updatedOrder.rejectedByName || 'brand owner'}${updatedOrder.rejectionReason ? `. Reason: "${updatedOrder.rejectionReason}"` : '.'}`,
          link: '/admin/orders',
        });

        this.logAdminAction(
          'ORDER_REJECTED',
          'order',
          updatedOrder.id,
          `Order #${updatedOrder.id} rejected by ${updatedOrder.rejectedByName || 'brand owner'}. Reason: ${updatedOrder.rejectionReason || 'None specified'}`
        );
      }

      if (status === 'delivered') {
        this.createNotification({
          userId: 'usr_admin',
          userRole: 'admin',
          type: 'order_delivered',
          title: `Order #${updatedOrder.id} Delivered (Commission Eligible)`,
          message: `Order #${updatedOrder.id} marked as delivered by brand. Reseller commission ($${updatedOrder.resellerCommission.toFixed(2)}) is recorded and eligible for monthly payout.`,
          link: '/admin/orders',
        });

        this.logAdminAction(
          'ORDER_DELIVERED',
          'order',
          updatedOrder.id,
          `Order #${updatedOrder.id} marked as delivered. Reseller commission ($${updatedOrder.resellerCommission.toFixed(2)}) flagged as eligible for monthly payout.`
        );
      }
    }
  }

  // --- STOREFRONT SOCIAL LINKS ---
  public getAllSocialLinks(): StorefrontSocialLink[] {
    return this.getItem<StorefrontSocialLink[]>(
      STORAGE_KEYS.SOCIAL_LINKS,
      generateInitialSocialLinks('sf_usr_reseller_1')
    );
  }

  public getStorefrontSocialLinks(storefrontId: string): StorefrontSocialLink[] {
    const links = this.getAllSocialLinks().filter((l) => l.storefrontId === storefrontId);
    if (links.length === 0 && storefrontId === 'sf_usr_reseller_1') {
      const initial = generateInitialSocialLinks(storefrontId);
      this.setItem(STORAGE_KEYS.SOCIAL_LINKS, [...this.getAllSocialLinks(), ...initial]);
      return initial;
    }
    return links.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addSocialLink(storefrontId: string, platform: string, url: string): StorefrontSocialLink {
    const allLinks = this.getAllSocialLinks();
    const storefrontLinks = allLinks.filter((l) => l.storefrontId === storefrontId);
    const maxOrder = storefrontLinks.reduce((max, l) => Math.max(max, l.displayOrder || 0), 0);
    const now = new Date().toISOString();

    const newLink: StorefrontSocialLink = {
      id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      storefrontId,
      platform,
      url: url.trim(),
      isVisible: true,
      displayOrder: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    };

    this.setItem(STORAGE_KEYS.SOCIAL_LINKS, [...allLinks, newLink]);
    return newLink;
  }

  public updateSocialLink(id: string, updates: Partial<StorefrontSocialLink>) {
    const allLinks = this.getAllSocialLinks();
    const updated = allLinks.map((l) => {
      if (l.id === id) {
        return {
          ...l,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });
    this.setItem(STORAGE_KEYS.SOCIAL_LINKS, updated);
  }

  public removeSocialLink(id: string) {
    const allLinks = this.getAllSocialLinks();
    const filtered = allLinks.filter((l) => l.id !== id);
    this.setItem(STORAGE_KEYS.SOCIAL_LINKS, filtered);
  }

  public toggleSocialLinkVisibility(id: string): boolean {
    const allLinks = this.getAllSocialLinks();
    let newVisibility = false;
    const updated = allLinks.map((l) => {
      if (l.id === id) {
        newVisibility = !l.isVisible;
        return {
          ...l,
          isVisible: newVisibility,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });
    this.setItem(STORAGE_KEYS.SOCIAL_LINKS, updated);
    return newVisibility;
  }

  public reorderSocialLinks(storefrontId: string, orderedIds: string[]) {
    const allLinks = this.getAllSocialLinks();
    const updated = allLinks.map((l) => {
      if (l.storefrontId === storefrontId) {
        const newIndex = orderedIds.indexOf(l.id);
        if (newIndex !== -1) {
          return {
            ...l,
            displayOrder: newIndex + 1,
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return l;
    });
    this.setItem(STORAGE_KEYS.SOCIAL_LINKS, updated);
  }

  // --- COMMISSIONS & PAYOUTS ---
  public getPayouts(): CommissionPayout[] {
    return this.getItem<CommissionPayout[]>(STORAGE_KEYS.PAYOUTS, initialPayouts);
  }

  public getPayoutsByReseller(resellerId: string): CommissionPayout[] {
    return this.getPayouts().filter((p) => p.resellerId === resellerId);
  }

  public triggerMonthlyPayoutsBatch(): number {
    const storefronts = this.getStorefronts();
    const payouts = this.getPayouts();
    const now = new Date().toISOString();
    let generatedCount = 0;

    const updatedStorefronts = storefronts.map((sf) => {
      if (sf.pendingPayout >= sf.minPayoutThreshold && sf.pendingPayout > 0) {
        const newPayout: CommissionPayout = {
          id: generateId('pay'),
          resellerId: sf.resellerId,
          storefrontId: sf.id,
          storefrontName: sf.storeName,
          amount: sf.pendingPayout,
          status: 'processed',
          payoutDate: now,
          periodStart: '2025-03-01',
          periodEnd: '2025-03-31',
          createdAt: now,
        };

        payouts.unshift(newPayout);
        generatedCount++;

        this.createNotification({
          userId: sf.resellerId,
          userRole: 'reseller',
          type: 'monthly_payout',
          title: 'Monthly Payout Processed!',
          message: `Your monthly commission payout of $${sf.pendingPayout.toFixed(2)} has been transferred.`,
          link: '/reseller/commissions',
        });

        return {
          ...sf,
          pendingPayout: 0,
        };
      }
      return sf;
    });

    this.setItem(STORAGE_KEYS.STOREFRONTS, updatedStorefronts);
    this.setItem(STORAGE_KEYS.PAYOUTS, payouts);
    return generatedCount;
  }

  // --- MANUAL CREATOR COMMISSION PAYOUT SYSTEM ---
  public getMinPayoutAmount(): number {
    const raw = this.getItem<number | null>(STORAGE_KEYS.CREATOR_MIN_PAYOUT, null);
    if (raw !== null && typeof raw === 'number' && raw >= 0) {
      return raw;
    }
    const settings = this.getPlatformSettings();
    return settings.minPayoutAmount || 1000;
  }

  public setMinPayoutAmount(amount: number): void {
    const cleanAmount = Math.max(0, Number(amount) || 1000);
    this.setItem(STORAGE_KEYS.CREATOR_MIN_PAYOUT, cleanAmount);
    this.updatePlatformSettings({ minPayoutAmount: cleanAmount });
    this.logAdminAction(
      'UPDATE_MIN_PAYOUT',
      'platform_settings',
      'min_payout',
      `Admin updated platform minimum payout amount to ${cleanAmount.toLocaleString()} ETB.`
    );
    this.notify();
  }

  public getCreatorPayouts(): CreatorPayout[] {
    const payouts = this.getItem<CreatorPayout[]>(STORAGE_KEYS.CREATOR_PAYOUTS, initialCreatorPayouts);
    return [...payouts].sort(
      (a, b) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime()
    );
  }

  public getCreatorPayoutsByCreatorId(creatorId: string): CreatorPayout[] {
    return this.getCreatorPayouts().filter((p) => p.creatorId === creatorId || p.storefrontId === creatorId);
  }

  public getCreatorCommissionBalances(minPayoutOverride?: number): CreatorCommissionBalance[] {
    const users = this.getUsers().filter((u) => u.role === 'reseller' || (u.role as string) === 'creator');
    const storefronts = this.getStorefronts();
    const allOrders = this.getOrders();
    const allPayouts = this.getCreatorPayouts();
    const platformMinPayout =
      minPayoutOverride !== undefined && minPayoutOverride >= 0
        ? minPayoutOverride
        : this.getMinPayoutAmount();

    return users.map((user) => {
      const storefront =
        storefronts.find((s) => s.resellerId === user.id) ||
        this.getStorefrontByResellerId(user.id);

      // Orders that contribute to commission (delivered, completed, or explicitly marked eligible)
      const creatorOrders = allOrders.filter((o) => {
        const isStore =
          o.storefrontId === storefront?.id ||
          o.storefrontId === `sf_${user.id}` ||
          o.storefrontId === user.id;
        return isStore;
      });

      const eligibleOrders = creatorOrders.filter(
        (o) => o.status === 'delivered' || o.status === 'completed' || o.commissionEligibleForPayout
      );

      const ordersTotalCommission = eligibleOrders.reduce(
        (sum, o) => sum + (Number(o.resellerCommission) || 0),
        0
      );

      // Total commission earned: based strictly on delivered/completed eligible orders
      const totalCommissionEarned = ordersTotalCommission;

      // Creator's recorded manual payouts
      const creatorPayouts = allPayouts.filter(
        (p) => p.creatorId === user.id || (storefront && p.storefrontId === storefront.id)
      );

      const alreadyPaid = creatorPayouts.reduce(
        (sum, p) => sum + (Number(p.amount) || 0),
        0
      );

      const unpaidCommission = Math.max(0, totalCommissionEarned - alreadyPaid);
      const minPayout = platformMinPayout;

      let status: CreatorPayoutStatus = 'not_eligible';
      if (unpaidCommission >= minPayout && unpaidCommission > 0) {
        status = 'eligible';
      } else if (unpaidCommission === 0 && alreadyPaid > 0) {
        status = 'paid';
      } else {
        status = 'not_eligible';
      }

      const lastPayout = creatorPayouts[0];
      const payoutAccount = this.getCreatorPayoutAccount(user.id);

      const cleanCreatorName = user.name.includes('(')
        ? user.name.split('(')[0].trim()
        : user.name;

      return {
        creatorId: user.id,
        creatorName: cleanCreatorName,
        creatorEmail: user.email,
        creatorPhone: user.phone || '+251 91 123 4567',
        avatarUrl: user.avatarUrl,
        storefrontId: storefront?.id || `sf_${user.id}`,
        storefrontName: storefront?.storeName || `${cleanCreatorName}'s Store`,
        storefrontSlug: storefront?.slug,
        logoUrl: storefront?.logoUrl,
        totalCommissionEarned,
        alreadyPaid,
        unpaidCommission,
        minPayoutAmount: minPayout,
        status,
        eligibleOrdersCount: eligibleOrders.length,
        payoutsCount: creatorPayouts.length,
        lastPayoutDate: lastPayout?.paidAt,
        lastPayoutMethod: lastPayout?.paymentMethod,
        lastPayoutReference: lastPayout?.transactionReference,
        payoutAccount,
      };
    });
  }

  public getCreatorCommissionBalanceById(creatorId: string): CreatorCommissionBalance | null {
    const balances = this.getCreatorCommissionBalances();
    return (
      balances.find(
        (b) => b.creatorId === creatorId || b.storefrontId === creatorId
      ) || null
    );
  }

  public getPayoutSummaryStats(minPayoutOverride?: number): PayoutSummaryStats {
    const balances = this.getCreatorCommissionBalances(minPayoutOverride);
    const payouts = this.getCreatorPayouts();
    const minPayoutAmount =
      minPayoutOverride !== undefined && minPayoutOverride >= 0
        ? minPayoutOverride
        : this.getMinPayoutAmount();

    const eligibleCreatorsCount = balances.filter((b) => b.status === 'eligible').length;
    const notEligibleCreatorsCount = balances.filter((b) => b.status === 'not_eligible').length;
    const totalUnpaidCommissions = balances.reduce((sum, b) => sum + b.unpaidCommission, 0);
    const totalPaidAmount = payouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const paidThisPeriod = payouts
      .filter((p) => p.paidAt >= thirtyDaysAgo)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return {
      eligibleCreatorsCount,
      totalUnpaidCommissions,
      paidThisPeriod: paidThisPeriod || totalPaidAmount,
      totalPaidAmount,
      notEligibleCreatorsCount,
      totalCreatorsCount: balances.length,
      minPayoutAmount,
    };
  }

  public recordCreatorManualPayment(params: {
    creatorId: string;
    amount: number;
    paymentMethod: string;
    transactionReference?: string;
    note?: string;
    commissionPeriod?: string;
    paidByAdminId?: string;
    paidByAdminName?: string;
  }): CreatorPayout {
    const currentUser = this.getCurrentUser();
    const adminId = params.paidByAdminId || currentUser?.id || 'usr_admin';
    const adminName =
      params.paidByAdminName ||
      (currentUser?.role === 'admin' ? currentUser.name : 'System Admin');

    const balance = this.getCreatorCommissionBalanceById(params.creatorId);
    if (!balance) {
      throw new Error(`Creator with ID "${params.creatorId}" not found.`);
    }

    const payAmount = Number(params.amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      throw new Error('Payment amount must be greater than 0 ETB.');
    }

    if (payAmount > balance.unpaidCommission) {
      throw new Error(
        `Payment amount (${payAmount.toLocaleString()} ETB) exceeds available unpaid commission (${balance.unpaidCommission.toLocaleString()} ETB). Double payments and overpayments are strictly prevented.`
      );
    }

    const now = new Date().toISOString();
    const newPayout: CreatorPayout = {
      id: generateId('pay_cr'),
      creatorId: balance.creatorId,
      creatorName: balance.creatorName,
      creatorEmail: balance.creatorEmail,
      creatorPhone: balance.creatorPhone,
      storefrontId: balance.storefrontId,
      storefrontName: balance.storefrontName,
      amount: payAmount,
      currency: 'ETB',
      status: 'paid',
      paymentMethod: (params.paymentMethod as PayoutPaymentMethod) || 'telebirr',
      transactionReference: params.transactionReference?.trim() || undefined,
      paidAt: now,
      paidByAdminId: adminId,
      paidByAdminName: adminName,
      note: params.note?.trim() || undefined,
      commissionPeriod:
        params.commissionPeriod?.trim() ||
        `Period ending ${new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Persist new Creator Payout record
    const existingPayouts = this.getCreatorPayouts();
    this.setItem(STORAGE_KEYS.CREATOR_PAYOUTS, [newPayout, ...existingPayouts]);

    // 2. Adjust Storefront pendingPayout
    const storefronts = this.getStorefronts();
    const updatedStorefronts = storefronts.map((sf) => {
      if (sf.id === balance.storefrontId || sf.resellerId === balance.creatorId) {
        const newPending = Math.max(0, (sf.pendingPayout || 0) - payAmount);
        return {
          ...sf,
          pendingPayout: newPending,
        };
      }
      return sf;
    });
    this.setItem(STORAGE_KEYS.STOREFRONTS, updatedStorefronts);

    // 3. Log Admin Audit Trail
    this.logAdminAction(
      'CREATOR_MANUAL_PAYOUT',
      'payout',
      newPayout.id,
      `Admin ${adminName} recorded manual payment of ${payAmount.toLocaleString()} ETB to ${balance.creatorName} (${balance.storefrontName}) via ${params.paymentMethod}${
        params.transactionReference ? ` [Ref: ${params.transactionReference}]` : ''
      }.`,
      {
        targetName: balance.creatorName,
        reason: `Manual Payout ${params.paymentMethod} (Ref: ${params.transactionReference || 'None'}, Period: ${newPayout.commissionPeriod || 'N/A'})`,
      }
    );

    // 4. Create Notification for Creator
    const methodLabels: Record<string, string> = {
      telebirr: 'Telebirr',
      bank_transfer: 'Bank Transfer',
      cbe_birr: 'CBE Birr',
      cash: 'Cash Handover',
      other: 'Direct Transfer',
    };
    const readableMethod = methodLabels[params.paymentMethod] || params.paymentMethod;

    this.createNotification({
      userId: balance.creatorId,
      userRole: 'reseller',
      type: 'commission_payout_paid',
      title: 'Commission Payment Paid!',
      message: `Your commission payment of ${payAmount.toLocaleString()} ETB has been marked as paid via ${readableMethod}${
        params.transactionReference ? ` (Ref: ${params.transactionReference})` : ''
      }.`,
      link: '/reseller/commissions',
    });

    this.notify();
    return newPayout;
  }

  // --- ETHIOPIAN PAYOUT BANKS REFERENCE REPOSITORY ---
  public getPayoutBanks(includeInactive: boolean = false): PayoutBank[] {
    const banks = this.getItem<PayoutBank[]>(STORAGE_KEYS.PAYOUT_BANKS, OFFICIAL_ETHIOPIAN_BANKS);
    if (includeInactive) {
      return [...banks].sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
    }
    return banks
      .filter((b) => b.isActive !== false)
      .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
  }

  public getAllPayoutBanks(): PayoutBank[] {
    return this.getPayoutBanks(true);
  }

  public getPayoutBankById(bankId: string): PayoutBank | null {
    const banks = this.getAllPayoutBanks();
    return banks.find((b) => b.id === bankId) || null;
  }

  public togglePayoutBankStatus(bankId: string, isActive?: boolean): PayoutBank | null {
    const banks = this.getAllPayoutBanks();
    const target = banks.find((b) => b.id === bankId);
    if (!target) return null;

    const newStatus = isActive !== undefined ? isActive : !target.isActive;
    const updatedBanks = banks.map((b) => (b.id === bankId ? { ...b, isActive: newStatus } : b));
    this.setItem(STORAGE_KEYS.PAYOUT_BANKS, updatedBanks);

    this.logAdminAction(
      'UPDATE_PAYOUT_BANK_STATUS',
      'platform_settings',
      bankId,
      `Admin changed status of bank "${target.name}" to ${newStatus ? 'Active' : 'Inactive'}.`
    );

    this.notify();
    return { ...target, isActive: newStatus };
  }

  // --- CREATOR COMMISSION PAYOUT ACCOUNTS ---
  public getCreatorPayoutAccounts(): CreatorPayoutAccount[] {
    return this.getItem<CreatorPayoutAccount[]>(
      STORAGE_KEYS.CREATOR_PAYOUT_ACCOUNTS,
      initialCreatorPayoutAccounts
    );
  }

  public getCreatorPayoutAccount(creatorId: string): CreatorPayoutAccount | null {
    const accounts = this.getCreatorPayoutAccounts();
    const account = accounts.find((a) => a.creatorId === creatorId);
    if (!account) return null;

    // Resolve current bank name dynamically if bankId exists
    if (account.bankId) {
      const bank = this.getPayoutBankById(account.bankId);
      if (bank) {
        return {
          ...account,
          bankName: bank.name,
        };
      }
    }
    return account;
  }

  public saveCreatorPayoutAccount(params: {
    creatorId: string;
    payoutMethod: PayoutMethodType;
    bankId?: string;
    accountHolderName?: string;
    accountNumber?: string;
    telebirrPhone?: string;
  }): CreatorPayoutAccount {
    const { creatorId, payoutMethod, bankId, accountHolderName, accountNumber, telebirrPhone } = params;
    const accounts = this.getCreatorPayoutAccounts();
    const existingIndex = accounts.findIndex((a) => a.creatorId === creatorId);
    const now = new Date().toISOString();

    let resolvedBankName: string | undefined = undefined;
    if (payoutMethod === 'ethiopian_bank') {
      if (!bankId) {
        throw new Error('Please select an Ethiopian bank from the licensed list.');
      }
      const bank = this.getPayoutBankById(bankId);
      if (!bank) {
        throw new Error('The selected Ethiopian bank is invalid.');
      }
      if (!accountHolderName?.trim()) {
        throw new Error('Account holder name is required.');
      }
      if (!accountNumber?.trim()) {
        throw new Error('Account number is required.');
      }
      resolvedBankName = bank.name;
    } else if (payoutMethod === 'telebirr') {
      if (!telebirrPhone?.trim()) {
        throw new Error('Telebirr phone number is required.');
      }
    }

    const newAccount: CreatorPayoutAccount = {
      id: existingIndex >= 0 ? accounts[existingIndex].id : generateId('pact'),
      creatorId,
      payoutMethod,
      bankId: payoutMethod === 'ethiopian_bank' ? bankId : undefined,
      bankName: payoutMethod === 'ethiopian_bank' ? resolvedBankName : undefined,
      accountHolderName: payoutMethod === 'ethiopian_bank' ? accountHolderName?.trim() : undefined,
      accountNumber: payoutMethod === 'ethiopian_bank' ? accountNumber?.trim() : undefined,
      telebirrPhone: payoutMethod === 'telebirr' ? telebirrPhone?.trim() : undefined,
      isVerified: true,
      updatedAt: now,
      createdAt: existingIndex >= 0 ? accounts[existingIndex].createdAt : now,
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = newAccount;
    } else {
      accounts.push(newAccount);
    }

    this.setItem(STORAGE_KEYS.CREATOR_PAYOUT_ACCOUNTS, accounts);
    this.notify();
    return newAccount;
  }

  // --- FOLLOWERS ---
  public getFollowers(): Follower[] {
    return this.getItem<Follower[]>(STORAGE_KEYS.FOLLOWERS, initialFollowers);
  }

  public getFollowersByBusinessId(businessId: string): Follower[] {
    return this.getFollowers().filter((f) => f.businessId === businessId);
  }

  public getFollowingByResellerId(resellerId: string): Follower[] {
    return this.getFollowers().filter((f) => f.resellerId === resellerId);
  }

  public isFollowing(resellerId: string, businessId: string): boolean {
    if (!resellerId || !businessId) return false;
    return this.getFollowers().some((f) => f.resellerId === resellerId && f.businessId === businessId);
  }

  public followBusiness(resellerId: string, businessId: string): boolean {
    if (!resellerId || !businessId) return false;
    const followers = this.getFollowers();
    const existing = followers.find((f) => f.resellerId === resellerId && f.businessId === businessId);

    if (!existing) {
      const newFollow: Follower = {
        id: generateId('fol'),
        resellerId,
        businessId,
        createdAt: new Date().toISOString(),
      };
      // Prevent duplicate follow records
      const filtered = followers.filter((f) => !(f.resellerId === resellerId && f.businessId === businessId));
      this.setItem(STORAGE_KEYS.FOLLOWERS, [newFollow, ...filtered]);

      // Calculate exact follower count
      const count = this.getFollowersByBusinessId(businessId).length;
      this.updateBusinessProfile(businessId, { followerCount: count }, true);

      // Notify Business Owner on NEW follow only
      const biz = this.getBusinessById(businessId);
      if (biz) {
        const resellerUser = this.getUsers().find((u) => u.id === resellerId);
        const resellerName = resellerUser?.name ? resellerUser.name.split('(')[0].trim() : 'A reseller';
        this.createNotification({
          userId: biz.ownerId,
          userRole: 'business_owner',
          type: 'system_announcement',
          title: 'New Reseller Follower!',
          message: `${resellerName} started following ${biz.businessName}.`,
          link: '/business/profile',
        });
      }
    } else {
      // Sync follower count anyway
      const count = this.getFollowersByBusinessId(businessId).length;
      this.updateBusinessProfile(businessId, { followerCount: count }, true);
    }

    return true;
  }

  public unfollowBusiness(resellerId: string, businessId: string): boolean {
    if (!resellerId || !businessId) return false;
    const followers = this.getFollowers();
    const updated = followers.filter((f) => !(f.resellerId === resellerId && f.businessId === businessId));
    this.setItem(STORAGE_KEYS.FOLLOWERS, updated);

    // Calculate exact follower count and update profile (no notification sent on unfollow)
    const count = this.getFollowersByBusinessId(businessId).length;
    this.updateBusinessProfile(businessId, { followerCount: count }, true);

    return false;
  }

  public toggleFollow(resellerId: string, businessId: string): boolean {
    if (this.isFollowing(resellerId, businessId)) {
      return this.unfollowBusiness(resellerId, businessId);
    } else {
      return this.followBusiness(resellerId, businessId);
    }
  }

  // --- NOTIFICATIONS ---
  public getNotifications(userId: string): Notification[] {
    return this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications)
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
    const notifications = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const newNotif: Notification = {
      ...data,
      id: generateId('notif'),
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifications]);
    return newNotif;
  }

  public markNotificationAsRead(id: string) {
    const notifications = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  public markAllNotificationsAsRead(userId: string) {
    const notifications = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const updated = notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // --- CATEGORIES & SUBCATEGORIES ---
  public addCategory(data: Partial<CategoryWithSubcategories> & { name: string }): CategoryWithSubcategories {
    const categories = this.getCategoriesWithSubcategories();
    const catId = generateId('cat');
    const newCat: CategoryWithSubcategories = {
      id: catId,
      name: data.name.trim(),
      slug: data.slug || data.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: data.description || '',
      icon: data.icon || 'FolderTree',
      sortOrder: data.sortOrder || categories.length + 1,
      isActive: data.isActive !== false,
      subcategories: data.subcategories || [
        {
          id: generateId('sub'),
          categoryId: catId,
          name: 'General',
          slug: 'general',
          isActive: true,
          sortOrder: 1,
        },
      ],
    };
    this.setItem(STORAGE_KEYS.CATEGORIES, [...categories, newCat]);
    this.logAdminAction('ADD_CATEGORY', 'category', newCat.id, `Created category "${newCat.name}"`);
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<CategoryWithSubcategories>) {
    const categories = this.getCategoriesWithSubcategories();
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.setItem(STORAGE_KEYS.CATEGORIES, updated);
  }

  public toggleCategoryActive(id: string) {
    const categories = this.getCategoriesWithSubcategories();
    const updated = categories.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    this.setItem(STORAGE_KEYS.CATEGORIES, updated);
  }

  public deleteCategory(id: string) {
    // Soft disable / archive instead of destructive deletion if products exist
    const products = this.getProducts();
    const catObj = this.getCategoriesWithSubcategories().find((c) => c.id === id);
    const hasProducts = catObj && products.some((p) => p.category === catObj.name);

    if (hasProducts) {
      this.toggleCategoryActive(id);
      this.logAdminAction('ARCHIVE_CATEGORY', 'category', id, `Deactivated category "${catObj?.name}" (products attached)`);
    } else {
      const categories = this.getCategoriesWithSubcategories().filter((c) => c.id !== id);
      this.setItem(STORAGE_KEYS.CATEGORIES, categories);
      this.logAdminAction('DELETE_CATEGORY', 'category', id, `Removed empty category #${id}`);
    }
  }

  public addSubcategory(categoryId: string, name: string) {
    const categories = this.getCategoriesWithSubcategories();
    const updated = categories.map((c) => {
      if (c.id === categoryId) {
        const subs = c.subcategories || [];
        const newSub = {
          id: generateId('sub'),
          categoryId,
          name: name.trim(),
          slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
          isActive: true,
          sortOrder: subs.length + 1,
        };
        return { ...c, subcategories: [...subs, newSub] };
      }
      return c;
    });
    this.setItem(STORAGE_KEYS.CATEGORIES, updated);
  }

  public updateSubcategory(categoryId: string, subId: string, updates: Partial<CategoryWithSubcategories['subcategories'][0]>) {
    const categories = this.getCategoriesWithSubcategories();
    const updated = categories.map((c) => {
      if (c.id === categoryId) {
        const subs = (c.subcategories || []).map((s) => (s.id === subId ? { ...s, ...updates } : s));
        return { ...c, subcategories: subs };
      }
      return c;
    });
    this.setItem(STORAGE_KEYS.CATEGORIES, updated);
  }

  public deleteSubcategory(categoryId: string, subId: string) {
    const categories = this.getCategoriesWithSubcategories();
    const updated = categories.map((c) => {
      if (c.id === categoryId) {
        const subs = (c.subcategories || []).filter((s) => s.id !== subId);
        return { ...c, subcategories: subs };
      }
      return c;
    });
    this.setItem(STORAGE_KEYS.CATEGORIES, updated);
  }

  // --- ADMIN PLATFORM OPERATIONS ---
  public getAdminPlatformStats() {
    const orders = this.getOrders();
    const payouts = this.getPayouts();
    const businesses = this.getBusinesses();
    const storefronts = this.getStorefronts();
    const products = this.getProducts();
    const disputes = this.getDisputes();
    const reports = this.getReports();
    const users = this.getUsers();

    const totalVolume = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCommissionsPaid = payouts.reduce((sum, p) => sum + p.amount, 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const completedOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'completed').length;
    const pendingPayoutsAmount = storefronts.reduce((sum, sf) => sum + sf.pendingPayout, 0);
    const openDisputesCount = disputes.filter((d) => d.status === 'open' || d.status === 'investigating').length;
    const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

    return {
      totalVolume,
      totalCommissionsPaid,
      businessCount: businesses.length,
      storefrontCount: storefronts.length,
      productsCount: products.length,
      activeProductsCount: products.filter((p) => !p.isHidden && p.status === 'active').length,
      ordersCount: orders.length,
      pendingOrdersCount: pendingOrders,
      completedOrdersCount: completedOrders,
      pendingPayoutsAmount,
      openDisputesCount,
      pendingReportsCount,
      usersCount: users.length,
    };
  }

  // --- DISPUTES ---
  public getDisputes(): Dispute[] {
    return this.getItem<Dispute[]>(STORAGE_KEYS.DISPUTES, initialDisputes);
  }

  public getDisputeById(id: string): Dispute | undefined {
    return this.getDisputes().find((d) => d.id === id);
  }

  public createDispute(data: Omit<Dispute, 'id' | 'status' | 'messages' | 'createdAt' | 'updatedAt'>): Dispute {
    const disputes = this.getDisputes();
    const newDispute: Dispute = {
      ...data,
      id: generateId('disp'),
      status: 'open',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.DISPUTES, [newDispute, ...disputes]);
    this.logAdminAction('CREATE_DISPUTE', 'dispute', newDispute.id, `Created dispute for order #${data.orderId}`);
    return newDispute;
  }

  public updateDisputeStatus(id: string, status: Dispute['status'], resolutionDetails?: string, internalNotes?: string) {
    const disputes = this.getDisputes();
    const updated = disputes.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          status,
          ...(resolutionDetails ? { resolutionDetails } : {}),
          ...(internalNotes ? { internalNotes } : {}),
          updatedAt: new Date().toISOString(),
        };
      }
      return d;
    });
    this.setItem(STORAGE_KEYS.DISPUTES, updated);
    this.logAdminAction('UPDATE_DISPUTE_STATUS', 'dispute', id, `Updated dispute #${id} status to ${status}`);
  }

  public addDisputeMessage(disputeId: string, message: { senderId: string; senderName: string; senderRole: UserRole; text: string }) {
    const disputes = this.getDisputes();
    const updated = disputes.map((d) => {
      if (d.id === disputeId) {
        const newMsg = {
          id: generateId('msg'),
          ...message,
          timestamp: new Date().toISOString(),
        };
        return {
          ...d,
          messages: [...d.messages, newMsg],
          updatedAt: new Date().toISOString(),
        };
      }
      return d;
    });
    this.setItem(STORAGE_KEYS.DISPUTES, updated);
  }

  // --- REPORTS & MODERATION ---
  public getReports(): ModerationReport[] {
    return this.getItem<ModerationReport[]>(STORAGE_KEYS.REPORTS, initialReports);
  }

  public createReport(data: Omit<ModerationReport, 'id' | 'status' | 'createdAt'>): ModerationReport {
    const reports = this.getReports();
    const newReport: ModerationReport = {
      ...data,
      id: generateId('rep'),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.REPORTS, [newReport, ...reports]);
    return newReport;
  }

  public updateReportStatus(id: string, status: ModerationReport['status'], adminNotes?: string) {
    const reports = this.getReports();
    const updated = reports.map((r) => (r.id === id ? { ...r, status, ...(adminNotes ? { adminNotes } : {}) } : r));
    this.setItem(STORAGE_KEYS.REPORTS, updated);
    this.logAdminAction('UPDATE_REPORT_STATUS', 'report', id, `Updated report #${id} to ${status}`);
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  }

  public logAdminAction(
    action: string,
    targetType: string,
    targetId: string,
    details: string,
    options?: {
      targetName?: string;
      previousStatus?: string;
      newStatus?: string;
      reason?: string;
    }
  ) {
    const currentUser = this.getCurrentUser();
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: generateId('log'),
      adminId: currentUser.id,
      adminName: currentUser.name || 'Platform Admin',
      action,
      targetType,
      targetId,
      targetName: options?.targetName,
      previousStatus: options?.previousStatus,
      newStatus: options?.newStatus,
      reason: options?.reason,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    };
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]);
  }

  // --- ANNOUNCEMENTS ---
  public getAnnouncements(): Announcement[] {
    return this.getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements);
  }

  public createAnnouncement(title: string, message: string, targetAudience: Announcement['targetAudience'], recipientIds?: string[]): Announcement {
    const announcements = this.getAnnouncements();
    const currentUser = this.getCurrentUser();
    const newAnnouncement: Announcement = {
      id: generateId('anc'),
      title,
      message,
      targetAudience,
      recipientIds,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name || 'Platform Admin',
    };
    this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, [newAnnouncement, ...announcements]);

    // Broadcast notifications to targeted users
    const users = this.getUsers();
    users.forEach((u) => {
      let shouldNotify = false;
      if (targetAudience === 'all') shouldNotify = true;
      else if (targetAudience === 'businesses' && u.role === 'business_owner') shouldNotify = true;
      else if (targetAudience === 'resellers' && u.role === 'reseller') shouldNotify = true;
      else if (targetAudience === 'selected' && recipientIds?.includes(u.id)) shouldNotify = true;

      if (shouldNotify) {
        this.createNotification({
          userId: u.id,
          userRole: u.role,
          type: 'system_announcement',
          title: `📢 Announcement: ${title}`,
          message,
        });
      }
    });

    this.logAdminAction('BROADCAST_ANNOUNCEMENT', 'announcement', newAnnouncement.id, `Broadcasted: "${title}" to ${targetAudience}`);
    return newAnnouncement;
  }

  // --- PLATFORM SETTINGS ---
  public getPlatformSettings(): PlatformSettings {
    return this.getItem<PlatformSettings>(STORAGE_KEYS.PLATFORM_SETTINGS, initialPlatformSettings);
  }

  public updatePlatformSettings(settings: Partial<PlatformSettings>) {
    const current = this.getPlatformSettings();
    const updated = { ...current, ...settings };
    this.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, updated);
    this.logAdminAction('UPDATE_SETTINGS', 'platform', 'global', 'Updated global platform configuration');
  }

  // --- USER & STATUS GOVERNANCE ---
  public banUser(userId: string, reason: string, banType: 'permanent' | 'temporary' = 'permanent') {
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const previousStatus = target.status || 'active';
    const now = new Date().toISOString();

    const updatedUsers = users.map((u) =>
      u.id === userId
        ? {
            ...u,
            status: 'banned' as UserAccountStatus,
            banReason: reason,
            bannedAt: now,
            banType,
          }
        : u
    );
    this.setItem(STORAGE_KEYS.USERS, updatedUsers);

    // Sync business status if business owner
    const businesses = this.getBusinesses();
    const updatedBusinesses = businesses.map((b) =>
      b.ownerId === userId ? { ...b, status: 'banned' as UserAccountStatus, statusReason: reason } : b
    );
    this.setItem(STORAGE_KEYS.BUSINESSES, updatedBusinesses);

    // Sync storefront status if reseller
    const storefronts = this.getStorefronts();
    const updatedStorefronts = storefronts.map((sf) =>
      sf.resellerId === userId ? { ...sf, status: 'banned' as UserAccountStatus, isDisabled: true, disabledReason: 'Account Banned' } : sf
    );
    this.setItem(STORAGE_KEYS.STOREFRONTS, updatedStorefronts);

    // Notify user
    this.createNotification({
      userId,
      userRole: target.role,
      type: 'account_status_changed',
      title: '⚠️ Account Banned',
      message: `Your account has been banned. Reason: ${reason}. Submit an appeal if you believe this is an error.`,
    });

    // Record audit log
    this.logAdminAction('BAN_USER', 'user', userId, `Banned user ${target.name} (${target.email}). Reason: ${reason}`, {
      targetName: target.name,
      previousStatus,
      newStatus: 'banned',
      reason,
    });
  }

  public suspendUser(userId: string, reason: string, endDate?: string) {
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const previousStatus = target.status || 'active';
    const now = new Date().toISOString();

    const updatedUsers = users.map((u) =>
      u.id === userId
        ? {
            ...u,
            status: 'suspended' as UserAccountStatus,
            suspensionReason: reason,
            suspendedAt: now,
            suspensionEndDate: endDate,
          }
        : u
    );
    this.setItem(STORAGE_KEYS.USERS, updatedUsers);

    // Sync business status
    const businesses = this.getBusinesses();
    const updatedBusinesses = businesses.map((b) =>
      b.ownerId === userId ? { ...b, status: 'suspended' as UserAccountStatus, statusReason: reason } : b
    );
    this.setItem(STORAGE_KEYS.BUSINESSES, updatedBusinesses);

    // Sync storefront status (remains visible unless explicitly disabled)
    const storefronts = this.getStorefronts();
    const updatedStorefronts = storefronts.map((sf) =>
      sf.resellerId === userId ? { ...sf, status: 'suspended' as UserAccountStatus } : sf
    );
    this.setItem(STORAGE_KEYS.STOREFRONTS, updatedStorefronts);

    // Notify user
    this.createNotification({
      userId,
      userRole: target.role,
      type: 'account_status_changed',
      title: '⏸️ Account Suspended',
      message: `Your account has been suspended${endDate ? ` until ${endDate}` : ''}. Reason: ${reason}`,
    });

    // Record audit log
    this.logAdminAction('SUSPEND_USER', 'user', userId, `Suspended user ${target.name} (${target.email}). Reason: ${reason}`, {
      targetName: target.name,
      previousStatus,
      newStatus: 'suspended',
      reason,
    });
  }

  public reactivateUser(userId: string, reason?: string) {
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const previousStatus = target.status || 'active';

    const updatedUsers = users.map((u) =>
      u.id === userId
        ? {
            ...u,
            status: 'active' as UserAccountStatus,
            banReason: undefined,
            bannedAt: undefined,
            banType: undefined,
            suspensionReason: undefined,
            suspendedAt: undefined,
            suspensionEndDate: undefined,
          }
        : u
    );
    this.setItem(STORAGE_KEYS.USERS, updatedUsers);

    // Sync business status
    const businesses = this.getBusinesses();
    const updatedBusinesses = businesses.map((b) =>
      b.ownerId === userId ? { ...b, status: 'active' as UserAccountStatus, statusReason: undefined } : b
    );
    this.setItem(STORAGE_KEYS.BUSINESSES, updatedBusinesses);

    // Sync storefront status
    const storefronts = this.getStorefronts();
    const updatedStorefronts = storefronts.map((sf) =>
      sf.resellerId === userId ? { ...sf, status: 'active' as UserAccountStatus, isDisabled: false, disabledReason: undefined } : sf
    );
    this.setItem(STORAGE_KEYS.STOREFRONTS, updatedStorefronts);

    // Notify user
    this.createNotification({
      userId,
      userRole: target.role,
      type: 'account_status_changed',
      title: '✅ Account Reactivated',
      message: 'Your account status has been reactivated. Full platform access and permissions have been restored.',
    });

    // Record audit log
    this.logAdminAction('REACTIVATE_USER', 'user', userId, `Reactivated account for user ${target.name}`, {
      targetName: target.name,
      previousStatus,
      newStatus: 'active',
      reason: reason || 'Administrative reactivation',
    });
  }

  public updateUserStatus(userId: string, status: UserAccountStatus) {
    if (status === 'banned') {
      this.banUser(userId, 'Administrative account ban');
    } else if (status === 'suspended') {
      this.suspendUser(userId, 'Administrative account suspension');
    } else if (status === 'active') {
      this.reactivateUser(userId, 'Administrative status update');
    } else {
      const users = this.getUsers();
      const updatedUsers = users.map((u) => (u.id === userId ? { ...u, status } : u));
      this.setItem(STORAGE_KEYS.USERS, updatedUsers);
    }
  }

  public updateBusinessStatus(businessId: string, status: UserAccountStatus) {
    const businesses = this.getBusinesses();
    const biz = businesses.find((b) => b.id === businessId);
    if (biz) {
      this.updateUserStatus(biz.ownerId, status);
    }
  }

  public toggleBusinessVerification(businessId: string) {
    const businesses = this.getBusinesses();
    const target = businesses.find((b) => b.id === businessId);
    if (!target) return;
    const isVerified = !target.isVerified;
    const updated = businesses.map((b) => (b.id === businessId ? { ...b, isVerified } : b));
    this.setItem(STORAGE_KEYS.BUSINESSES, updated);
    this.logAdminAction(
      'TOGGLE_BUSINESS_VERIFICATION',
      'business',
      businessId,
      `${isVerified ? 'Verified' : 'Unverified'} brand ${target.businessName}`,
      { targetName: target.businessName }
    );
  }

  public updateStorefrontStatus(storefrontId: string, status: UserAccountStatus) {
    const storefronts = this.getStorefronts();
    const sf = storefronts.find((s) => s.id === storefrontId);
    if (sf) {
      this.updateUserStatus(sf.resellerId, status);
    }
  }

  public toggleStorefrontDisabled(storefrontId: string, isDisabled: boolean, reason?: string) {
    const storefronts = this.getStorefronts();
    const sf = storefronts.find((s) => s.id === storefrontId);
    if (!sf) return;

    const previousStatus = sf.isDisabled ? 'disabled' : 'active';
    const now = new Date().toISOString();

    const updated = storefronts.map((s) =>
      s.id === storefrontId
        ? {
            ...s,
            isDisabled,
            disabledReason: isDisabled ? reason || 'Platform administration disabled storefront' : undefined,
            disabledAt: isDisabled ? now : undefined,
          }
        : s
    );
    this.setItem(STORAGE_KEYS.STOREFRONTS, updated);

    // Notify reseller
    this.createNotification({
      userId: sf.resellerId,
      userRole: 'reseller',
      type: 'storefront_status_changed',
      title: isDisabled ? '🔒 Storefront Disabled' : '🌐 Storefront Enabled',
      message: isDisabled
        ? `Your storefront "${sf.storeName}" was disabled by platform administration. Reason: ${reason || 'Policy compliance review'}`
        : `Your storefront "${sf.storeName}" has been restored and is active for public visitors.`,
    });

    // Record audit log
    this.logAdminAction(
      isDisabled ? 'DISABLE_STOREFRONT' : 'ENABLE_STOREFRONT',
      'storefront',
      storefrontId,
      `${isDisabled ? 'Disabled' : 'Enabled'} storefront ${sf.storeName}. ${reason ? `Reason: ${reason}` : ''}`,
      {
        targetName: sf.storeName,
        previousStatus,
        newStatus: isDisabled ? 'disabled' : 'active',
        reason,
      }
    );
  }

  // --- PRODUCT MODERATION & APPEALS ---
  public toggleProductHidden(productId: string, isHidden: boolean, adminNotes?: string) {
    const products = this.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const previousStatus = product.isHidden ? 'hidden' : 'active';
    const now = new Date().toISOString();

    const updated = products.map((p) =>
      p.id === productId
        ? {
            ...p,
            isHidden,
            hiddenReason: isHidden ? adminNotes : undefined,
            hiddenAt: isHidden ? now : undefined,
            adminNotes: adminNotes || p.adminNotes,
            appealStatus: isHidden ? undefined : ('approved' as AppealStatus),
          }
        : p
    );
    this.setItem(STORAGE_KEYS.PRODUCTS, updated);

    // Find business owner to notify
    const businesses = this.getBusinesses();
    const biz = businesses.find((b) => b.id === product.businessId);

    if (biz) {
      this.createNotification({
        userId: biz.ownerId,
        userRole: 'business_owner',
        type: 'product_updated',
        title: isHidden ? '🙈 Product Hidden by Admin' : '👁️ Product Restored by Admin',
        message: isHidden
          ? `Your product "${product.title}" was hidden from reseller storefronts by administration. Reason: ${adminNotes || 'Policy review'}. You can submit an appeal in your dashboard.`
          : `Your product "${product.title}" has been restored and is visible to resellers again.`,
        link: '/business/products',
      });
    }

    // Record audit log
    this.logAdminAction(
      isHidden ? 'HIDE_PRODUCT' : 'RESTORE_PRODUCT',
      'product',
      productId,
      `${isHidden ? 'Hid' : 'Restored'} product "${product.title}" (ID: #${productId}). ${adminNotes ? `Reason: ${adminNotes}` : ''}`,
      {
        targetName: product.title,
        previousStatus,
        newStatus: isHidden ? 'hidden' : 'active',
        reason: adminNotes,
      }
    );
  }

  public getProductAppeals(): ProductAppeal[] {
    return this.getItem<ProductAppeal[]>(STORAGE_KEYS.PRODUCT_APPEALS, initialProductAppeals);
  }

  public getProductAppealsByBusinessId(businessId: string): ProductAppeal[] {
    return this.getProductAppeals().filter((a) => a.businessId === businessId);
  }

  public getProductAppealByProductId(productId: string): ProductAppeal | undefined {
    return this.getProductAppeals().find((a) => a.productId === productId);
  }

  public submitProductAppeal(data: { productId: string; appealMessage: string; attachments?: string[] }): ProductAppeal | undefined {
    const product = this.getProductById(data.productId);
    if (!product) return undefined;

    const currentUser = this.getCurrentUser();
    const businesses = this.getBusinesses();
    const biz = businesses.find((b) => b.id === product.businessId);
    const users = this.getUsers();
    const ownerId = biz?.ownerId || currentUser.id;
    const ownerUser = users.find((u) => u.id === ownerId) || currentUser;
    const now = new Date().toISOString();

    const newAppeal: ProductAppeal = {
      id: generateId('p-apl'),
      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0] || '',
      businessId: product.businessId,
      businessName: product.businessName || biz?.businessName || 'Business',
      ownerId,
      ownerName: ownerUser.name || currentUser.name,
      ownerEmail: ownerUser.email || currentUser.email,
      ownerPhone: ownerUser.phone || currentUser.phone || biz?.phone || '(555) 234-5678',
      hiddenReason: product.hiddenReason || 'Policy & compliance review required.',
      hiddenAt: product.hiddenAt || now,
      hiddenByAdminId: product.hiddenByAdminId,
      hiddenByAdminName: product.hiddenByAdminName || 'Compliance Operator',
      appealMessage: data.appealMessage,
      attachments: data.attachments || [],
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      history: [
        {
          action: 'Product Hidden',
          timestamp: product.hiddenAt || now,
          actor: product.hiddenByAdminName || 'Compliance Operator',
          details: `Hidden reason: ${product.hiddenReason || 'Policy & compliance review required.'}`,
        },
        {
          action: 'Appeal Submitted',
          timestamp: now,
          actor: ownerUser.name || currentUser.name,
          details: data.appealMessage,
        },
      ],
    };

    const existingAppeals = this.getProductAppeals();
    this.setItem(STORAGE_KEYS.PRODUCT_APPEALS, [newAppeal, ...existingAppeals]);

    // Update Product appeal status
    this.updateProduct(product.id, {
      appealStatus: 'pending',
      currentAppealId: newAppeal.id,
    });

    // Notify Admin
    this.createNotification({
      userId: 'usr_admin',
      userRole: 'admin',
      type: 'dispute_created',
      title: '⚖️ New Product Moderation Appeal Submitted',
      message: `${newAppeal.businessName} submitted an appeal for hidden product "${product.title}".`,
      link: '/admin?tab=product-appeals',
    });

    // Audit Log
    this.logAdminAction(
      'SUBMIT_PRODUCT_APPEAL',
      'product',
      product.id,
      `Business owner ${currentUser.name} (${newAppeal.businessName}) submitted appeal #${newAppeal.id} for hidden product "${product.title}"`,
      {
        targetName: product.title,
        reason: data.appealMessage,
      }
    );

    return newAppeal;
  }

  public updateProductAppealMessage(appealId: string, additionalMessage: string, attachments?: string[]) {
    const appeals = this.getProductAppeals();
    const appeal = appeals.find((a) => a.id === appealId);
    if (!appeal) return;

    const now = new Date().toISOString();
    const updatedAppeals = appeals.map((a) =>
      a.id === appealId
        ? {
            ...a,
            appealMessage: `${a.appealMessage}\n\n[Update on ${new Date().toLocaleDateString()}]: ${additionalMessage}`,
            attachments: attachments && attachments.length > 0 ? [...(a.attachments || []), ...attachments] : a.attachments,
            status: 'pending' as AppealStatus,
            updatedAt: now,
          }
        : a
    );
    this.setItem(STORAGE_KEYS.PRODUCT_APPEALS, updatedAppeals);

    const product = this.getProductById(appeal.productId);
    if (product) {
      this.updateProduct(product.id, { appealStatus: 'pending' });
    }

    // Notify Admin
    this.createNotification({
      userId: 'usr_admin',
      userRole: 'admin',
      type: 'dispute_created',
      title: '⚖️ Product Appeal Updated with Information',
      message: `${appeal.businessName} submitted additional information for product appeal #${appeal.id}.`,
      link: '/admin',
    });
  }

  public reviewProductAppeal(appealId: string, decision: 'approve' | 'reject' | 'request_info', adminNotes?: string) {
    const productAppeals = this.getProductAppeals();
    const appeal = productAppeals.find((a) => a.id === appealId);
    if (!appeal) return;

    const now = new Date().toISOString();
    const currentUser = this.getCurrentUser();

    let newStatus: AppealStatus = 'pending';
    if (decision === 'approve') newStatus = 'approved';
    else if (decision === 'reject') newStatus = 'rejected';
    else if (decision === 'request_info') newStatus = 'more_info_requested';

    const updatedAppeals = productAppeals.map((a) => {
      if (a.id !== appealId) return a;

      const currentHistory = a.history && a.history.length > 0
        ? a.history
        : [
            {
              action: 'Product Hidden',
              timestamp: a.hiddenAt || a.createdAt,
              actor: a.hiddenByAdminName || 'Compliance Operator',
              details: `Hidden reason: ${a.hiddenReason}`,
            },
            {
              action: 'Appeal Submitted',
              timestamp: a.createdAt,
              actor: a.ownerName,
              details: a.appealMessage,
            },
          ];

      const actionTitle =
        decision === 'approve'
          ? 'Appeal Approved & Product Restored'
          : decision === 'reject'
          ? 'Appeal Rejected'
          : 'Additional Info Requested';

      const actionDetails =
        adminNotes ||
        (decision === 'approve'
          ? 'Appeal verified and approved. Product unhidden and restored across Marketplace and storefronts.'
          : decision === 'reject'
          ? 'Product remains hidden per compliance guidelines.'
          : 'Additional compliance information requested from business owner.');

      const newHistoryEntry = {
        action: actionTitle,
        timestamp: now,
        actor: `${currentUser.name} (Admin)`,
        details: actionDetails,
      };

      return {
        ...a,
        status: newStatus,
        adminNotes: adminNotes || a.adminNotes,
        rejectionReason: decision === 'reject' ? adminNotes : a.rejectionReason,
        requestedInfo: decision === 'request_info' ? adminNotes : a.requestedInfo,
        reviewedAt: now,
        reviewedByAdminId: currentUser.id,
        reviewedByAdminName: currentUser.name,
        updatedAt: now,
        history: [...currentHistory, newHistoryEntry],
      };
    });
    this.setItem(STORAGE_KEYS.PRODUCT_APPEALS, updatedAppeals);

    const product = this.getProductById(appeal.productId);

    if (decision === 'approve') {
      // Automatically restore product visibility across marketplace and reseller storefronts!
      if (product) {
        const products = this.getProducts();
        const updatedProducts = products.map((p) =>
          p.id === product.id
            ? {
                ...p,
                isHidden: false,
                hiddenReason: undefined,
                hiddenAt: undefined,
                appealStatus: 'approved' as AppealStatus,
                updatedAt: now,
              }
            : p
        );
        this.setItem(STORAGE_KEYS.PRODUCTS, updatedProducts);
      }

      // Notify Business Owner
      this.createNotification({
        userId: appeal.ownerId,
        userRole: 'business_owner',
        type: 'product_updated',
        title: '✅ Product Appeal Approved & Restored',
        message: `Your appeal for "${appeal.productTitle}" was approved by administration. The product has been automatically restored to the marketplace and reseller catalogs.`,
        link: '/business/products',
      });

      // Audit Log
      this.logAdminAction(
        'APPROVE_PRODUCT_APPEAL',
        'product',
        appeal.productId,
        `Approved appeal #${appeal.id} for product "${appeal.productTitle}". Product automatically unhidden & restored to catalog.`,
        {
          targetName: appeal.productTitle,
          previousStatus: 'hidden',
          newStatus: 'active',
          reason: adminNotes,
        }
      );
    } else if (decision === 'reject') {
      if (product) {
        this.updateProduct(product.id, { appealStatus: 'rejected' });
      }

      // Notify Business Owner
      this.createNotification({
        userId: appeal.ownerId,
        userRole: 'business_owner',
        type: 'product_updated',
        title: '❌ Product Appeal Declined',
        message: `Your appeal for product "${appeal.productTitle}" was declined by administration. Reason: ${adminNotes || 'Does not meet platform compliance requirements.'}`,
        link: '/business/products',
      });

      // Audit Log
      this.logAdminAction(
        'REJECT_PRODUCT_APPEAL',
        'product',
        appeal.productId,
        `Declined appeal #${appeal.id} for product "${appeal.productTitle}". Reason: ${adminNotes || 'Non-compliant'}`,
        {
          targetName: appeal.productTitle,
          previousStatus: 'pending',
          newStatus: 'rejected',
          reason: adminNotes,
        }
      );
    } else if (decision === 'request_info') {
      if (product) {
        this.updateProduct(product.id, { appealStatus: 'more_info_requested' });
      }

      // Notify Business Owner
      this.createNotification({
        userId: appeal.ownerId,
        userRole: 'business_owner',
        type: 'product_updated',
        title: 'ℹ️ Additional Info Requested for Product Appeal',
        message: `Administration requested additional information regarding your appeal for "${appeal.productTitle}": ${adminNotes}`,
        link: '/business/products',
      });

      // Audit Log
      this.logAdminAction(
        'REQUEST_INFO_PRODUCT_APPEAL',
        'product',
        appeal.productId,
        `Requested additional information for product appeal #${appeal.id} on "${appeal.productTitle}". Notes: ${adminNotes}`,
        {
          targetName: appeal.productTitle,
          previousStatus: 'pending',
          newStatus: 'more_info_requested',
          reason: adminNotes,
        }
      );
    }
  }

  public deleteProductAdmin(productId: string) {
    const products = this.getProducts();
    const product = products.find((p) => p.id === productId);
    const updated = products.filter((p) => p.id !== productId);
    this.setItem(STORAGE_KEYS.PRODUCTS, updated);
    this.logAdminAction(
      'DELETE_PRODUCT',
      'product',
      productId,
      `Permanently removed product "${product?.title || productId}" from platform catalog`,
      { targetName: product?.title, previousStatus: 'active', newStatus: 'deleted' }
    );
  }

  // --- APPEALS SYSTEM ---
  public getAppeals(): AccountAppeal[] {
    return this.getItem<AccountAppeal[]>(STORAGE_KEYS.APPEALS, initialAppeals);
  }

  public getAppealsByUser(userId: string): AccountAppeal[] {
    return this.getAppeals().filter((a) => a.userId === userId);
  }

  public submitAppeal(data: { userId: string; subject: string; explanation: string; attachments?: string[] }): AccountAppeal {
    const user = this.getUsers().find((u) => u.id === data.userId) || this.getCurrentUser();
    const appeals = this.getAppeals();
    const now = new Date().toISOString();

    const newAppeal: AccountAppeal = {
      id: generateId('apl'),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userEmail: user.email,
      subject: data.subject,
      explanation: data.explanation,
      attachments: data.attachments,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    this.setItem(STORAGE_KEYS.APPEALS, [newAppeal, ...appeals]);

    // Notify Admin
    this.createNotification({
      userId: 'usr_admin',
      userRole: 'admin',
      type: 'dispute_created',
      title: '⚖️ New Account Restriction Appeal',
      message: `${user.name} (${user.role}) submitted an appeal regarding: "${data.subject}"`,
      link: '/admin',
    });

    // Record audit log entry
    this.logAdminAction('SUBMIT_APPEAL', 'appeal', newAppeal.id, `User ${user.name} submitted appeal #${newAppeal.id} for "${data.subject}"`, {
      targetName: user.name,
      reason: data.subject,
    });

    return newAppeal;
  }

  public reviewAppeal(appealId: string, decision: 'approve' | 'reject' | 'request_info', adminNotes?: string) {
    const appeals = this.getAppeals();
    const appeal = appeals.find((a) => a.id === appealId);
    if (!appeal) return;

    const previousStatus = appeal.status;
    const now = new Date().toISOString();

    let newStatus: AppealStatus = 'pending';
    if (decision === 'approve') newStatus = 'approved';
    else if (decision === 'reject') newStatus = 'rejected';
    else if (decision === 'request_info') newStatus = 'more_info_requested';

    const updatedAppeals = appeals.map((a) =>
      a.id === appealId
        ? {
            ...a,
            status: newStatus,
            adminNotes: adminNotes || a.adminNotes,
            rejectionReason: decision === 'reject' ? adminNotes : a.rejectionReason,
            updatedAt: now,
          }
        : a
    );
    this.setItem(STORAGE_KEYS.APPEALS, updatedAppeals);

    // If approved, automatically reactivate the user account!
    if (decision === 'approve') {
      this.reactivateUser(appeal.userId, `Appeal #${appeal.id} approved by admin`);
      this.createNotification({
        userId: appeal.userId,
        userRole: appeal.userRole,
        type: 'appeal_status_changed',
        title: '🎉 Appeal Approved!',
        message: `Your account restriction appeal for "${appeal.subject}" has been approved! Full access has been restored.`,
      });
      this.logAdminAction('APPROVE_APPEAL', 'appeal', appealId, `Approved appeal #${appealId} for user ${appeal.userName}. Account restored.`, {
        targetName: appeal.userName,
        previousStatus,
        newStatus: 'approved',
        reason: adminNotes,
      });
    } else if (decision === 'reject') {
      this.createNotification({
        userId: appeal.userId,
        userRole: appeal.userRole,
        type: 'appeal_status_changed',
        title: '❌ Appeal Decision: Rejected',
        message: `Your appeal for "${appeal.subject}" was reviewed and rejected. ${adminNotes ? `Admin note: ${adminNotes}` : ''}`,
      });
      this.logAdminAction('REJECT_APPEAL', 'appeal', appealId, `Rejected appeal #${appealId} for user ${appeal.userName}. ${adminNotes ? `Note: ${adminNotes}` : ''}`, {
        targetName: appeal.userName,
        previousStatus,
        newStatus: 'rejected',
        reason: adminNotes,
      });
    } else if (decision === 'request_info') {
      this.createNotification({
        userId: appeal.userId,
        userRole: appeal.userRole,
        type: 'appeal_status_changed',
        title: '💬 Appeal Update: More Information Requested',
        message: `The administration requested more details regarding your appeal "${appeal.subject}": ${adminNotes || 'Please reply.'}`,
      });
      this.logAdminAction('REQUEST_APPEAL_INFO', 'appeal', appealId, `Requested additional info for appeal #${appealId} from user ${appeal.userName}`, {
        targetName: appeal.userName,
        previousStatus,
        newStatus: 'more_info_requested',
        reason: adminNotes,
      });
    }
  }

  // --- PAYOUT REFERENCE RECORDING ---
  public markPayoutPaid(payoutId: string, reference: string) {
    const payouts = this.getPayouts();
    const updated = payouts.map((p) => (p.id === payoutId ? { ...p, status: 'processed' as const, paymentReference: reference } : p));
    this.setItem(STORAGE_KEYS.PAYOUTS, updated);
    this.logAdminAction('MARK_PAYOUT_PAID', 'payout', payoutId, `Recorded payment reference ${reference} for payout #${payoutId}`);
  }

  // --- ORDER TIMELINE GENERATOR ---
  public getOrderTimeline(orderId: string): OrderTimelineEvent[] {
    const order = this.getOrders().find((o) => o.id === orderId);
    if (!order) return [];

    const storefront = this.getStorefronts().find((sf) => sf.id === order.storefrontId);
    const reseller = storefront ? this.getUsers().find((u) => u.id === storefront.resellerId) : null;
    const business = this.getBusinesses().find((b) => b.id === order.items[0]?.businessId);

    const baseTime = new Date(order.createdAt).getTime();

    const events: OrderTimelineEvent[] = [
      {
        id: `evt_1_${order.id}`,
        orderId: order.id,
        timestamp: order.createdAt,
        stage: 'created',
        title: 'Buyer Placed Order',
        description: `Order placed by ${order.customerName} (${order.customerEmail}) for ${order.items.length} item(s) totaling $${order.totalAmount.toFixed(2)}.`,
        actor: order.customerName,
      },
      {
        id: `evt_2_${order.id}`,
        orderId: order.id,
        timestamp: new Date(baseTime + 1000 * 60 * 2).toISOString(),
        stage: 'notification',
        title: 'Reseller & Business Notified',
        description: `Notifications dispatched to reseller (${reseller?.name || 'Reseller'}) and supplier brand (${business?.businessName || 'Business Owner'}).`,
        actor: 'Suk Engine',
      },
    ];

    if (order.status === 'rejected') {
      events.push({
        id: `evt_rej_${order.id}`,
        orderId: order.id,
        timestamp: order.rejectedAt || order.updatedAt,
        stage: 'rejected' as any,
        title: 'Order Rejected',
        description: `Order was rejected by ${order.rejectedByName || 'Brand Owner'}${order.rejectionReason ? `. Reason: "${order.rejectionReason}"` : '.'}`,
        actor: order.rejectedByName || 'Brand Owner',
      });
    }

    if (order.status !== 'pending' && order.status !== 'rejected') {
      events.push({
        id: `evt_3_${order.id}`,
        orderId: order.id,
        timestamp: new Date(baseTime + 1000 * 60 * 45).toISOString(),
        stage: 'accepted',
        title: 'Business Accepted Order',
        description: `Supplier brand ${business?.businessName || 'Business'} verified stock & queued for fulfillment.`,
        actor: business?.businessName || 'Supplier Brand',
      });
    }

    if (order.status === 'shipped' || order.status === 'delivered' || order.status === 'completed') {
      events.push({
        id: `evt_4_${order.id}`,
        orderId: order.id,
        timestamp: new Date(baseTime + 1000 * 60 * 60 * 18).toISOString(),
        stage: 'shipped',
        title: 'Order Dispatched with Carrier',
        description: `Package handed over to FedEx Express with tracking reference #FX-${order.id.replace('ord_', '')}.`,
        actor: business?.businessName || 'Fulfillment Depot',
      });
    }

    if (order.status === 'delivered' || order.status === 'completed') {
      events.push({
        id: `evt_5_${order.id}`,
        orderId: order.id,
        timestamp: new Date(baseTime + 1000 * 60 * 60 * 48).toISOString(),
        stage: 'delivered',
        title: 'Order Delivered to Buyer',
        description: `Shipment confirmed delivered to ${order.shippingAddress.city}, ${order.shippingAddress.state}.`,
        actor: 'Courier Carrier',
      });
    }

    // Commission event
    events.push({
      id: `evt_6_${order.id}`,
      orderId: order.id,
      timestamp: new Date(baseTime + 1000 * 60 * 5).toISOString(),
      stage: 'commission',
      title: 'Reseller Commission Calculated',
      description: `Commission of $${order.resellerCommission.toFixed(2)} automatically calculated & reserved for ${storefront?.storeName || 'Storefront'}.`,
      actor: 'Suk Settlement Engine',
    });

    return events;
  }

  public runMonthlyPayouts(): CommissionPayout[] {
    const storefronts = this.getStorefronts();
    const payouts = this.getPayouts();
    const newPayouts: CommissionPayout[] = [];

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

    storefronts.forEach((sf) => {
      if (sf.pendingPayout >= sf.minPayoutThreshold && sf.pendingPayout > 0) {
        const payoutAmount = sf.pendingPayout;
        const payout: CommissionPayout = {
          id: generateId('pay'),
          resellerId: sf.resellerId,
          storefrontId: sf.id,
          storefrontName: sf.storeName,
          amount: payoutAmount,
          status: 'processed',
          paymentReference: `ACH-${Math.floor(10000000 + Math.random() * 90000000)}`,
          periodStart,
          periodEnd,
          payoutDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        newPayouts.push(payout);

        // Reset pending payout for storefront
        this.updateStorefront(sf.id, { pendingPayout: 0 });

        // Notify reseller
        this.createNotification({
          userId: sf.resellerId,
          userRole: 'reseller',
          type: 'payout_processed',
          title: 'Monthly Payout Processed!',
          message: `Monthly payout of $${payoutAmount.toFixed(2)} was transferred to your payout account.`,
          link: '/reseller/commissions',
        });
      }
    });

    if (newPayouts.length > 0) {
      this.setItem(STORAGE_KEYS.PAYOUTS, [...newPayouts, ...payouts]);
      this.logAdminAction('RUN_MONTHLY_PAYOUTS', 'payouts', 'batch', `Generated ${newPayouts.length} monthly payouts totaling $${newPayouts.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`);
    }

    return newPayouts;
  }

  // --- SUPPORT TICKET SYSTEM METHODS ---
  public getTickets(): SupportTicket[] {
    return this.getItem<SupportTicket[]>(STORAGE_KEYS.TICKETS, initialTickets);
  }

  public getTicketById(id: string): SupportTicket | undefined {
    return this.getTickets().find((t) => t.id === id);
  }

  public getTicketsByReseller(resellerId: string): SupportTicket[] {
    return this.getTickets().filter((t) => t.resellerId === resellerId);
  }

  public createCustomerTicket(data: {
    customerName?: string;
    customerPhone: string;
    relatedOrderId?: string;
    businessId?: string;
    category: string;
    description: string;
    priority?: TicketPriority;
    initialNote?: string;
  }): SupportTicket {
    const tickets = this.getTickets();
    const nextNum = 1000 + tickets.length + 1;
    const now = new Date().toISOString();

    const notes: TicketNote[] = [];
    if (data.initialNote && data.initialNote.trim()) {
      notes.push({
        id: generateId('note'),
        authorName: 'Platform Admin',
        authorRole: 'admin',
        note: data.initialNote.trim(),
        createdAt: now,
      });
    }

    const ticket: SupportTicket = {
      id: `TCK-${nextNum}`,
      ticketType: 'customer',
      customerName: data.customerName?.trim() || undefined,
      customerPhone: data.customerPhone.trim(),
      relatedOrderId: data.relatedOrderId?.trim() || undefined,
      businessId: data.businessId?.trim() || undefined,
      category: data.category,
      description: data.description.trim(),
      status: 'Open',
      priority: data.priority || 'medium',
      notes,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [ticket, ...tickets];
    this.setItem(STORAGE_KEYS.TICKETS, updated);
    this.logAdminAction(
      'CREATE_CUSTOMER_SUPPORT_TICKET',
      'ticket',
      ticket.id,
      `Created customer ticket ${ticket.id} for phone ${ticket.customerPhone} (Category: ${ticket.category})`
    );

    return ticket;
  }

  public createResellerTicket(data: {
    resellerId: string;
    resellerName: string;
    category: string;
    description: string;
    priority?: TicketPriority;
  }): SupportTicket {
    const tickets = this.getTickets();
    const nextNum = 1000 + tickets.length + 1;
    const now = new Date().toISOString();

    const ticket: SupportTicket = {
      id: `TCK-${nextNum}`,
      ticketType: 'reseller',
      resellerId: data.resellerId,
      resellerName: data.resellerName,
      category: data.category,
      description: data.description.trim(),
      status: 'Open',
      priority: data.priority || 'medium',
      notes: [],
      createdAt: now,
      updatedAt: now,
    };

    const updated = [ticket, ...tickets];
    this.setItem(STORAGE_KEYS.TICKETS, updated);

    // Notify admin
    this.createNotification({
      userId: 'usr_admin',
      userRole: 'admin',
      type: 'dispute_created',
      title: `New Reseller Ticket ${ticket.id}`,
      message: `${data.resellerName} submitted ticket: ${data.category}`,
      link: '/admin/tickets',
    });

    return ticket;
  }

  public updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    priority?: TicketPriority
  ): SupportTicket | undefined {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index === -1) return undefined;

    const current = tickets[index];
    const updatedTicket: SupportTicket = {
      ...current,
      status,
      priority: priority || current.priority,
      updatedAt: new Date().toISOString(),
    };

    tickets[index] = updatedTicket;
    this.setItem(STORAGE_KEYS.TICKETS, tickets);

    this.logAdminAction(
      'UPDATE_TICKET_STATUS',
      'ticket',
      ticketId,
      `Updated ticket ${ticketId} status to ${status}${priority ? ` (Priority: ${priority})` : ''}`
    );

    // If reseller ticket, notify reseller
    if (current.ticketType === 'reseller' && current.resellerId) {
      this.createNotification({
        userId: current.resellerId,
        userRole: 'reseller',
        type: 'dispute_created',
        title: `Ticket ${ticketId} Updated`,
        message: `Your ticket status was changed to "${status}".`,
        link: '/reseller/tickets',
      });
    }

    return updatedTicket;
  }

  public addTicketNote(
    ticketId: string,
    authorName: string,
    authorRole: string,
    noteText: string
  ): SupportTicket | undefined {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index === -1) return undefined;

    const current = tickets[index];
    const now = new Date().toISOString();
    const newNote: TicketNote = {
      id: generateId('note'),
      authorName,
      authorRole,
      note: noteText.trim(),
      createdAt: now,
    };

    const updatedTicket: SupportTicket = {
      ...current,
      notes: [...current.notes, newNote],
      updatedAt: now,
    };

    tickets[index] = updatedTicket;
    this.setItem(STORAGE_KEYS.TICKETS, tickets);

    return updatedTicket;
  }

  // --- ORDER REPORTS ---
  public getOrderReports(): OrderReport[] {
    return this.getItem<OrderReport[]>(STORAGE_KEYS.ORDER_REPORTS, initialOrderReports);
  }

  public getOrderReportsByResellerId(resellerId: string): OrderReport[] {
    return this.getOrderReports().filter((r) => r.resellerId === resellerId);
  }

  public getOrderReportsByOrderId(orderId: string): OrderReport[] {
    return this.getOrderReports().filter((r) => r.orderId === orderId);
  }

  public createOrderReport(data: {
    orderId: string;
    category: OrderReportCategory | string;
    description: string;
    attachments?: string[];
  }): OrderReport {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === data.orderId);
    if (!order) {
      throw new Error(`Order #${data.orderId} not found`);
    }

    const currentUser = this.getCurrentUser();
    const storefront = this.getStorefronts().find((s) => s.id === order.storefrontId);
    const storefrontName = storefront?.storeName || order.storefrontName || 'Storefront';
    const resellerName = currentUser.name || 'Reseller';

    const firstItem = order.items[0];
    let businessId = firstItem?.businessId;
    let businessName = firstItem?.brand;

    if (businessId) {
      const biz = this.getBusinesses().find((b) => b.id === businessId);
      if (biz) {
        businessName = biz.businessName;
      }
    }

    const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.productTitle}`).join(', ');
    const productTitle = firstItem ? firstItem.productTitle : 'Order Items';

    const reports = this.getOrderReports();
    const nextNum = 1000 + reports.length + 1;
    const now = new Date().toISOString();

    const report: OrderReport = {
      id: `RPT-${nextNum}`,
      orderId: order.id,
      resellerId: currentUser.id,
      resellerName,
      storefrontId: order.storefrontId,
      storefrontName,
      businessId,
      businessName,
      productTitle,
      itemsSummary,
      orderDate: order.createdAt,
      orderStatus: order.status,
      totalAmount: order.totalAmount,
      resellerCommission: order.resellerCommission,
      category: data.category,
      description: data.description.trim(),
      attachments: data.attachments || [],
      status: 'open',
      notes: [],
      createdAt: now,
      updatedAt: now,
    };

    const updated = [report, ...reports];
    this.setItem(STORAGE_KEYS.ORDER_REPORTS, updated);

    // Notify Admin immediately
    this.createNotification({
      userId: 'usr_admin',
      userRole: 'admin',
      type: 'order_report_created',
      title: `🚩 New Order Report ${report.id}`,
      message: `${resellerName} submitted report for Order #${order.id}: ${data.category}`,
      link: '/admin/order-reports',
    });

    // Notify Reseller confirmation
    this.createNotification({
      userId: currentUser.id,
      userRole: 'reseller',
      type: 'order_report_created',
      title: `✅ Order Report ${report.id} Created`,
      message: `Your report for Order #${order.id} has been submitted for admin review.`,
      link: '/reseller/orders',
    });

    this.logAdminAction(
      'CREATE_ORDER_REPORT',
      'order_report',
      report.id,
      `Reseller ${resellerName} created report ${report.id} for order #${order.id} (${data.category})`
    );

    return report;
  }

  public updateOrderReportStatus(
    reportId: string,
    status: OrderReportStatus,
    noteText?: string,
    resolutionDetails?: string,
    requestTarget?: 'business' | 'reseller'
  ): OrderReport | undefined {
    const reports = this.getOrderReports();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) return undefined;

    const current = reports[index];
    const now = new Date().toISOString();
    const currentUser = this.getCurrentUser();

    let updatedNotes = [...current.notes];
    if (noteText && noteText.trim()) {
      updatedNotes.push({
        id: generateId('note'),
        authorName: currentUser.name || 'Platform Admin',
        authorRole: currentUser.role || 'admin',
        note: noteText.trim(),
        createdAt: now,
        isInternalOnly: false,
      });
    }

    const updatedReport: OrderReport = {
      ...current,
      status,
      resolutionDetails: resolutionDetails !== undefined ? resolutionDetails : current.resolutionDetails,
      notes: updatedNotes,
      updatedAt: now,
    };

    reports[index] = updatedReport;
    this.setItem(STORAGE_KEYS.ORDER_REPORTS, reports);

    // Notify Reseller: received / status changed / requested info / resolved
    this.createNotification({
      userId: current.resellerId,
      userRole: 'reseller',
      type: 'order_report_updated',
      title: `Order Report ${current.id} Update: ${status.replace(/_/g, ' ').toUpperCase()}`,
      message:
        status === 'resolved'
          ? `Your report for Order #${current.orderId} has been resolved.`
          : status === 'waiting_reseller_response'
          ? `Admin requested additional information regarding Order Report #${current.id}.`
          : `Status of Order Report #${current.id} updated to "${status.replace(/_/g, ' ')}".`,
      link: '/reseller/orders',
    });

    // Notify Business Owner if admin requested info related to reported order or status is waiting_business_response
    if (requestTarget === 'business' || status === 'waiting_business_response') {
      if (current.businessId) {
        const biz = this.getBusinesses().find((b) => b.id === current.businessId);
        if (biz) {
          this.createNotification({
            userId: biz.ownerId,
            userRole: 'business_owner',
            type: 'order_report_updated',
            title: `⚠️ Admin Inquiry regarding Order #${current.orderId}`,
            message: noteText || `Platform administration has requested information regarding order #${current.orderId}.`,
            link: '/business/orders',
          });
        }
      }
    }

    this.logAdminAction(
      'UPDATE_ORDER_REPORT',
      'order_report',
      reportId,
      `Updated order report ${reportId} status to ${status}${noteText ? `: ${noteText}` : ''}`
    );

    return updatedReport;
  }

  public addOrderReportNote(
    reportId: string,
    authorName: string,
    authorRole: UserRole,
    noteText: string,
    isInternalOnly: boolean = false
  ): OrderReport | undefined {
    const reports = this.getOrderReports();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) return undefined;

    const current = reports[index];
    const now = new Date().toISOString();

    const newNote: OrderReportNote = {
      id: generateId('note'),
      authorName,
      authorRole,
      note: noteText.trim(),
      createdAt: now,
      isInternalOnly,
    };

    const updatedReport: OrderReport = {
      ...current,
      notes: [...current.notes, newNote],
      updatedAt: now,
    };

    reports[index] = updatedReport;
    this.setItem(STORAGE_KEYS.ORDER_REPORTS, reports);
    return updatedReport;
  }

  // --- PRODUCT REVIEWS & RATINGS ---
  public getReviews(): ProductReview[] {
    return this.getItem<ProductReview[]>(STORAGE_KEYS.REVIEWS, initialReviews);
  }

  public getReviewsForProduct(productId: string, includeHidden: boolean = false): ProductReview[] {
    return this.getReviews().filter((r) => r.productId === productId && (includeHidden || !r.isHidden));
  }

  public getReviewsForBusiness(businessId: string, includeHidden: boolean = false): ProductReview[] {
    return this.getReviews().filter((r) => r.businessId === businessId && (includeHidden || !r.isHidden));
  }

  public getReviewForOrderAndProduct(orderId: string, productId: string): ProductReview | undefined {
    return this.getReviews().find((r) => r.orderId === orderId && r.productId === productId);
  }

  public getRatingStatsForProduct(productId: string): RatingStats {
    const reviews = this.getReviewsForProduct(productId, false);
    return this.calculateRatingStats(reviews);
  }

  public getRatingStatsForBusiness(businessId: string): RatingStats {
    const reviews = this.getReviewsForBusiness(businessId, false);
    return this.calculateRatingStats(reviews);
  }

  private calculateRatingStats(reviews: ProductReview[]): RatingStats {
    const totalReviews = reviews.length;
    const totalVerified = reviews.filter((r) => r.isVerifiedPurchase).length;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        totalVerified: 0,
        breakdown,
        breakdownPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    let sum = 0;
    reviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      breakdown[rounded as keyof typeof breakdown] = (breakdown[rounded as keyof typeof breakdown] || 0) + 1;
      sum += r.rating;
    });

    const averageRating = Number((sum / totalReviews).toFixed(2));
    const breakdownPercentages = {
      5: Math.round((breakdown[5] / totalReviews) * 100),
      4: Math.round((breakdown[4] / totalReviews) * 100),
      3: Math.round((breakdown[3] / totalReviews) * 100),
      2: Math.round((breakdown[2] / totalReviews) * 100),
      1: Math.round((breakdown[1] / totalReviews) * 100),
    };

    return {
      averageRating,
      totalReviews,
      totalVerified,
      breakdown,
      breakdownPercentages,
    };
  }

  public getVerifiedOrdersForProduct(productId: string, customerEmailOrId?: string): Order[] {
    const orders = this.getOrders();
    return orders.filter((o) => {
      if (o.status === 'cancelled' || o.status === 'rejected') return false;
      const hasItem = o.items.some((item) => item.productId === productId);
      if (!hasItem) return false;
      if (customerEmailOrId && customerEmailOrId.trim()) {
        const query = customerEmailOrId.trim().toLowerCase();
        const matchesEmail = o.customerEmail.toLowerCase().includes(query);
        const matchesId = o.id.toLowerCase().includes(query);
        if (!matchesEmail && !matchesId) return false;
      }
      return true;
    });
  }

  public createReview(data: {
    orderId: string;
    productId: string;
    businessId: string;
    storefrontId?: string;
    customerName: string;
    isAnonymous?: boolean;
    rating: number;
    comment?: string;
  }): ProductReview {
    const orders = this.getOrders();
    const order = orders.find(
      (o) => o.id === data.orderId || o.id.toLowerCase() === data.orderId.toLowerCase()
    );

    // Verify purchase: Order must exist and contain the target product, and not be cancelled/rejected
    const orderItem = order?.items.find((i) => i.productId === data.productId);
    const isVerifiedPurchase = !!order && !!orderItem && order.status !== 'cancelled' && order.status !== 'rejected';

    if (!isVerifiedPurchase) {
      throw new Error('Only customers who actually purchased this product can leave a review. No verified order was found.');
    }

    const products = this.getProducts();
    const product = products.find((p) => p.id === data.productId);
    const productTitle = product?.title || 'Product';

    const businesses = this.getBusinesses();
    const business = businesses.find((b) => b.id === data.businessId);
    const businessName = business?.businessName || 'Business';

    const reviews = this.getReviews();
    const existing = reviews.find((r) => r.orderId === data.orderId && r.productId === data.productId);
    if (existing) {
      throw new Error(`A review has already been submitted for this product in order #${data.orderId}`);
    }

    const now = new Date().toISOString();
    const newReview: ProductReview = {
      id: generateId('rev'),
      orderId: data.orderId,
      productId: data.productId,
      businessId: data.businessId,
      storefrontId: data.storefrontId || order.storefrontId,
      customerName: data.isAnonymous ? 'Anonymous Customer' : data.customerName,
      isAnonymous: !!data.isAnonymous,
      rating: Math.min(5, Math.max(1, Math.round(data.rating))),
      comment: data.comment?.trim() || undefined,
      isVerifiedPurchase: true,
      isHidden: false,
      createdAt: now,
      updatedAt: now,
      productTitle,
      businessName,
    };

    const updatedReviews = [newReview, ...reviews];
    this.setItem(STORAGE_KEYS.REVIEWS, updatedReviews);

    // Recalculate business average rating
    this.recalculateBusinessRating(data.businessId);

    // Notify Business Owner
    if (business) {
      this.createNotification({
        userId: business.ownerId,
        userRole: 'business_owner',
        type: 'new_review',
        title: `⭐ New Review for ${productTitle} (${newReview.rating}/5 stars)`,
        message: `${newReview.customerName} left a ${newReview.rating}-star review: "${newReview.comment ? newReview.comment.slice(0, 60) + '...' : 'No comment provided'}"`,
        link: '/business/reviews',
      });

      // Low Rating Alert (1 or 2 stars)
      if (newReview.rating <= 2) {
        this.createNotification({
          userId: business.ownerId,
          userRole: 'business_owner',
          type: 'low_rating_alert',
          title: `⚠️ Low Rating Alert: ${newReview.rating} Stars received`,
          message: `Your product "${productTitle}" received a low rating (${newReview.rating}/5 stars). Check feedback to improve product quality.`,
          link: '/business/reviews',
        });

        this.createNotification({
          userId: 'usr_admin',
          userRole: 'admin',
          type: 'low_rating_alert',
          title: `⚠️ Low Product Rating Alert (${businessName})`,
          message: `Product "${productTitle}" by ${businessName} received a ${newReview.rating}-star review.`,
          link: '/admin/moderation',
        });
      }
    }

    return newReview;
  }

  public updateReview(data: {
    reviewId: string;
    rating: number;
    comment?: string;
    isAnonymous?: boolean;
    customerName?: string;
  }): ProductReview {
    const reviews = this.getReviews();
    const index = reviews.findIndex((r) => r.id === data.reviewId);
    if (index === -1) throw new Error('Review not found');

    const current = reviews[index];
    const updatedReview: ProductReview = {
      ...current,
      rating: Math.min(5, Math.max(1, Math.round(data.rating))),
      comment: data.comment?.trim() || undefined,
      customerName: data.isAnonymous
        ? 'Anonymous Customer'
        : (data.customerName || current.customerName),
      isAnonymous: typeof data.isAnonymous === 'boolean' ? data.isAnonymous : current.isAnonymous,
      updatedAt: new Date().toISOString(),
    };

    reviews[index] = updatedReview;
    this.setItem(STORAGE_KEYS.REVIEWS, reviews);
    this.recalculateBusinessRating(current.businessId);
    return updatedReview;
  }

  public replyToReview(reviewId: string, replyText: string, authorName: string): ProductReview | undefined {
    const reviews = this.getReviews();
    const index = reviews.findIndex((r) => r.id === reviewId);
    if (index === -1) return undefined;

    const current = reviews[index];
    const now = new Date().toISOString();
    const reply: ReviewReply = {
      id: generateId('rep'),
      reviewId,
      businessId: current.businessId,
      authorName,
      replyText: replyText.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const updatedReview: ProductReview = {
      ...current,
      reply,
      updatedAt: now,
    };

    reviews[index] = updatedReview;
    this.setItem(STORAGE_KEYS.REVIEWS, reviews);
    return updatedReview;
  }

  public reportReview(reviewId: string, reason: string, details?: string): ReviewReport {
    const currentUser = this.getCurrentUser();
    const reviews = this.getReviews();
    const review = reviews.find((r) => r.id === reviewId);

    const reports = this.getItem<ReviewReport[]>(STORAGE_KEYS.REVIEW_REPORTS, initialReviewReports);
    const now = new Date().toISOString();

    const report: ReviewReport = {
      id: generateId('reprt'),
      reviewId,
      reporterId: currentUser.id,
      reporterRole: currentUser.role,
      reason: reason.trim(),
      details: details?.trim() || undefined,
      status: 'open',
      createdAt: now,
      review,
    };

    const updated = [report, ...reports];
    this.setItem(STORAGE_KEYS.REVIEW_REPORTS, updated);

    // Notify Admin
    this.createNotification({
      userId: 'usr_admin',
      userRole: 'admin',
      type: 'review_reported',
      title: `🚩 Review Reported by Business`,
      message: `Review #${reviewId} was reported as inappropriate/abusive: "${reason}"`,
      link: '/admin/moderation',
    });

    this.logAdminAction(
      'REPORT_REVIEW',
      'review',
      reviewId,
      `Business owner reported review ${reviewId}: ${reason}`
    );

    return report;
  }

  public getReviewReports(): ReviewReport[] {
    const reports = this.getItem<ReviewReport[]>(STORAGE_KEYS.REVIEW_REPORTS, initialReviewReports);
    const reviews = this.getReviews();
    return reports.map((r) => ({
      ...r,
      review: reviews.find((rev) => rev.id === r.reviewId),
    }));
  }

  public updateReviewReportStatus(reportId: string, status: ReviewReportStatus): ReviewReport | undefined {
    const reports = this.getItem<ReviewReport[]>(STORAGE_KEYS.REVIEW_REPORTS, initialReviewReports);
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) return undefined;

    reports[index].status = status;
    this.setItem(STORAGE_KEYS.REVIEW_REPORTS, reports);
    return reports[index];
  }

  public hideReview(reviewId: string, hiddenReason: string): ProductReview | undefined {
    const reviews = this.getReviews();
    const index = reviews.findIndex((r) => r.id === reviewId);
    if (index === -1) return undefined;

    reviews[index].isHidden = true;
    reviews[index].hiddenReason = hiddenReason;
    reviews[index].updatedAt = new Date().toISOString();

    this.setItem(STORAGE_KEYS.REVIEWS, reviews);
    this.recalculateBusinessRating(reviews[index].businessId);

    this.logAdminAction('HIDE_REVIEW', 'review', reviewId, `Admin hid review #${reviewId}: ${hiddenReason}`);
    return reviews[index];
  }

  public unhideReview(reviewId: string): ProductReview | undefined {
    const reviews = this.getReviews();
    const index = reviews.findIndex((r) => r.id === reviewId);
    if (index === -1) return undefined;

    reviews[index].isHidden = false;
    reviews[index].hiddenReason = undefined;
    reviews[index].updatedAt = new Date().toISOString();

    this.setItem(STORAGE_KEYS.REVIEWS, reviews);
    this.recalculateBusinessRating(reviews[index].businessId);

    this.logAdminAction('UNHIDE_REVIEW', 'review', reviewId, `Admin unhid review #${reviewId}`);
    return reviews[index];
  }

  public deleteReview(reviewId: string) {
    const reviews = this.getReviews();
    const target = reviews.find((r) => r.id === reviewId);
    if (!target) return;

    const filtered = reviews.filter((r) => r.id !== reviewId);
    this.setItem(STORAGE_KEYS.REVIEWS, filtered);
    this.recalculateBusinessRating(target.businessId);

    this.logAdminAction('DELETE_REVIEW', 'review', reviewId, `Admin deleted review #${reviewId}`);
  }

  private recalculateBusinessRating(businessId: string) {
    const stats = this.getRatingStatsForBusiness(businessId);
    this.updateBusinessProfile(businessId, { rating: stats.averageRating || 5.0 }, true);
  }
}

export const storage = new MarketplaceStorageService();
