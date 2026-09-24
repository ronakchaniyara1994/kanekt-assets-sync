import React from 'react';
import { AmcSummary } from '../../types/investment';
import { formatCurrency, formatCompactCurrency } from '../../lib/formatters';
import { Landmark } from 'lucide-react';

interface AmcSummaryTableProps {
  amcSummaries: AmcSummary[];
}

export const AmcSummaryTable: React.FC<AmcSummaryTableProps> = ({ amcSummaries }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">Asset Management Company (AMC) Breakdown</h3>
        </div>
        <span className="text-xs text-slate-400">{amcSummaries.length} Fund Houses</span>
      </div>

      <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
        <table className="min-w-full text-xs divide-y divide-slate-200">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3.5 py-2.5 text-left font-semibold">AMC / Fund House</th>
              <th className="px-3 py-2.5 text-center font-semibold">Clients</th>
              <th className="px-3 py-2.5 text-center font-semibold">Schemes</th>
              <th className="px-3 py-2.5 text-right font-semibold">CAMS AUM</th>
              <th className="px-3 py-2.5 text-right font-semibold">KFintech AUM</th>
              <th className="px-3.5 py-2.5 text-right font-semibold">Total Current Value (AUM)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {amcSummaries.map((amc, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 transition">
                <td className="px-3.5 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                  {amc.amcName}
                </td>
                <td className="px-3 py-2.5 text-center text-slate-600">{amc.clientsCount}</td>
                <td className="px-3 py-2.5 text-center text-slate-600">{amc.schemesCount}</td>
                <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                  {amc.camsAum > 0 ? formatCompactCurrency(amc.camsAum) : '—'}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                  {amc.kfintechAum > 0 ? formatCompactCurrency(amc.kfintechAum) : '—'}
                </td>
                <td className="px-3.5 py-2.5 text-right font-bold text-slate-900 font-mono">
                  {formatCurrency(amc.totalAum)}
                </td>
              </tr>
            ))}

            {amcSummaries.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                  No AMC data available. Upload CAMS or KFintech CSV to view breakdown.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
