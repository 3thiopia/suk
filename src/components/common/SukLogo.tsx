import React, { useState } from 'react';

export interface SukLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightMode?: boolean;
  showText?: boolean;
  src?: string;
  alt?: string;
}

export const SUK_LOGO_PATH = '/images/suk-logo.png';

export function SukLogoIcon({
  className = 'h-7 w-7',
  src = SUK_LOGO_PATH,
}: {
  className?: string;
  src?: string;
  color?: 'emerald' | 'white' | 'dark';
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-neutral-900 text-emerald-400 font-extrabold text-xs rounded-lg p-1 ${className}`}>
        $
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="SUK"
      onError={() => setHasError(true)}
      className={`object-cover rounded-xl shrink-0 select-none ${className}`}
      loading="eager"
    />
  );
}

export function SukLogo({
  className = '',
  size = 'md',
  lightMode = false,
  showText = true,
  src = SUK_LOGO_PATH,
  alt = 'SUK Logo',
}: SukLogoProps) {
  const [hasError, setHasError] = useState(false);

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl lg:text-6xl',
  };

  const badgeWrapper = {
    sm: 'h-7 w-7 rounded-lg',
    md: 'h-9 w-9 rounded-xl',
    lg: 'h-12 w-12 rounded-xl',
    xl: 'h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none shrink-0 ${className}`}>
      {/* Brand Image Logo Badge (Replaceable via /images/suk-logo.png) */}
      <div className={`relative flex items-center justify-center overflow-hidden bg-neutral-900 text-emerald-400 shadow-xs border border-neutral-800 shrink-0 ${badgeWrapper[size]}`}>
        {!hasError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover rounded-[inherit] transition-opacity duration-200"
            loading="eager"
          />
        ) : (
          <span className="font-extrabold text-emerald-400">$</span>
        )}
      </div>

      {/* Brand Name Text: SUK with Green K */}
      {showText && (
        <span className={`font-black tracking-tight ${textSizes[size]} ${lightMode ? 'text-white' : 'text-neutral-900'}`}>
          SU<span className="text-emerald-600">K</span>
        </span>
      )}
    </div>
  );
}



