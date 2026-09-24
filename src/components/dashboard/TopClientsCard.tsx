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
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-800">Top Clients by Portfolio Value</h3>
        </div>
        <button
          onClick={onViewAllClients}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden">
        {topClients.slice(0, 8).map((client, idx) => (
          <div
            key={client.clientId}
            onClick={() => onSelectClient(client)}
            className="py-2.5 px-2 -mx-2 flex items-center justify-between hover:bg-slate-50/80 rounded-lg cursor-pointer transition"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <span className="w-5 text-center text-xs font-bold text-slate-400">
                #{idx + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate" title={client.primaryName}>
                  {client.primaryName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {client.sources.map(src => (
                    <SourceBadge key={src} source={src} size="sm" />
                  ))}
                  <span className="text-[11px] text-slate-400">
                    {client.totalSchemesCount} schemes
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-900 block">
                {formatCompactCurrency(client.totalAum)}
              </span>
              <span className="text-[10px] text-slate-400 block" title={formatCurrency(client.totalAum)}>
                {client.activeHoldingsCount} active
              </span>
            </div>
          </div>
        ))}

        {topClients.length === 0 && (
          <p className="text-xs text-slate-400 py-6 text-center italic">No clients found</p>
        )}
      </div>
    </div>
  );
};
