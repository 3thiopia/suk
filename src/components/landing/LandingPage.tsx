import React, { useState } from 'react';
import { Building2, Store, ArrowRight, Sparkles, CheckCircle2, TrendingUp, ShieldCheck, Smartphone, Layout, BarChart3, Coins } from 'lucide-react';
import { motion } from 'motion/react';
import { SukLogo } from '../common/SukLogo';
import { LandingFooterModal, FooterModalType } from './LandingFooterModal';
import { storage } from '../../lib/storage';
import { getHomeRoute } from '../../lib/utils';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [footerModalType, setFooterModalType] = useState<FooterModalType>(null);

  const handleLogoClick = () => {
    const currentUser = storage.getCurrentUser();
    const isAuthenticated = storage.isAuthenticated();
    onNavigate(getHomeRoute(currentUser?.role, isAuthenticated));
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      {/* 1. TOP NAVIGATION (HIDDEN ON MOBILE, VISIBLE ON DESKTOP/TABLET) */}
      <header className="hidden sm:block sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="cursor-pointer" onClick={handleLogoClick}>
            <SukLogo size="md" />
          </div>

          {/* Nav CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/signin')}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-extrabold text-neutral-800 hover:bg-neutral-50 active:scale-95 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('/get-started')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-600 active:scale-95 transition-all shadow-xs"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden pt-10 pb-16 sm:py-20 lg:py-24 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {/* Animated Background Dollar Watermarks */}
          <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
            {/* Dollar Symbol 1 - Top Right (Drifting diagonally) */}
            <motion.div
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{
                x: [0, 25, -20, 0],
                y: [0, -30, 20, 0],
                rotate: [0, 8, -6, 0]
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute -top-6 -right-6 sm:top-2 sm:right-8 lg:right-12 text-emerald-600/10 pointer-events-none"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-36 h-36 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </motion.div>

            {/* Dollar Symbol 2 - Bottom Left (Drifting diagonally) */}
            <motion.div
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{
                x: [0, -20, 20, 0],
                y: [0, 25, -25, 0],
                rotate: [0, -10, 6, 0]
              }}
              transition={{
                duration: 26,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2
              }}
              className="absolute -bottom-8 -left-8 sm:bottom-2 sm:left-6 lg:left-10 text-neutral-400/8 sm:text-neutral-400/10 pointer-events-none"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-32 h-32 sm:w-56 sm:h-56 lg:w-72 lg:h-72"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </motion.div>

            {/* Dollar Symbol 3 - Center Watermark (hidden on mobile, subtle on tablet/desktop) */}
            <motion.div
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{
                x: [0, 18, -22, 0],
                y: [0, -18, 24, 0],
                rotate: [0, 5, -8, 0]
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 4
              }}
              className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500/6 lg:text-emerald-500/8 pointer-events-none"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </motion.div>
          </div>

          {/* Hero Content Wrapper */}
          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Brand Logo Display */}
            <div className="flex justify-center mb-6">
              <SukLogo size="xl" />
            </div>

            {/* Short Tagline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-tight max-w-3xl mx-auto">
              Connect businesses with creators across Ethiopia.
            </h1>

            <p className="mt-3 text-lg sm:text-xl font-bold text-neutral-500">
              Start selling. Start earning. Together.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('/get-started')}
                className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-7 py-4 text-sm font-extrabold text-white hover:bg-emerald-600 active:scale-98 transition-all shadow-md hover:shadow-emerald-900/10"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </button>
              <button
                onClick={() => onNavigate('/signin')}
                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-300 bg-white px-7 py-4 text-sm font-extrabold text-neutral-800 hover:bg-neutral-50 active:scale-98 transition-all"
              >
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3. SHORT EXPLANATION */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 border-y border-neutral-100 bg-neutral-50/60 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-medium">
              SUK helps business owners grow their sales by working with creators. Creators earn commissions by promoting products, while customers can shop without creating an account.
            </p>
          </div>
        </section>

        {/* 4. HOW IT WORKS SECTION */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Simple Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              How It Works
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-medium">
              A seamless marketplace connecting Ethiopian product suppliers with active creators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* For Business Owners Column */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-white font-bold">
                    <Building2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-neutral-900">For Business Owners</h3>
                    <p className="text-xs text-neutral-500">Expand your distribution network</p>
                  </div>
                </div>

                <div className="space-y-6 relative pl-2">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-black text-xs text-emerald-800">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-neutral-900">Create Your Business Account</h4>
                      <p className="mt-1 text-xs text-neutral-600 leading-relaxed font-medium">
                        Register your business in less than a minute.
                      </p>
                    </div>
                  </div>

                  {/* Divider arrow */}
                  <div className="text-neutral-300 pl-3">↓</div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-black text-xs text-emerald-800">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-neutral-900">Add Your Products</h4>
                      <p className="mt-1 text-xs text-neutral-600 leading-relaxed font-medium">
                        Upload products, set prices, and choose the commission you want to pay creators.
                      </p>
                    </div>
                  </div>

                  {/* Divider arrow */}
                  <div className="text-neutral-300 pl-3">↓</div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-black text-xs text-emerald-800">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-neutral-900">Receive Orders</h4>
                      <p className="mt-1 text-xs text-neutral-600 leading-relaxed font-medium">
                        Creators promote your products, and you receive and manage customer orders from your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-100">
                <button
                  onClick={() => onNavigate('/register?role=business_owner')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 px-4 text-xs font-extrabold text-white hover:bg-emerald-600 transition-colors"
                >
                  <span>Start as Business Owner</span>
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                </button>
              </div>
            </div>

            {/* For Creators Column */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-white font-bold">
                    <Store className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-neutral-900">For Creators</h3>
                    <p className="text-xs text-neutral-500">Sell products without stocking inventory</p>
                  </div>
                </div>

                <div className="space-y-6 relative pl-2">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-black text-xs text-emerald-800">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-neutral-900">Create Your Creator Account</h4>
                      <p className="mt-1 text-xs text-neutral-600 leading-relaxed font-medium">
                        Sign up and start exploring products from businesses.
                      </p>
                    </div>
                  </div>

                  {/* Divider arrow */}
                  <div className="text-neutral-300 pl-3">↓</div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-black text-xs text-emerald-800">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-neutral-900">Add Products to Your Storefront</h4>
                      <p className="mt-1 text-xs text-neutral-600 leading-relaxed font-medium">
                        Choose products from the marketplace and add them to your own storefront.
                      </p>
                    </div>
                  </div>

                  {/* Divider arrow */}
                  <div className="text-neutral-300 pl-3">↓</div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-black text-xs text-emerald-800">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-neutral-900">Share & Earn</h4>
                      <p className="mt-1 text-xs text-neutral-600 leading-relaxed font-medium">
                        Share your storefront with customers and earn commission on every successful delivered order.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-100">
                <button
                  onClick={() => onNavigate('/register?role=reseller')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 px-4 text-xs font-extrabold text-white hover:bg-emerald-600 transition-colors"
                >
                  <span>Start as Creator</span>
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. WHY SUK SECTION */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50/70 border-y border-neutral-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
                Why SUK?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-medium">
                Everything you need to grow sales and earn commissions effectively.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs hover:border-emerald-500 transition-colors">
                <div className="text-3xl mb-3">🚀</div>
                <h3 className="text-base font-extrabold text-neutral-900 mb-1.5">
                  Grow your business with creators
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Connect with motivated creators ready to market and sell your catalog across Ethiopia.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs hover:border-emerald-500 transition-colors">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-base font-extrabold text-neutral-900 mb-1.5">
                  Earn commissions from every sale
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Earn clear, transparent commissions on every successful order delivered through your link.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs hover:border-emerald-500 transition-colors">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="text-base font-extrabold text-neutral-900 mb-1.5">
                  Create a beautiful storefront
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Build and customize a digital storefront with custom branding, themes, and product collections.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs hover:border-emerald-500 transition-colors">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-base font-extrabold text-neutral-900 mb-1.5">
                  Track sales and analytics
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Monitor views, pending orders, commission totals, and performance stats in real time.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs hover:border-emerald-500 transition-colors">
                <div className="text-3xl mb-3">📱</div>
                <h3 className="text-base font-extrabold text-neutral-900 mb-1.5">
                  Mobile-friendly experience
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Fully optimized for smartphones so you can manage products and orders anywhere.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs hover:border-emerald-500 transition-colors">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="text-base font-extrabold text-neutral-900 mb-1.5">
                  Secure account management
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Reliable phone-based account creation designed to protect your store and payouts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. ACCOUNT TYPES SECTION (2 CARDS: BUSINESS OWNER & CREATOR - NO CUSTOMER CARD) */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Choose Your Account Type
            </h2>
            <p className="mt-1 text-xs text-neutral-500 font-medium">
              Join as a supplier or start earning as a creator
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Owner Card */}
            <div
              onClick={() => onNavigate('/register?role=business_owner')}
              className="group cursor-pointer rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 mb-5 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                  <span className="text-2xl">🏪</span>
                </div>
                <h3 className="text-lg font-extrabold text-neutral-900 mb-2">Business Owner</h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Sell your products through a network of creators.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center text-xs font-bold text-neutral-900 group-hover:text-emerald-600">
                <span>Start as Business Owner</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Creator Card */}
            <div
              onClick={() => onNavigate('/register?role=reseller')}
              className="group cursor-pointer rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 mb-5 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-lg font-extrabold text-neutral-900 mb-2">Creator</h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Build your own storefront, promote products from trusted businesses, grow your audience, and earn commission from every successful sale.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center text-xs font-bold text-neutral-900 group-hover:text-emerald-600">
                <span>Start as Creator</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </section>

        {/* 7. FINAL CALL TO ACTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-neutral-100 bg-neutral-900 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Ready to get started?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-300 font-medium max-w-xl mx-auto">
              Join SUK today and start growing your business or earning commissions.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('/get-started')}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-7 py-3.5 text-sm font-extrabold text-neutral-950 hover:bg-emerald-400 active:scale-98 transition-all shadow-md"
              >
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4 text-neutral-950" />
              </button>
              <button
                onClick={() => onNavigate('/signin')}
                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-800 px-7 py-3.5 text-sm font-extrabold text-white hover:bg-neutral-700 active:scale-98 transition-all"
              >
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 8. MINIMAL FOOTER */}
      <footer className="border-t border-neutral-100 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
            <SukLogo size="sm" />
            <span className="text-xs text-neutral-400">© {new Date().getFullYear()} SUK. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-neutral-600">
            <button
              onClick={() => setFooterModalType('about')}
              className="hover:text-neutral-900 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => setFooterModalType('contact')}
              className="hover:text-neutral-900 transition-colors"
            >
              Contact
            </button>
            <button
              onClick={() => setFooterModalType('privacy')}
              className="hover:text-neutral-900 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setFooterModalType('terms')}
              className="hover:text-neutral-900 transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>

      {/* Footer Modal Info */}
      <LandingFooterModal type={footerModalType} onClose={() => setFooterModalType(null)} />
    </div>
  );
}

