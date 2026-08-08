import React from 'react';
import { Check, X, ShieldCheck, ShieldAlert } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password?: string;
  showRequirements?: boolean;
}

export function evaluatePasswordStrength(password: string = '') {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

  let label = 'Too Short';
  let color = 'bg-neutral-200 text-neutral-500';
  let barColor = 'bg-neutral-200';
  let percentage = 0;

  if (password.length > 0) {
    if (score <= 2) {
      label = 'Weak';
      color = 'text-rose-600 font-bold';
      barColor = 'bg-rose-500';
      percentage = 25;
    } else if (score === 3) {
      label = 'Fair';
      color = 'text-amber-600 font-bold';
      barColor = 'bg-amber-500';
      percentage = 50;
    } else if (score === 4) {
      label = 'Good';
      color = 'text-blue-600 font-bold';
      barColor = 'bg-blue-500';
      percentage = 75;
    } else {
      label = 'Strong';
      color = 'text-emerald-600 font-bold';
      barColor = 'bg-emerald-500';
      percentage = 100;
    }
  }

  return {
    score,
    label,
    color,
    barColor,
    percentage,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    isValid: hasMinLength && score >= 3,
  };
}

export function PasswordStrengthIndicator({
  password = '',
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const strength = evaluatePasswordStrength(password);

  const requirements = [
    { label: 'At least 8 characters', met: strength.hasMinLength },
    { label: 'Uppercase letter (A-Z)', met: strength.hasUppercase },
    { label: 'Lowercase letter (a-z)', met: strength.hasLowercase },
    { label: 'Number (0-9)', met: strength.hasNumber },
    { label: 'Special character (!@#$...)', met: strength.hasSpecial },
  ];

  return (
    <div className="mt-2 space-y-2 text-xs">
      {/* Visual Strength Meter Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.barColor}`}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
        <div className={`text-[11px] shrink-0 ${strength.color}`}>
          {strength.label}
        </div>
      </div>

      {/* Checklist Requirements */}
      {showRequirements && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[11px]">
          {requirements.map((req, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 transition-colors ${
                req.met ? 'text-emerald-700 font-medium' : 'text-neutral-400'
              }`}
            >
              {req.met ? (
                <Check className="h-3 w-3 text-emerald-600 shrink-0" />
              ) : (
                <X className="h-3 w-3 text-neutral-300 shrink-0" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
