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

  const getMainDashboardRoute = () => {
    return getHomeRoute(currentUser?.role, storage.isAuthenticated());
  };

  const getPrimaryCatalogRoute = () => {
    if (currentUser.role === 'reseller') return '/marketplace';
    if (currentUser.role === 'business_owner') return '/products';
    return '/admin/products';
  };

  const getPrimaryOrdersRoute = () => {
    if (currentUser.role === 'reseller') return '/reseller/orders';
    if (currentUser.role === 'business_owner') return '/orders';
    return '/admin/orders';
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            <button
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
            <LanguageSwitcher className="hidden md:inline-block" />

            {/* Notification Dropdown */}
            <NotificationDropdown userId={currentUser.id} onNavigate={onNavigate} />

            {/* Role / User Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white p-1 sm:p-1.5 sm:pl-2.5 text-xs font-bold text-neutral-800 shadow-2xs hover:bg-neutral-50"
              >
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-6 w-6 rounded-full object-cover" />
                <span className="hidden sm:inline max-w-[90px] truncate">{currentUser.name.split(' ')[0]}</span>
                <span className="hidden xs:inline-block rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase text-neutral-600 font-extrabold">
                  {currentUser.role === 'business_owner' ? 'Owner' : currentUser.role}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>

              {isUserSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl z-50 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Switch User / Role
                  </div>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`flex w-full items-center justify-between rounded-xl p-2 text-xs transition-colors ${
                        u.id === currentUser.id ? 'bg-neutral-100 font-bold text-neutral-900' : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={u.avatarUrl} alt={u.name} className="h-6 w-6 rounded-full object-cover" />
                        <div className="text-left">
                          <p className="font-bold">{u.name}</p>
                          <p className="text-[10px] text-neutral-400">{u.email}</p>
                        </div>
                      </div>
                      <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[9px] uppercase font-bold text-neutral-700">
                        {u.role === 'business_owner' ? 'Owner' : u.role === 'reseller' ? 'Reseller' : 'Admin'}
                      </span>
                    </button>
                  ))}

                  <div className="my-1 border-t border-neutral-100" />

                  <button
                    onClick={() => {
                      setIsUserSwitcherOpen(false);
                      onNavigate('/');
                    }}
                    className="flex w-full items-center gap-2 rounded-xl p-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <Home className="h-4 w-4 text-emerald-600" />
                    <span>Public Landing Page</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-xl p-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors"
                  >
                    <Shield className="h-4 w-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
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
                onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
                className="rounded-lg bg-white border border-neutral-200 px-2 py-1 text-[10px] font-bold text-neutral-700 shadow-2xs"
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

      {/* Bottom Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-neutral-200 bg-white/95 backdrop-blur-md lg:hidden px-2 shadow-lg">
        <button
          onClick={() => handleNavClick(getMainDashboardRoute())}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
            currentPath === getMainDashboardRoute() ? 'text-emerald-600' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => handleNavClick(getPrimaryCatalogRoute())}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
            currentPath === getPrimaryCatalogRoute() ? 'text-emerald-600' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Grid className="h-4 w-4" />
          <span>Catalog</span>
        </button>

        <button
          onClick={() => handleNavClick(getPrimaryOrdersRoute())}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
            currentPath === getPrimaryOrdersRoute() ? 'text-emerald-600' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Orders</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold text-neutral-500 hover:text-neutral-900"
        >
          <Menu className="h-4 w-4" />
          <span>Menu</span>
        </button>
      </div>
    </>
  );
}
