import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyableFieldProps {
  /** The actual plain text value to copy to clipboard (always unmasked) */
  valueToCopy: string;
  /** Optional display text if visually formatted or masked. Defaults to valueToCopy. */
  displayValue?: string;
  /** Label for the tooltip or confirmation, e.g. "Account number", "Telebirr number" */
  label?: string;
  /** Custom notification text when copied, e.g. "Account number copied" */
  successMessage?: string;
  /** Size variation */
  size?: 'xs' | 'sm' | 'md';
  /** Extra container styling */
  className?: string;
  /** Custom styling for display value text */
  textClassName?: string;
  /** ID attribute for the button */
  id?: string;
  /** Whether to show a text "Copy" label next to the icon or just an icon button */
  showLabel?: boolean;
}

export function CopyableField({
  valueToCopy,
  displayValue,
  label = 'Value',
  successMessage,
  size = 'xs',
  className = '',
  textClassName = '',
  id,
  showLabel = false,
}: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!valueToCopy) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(valueToCopy);
      } else {
        // Fallback for older browsers / webview if needed
        const textArea = document.createElement('textarea');
        textArea.value = valueToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text to clipboard:', err);
    }
  };

  const displayText = displayValue !== undefined ? displayValue : valueToCopy;
  const message = successMessage || `${label} copied`;

  return (
    <div className={`inline-flex items-center gap-1.5 min-w-0 max-w-full relative ${className}`}>
      {/* Display text */}
      <span className={`truncate ${textClassName || 'font-mono font-bold text-neutral-900'}`}>
        {displayText}
      </span>

      {/* Copy Action Button */}
      <button
        type="button"
        id={id}
        onClick={handleCopy}
        title={copied ? message : `Copy ${label.toLowerCase()}`}
        aria-label={`Copy ${label.toLowerCase()}`}
        className={`inline-flex items-center justify-center gap-1 shrink-0 rounded-lg border transition-all active:scale-95 touch-manipulation ${
          copied
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
            : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 active:bg-neutral-100 shadow-2xs'
        } ${
          size === 'xs'
            ? 'px-1.5 py-1 text-[10px]'
            : size === 'sm'
            ? 'px-2 py-1 text-xs'
            : 'px-2.5 py-1.5 text-xs'
        }`}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-600 shrink-0 stroke-[2.5]" />
            {showLabel && <span className="font-bold text-[10px] text-emerald-700">Copied</span>}
          </>
        ) : (
          <>
            <Copy className="h-3 w-3 shrink-0" />
            {showLabel && <span className="font-bold text-[10px]">Copy</span>}
          </>
        )}
      </button>

      {/* Floating inline feedback badge on copy */}
      {copied && !showLabel && (
        <span
          role="status"
          className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-md animate-in fade-in zoom-in-90 duration-150"
        >
          {message}
        </span>
      )}
    </div>
  );
}
