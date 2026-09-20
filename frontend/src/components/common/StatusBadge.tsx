import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, HelpCircle } from 'lucide-react';

interface Props {
  status: 'MATCHED' | 'PARTIAL' | 'NOT FOUND' | 'UNCLEAR' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase().trim();

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  if (normalized === 'MATCHED' || normalized === 'VALIDATED') {
    return (
      <span className={`inline-flex items-center rounded-full font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}>
        <CheckCircle2 className={`${iconSizes} text-emerald-400`} />
        <span>Matched</span>
      </span>
    );
  }

  if (normalized === 'PARTIAL' || normalized === 'NEEDS VALIDATION') {
    return (
      <span className={`inline-flex items-center rounded-full font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 ${sizeClasses}`}>
        <AlertCircle className={`${iconSizes} text-amber-400`} />
        <span>Partial</span>
      </span>
    );
  }

  if (normalized === 'NOT FOUND' || normalized === 'MISSING' || normalized === 'NOT DEMONSTRATED') {
    return (
      <span className={`inline-flex items-center rounded-full font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}>
        <XCircle className={`${iconSizes} text-rose-400`} />
        <span>Not Found</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium bg-slate-500/15 text-slate-400 border border-slate-500/30 ${sizeClasses}`}>
      <HelpCircle className={`${iconSizes} text-slate-400`} />
      <span>Unclear</span>
    </span>
  );
};
