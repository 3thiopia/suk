import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Globe,
  ExternalLink,
  X,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { Storefront } from '../../types';
import { getStorefrontFullDomain, getStorefrontShareLinks } from '../../lib/subdomain';

interface ShareStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  storefront: Storefront;
}

export function ShareStoreModal({ isOpen, onClose, storefront }: ShareStoreModalProps) {
  const [copied, setCopied] = useState(false);
  const shareData = getStorefrontShareLinks(storefront);
  const fullDomain = getStorefrontFullDomain(storefront.slug);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareData.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
              <Share2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Share Your Storefront</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Promote your custom domain across social media</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storefront Link Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Storefront URL
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white overflow-hidden">
              <Globe className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
              <span className="truncate select-all">{fullDomain}</span>
            </div>
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              Store link copied to clipboard!
            </p>
          )}
        </div>

        {/* Social Media Preview Simulation */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Social Share Preview
          </span>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 rounded-2xl flex gap-3 items.center">
            <img
              src={storefront.logoUrl || storefront.bannerUrl}
              alt={storefront.storeName}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {storefront.storeName}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                {storefront.bannerSubtitle || 'Curated white-label products on SUK marketplace'}
              </p>
              <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {fullDomain}
              </p>
            </div>
          </div>
        </div>

        {/* Social Platform Quick Share Grid */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            1-Click Social Share
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <a
              href={shareData.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-800/50 rounded-xl flex items-center gap-2 transition-colors text-xs font-semibold text-emerald-800 dark:text-emerald-300"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
              WhatsApp
            </a>

            <a
              href={shareData.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200/60 dark:border-sky-800/50 rounded-xl flex items-center gap-2 transition-colors text-xs font-semibold text-sky-800 dark:text-sky-300"
            >
              <Send className="w-4 h-4 text-sky-500" />
              Telegram
            </a>

            <a
              href={shareData.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-800/50 rounded-xl flex items-center gap-2 transition-colors text-xs font-semibold text-blue-800 dark:text-blue-300"
            >
              <Facebook className="w-4 h-4 text-blue-600 fill-blue-600/20" />
              Facebook
            </a>

            <a
              href={shareData.x}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 transition-colors text-xs font-semibold text-slate-900 dark:text-white"
            >
              <Twitter className="w-4 h-4 text-slate-800 dark:text-slate-200" />
              X / Twitter
            </a>

            <a
              href={shareData.email}
              className="p-3 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 rounded-xl flex items-center gap-2 transition-colors text-xs font-semibold text-purple-800 dark:text-purple-300"
            >
              <Mail className="w-4 h-4 text-purple-600" />
              Email
            </a>

            <button
              onClick={handleCopy}
              className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
              Copy URL
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
