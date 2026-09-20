import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  className?: string;
}

export const HumanReviewNotice: React.FC<Props> = ({ className = '' }) => {
  return (
    <div className={`flex items-start space-x-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs ${className}`}>
      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
      <div>
        <span className="font-semibold text-amber-200">Human Review Required: </span>
        <span>
          AI-generated matching indicator and screening insights are strictly based on available candidate evidence.
          This system provides evidentiary signals for recruiters and does not make automated or autonomous hiring decisions.
        </span>
      </div>
    </div>
  );
};

export const AuditSourceBadge: React.FC<{ source: string }> = ({ source }) => {
  return (
    <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">
      <ShieldCheck className="w-3 h-3 text-blue-400" />
      <span>{source}</span>
    </div>
  );
};
