import React from 'react';
import { X, Shield, FileText, Info, Mail, HelpCircle, CheckCircle2 } from 'lucide-react';

export type FooterModalType = 'about' | 'contact' | 'privacy' | 'terms' | 'faq' | null;

interface LandingFooterModalProps {
  type: FooterModalType;
  onClose: () => void;
}

export function LandingFooterModal({ type, onClose }: LandingFooterModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {type === 'about' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">About TradeHub</h2>
                <p className="text-xs text-neutral-500">Next-Generation B2B Commerce & Creator Platform</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              TradeHub connects original product manufacturers and brand suppliers directly with independent digital creators. Our mission is to democratize e-commerce distribution by giving suppliers instant access to motivated sellers, while giving creators full turn-key storefront tools without inventory risk.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <h4 className="font-bold text-xs text-neutral-900 mb-1">For Suppliers</h4>
                <p className="text-xs text-neutral-500">Scale distribution channel sales with automated commission management.</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <h4 className="font-bold text-xs text-neutral-900 mb-1">For Creators</h4>
                <p className="text-xs text-neutral-500">Launch curated storefronts with zero upfront stock investments.</p>
              </div>
            </div>
          </div>
        )}

        {type === 'contact' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Contact Us</h2>
                <p className="text-xs text-neutral-500">We are here to support your business growth</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600">
              Have questions about onboarding your catalog or setting up your creator network? Get in touch with our team.
            </p>
            <div className="space-y-3">
              <div className="rounded-xl border border-neutral-200 p-3 bg-neutral-50">
                <p className="text-xs font-bold text-neutral-800">Support Email</p>
                <p className="text-sm font-mono text-emerald-700">support@tradehub-saas.com</p>
              </div>
              <div className="rounded-xl border border-neutral-200 p-3 bg-neutral-50">
                <p className="text-xs font-bold text-neutral-800">Partner & Wholesale Inquiries</p>
                <p className="text-sm font-mono text-emerald-700">partners@tradehub-saas.com</p>
              </div>
            </div>
          </div>
        )}

        {type === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Privacy Policy</h2>
                <p className="text-xs text-neutral-500">Last updated: August 2026</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
              <p>
                At TradeHub, we protect the privacy and security of business owners, creators, and guest customers.
              </p>

              <h4 className="font-bold text-neutral-900 text-sm pt-1">1. Information Collection</h4>
              <p>
                We collect essential business information required to facilitate creator relationships, order processing, and payout disbursements. Guest checkout details are strictly used for shipping and transaction confirmation.
              </p>

              <h4 className="font-bold text-neutral-900 text-sm pt-1">2. Data Security & Usage</h4>
              <p>
                Your data is never sold to third-party advertisers. All payout details and financial metrics are encrypted and accessed strictly for verified platform transactions.
              </p>
            </div>
          </div>
        )}

        {type === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Terms of Service</h2>
                <p className="text-xs text-neutral-500">Agreement governing platform usage</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
              <p>
                By accessing TradeHub, you agree to adhere to supplier quality guidelines, creator commission terms, and platform compliance policies.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm pt-1">Creator Commission Guarantee</h4>
              <p>
                Suppliers agree to honor specified commission percentages for orders placed through creator storefront links. TradeHub automatically manages payout tracking and dispute resolution.
              </p>
            </div>
          </div>
        )}

        {type === 'faq' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Frequently Asked Questions</h2>
                <p className="text-xs text-neutral-500">Quick answers to common questions</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-neutral-200 p-3">
                <h4 className="font-bold text-xs text-neutral-900 mb-1">Do customers need an account to buy?</h4>
                <p className="text-xs text-neutral-600">No! Customers complete guest checkout directly on creator storefronts without registration.</p>
              </div>
              <div className="rounded-xl border border-neutral-200 p-3">
                <h4 className="font-bold text-xs text-neutral-900 mb-1">How do creators earn commissions?</h4>
                <p className="text-xs text-neutral-600">When a customer purchases through your custom storefront link, the supplier fulfills the order and your commission is credited automatically.</p>
              </div>
              <div className="rounded-xl border border-neutral-200 p-3">
                <h4 className="font-bold text-xs text-neutral-900 mb-1">How do business owners get paid?</h4>
                <p className="text-xs text-neutral-600">Supplier revenue net of creator commission is deposited directly to your business account upon order placement.</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end pt-3 border-t border-neutral-100">
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
