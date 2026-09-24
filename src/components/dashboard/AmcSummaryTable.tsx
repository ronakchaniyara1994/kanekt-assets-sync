import React, { useState, useMemo } from 'react';
import { AmcSummary } from '../../types/investment';
import { formatCurrency, formatCompactCurrency } from '../../lib/formatters';
import { Landmark, Search, ArrowRight } from 'lucide-react';

interface AmcSummaryTableProps {
  amcSummaries: AmcSummary[];
  totalAum?: number;
}

export const AmcSummaryTable: React.FC<AmcSummaryTableProps> = ({ amcSummaries, totalAum }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSummaries = useMemo(() => {
    if (!searchTerm.trim()) return amcSummaries;
    const term = searchTerm.toLowerCase();
    return amcSummaries.filter(amc => amc.amcName.toLowerCase().includes(term));
  }, [amcSummaries, searchTerm]);

  const effectiveTotalAum = totalAum || amcSummaries.reduce((sum, a) => sum + a.totalAum, 0) || 1;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Fund House (AMC) Breakdown</h3>
            <p className="text-[11px] text-slate-400">Exposure and allocation across asset management companies</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search fund house..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-semibold shrink-0">
            {filteredSummaries.length} AMCs
          </span>
        </div>
      </div>

      {/* Mobile scroll hint */}
      <div className="sm:hidden flex items-center justify-end text-[10px] text-slate-400 mb-1.5 gap-1">
        <span>Swipe horizontally to view all columns</span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
      </div>

      <div className="overflow-x-auto border border-slate-200/80 rounded-lg shadow-2xs">
        <table className="min-w-full text-xs divide-y divide-slate-200">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3.5 py-2.5 text-left font-semibold">AMC / Fund House</th>
              <th className="px-3 py-2.5 text-center font-semibold">Clients</th>
              <th className="px-3 py-2.5 text-center font-semibold">Schemes</th>
              <th className="px-3 py-2.5 text-right font-semibold">CAMS AUM</th>
              <th className="px-3 py-2.5 text-right font-semibold">KFintech AUM</th>
              <th className="px-3.5 py-2.5 text-right font-semibold">Total AUM</th>
              <th className="px-3.5 py-2.5 text-right font-semibold w-24">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredSummaries.map((amc, idx) => {
              const sharePercent = ((amc.totalAum / effectiveTotalAum) * 100);
              return (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="px-3.5 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                    <span className="truncate max-w-[220px] block" title={amc.amcName}>
                      {amc.amcName}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-slate-600 font-mono">{amc.clientsCount}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600 font-mono">{amc.schemesCount}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-600 whitespace-nowrap">
                    {amc.camsAum > 0 ? (
                      <span className="text-blue-600 font-medium">{formatCompactCurrency(amc.camsAum)}</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-600 whitespace-nowrap">
                    {amc.kfintechAum > 0 ? (
                      <span className="text-purple-600 font-medium">{formatCompactCurrency(amc.kfintechAum)}</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-slate-900 font-mono whitespace-nowrap" title={formatCurrency(amc.totalAum)}>
                    {formatCurrency(amc.totalAum)}
                  </td>
                  <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(3, sharePercent))}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-slate-600">
                        {sharePercent.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredSummaries.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400 italic">
                  {searchTerm ? `No fund house matching "${searchTerm}"` : 'No AMC data available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
