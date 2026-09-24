import React from 'react';
import { DashboardMetrics } from '../../types/investment';
import { formatCurrency, formatCompactCurrency } from '../../lib/formatters';
import { Users, Wallet, Layers, FileSpreadsheet } from 'lucide-react';

interface MetricCardsProps {
  metrics: DashboardMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const total = metrics.totalAum || 1;
  const camsPct = Math.round((metrics.camsAum / total) * 100);
  const kfinPct = Math.max(0, 100 - camsPct);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total AUM Card */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Total Value (AUM)
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <span
            className="text-base sm:text-xl lg:text-2xl font-bold font-mono text-slate-900 tracking-tight block truncate"
            title={formatCurrency(metrics.totalAum)}
          >
            <span className="hidden sm:inline">{formatCurrency(metrics.totalAum, false)}</span>
            <span className="inline sm:hidden">{formatCompactCurrency(metrics.totalAum)}</span>
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 mt-1 block truncate">
            Combined active portfolio
          </span>
        </div>
      </div>

      {/* Total Clients Card */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Total Clients
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <span className="text-base sm:text-xl lg:text-2xl font-bold font-mono text-indigo-600 tracking-tight block">
            {metrics.totalClients.toLocaleString('en-IN')}
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
            <span className="text-blue-600 font-medium">{metrics.camsClientsCount} CAMS</span>
            <span>•</span>
            <span className="text-purple-600 font-medium">{metrics.kfintechClientsCount} KFin</span>
          </div>
        </div>
      </div>

      {/* RTA Split Progress Card */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            RTA Share
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          {/* Dual progress bar */}
          <div className="w-full bg-slate-100 h-2 sm:h-2.5 rounded-full flex overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${metrics.totalAum > 0 ? camsPct : 50}%` }}
              title={`CAMS: ${camsPct}%`}
            />
            <div
              className="bg-purple-500 h-full transition-all duration-500"
              style={{ width: `${metrics.totalAum > 0 ? kfinPct : 50}%` }}
              title={`KFintech: ${kfinPct}%`}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-600 mt-1.5 font-medium">
            <span className="text-blue-600 truncate">{camsPct}% CAMS</span>
            <span className="text-purple-600 truncate">{kfinPct}% KFin</span>
          </div>
        </div>
      </div>

      {/* Portfolio Depth Card */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Portfolio Depth
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-xl lg:text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {metrics.totalSchemes.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Schemes</span>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-400 mt-1 block truncate">
            {metrics.totalFolios.toLocaleString('en-IN')} Folios • {metrics.totalRecords.toLocaleString('en-IN')} Holdings
          </span>
        </div>
      </div>
    </div>
  );
};
