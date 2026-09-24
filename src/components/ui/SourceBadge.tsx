import React from 'react';
import { DataSource } from '../../types/investment';

interface SourceBadgeProps {
  source: DataSource | 'BOTH';
  size?: 'sm' | 'md';
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  if (source === 'CAMS') {
    return (
      <span className={`inline-flex items-center font-medium rounded-md bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
        CAMS
      </span>
    );
  }

  if (source === 'KFINTECH') {
    return (
      <span className={`inline-flex items-center font-medium rounded-md bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-1.5"></span>
        KFintech
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-700/10 ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
      CAMS + KFintech
    </span>
  );
};
