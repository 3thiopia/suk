import React, { useState } from 'react';
import { Copy, Check, Phone, PhoneCall } from 'lucide-react';

interface PhoneActionButtonsProps {
  phone: string;
  showNumber?: boolean;
  className?: string;
  textColorClass?: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'inline' | 'compact' | 'pill';
}

export const PhoneActionButtons: React.FC<PhoneActionButtonsProps> = ({
  phone,
  showNumber = false,
  className = '',
  textColorClass = 'text-neutral-900',
  size = 'sm',
  variant = 'inline',
}) => {
  const [copied, setCopied] = useState(false);

  if (!phone || !phone.trim()) {
    return <span className="text-neutral-400 italic text-xs">N/A</span>;
  }

  const cleanPhone = phone.trim();
  // Sanitize for tel: URI (keep + and digits)
  const telHref = `tel:${cleanPhone.replace(/[^\d+]/g, '')}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cleanPhone);
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = cleanPhone;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  const textSizes = {
    xs: 'text-[11px]',
    sm: 'text-xs',
    md: 'text-sm',
  };

  const paddingSizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'px-2 py-1.5',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 max-w-full ${className}`}>
      {showNumber && (
        <span className={`font-mono font-bold ${textColorClass} ${textSizes[size]}`}>
          {cleanPhone}
        </span>
      )}

      <div className="inline-flex items-center gap-1 shrink-0">
        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? 'Phone number copied!' : 'Copy phone number'}
          aria-label="Copy phone number"
          className={`relative inline-flex items-center justify-center ${paddingSizes[size]} rounded-lg border transition-all cursor-pointer shadow-2xs ${
            copied
              ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
              : 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800 hover:text-neutral-950 active:scale-95'
          }`}
        >
          {copied ? (
            <>
              <Check className={`${iconSizes[size]} text-emerald-700 animate-in zoom-in-50 duration-150`} />
              <span className="sr-only">Copied</span>
            </>
          ) : (
            <>
              <Copy className={iconSizes[size]} />
              <span className="sr-only">Copy</span>
            </>
          )}

          {/* Feedback Tooltip Badge */}
          {copied && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 text-[10px] font-bold text-white bg-neutral-900 rounded-md shadow-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 duration-150 pointer-events-none">
              Copied!
            </span>
          )}
        </button>

        {/* Call Button */}
        <a
          href={telHref}
          onClick={(e) => e.stopPropagation()}
          title={`Call ${cleanPhone}`}
          aria-label={`Call ${cleanPhone}`}
          className={`inline-flex items-center justify-center ${paddingSizes[size]} rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all cursor-pointer shadow-2xs active:scale-95`}
        >
          <PhoneCall className={`${iconSizes[size]} text-emerald-700`} />
          <span className="sr-only">Call</span>
        </a>
      </div>
    </div>
  );
};
