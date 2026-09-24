import React from 'react';
import { ClientHoldingSummary } from '../../types/investment';
import { formatCurrency, formatCompactCurrency } from '../../lib/formatters';
import { SourceBadge } from '../ui/SourceBadge';
import { ChevronRight, Award } from 'lucide-react';

interface TopClientsCardProps {
  topClients: ClientHoldingSummary[];
  onSelectClient: (client: ClientHoldingSummary) => void;
  onViewAllClients: () => void;
}

export const TopClientsCard: React.FC<TopClientsCardProps> = ({
  topClients,
  onSelectClient,
  onViewAllClients,
}) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500 shrink-0" />
          <h3 className="text-sm font-bold text-slate-800">Top Clients</h3>
        </div>
        <button
          onClick={onViewAllClients}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden flex-1 flex flex-col justify-around py-1">
        {topClients.slice(0, 5).map((client, idx) => (
          <div
            key={client.clientId}
            onClick={() => onSelectClient(client)}
            className="py-2 px-2 -mx-1.5 flex items-center justify-between hover:bg-slate-50/80 rounded-lg cursor-pointer transition group"
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <span
                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  idx === 0
                    ? 'bg-amber-100 text-amber-800 font-extrabold'
                    : idx === 1
                    ? 'bg-slate-200 text-slate-700 font-bold'
                    : idx === 2
                    ? 'bg-amber-50 text-amber-900 border border-amber-200/70'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition" title={client.primaryName}>
                  {client.primaryName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {client.sources.map(src => (
                    <SourceBadge key={src} source={src} size="sm" />
                  ))}
                  <span className="text-[10px] text-slate-400">
                    {client.totalSchemesCount} schemes
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 flex items-center gap-1.5">
              <div>
                <span className="text-xs font-bold text-slate-900 block font-mono">
                  {formatCompactCurrency(client.totalAum)}
                </span>
                <span className="text-[10px] text-slate-400 block" title={formatCurrency(client.totalAum)}>
                  {client.activeHoldingsCount} active
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition shrink-0" />
            </div>
          </div>
        ))}

        {topClients.length === 0 && (
          <p className="text-xs text-slate-400 py-6 text-center italic">No clients found</p>
        )}
      </div>

      <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
        <span>Ranked by portfolio value</span>
        <button
          onClick={onViewAllClients}
          className="text-indigo-600 font-semibold hover:underline"
        >
          All {topClients.length} clients &rarr;
        </button>
      </div>
    </div>
  );
};
