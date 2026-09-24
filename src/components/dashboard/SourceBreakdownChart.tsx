import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DashboardMetrics } from '../../types/investment';
import { formatCurrency, formatCompactCurrency } from '../../lib/formatters';

interface SourceBreakdownChartProps {
  metrics: DashboardMetrics;
}

export const SourceBreakdownChart: React.FC<SourceBreakdownChartProps> = ({ metrics }) => {
  const data = [
    { name: 'CAMS', value: metrics.camsAum, color: '#3b82f6', clients: metrics.camsClientsCount },
    { name: 'KFintech', value: metrics.kfintechAum, color: '#a855f7', clients: metrics.kfintechClientsCount },
  ].filter(d => d.value > 0);

  const total = metrics.totalAum || 1;
  const camsPercent = ((metrics.camsAum / total) * 100).toFixed(1);
  const kfinPercent = ((metrics.kfintechAum / total) * 100).toFixed(1);

  if (metrics.totalAum === 0) {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-center h-64 text-slate-400 text-xs italic">
        No active investment data available
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Source Breakdown</h3>
          <p className="text-[11px] text-slate-400">RTA Portfolio Share</p>
        </div>
        <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
          {metrics.totalRecords} records
        </span>
      </div>

      <div className="py-2 flex flex-col items-center">
        <div className="h-36 sm:h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={46}
                outerRadius={66}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number) => [formatCurrency(val), 'AUM']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 2-column breakdown badges */}
        <div className="w-full grid grid-cols-2 gap-2 sm:gap-2.5 mt-1">
          {/* CAMS item */}
          <div className="p-2 sm:p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900">
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                CAMS
              </span>
              <span className="font-mono text-blue-700">{camsPercent}%</span>
            </div>
            <div className="mt-1 text-xs font-bold font-mono text-slate-800 truncate" title={formatCurrency(metrics.camsAum)}>
              {formatCompactCurrency(metrics.camsAum)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {metrics.camsClientsCount} clients
            </div>
          </div>

          {/* KFintech item */}
          <div className="p-2 sm:p-2.5 rounded-lg bg-purple-50/60 border border-purple-100">
            <div className="flex items-center justify-between text-xs font-bold text-purple-900">
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                KFin
              </span>
              <span className="font-mono text-purple-700">{kfinPercent}%</span>
            </div>
            <div className="mt-1 text-xs font-bold font-mono text-slate-800 truncate" title={formatCurrency(metrics.kfintechAum)}>
              {formatCompactCurrency(metrics.kfintechAum)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {metrics.kfintechClientsCount} clients
            </div>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
        <span className="truncate">Combined Total</span>
        <span className="font-semibold text-slate-700 font-mono">{formatCompactCurrency(metrics.totalAum)}</span>
      </div>
    </div>
  );
};
