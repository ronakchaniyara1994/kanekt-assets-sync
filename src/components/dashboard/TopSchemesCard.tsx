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
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0" />
          <h3 className="text-sm font-bold text-slate-800">Top Schemes</h3>
        </div>
        <span className="text-xs text-slate-400">Largest Exposures</span>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden flex-1 flex flex-col justify-around py-1">
        {topSchemes.slice(0, 5).map((scheme, idx) => (
          <div key={idx} className="py-2 px-2 -mx-1.5 flex items-center justify-between hover:bg-slate-50/80 rounded-lg transition">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <span
                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  idx === 0
                    ? 'bg-indigo-100 text-indigo-800 font-extrabold'
                    : idx === 1
                    ? 'bg-slate-200 text-slate-700 font-bold'
                    : idx === 2
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate" title={scheme.schemeName}>
                  {scheme.schemeName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="truncate max-w-[120px] text-[10px] text-slate-500">{scheme.amcName}</span>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">{scheme.clientsCount} clients</span>
                  <SourceBadge source={scheme.source} size="sm" />
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-900 block font-mono" title={formatCurrency(scheme.totalAum)}>
                {formatCompactCurrency(scheme.totalAum)}
              </span>
            </div>
          </div>
        ))}

        {topSchemes.length === 0 && (
          <p className="text-xs text-slate-400 py-6 text-center italic">No schemes found</p>
        )}
      </div>

      <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
        <span>Ranked by AUM</span>
        <span className="font-semibold text-slate-600">{topSchemes.length} schemes tracked</span>
      </div>
    </div>
  );
};
