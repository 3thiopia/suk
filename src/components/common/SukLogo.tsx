import React from 'react';
import { DollarSign } from 'lucide-react';

interface SukLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightMode?: boolean;
}

export function SukLogoIcon({ className = 'h-6 w-6', color = 'emerald' }: { className?: string; color?: 'emerald' | 'white' | 'dark' }) {
  const colorClass = color === 'emerald' ? 'text-emerald-500' : color === 'white' ? 'text-white' : 'text-neutral-900';

  return (
    <DollarSign
      className={`${className} ${colorClass}`}
      strokeWidth={3}
    />
  );
}

export function SukLogo({ className = '', size = 'md', lightMode = false }: SukLogoProps) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl lg:text-6xl',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12 sm:h-14 sm:w-14',
  };

  const badgeWrapper = {
    sm: 'h-7 w-7 rounded-lg',
    md: 'h-9 w-9 rounded-xl',
    lg: 'h-12 w-12 rounded-xl',
    xl: 'h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Badge with Dollar Sign */}
      <div className={`flex items-center justify-center bg-neutral-900 text-emerald-400 shadow-xs border border-neutral-800 ${badgeWrapper[size]}`}>
        <SukLogoIcon className={iconSizes[size]} color="emerald" />
      </div>

      {/* Brand Name Text */}
      <span className={`font-black tracking-tight ${textSizes[size]} ${lightMode ? 'text-white' : 'text-neutral-900'}`}>
        SU<span className="text-emerald-600">K</span>
      </span>
    </div>
  );
}

