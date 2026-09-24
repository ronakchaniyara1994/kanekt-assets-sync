import React from 'react';
import { SchemeSummary } from '../../types/investment';
import { formatCompactCurrency, formatCurrency } from '../../lib/formatters';
import { TrendingUp } from 'lucide-react';
import { SourceBadge } from '../ui/SourceBadge';

interface TopSchemesCardProps {
  topSchemes: SchemeSummary[];
}

export const TopSchemesCard: React.FC<TopSchemesCardProps> = ({ topSchemes }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-800">Top Schemes by AUM</h3>
        </div>
        <span className="text-xs text-slate-400">Largest Exposures</span>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden">
        {topSchemes.slice(0, 8).map((scheme, idx) => (
          <div key={idx} className="py-2.5 flex items-center justify-between">
            <div className="min-w-0 pr-3">
              <p className="text-xs font-semibold text-slate-800 truncate" title={scheme.schemeName}>
                {scheme.schemeName}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="truncate max-w-[140px] text-slate-600">{scheme.amcName}</span>
                <span>•</span>
                <span>{scheme.clientsCount} clients</span>
                <SourceBadge source={scheme.source} size="sm" />
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-900 block" title={formatCurrency(scheme.totalAum)}>
                {formatCompactCurrency(scheme.totalAum)}
              </span>
            </div>
          </div>
        ))}

        {topSchemes.length === 0 && (
          <p className="text-xs text-slate-400 py-6 text-center italic">No schemes found</p>
        )}
      </div>
    </div>
  );
};
