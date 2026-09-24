import React from 'react';
import { DashboardMetrics } from '../../types/investment';
import { formatCurrency, formatCompactCurrency } from '../../lib/formatters';
import { Users, Wallet, Layers, FileSpreadsheet } from 'lucide-react';

interface MetricCardsProps {
  metrics: DashboardMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* Total AUM Card */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Total Value (AUM)
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <span className="text-base sm:text-2xl font-bold font-mono text-slate-900 tracking-tight block truncate">
            {formatCurrency(metrics.totalAum)}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 block truncate">
            Combined AUM across RTAs
          </span>
        </div>
      </div>


      {/* Total Clients Card */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Total Clients
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <span className="text-base sm:text-2xl font-bold font-mono text-indigo-600 tracking-tight block">
            {metrics.totalClients.toLocaleString('en-IN')}
          </span>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
            <span>{metrics.camsClientsCount} CAMS</span>
            <span>•</span>
            <span>{metrics.kfintechClientsCount} KFin</span>
          </div>
        </div>
      </div>

      {/* CAMS vs KFintech Split */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            RTA Split (AUM)
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-1.5">
          <div className="flex justify-between items-center text-[11px] sm:text-xs">
            <span className="text-slate-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              CAMS
            </span>
            <span className="font-semibold text-slate-900 font-mono">
              {formatCompactCurrency(metrics.camsAum)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] sm:text-xs">
            <span className="text-slate-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              KFin
            </span>
            <span className="font-semibold text-slate-900 font-mono">
              {formatCompactCurrency(metrics.kfintechAum)}
            </span>
          </div>
        </div>
      </div>

      {/* Schemes & Folios */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Portfolio Depth
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 space-y-1">
          <div className="flex justify-between items-center text-[11px] sm:text-xs">
            <span className="text-slate-600">Schemes:</span>
            <span className="font-bold text-slate-800 font-mono">
              {metrics.totalSchemes.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] sm:text-xs">
            <span className="text-slate-600">Folios:</span>
            <span className="font-bold text-slate-800 font-mono">
              {metrics.totalFolios.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
