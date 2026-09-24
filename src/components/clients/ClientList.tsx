import React, { useState, useMemo } from 'react';
import { ClientHoldingSummary, DataSource } from '../../types/investment';
import { formatCurrency, formatCompactCurrency } from '../../lib/formatters';
import { SourceBadge } from '../ui/SourceBadge';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Eye,
  CheckSquare,
  Square,
  Download,
} from 'lucide-react';

interface ClientListProps {
  clients: ClientHoldingSummary[];
  onSelectClient: (client: ClientHoldingSummary) => void;
  amcOptions: string[];
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  onSelectClient,
  amcOptions,
}) => {
  const [sourceTab, setSourceTab] = useState<'ALL' | 'CAMS' | 'KFINTECH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmc, setSelectedAmc] = useState<string>('ALL');
  const [hideZeroHoldings, setHideZeroHoldings] = useState(false);
  const [sortBy, setSortBy] = useState<'aum_desc' | 'aum_asc' | 'name_asc' | 'name_desc'>('aum_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filter & Search Logic
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // 1. Source Tab
      if (sourceTab === 'CAMS' && !client.sources.includes('CAMS')) return false;
      if (sourceTab === 'KFINTECH' && !client.sources.includes('KFINTECH')) return false;

      // 2. Hide zero balance clients
      if (hideZeroHoldings && client.totalAum === 0) return false;

      // 3. AMC Filter
      if (selectedAmc !== 'ALL') {
        const hasAmc = client.records.some((r) => r.amc === selectedAmc);
        if (!hasAmc) return false;
      }

      // 4. Search query (client name, PAN, city, or matching folio/scheme in records)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = client.primaryName.toLowerCase().includes(query);
        const matchesPan = client.pan ? client.pan.toLowerCase().includes(query) : false;
        const matchesCity = client.city ? client.city.toLowerCase().includes(query) : false;
        const matchesRecord = client.records.some(
          (r) =>
            r.folio.toLowerCase().includes(query) ||
            r.scheme.toLowerCase().includes(query)
        );

        if (!matchesName && !matchesPan && !matchesCity && !matchesRecord) {
          return false;
        }
      }

      return true;
    });
  }, [clients, sourceTab, hideZeroHoldings, selectedAmc, searchQuery]);

  // Sort logic
  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      if (sortBy === 'aum_desc') return b.totalAum - a.totalAum;
      if (sortBy === 'aum_asc') return a.totalAum - b.totalAum;
      if (sortBy === 'name_asc') return a.primaryName.localeCompare(b.primaryName);
      if (sortBy === 'name_desc') return b.primaryName.localeCompare(a.primaryName);
      return 0;
    });
  }, [filteredClients, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(sortedClients.length / pageSize) || 1;
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedClients.slice(start, start + pageSize);
  }, [sortedClients, currentPage, pageSize]);

  const handleTabChange = (tab: 'ALL' | 'CAMS' | 'KFINTECH') => {
    setSourceTab(tab);
    setCurrentPage(1);
  };

  const exportFilteredCsv = () => {
    if (sortedClients.length === 0) return;
    const headers = ['Client Name', 'PAN', 'Sources', 'Total AUM', 'CAMS AUM', 'KFintech AUM', 'Schemes', 'Folios', 'City'];
    const rows = sortedClients.map(c => [
      `"${c.primaryName.replace(/"/g, '""')}"`,
      `"${c.pan || ''}"`,
      `"${c.sources.join(' + ')}"`,
      c.totalAum,
      c.camsAum,
      c.kfintechAum,
      c.totalSchemesCount,
      c.totalFoliosCount,
      `"${c.city || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clients_summary_${sourceTab.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clients & Investment Holdings</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse and search consolidated mutual fund portfolios across CAMS and KFintech.
          </p>
        </div>

        {/* Source Tabs (Section 21) */}
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 max-w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleTabChange('ALL')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition ${
              sourceTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Clients ({clients.length})
          </button>
          <button
            onClick={() => handleTabChange('CAMS')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition ${
              sourceTab === 'CAMS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CAMS ({clients.filter(c => c.sources.includes('CAMS')).length})
          </button>
          <button
            onClick={() => handleTabChange('KFINTECH')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition ${
              sourceTab === 'KFINTECH'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            KFintech ({clients.filter(c => c.sources.includes('KFINTECH')).length})
          </button>
        </div>
      </div>


      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search client name, folio, scheme, PAN..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* AMC Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedAmc}
              onChange={(e) => {
                setSelectedAmc(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">All AMCs / Fund Houses</option>
              {amcOptions.map((amc) => (
                <option key={amc} value={amc}>
                  {amc}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="aum_desc">Value: High to Low</option>
              <option value="aum_asc">Value: Low to High</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>

          {/* Export Action */}
          <div className="md:col-span-2 flex items-center justify-end">
            <button
              onClick={exportFilteredCsv}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition shadow-2xs"
              title="Export current view to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Secondary toggles */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <button
            onClick={() => setHideZeroHoldings(!hideZeroHoldings)}
            className="flex items-center gap-1.5 hover:text-slate-800 transition cursor-pointer select-none"
          >
            {hideZeroHoldings ? (
              <CheckSquare className="w-4 h-4 text-indigo-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Exclude zero-balance clients (₹0 AUM)</span>
          </button>

          <span>
            Showing <strong>{sortedClients.length}</strong> of <strong>{clients.length}</strong> clients
          </span>
        </div>
      </div>

      {/* Clients Data Display (Mobile Cards + Desktop Table) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Mobile View: High-Legibility Tap Cards (< 640px) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {paginatedClients.map((client) => {
            const isCrossSource = client.sources.length > 1;
            return (
              <div
                key={client.clientId}
                onClick={() => onSelectClient(client)}
                className="p-3.5 hover:bg-indigo-50/30 active:bg-indigo-50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 text-sm truncate">
                      {client.primaryName}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {isCrossSource ? (
                        <SourceBadge source="BOTH" size="sm" />
                      ) : (
                        <SourceBadge source={client.sources[0]} size="sm" />
                      )}
                      {client.city && (
                        <span className="text-[11px] text-slate-500">• {client.city}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold font-mono text-slate-900 block">
                      {formatCurrency(client.totalAum)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {client.totalSchemesCount} schemes • {client.totalFoliosCount} folios
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {paginatedClients.length === 0 && (
            <div className="text-center py-12 text-slate-400 italic text-xs">
              No clients match your filter or search criteria.
            </div>
          )}
        </div>

        {/* Tablet & Desktop View: Tabular Layout (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 select-none">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Client Name</th>
                <th className="px-3.5 py-3 text-left font-semibold">Source</th>
                <th className="px-3.5 py-3 text-center font-semibold">Schemes</th>
                <th className="px-3.5 py-3 text-center font-semibold">Folios</th>
                <th className="px-3.5 py-3 text-right font-semibold">CAMS AUM</th>
                <th className="px-3.5 py-3 text-right font-semibold">KFintech AUM</th>
                <th className="px-4 py-3 text-right font-semibold">Total Current Value (AUM)</th>
                <th className="px-4 py-3 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedClients.map((client) => {
                const isCrossSource = client.sources.length > 1;
                return (
                  <tr
                    key={client.clientId}
                    className="hover:bg-indigo-50/30 transition cursor-pointer group"
                    onClick={() => onSelectClient(client)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                        {client.primaryName}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        {client.pan && <span>PAN: {client.pan}</span>}
                        {client.city && <span>• {client.city}</span>}
                      </div>
                    </td>

                    <td className="px-3.5 py-3 whitespace-nowrap">
                      {isCrossSource ? (
                        <SourceBadge source="BOTH" size="sm" />
                      ) : (
                        <SourceBadge source={client.sources[0]} size="sm" />
                      )}
                    </td>

                    <td className="px-3.5 py-3 text-center font-medium text-slate-700 whitespace-nowrap">
                      {client.totalSchemesCount}
                    </td>

                    <td className="px-3.5 py-3 text-center font-mono text-slate-600 whitespace-nowrap">
                      {client.totalFoliosCount}
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                      {client.camsAum > 0 ? formatCompactCurrency(client.camsAum) : '—'}
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                      {client.kfintechAum > 0 ? formatCompactCurrency(client.kfintechAum) : '—'}
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                      {formatCurrency(client.totalAum)}
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectClient(client)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-medium rounded-md transition text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Portfolio</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginatedClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 italic">
                    No clients match your filter or search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


        {/* Pagination Controls */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
