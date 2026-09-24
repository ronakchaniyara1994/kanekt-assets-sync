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
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-800">Source Breakdown</h3>
        <span className="text-xs text-slate-400">RTA Portfolio Share</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-2">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={45}
                outerRadius={65}
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

        <div className="space-y-3">
          {/* CAMS item */}
          <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                CAMS
              </span>
              <span>{camsPercent}%</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-blue-700 mt-1">
              <span>{formatCompactCurrency(metrics.camsAum)}</span>
              <span>{metrics.camsClientsCount} Clients</span>
            </div>
          </div>

          {/* KFintech item */}
          <div className="p-2.5 rounded-lg bg-purple-50/50 border border-purple-100">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-900">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                KFintech
              </span>
              <span>{kfinPercent}%</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-purple-700 mt-1">
              <span>{formatCompactCurrency(metrics.kfintechAum)}</span>
              <span>{metrics.kfintechClientsCount} Clients</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
        <span>Combined Total: {formatCurrency(metrics.totalAum)}</span>
        <span>{metrics.totalRecords} Records</span>
      </div>
    </div>
  );
};
