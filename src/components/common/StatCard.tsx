import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'neutral';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  color = 'emerald',
}: StatCardProps) {
  const iconColors = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  };

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-all hover:border-neutral-300 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{title}</span>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg border', iconColors[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-neutral-900">{value}</div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-semibold',
              trendPositive ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {trendPositive ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>}
    </div>
  );
}
