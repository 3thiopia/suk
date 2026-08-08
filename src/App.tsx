import React, { useState, useEffect } from 'react';
import { storage } from './lib/storage';
import { getStorefrontSlugFromHostname, getStorefrontDomain } from './lib/subdomain';
import { User, CartItem, Order, Product } from './types';
import { Navbar } from './components/common/Navbar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { AccessDenied } from './components/common/AccessDenied';
import { NotificationsView } from './components/common/NotificationsView';
import { AccountRestrictedView } from './components/common/AccountRestrictedView';

// Business Components
import { BusinessDashboard } from './components/business/BusinessDashboard';
import { ProductManager } from './components/business/ProductManager';
import { BusinessOrders } from './components/business/BusinessOrders';
import { BusinessProfileEditor } from './components/business/BusinessProfileEditor';
import { BusinessInventory } from './components/business/BusinessInventory';
import { BusinessSettings } from './components/business/BusinessSettings';
import { BusinessReviews } from './components/business/BusinessReviews';

// Reseller Components
import { ResellerDashboard } from './components/reseller/ResellerDashboard';
import { ProductLibrary } from './components/reseller/ProductLibrary';
import { BusinessMarketplace } from './components/reseller/BusinessMarketplace';
import { StorefrontCustomizer } from './components/reseller/StorefrontCustomizer';
import { StorefrontProductsManager } from './components/reseller/StorefrontProductsManager';
import { CollectionManager } from './components/reseller/CollectionManager';
import { ResellerOrders } from './components/reseller/ResellerOrders';
import { CommissionPayoutsView } from './components/reseller/CommissionPayoutsView';
import { FollowingList } from './components/reseller/FollowingList';
import { ResellerSettings } from './components/reseller/ResellerSettings';
import { ResellerSupportView } from './components/reseller/ResellerSupportView';
import { SocialLinksManager } from './components/reseller/SocialLinksManager';
import { SupplierProfilePage } from './components/reseller/SupplierProfilePage';
import { ProductDetailPage } from './components/reseller/ProductDetailPage';

// Customer Public Storefront Components
import { PublicStorefront } from './components/storefront/PublicStorefront';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { OrderConfirmation } from './components/storefront/OrderConfirmation';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';

// Landing & Auth Components
import { LandingPage } from './components/landing/LandingPage';
import { GetStartedPage } from './components/auth/GetStartedPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { SignInPage } from './components/auth/SignInPage';

export function getDefaultRouteForRole(role: string): string {
  switch (role) {
    case 'reseller':
      return '/reseller/analytics';
    case 'business_owner':
      return '/orders';
    case 'admin':
      return '/admin/orders';
    default:
      return '/';
  }
}

export function isPublicRoute(path: string): boolean {
  return (
    path === '/' ||
    path === '/landing' ||
    path === '/get-started' ||
    path === '/register' ||
    path === '/signin' ||
    path === '/marketplace' ||
    path.startsWith('/store/') ||
    path.startsWith('/supplier/') ||
    path.startsWith('/product/')
  );
}

export function isRouteAllowedForRole(path: string, role: string): boolean {
  // Public routes accessible to everyone
  if (isPublicRoute(path)) {
    return true;
  }

  if (role === 'reseller') {
    const resellerAllowedPaths = [
      '/marketplace',
      '/reseller',
      '/reseller/marketplace',
      '/reseller/library',
      '/reseller/storefront',
      '/reseller/store-products',
      '/reseller/collections',
      '/reseller/orders',
      '/reseller/analytics',
      '/reseller/commissions',
      '/reseller/payouts',
      '/reseller/notifications',
      '/reseller/settings',
      '/reseller/customize',
      '/reseller/social-links',
      '/reseller/following',
      '/reseller/tickets',
      '/reseller/support',
    ];
    return resellerAllowedPaths.some((p) => path === p || path.startsWith(p + '/'));
  }

  if (role === 'business_owner') {
    const businessAllowedPaths = [
      '/orders',
      '/products',
      '/inventory',
      '/profile',
      '/analytics',
      '/notifications',
      '/settings',
      '/reviews',
      '/business',
      '/business/orders',
      '/business/products',
      '/business/inventory',
      '/business/profile',
      '/business/analytics',
      '/business/notifications',
      '/business/settings',
      '/business/reviews',
    ];
    return businessAllowedPaths.some((p) => path === p || path.startsWith(p + '/'));
  }

  if (role === 'admin') {
    const adminAllowedPaths = [
      '/admin',
      '/admin/tickets',
      '/admin/orders',
      '/admin/businesses',
      '/admin/resellers',
      '/admin/products',
      '/admin/categories',
      '/admin/commissions',
      '/admin/payouts',
      '/admin/reports',
      '/admin/disputes',
      '/admin/notifications',
      '/admin/analytics',
      '/admin/audit',
      '/admin/settings',
    ];
    return adminAllowedPaths.some((p) => path === p || path.startsWith(p + '/'));
  }

  return false;
}

