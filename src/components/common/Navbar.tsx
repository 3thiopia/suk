import React, { useState } from 'react';
import {
  Store,
  Building2,
  Search,
  ShoppingBag,
  UserCheck,
  Shield,
  Layers,
  ChevronDown,
  Database,
  Sparkles,
  Menu,
  X,
  Package,
  BarChart3,
  Bell,
  Settings,
  DollarSign,
  Palette,
  LifeBuoy,
  Ticket,
  Scale,
  Grid,
  Home,
  ChevronRight,
  Share2,
  Star,
  Check,
  Plus,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { NotificationDropdown } from './NotificationDropdown';
import { SukLogo } from './SukLogo';
import { User } from '../../types';
import { useTranslation, LanguageSwitcher } from '../../lib/i18n/LanguageContext';
import { getHomeRoute } from '../../lib/utils';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string, params?: any) => void;
  currentUser: User;
  onUserChange: (user: User) => void;
  onOpenSearch: () => void;
}

export function Navbar({
  currentPath,
  onNavigate,
  currentUser,
  onUserChange,
  onOpenSearch,
}: NavbarProps) {
  const { t } = useTranslation();
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const users = storage.getUsers();
  const storefronts = storage.getStorefronts();

  const handleSelectUser = (user: User) => {
    storage.login(user.id);
    onUserChange(user);
    setIsUserSwitcherOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    setIsUserSwitcherOpen(false);
    setIsMobileMenuOpen(false);
    await storage.logout();
    onNavigate('/');
  };

  const activeStore =
    currentUser.role === 'reseller'
      ? storage.getStorefrontByResellerId(currentUser.id)
      : storefronts[0];

  const handleNavClick = (path: string, params?: any) => {
    onNavigate(path, params);
    setIsMobileMenuOpen(false);
  };

  const getNavLinks = () => {
    if (currentUser.role === 'business_owner') {
      return [
        { path: '/orders', altPath: '/business/orders', label: t('nav.orders'), icon: ShoppingBag },
        { path: '/products', altPath: '/business/products', label: t('nav.products'), icon: Package },
        { path: '/inventory', altPath: '/business/inventory', label: t('nav.inventory'), icon: Layers },
        { path: '/business/reviews', altPath: '/reviews', label: 'Reviews', icon: Star },
        { path: '/profile', altPath: '/business/profile', label: t('nav.profile'), icon: Building2 },
        { path: '/analytics', altPath: '/business', label: t('nav.analytics'), icon: BarChart3 },
        { path: '/settings', altPath: '/business/settings', label: t('nav.settings'), icon: Settings },
      ];
    } else if (currentUser.role === 'reseller') {
      return [
        { path: '/marketplace', altPath: '/reseller/marketplace', label: t('nav.marketplace'), icon: Grid },
        { path: '/reseller/store-products', altPath: '/reseller/storefront', label: t('nav.myStorefront'), icon: Store },
        { path: '/reseller/collections', altPath: '', label: t('nav.collections'), icon: Layers },
        { path: '/reseller/orders', altPath: '', label: t('nav.orders'), icon: ShoppingBag },
        { path: '/reseller/analytics', altPath: '/reseller', label: t('nav.analytics'), icon: BarChart3 },
        { path: '/reseller/commissions', altPath: '', label: t('nav.commission'), icon: DollarSign },
        { path: '/reseller/customize', altPath: '', label: t('nav.customizer'), icon: Palette },
        { path: '/reseller/social-links', altPath: '', label: t('nav.socialLinks'), icon: Share2 },
        { path: '/reseller/tickets', altPath: '/reseller/support', label: t('nav.support'), icon: LifeBuoy },
        { path: '/reseller/settings', altPath: '', label: t('nav.settings'), icon: Settings },
      ];
    } else {
      return [
        { path: '/admin/tickets', altPath: '', label: t('nav.tickets'), icon: Ticket },
        { path: '/admin/orders', altPath: '/admin', label: t('nav.orders'), icon: ShoppingBag },
        { path: '/admin/businesses', altPath: '', label: t('nav.businesses'), icon: Building2 },
        { path: '/admin/resellers', altPath: '', label: t('nav.resellers'), icon: Store },
        { path: '/admin/products', altPath: '', label: t('nav.products'), icon: Package },
        { path: '/admin/payouts', altPath: '/admin/commissions', label: t('nav.payouts'), icon: DollarSign },
        { path: '/admin/disputes', altPath: '', label: t('nav.disputes'), icon: Shield },
        { path: '/admin/settings', altPath: '', label: t('nav.settings'), icon: Settings },
      ];
    }
  };

  const navLinks = getNavLinks();

  const isLinkActive = (path: string, altPath: string) => {
    return currentPath === path || (altPath !== '' && currentPath === altPath);
  };

  const handleLogoClick = () => {
    const homeRoute = getHomeRoute(currentUser?.role, storage.isAuthenticated());
    handleNavClick(homeRoute);
  };

  const getOrdersRoute = () => {
    if (currentUser.role === 'reseller') return '/reseller/orders';
    if (currentUser.role === 'business_owner') return '/orders';
    return '/admin/orders';
  };

  const getProductsRoute = () => {
    if (currentUser.role === 'reseller') return '/reseller/store-products';
    if (currentUser.role === 'business_owner') return '/products';
    return '/admin/products';
  };

  const getAnalyticsRoute = () => {
    if (currentUser.role === 'reseller') return '/reseller/analytics';
    if (currentUser.role === 'business_owner') return '/analytics';
    return '/admin/analytics';
  };

  const getSettingsRoute = () => {
    if (currentUser.role === 'reseller') return '/reseller/settings';
    if (currentUser.role === 'business_owner') return '/settings';
    return '/admin/settings';
  };

  const isOrdersActive =
    currentPath === getOrdersRoute() ||
    currentPath.startsWith('/orders') ||
    currentPath.startsWith('/business/orders') ||
    currentPath.startsWith('/reseller/orders') ||
    currentPath.startsWith('/admin/orders');

  const isProductsActive =
    currentPath === getProductsRoute() ||
    currentPath.startsWith('/products') ||
    currentPath.startsWith('/business/products') ||
    currentPath.startsWith('/reseller/store-products') ||
    currentPath.startsWith('/reseller/library') ||
    currentPath.startsWith('/admin/products');

  const isAnalyticsActive =
    currentPath === getAnalyticsRoute() ||
    currentPath.startsWith('/analytics') ||
    currentPath.startsWith('/business/analytics') ||
    currentPath.startsWith('/reseller/analytics') ||
    currentPath === '/business' ||
    currentPath === '/reseller';

  const isSettingsActive =
    currentPath === getSettingsRoute() ||
    currentPath.startsWith('/settings') ||
    currentPath.startsWith('/business/settings') ||
    currentPath.startsWith('/reseller/settings') ||
    currentPath.startsWith('/admin/settings');

  const handleAddProductClick = () => {
    if (currentUser.role === 'business_owner') {
      if (currentPath !== '/products' && currentPath !== '/business/products') {
        onNavigate('/products');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-add-product-modal'));
        }, 150);
      } else {
        window.dispatchEvent(new CustomEvent('open-add-product-modal'));
      }
    } else if (currentUser.role === 'reseller') {
      onNavigate('/reseller/library');
    } else if (currentUser.role === 'admin') {
      onNavigate('/admin/products');
    } else {
      onNavigate('/signin');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Left: Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div
              onClick={handleLogoClick}
              className="cursor-pointer flex items-center hover:opacity-90 active:scale-95 transition-all"
              role="button"
              aria-label="Go to Home/Dashboard"
            >
              <SukLogo size="sm" />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
              {navLinks.map((link) => {
                const active = isLinkActive(link.path, link.altPath);
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`rounded-lg px-2.5 py-1.5 transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Notification Dropdown */}
            <NotificationDropdown userId={currentUser.id} onNavigate={onNavigate} />

            {/* Role / User Switcher */}
            <div className="relative">
              {/* Compact Mobile Profile Icon Button (Mobile view only) */}
              <button
                type="button"
                onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
                className="flex sm:hidden h-10 w-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white p-0.5 shadow-2xs hover:bg-neutral-50 active:scale-95 transition-all focus:outline-none ring-2 ring-emerald-500/20"
                aria-label="Switch Profile"
                title="Switch Profile"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </button>

              {/* Tablet/Desktop Profile Switcher Button */}
              <button
                type="button"
                onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
                className="hidden sm:flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white p-1 px-2.5 text-xs font-bold text-neutral-800 shadow-2xs hover:bg-neutral-50 active:scale-95 transition-all focus:outline-none"
                aria-label="Switch Profile"
                title="Switch Profile"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-6 w-6 rounded-full object-cover shrink-0 ring-1 ring-emerald-500/20"
                />
                <span className="max-w-[85px] truncate font-bold">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="rounded-md bg-emerald-100/90 px-1.5 py-0.5 text-[10px] uppercase text-emerald-900 font-extrabold shrink-0">
                  {currentUser.role === 'business_owner' ? 'Owner' : currentUser.role === 'reseller' ? 'Creator' : 'Admin'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              </button>

              {isUserSwitcherOpen && (
                <>
                  {/* Backdrop for mobile tap-away */}
                  <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-2xs sm:bg-transparent sm:backdrop-blur-none"
                    onClick={() => setIsUserSwitcherOpen(false)}
                  />

                  {/* Mobile-Friendly Profile Switcher Panel */}
                  <div className="fixed inset-x-3 top-16 z-50 max-w-sm mx-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-2xl ring-1 ring-black/5 space-y-2">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                        Select Active Profile
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsUserSwitcherOpen(false)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors sm:hidden"
                        aria-label="Close profile switcher"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-[60vh] sm:max-h-80 overflow-y-auto">
                      {users.map((u) => {
                        const isActive = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelectUser(u)}
                            className={`flex w-full items-center justify-between rounded-xl p-2.5 text-xs transition-all active:scale-98 ${
                              isActive
                                ? 'bg-emerald-50/90 border border-emerald-300/80 font-bold text-neutral-900 shadow-2xs'
                                : 'border border-neutral-100 hover:bg-neutral-50 text-neutral-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-1">
                              <img
                                src={u.avatarUrl}
                                alt={u.name}
                                className="h-8 w-8 rounded-full object-cover shrink-0 border border-neutral-200 shadow-2xs"
                              />
                              <div className="text-left truncate">
                                <p className="font-bold text-neutral-900 truncate">{u.name}</p>
                                <p className="text-[10px] text-neutral-500 truncate">{u.email}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[9px] uppercase font-extrabold ${
                                  isActive
                                    ? 'bg-emerald-200/90 text-emerald-900'
                                    : 'bg-neutral-100 text-neutral-600'
                                }`}
                              >
                                {u.role === 'business_owner' ? 'Owner' : u.role === 'reseller' ? 'Reseller' : 'Admin'}
                              </span>
                              {isActive && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="my-1 border-t border-neutral-100" />

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserSwitcherOpen(false);
                          onNavigate('/');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                      >
                        <Home className="h-4 w-4 text-emerald-600" />
                        <span>Public Landing Page</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <Shield className="h-4 w-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-neutral-200 p-4">
              <div
                onClick={handleLogoClick}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
                role="button"
                aria-label="Go to Home/Dashboard"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
                  <Store className="h-4 w-4" />
                </div>
                <span className="text-lg font-extrabold text-neutral-900">
                  Su<span className="text-emerald-500">k</span> Navigation
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current Active User Banner in Drawer */}
            <div className="bg-neutral-50 p-4 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-9 w-9 rounded-full object-cover border" />
                <div>
                  <p className="text-xs font-bold text-neutral-900">{currentUser.name}</p>
                  <p className="text-[10px] text-neutral-500 capitalize">{currentUser.role.replace('_', ' ')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsUserSwitcherOpen(true);
                }}
                className="rounded-lg bg-white border border-neutral-200 px-2.5 py-1 text-[10px] font-bold text-neutral-700 shadow-2xs hover:bg-neutral-50"
              >
                Switch
              </button>
            </div>

            {/* Language Selection Section in Drawer */}
            <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {t('nav.selectLanguage', 'Select Language')}
              </div>
              <LanguageSwitcher variant="inline" />
            </div>

            {/* Scrollable Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1">
                Workspace Menu
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isLinkActive(link.path, link.altPath);
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${active ? 'text-emerald-400' : 'text-neutral-500'}`} />
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-neutral-400'}`} />
                  </button>
                );
              })}

              <div className="pt-4 border-t border-neutral-100 mt-4">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-rose-500" />
                    <span>Sign Out</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Mobile Navigation Bar — Modern Floating Center Action */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200/90 bg-white/95 backdrop-blur-md lg:hidden shadow-2xl pb-safe">
        <div className="relative mx-auto flex h-16 max-w-md items-center justify-between px-1 sm:px-2">
          {/* 1. Orders */}
          <button
            type="button"
            onClick={() => handleNavClick(getOrdersRoute())}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] sm:text-[11px] font-bold transition-all ${
              isOrdersActive ? 'text-emerald-600 font-extrabold' : 'text-neutral-900 hover:text-black font-semibold'
            }`}
          >
            <ShoppingBag className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${isOrdersActive ? 'text-emerald-600 stroke-[2.5]' : 'text-neutral-900'}`} />
            <span className="truncate">{t('nav.orders', 'Orders')}</span>
            {isOrdersActive && <span className="h-1 w-1 rounded-full bg-emerald-600 -mt-0.5" />}
          </button>

          {/* 2. Products */}
          <button
            type="button"
            onClick={() => handleNavClick(getProductsRoute())}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] sm:text-[11px] font-bold transition-all ${
              isProductsActive ? 'text-emerald-600 font-extrabold' : 'text-neutral-900 hover:text-black font-semibold'
            }`}
          >
            <Package className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${isProductsActive ? 'text-emerald-600 stroke-[2.5]' : 'text-neutral-900'}`} />
            <span className="truncate">{t('nav.products', 'Products')}</span>
            {isProductsActive && <span className="h-1 w-1 rounded-full bg-emerald-600 -mt-0.5" />}
          </button>

          {/* 3. Floating Center Action (+ Add Product) */}
          <div className="flex flex-1 items-center justify-center relative -top-3">
            <button
              type="button"
              onClick={handleAddProductClick}
              className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-white transition-all duration-150 hover:bg-emerald-700 active:scale-95 focus:outline-none"
              aria-label={t('catalog.addProduct', 'Add Product')}
              title={t('catalog.addProduct', 'Add Product')}
            >
              <Plus className="h-6 w-6 stroke-[2.8]" />
            </button>
          </div>

          {/* 4. Analytics */}
          <button
            type="button"
            onClick={() => handleNavClick(getAnalyticsRoute())}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] sm:text-[11px] font-bold transition-all ${
              isAnalyticsActive ? 'text-emerald-600 font-extrabold' : 'text-neutral-900 hover:text-black font-semibold'
            }`}
          >
            <BarChart3 className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${isAnalyticsActive ? 'text-emerald-600 stroke-[2.5]' : 'text-neutral-900'}`} />
            <span className="truncate">{t('nav.analytics', 'Analytics')}</span>
            {isAnalyticsActive && <span className="h-1 w-1 rounded-full bg-emerald-600 -mt-0.5" />}
          </button>

          {/* 5. Settings */}
          <button
            type="button"
            onClick={() => handleNavClick(getSettingsRoute())}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] sm:text-[11px] font-bold transition-all ${
              isSettingsActive ? 'text-emerald-600 font-extrabold' : 'text-neutral-900 hover:text-black font-semibold'
            }`}
          >
            <Settings className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${isSettingsActive ? 'text-emerald-600 stroke-[2.5]' : 'text-neutral-900'}`} />
            <span className="truncate">{t('nav.settings', 'Settings')}</span>
            {isSettingsActive && <span className="h-1 w-1 rounded-full bg-emerald-600 -mt-0.5" />}
          </button>
        </div>
      </div>
    </>
  );
}