export default function App() {
  const initialUser = storage.getCurrentUser();
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [registerRole, setRegisterRole] = useState<'business_owner' | 'reseller'>('business_owner');

  const [currentPath, setCurrentPath] = useState<string>(() => {
    const saved = localStorage.getItem('wl_current_path');
    const isAuth = storage.isAuthenticated();
    if (isAuth) {
      if (saved && isRouteAllowedForRole(saved, initialUser.role)) {
        return saved;
      }
      return getDefaultRouteForRole(initialUser.role);
    }
    // If unauthenticated, only allow public routes
    if (saved && isPublicRoute(saved)) {
      return saved;
    }
    return '/';
  });

  const [, setStorageTick] = useState(0);

  // Global search modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Customer Cart & Checkout state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Subscribe to storage changes for reactive state updates
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setStorageTick((prev) => prev + 1);
      const isAuth = storage.isAuthenticated();
      const user = storage.getCurrentUser();
      setCurrentUser(user);

      // If user logged out and is currently on a protected route, force navigation back to landing page '/'
      if (!isAuth) {
        setCurrentPath((prevPath) => {
          if (!isPublicRoute(prevPath)) {
            localStorage.setItem('wl_current_path', '/');
            return '/';
          }
          return prevPath;
        });
      }
    });
    return unsubscribe;
  }, []);

  // Sync route on role switch / login
  const handleUserChange = (user: User) => {
    storage.login(user.id);
    setCurrentUser(user);
    const targetRoute = getDefaultRouteForRole(user.role);
    setCurrentPath(targetRoute);
    localStorage.setItem('wl_current_path', targetRoute);
  };

  const handleAuthSuccess = (user: User) => {
    storage.login(user.id);
    setCurrentUser(user);
    const targetRoute = getDefaultRouteForRole(user.role);
    setCurrentPath(targetRoute);
    localStorage.setItem('wl_current_path', targetRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchUserById = (userId: string) => {
    const user = storage.getUsers().find((u) => u.id === userId);
    if (user) {
      handleUserChange(user);
    }
  };

  const navigate = (path: string, roleParam?: 'business_owner' | 'reseller') => {
    if (roleParam) {
      setRegisterRole(roleParam);
    } else if (path.includes('role=reseller')) {
      setRegisterRole('reseller');
    } else if (path.includes('role=business_owner')) {
      setRegisterRole('business_owner');
    }

    const cleanPath = path.split('?')[0];
    const isAuth = storage.isAuthenticated();

    if (!isAuth) {
      if (isPublicRoute(cleanPath)) {
        setCurrentPath(cleanPath);
        localStorage.setItem('wl_current_path', cleanPath);
      } else {
        setCurrentPath('/');
        localStorage.setItem('wl_current_path', '/');
      }
    } else {
      if (isRouteAllowedForRole(cleanPath, currentUser.role)) {
        setCurrentPath(cleanPath);
        localStorage.setItem('wl_current_path', cleanPath);
      } else {
        const defaultPath = getDefaultRouteForRole(currentUser.role);
        setCurrentPath(defaultPath);
        localStorage.setItem('wl_current_path', defaultPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations for customer storefront
  const handleAddToCart = (product: Product, selectedCoverImage: string, storefrontProductId: string, quantity: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity,
          selectedCoverImage,
          storefrontProductId,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      );
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleOrderPlaced = (order: Order) => {
    setIsCheckoutOpen(false);
    setCart([]);
    setPlacedOrder(order);
  };

  // Subdomain Hostname Detection or Path-based Routing
  const hostSlugResult = getStorefrontSlugFromHostname(window.location.hostname);
  const hostnameSlug = hostSlugResult?.slug;
  const isPathStorefront = currentPath.startsWith('/store/');
  const activeSlug =
    (isPathStorefront ? currentPath.split('/store/')[1] : null) ||
    (currentPath === '/' ? hostnameSlug : null);

  // Render Public Customer Storefront
  if (activeSlug) {
    const storefront = storage.getStorefrontBySlug(activeSlug);
    const customization = storefront?.customization;

    return (
      <div>
        {/* Banner quick back button to Portal Dashboard */}
        <div className="bg-neutral-900 px-4 py-2 text-center text-xs text-neutral-300 flex items-center justify-between border-b border-neutral-800">
          <span className="font-mono text-[11px] text-emerald-400">
            SUK Storefront Subdomain Hostname: {storefront ? `${storefront.slug}.${getStorefrontDomain()}` : `${activeSlug}.${getStorefrontDomain()}`}
          </span>
          <button
            onClick={() => navigate(getDefaultRouteForRole(currentUser.role))}
            className="rounded bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition-colors"
          >
            ← Back to Portal ({currentUser.role.replace('_', ' ')})
          </button>
        </div>

        <PublicStorefront
          slug={activeSlug}
          cart={cart}
          onAddToCart={handleAddToCart}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigate={navigate}
        />

        {storefront && (
          <>
            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cart={cart}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              customization={customization}
              onCheckout={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            />

            <CheckoutModal
              isOpen={isCheckoutOpen}
              onClose={() => setIsCheckoutOpen(false)}
              storefrontId={storefront.id}
              cart={cart}
              customization={customization}
              onOrderPlaced={handleOrderPlaced}
            />

            <OrderConfirmation
              isOpen={!!placedOrder}
              onClose={() => setPlacedOrder(null)}
              order={placedOrder}
              customization={customization}
            />
          </>
        )}
      </div>
    );
  }

  // Account Restricted View Enforcement
  if (currentUser.status === 'banned' || currentUser.status === 'suspended') {
    return <AccountRestrictedView user={currentUser} onSwitchUser={handleSwitchUserById} />;
  }

  // Check if current route is allowed for the user's role
  const isAllowed = isRouteAllowedForRole(currentPath, currentUser.role);

  // Helper function to render active component based on route
  const renderRoleView = () => {
    // --- PUBLIC LANDING & AUTH FLOW ROUTES ---
    if (currentPath === '/' || currentPath === '/landing') {
      return <LandingPage onNavigate={navigate} />;
    }

    if (currentPath === '/get-started') {
      return <GetStartedPage onNavigate={navigate} />;
    }

    if (currentPath === '/register') {
      return (
        <RegisterPage
          initialRole={registerRole}
          onNavigate={navigate}
          onAuthSuccess={handleAuthSuccess}
        />
      );
    }

    if (currentPath === '/signin') {
      return (
        <SignInPage
          onNavigate={navigate}
          onAuthSuccess={handleAuthSuccess}
        />
      );
    }

    if (!isAllowed) {
      return (
        <AccessDenied
          userRole={currentUser.role}
          onNavigateToDefault={() => navigate(getDefaultRouteForRole(currentUser.role))}
        />
      );
    }

    // --- SUPPLIER PROFILE ROUTE (ACCESSIBLE TO ALL ROLES) ---
    if (currentPath.startsWith('/supplier/')) {
      const supplierId = currentPath.split('/supplier/')[1];
      return (
        <SupplierProfilePage
          businessId={supplierId}
          onNavigate={navigate}
          onBack={() => navigate(getDefaultRouteForRole(currentUser.role))}
        />
      );
    }

    // --- DEDICATED PRODUCT DETAIL ROUTE (ACCESSIBLE TO ALL ROLES) ---
    if (currentPath.startsWith('/product/')) {
      const productId = currentPath.split('/product/')[1];
      return (
        <ProductDetailPage
          productId={productId}
          onNavigate={navigate}
          onBack={() => navigate(getDefaultRouteForRole(currentUser.role))}
        />
      );
    }

    // --- RESELLER VIEWS ---
    if (currentUser.role === 'reseller') {
      if (
        currentPath === '/marketplace' ||
        currentPath === '/reseller/marketplace' ||
        currentPath === '/reseller/library'
      ) {
        return <BusinessMarketplace onNavigate={navigate} />;
      }
      if (
        currentPath === '/reseller/store-products' ||
        currentPath === '/reseller/storefront'
      ) {
        return <StorefrontProductsManager onNavigate={navigate} />;
      }
      if (currentPath === '/reseller/collections') {
        return <CollectionManager />;
      }
      if (currentPath === '/reseller/orders') {
        return <ResellerOrders />;
      }
      if (currentPath === '/reseller/analytics' || currentPath === '/reseller') {
        return <ResellerDashboard onNavigate={navigate} />;
      }
      if (currentPath === '/reseller/commissions' || currentPath === '/reseller/payouts') {
        return <CommissionPayoutsView />;
      }
      if (currentPath === '/reseller/customize') {
        return <StorefrontCustomizer onNavigate={navigate} />;
      }
      if (currentPath === '/reseller/social-links') {
        const resellerSf = storage.getStorefrontByResellerId(currentUser.id);
        return <SocialLinksManager storefrontId={resellerSf?.id || ''} />;
      }
      if (currentPath === '/reseller/notifications') {
        return <NotificationsView userId={currentUser.id} onNavigate={navigate} />;
      }
      if (currentPath === '/reseller/settings') {
        return <ResellerSettings />;
      }
      if (currentPath === '/reseller/following') {
        return <FollowingList onNavigate={navigate} />;
      }
      if (currentPath === '/reseller/tickets' || currentPath === '/reseller/support') {
        return <ResellerSupportView onNavigate={navigate} />;
      }
      return <BusinessMarketplace onNavigate={navigate} />;
    }

    // --- BUSINESS OWNER VIEWS ---
    if (currentUser.role === 'business_owner') {
      if (currentPath === '/orders' || currentPath === '/business/orders') {
        return <BusinessOrders />;
      }
      if (currentPath === '/products' || currentPath === '/business/products') {
        return <ProductManager />;
      }
      if (currentPath === '/inventory' || currentPath === '/business/inventory') {
        return <BusinessInventory />;
      }
      if (currentPath === '/reviews' || currentPath === '/business/reviews') {
        const business = storage.getBusinessByOwnerId(currentUser.id);
        if (!business) return <BusinessDashboard onNavigate={navigate} />;
        return <BusinessReviews business={business} />;
      }
      if (currentPath === '/profile' || currentPath === '/business/profile') {
        return <BusinessProfileEditor />;
      }
      if (currentPath === '/analytics' || currentPath === '/business') {
        return <BusinessDashboard onNavigate={navigate} />;
      }
      if (currentPath === '/notifications' || currentPath === '/business/notifications') {
        return <NotificationsView userId={currentUser.id} onNavigate={navigate} />;
      }
      if (currentPath === '/settings' || currentPath === '/business/settings') {
        return <BusinessSettings />;
      }
      return <BusinessOrders />;
    }

    // --- ADMIN VIEWS ---
    if (currentUser.role === 'admin') {
      let activeTab = 'tickets';
      if (currentPath === '/admin/orders') activeTab = 'orders';
      if (currentPath === '/admin/businesses') activeTab = 'businesses';
      if (currentPath === '/admin/resellers') activeTab = 'resellers';
      if (currentPath === '/admin/products') activeTab = 'products';
      if (currentPath === '/admin/reviews') activeTab = 'reviews';
      if (currentPath === '/admin/categories') activeTab = 'categories';
      if (currentPath === '/admin/commissions') activeTab = 'commissions';
      if (currentPath === '/admin/payouts') activeTab = 'commissions';
      if (currentPath === '/admin/reports') activeTab = 'reports';
      if (currentPath === '/admin/disputes') activeTab = 'disputes';
      if (currentPath === '/admin/notifications') activeTab = 'announcements';
      if (currentPath === '/admin/analytics') activeTab = 'overview';
      if (currentPath === '/admin/audit') activeTab = 'audit';
      if (currentPath === '/admin/settings') activeTab = 'settings';
      if (currentPath === '/admin/tickets') activeTab = 'tickets';

      return <AdminDashboard onNavigate={navigate} activeTab={activeTab} />;
    }

    return null;
  };

  // Standalone full-screen pages (Landing Page, Get Started, Registration, Sign In)
  if (['/', '/landing', '/get-started', '/register', '/signin'].includes(currentPath)) {
    return (
      <div className="min-h-screen bg-neutral-900 font-sans antialiased">
        {renderRoleView()}
      </div>
    );
  }

  // Render Main Portal Layout
  return (
    <div className="min-h-screen bg-neutral-50/70 text-neutral-900 font-sans antialiased">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8 pb-24 lg:pb-8">
        {renderRoleView()}
      </main>

      {/* Global Search Dialog */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigate}
      />
    </div>
  );
}
