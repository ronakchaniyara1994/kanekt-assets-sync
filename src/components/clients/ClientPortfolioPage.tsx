import React, { useState, useMemo } from 'react';
import { ClientHoldingSummary, InvestmentRecord } from '../../types/investment';
import { formatCurrency, formatUnits, formatNav, formatCompactCurrency } from '../../lib/formatters';
import { SourceBadge } from '../ui/SourceBadge';
import {
  ArrowLeft,
  Printer,
  Layers,
  Search,
  CheckSquare,
  Square,
  FileText,
  LayoutList,
  Building2,
  FolderOpen,
} from 'lucide-react';

interface ClientPortfolioPageProps {
  client: ClientHoldingSummary;
  onBack: () => void;
}

export const ClientPortfolioPage: React.FC<ClientPortfolioPageProps> = ({ client, onBack }) => {
  const [activeTab, setActiveTab] = useState<'holdings' | 'statement'>('holdings');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'CAMS' | 'KFINTECH'>('ALL');
  const [hideZeroHoldings, setHideZeroHoldings] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmc, setSelectedAmc] = useState<string>('ALL');
  const [statementGroupByAmc, setStatementGroupByAmc] = useState(true);

  // Statement generation timestamp
  const generatedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  }, []);

  // Compute latest valuation date from the client records
  const latestValuationDate = useMemo(() => {
    if (!client || client.records.length === 0) return 'N/A';
    const dates = client.records
      .map((r) => r.asOfDate)
      .filter(Boolean)
      .sort();
    return dates.length > 0 ? dates[dates.length - 1] : 'N/A';
  }, [client]);

  // Distinct AMCs in this client's portfolio
  const clientAmcOptions = useMemo(() => {
    const set = new Set<string>();
    client.records.forEach((r) => {
      if (r.amc) set.add(r.amc);
    });
    return Array.from(set).sort();
  }, [client]);

  // Filtered records for interactive holdings view
  const filteredRecords = useMemo(() => {
    return client.records.filter((rec) => {
      // Zero balance filter
      if (hideZeroHoldings && rec.currentValue === 0 && rec.units === 0) {
        return false;
      }
      // Source filter
      if (sourceFilter !== 'ALL' && rec.source !== sourceFilter) {
        return false;
      }
      // AMC filter
      if (selectedAmc !== 'ALL' && rec.amc !== selectedAmc) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesScheme = rec.scheme.toLowerCase().includes(query);
        const matchesFolio = rec.folio.toLowerCase().includes(query);
        const matchesAmc = rec.amc.toLowerCase().includes(query);
        if (!matchesScheme && !matchesFolio && !matchesAmc) {
          return false;
        }
      }
      return true;
    });
  }, [client, hideZeroHoldings, sourceFilter, selectedAmc, searchQuery]);

  // Statement records (filters out 0-holdings if hideZeroHoldings is true)
  const statementRecords = useMemo(() => {
    return client.records.filter((rec) => {
      if (hideZeroHoldings && rec.currentValue === 0 && rec.units === 0) {
        return false;
      }
      return true;
    });
  }, [client, hideZeroHoldings]);

  // Group records by AMC for statement
  const amcGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        amcName: string;
        records: InvestmentRecord[];
        totalValue: number;
        totalUnits: number;
      }
    > = {};

    for (const rec of statementRecords) {
      const amc = rec.amc || 'Other Mutual Funds';
      if (!groups[amc]) {
        groups[amc] = {
          amcName: amc,
          records: [],
          totalValue: 0,
          totalUnits: 0,
        };
      }
      groups[amc].records.push(rec);
      groups[amc].totalValue += rec.currentValue || 0;
      groups[amc].totalUnits += rec.units || 0;
    }

    return Object.values(groups).sort((a, b) => a.amcName.localeCompare(b.amcName));
  }, [statementRecords]);

  // Statement calculations
  const statementTotalValuation = useMemo(() => {
    return statementRecords.reduce((sum, r) => sum + (r.currentValue || 0), 0);
  }, [statementRecords]);

  const statementTotalUnits = useMemo(() => {
    return statementRecords.reduce((sum, r) => sum + (r.units || 0), 0);
  }, [statementRecords]);

  const camsVisibleAum = useMemo(() => {
    return statementRecords
      .filter((r) => r.source === 'CAMS')
      .reduce((sum, r) => sum + (r.currentValue || 0), 0);
  }, [statementRecords]);

  const kfintechVisibleAum = useMemo(() => {
    return statementRecords
      .filter((r) => r.source === 'KFINTECH')
      .reduce((sum, r) => sum + (r.currentValue || 0), 0);
  }, [statementRecords]);

  const handlePrint = () => {
    // If not currently on statement tab, switch to statement tab first so print content is mounted
    if (activeTab !== 'statement') {
      setActiveTab('statement');
      setTimeout(() => {
        window.print();
      }, 150);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 print:hidden">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Clients</span>
          </button>

          <div className="h-4 w-px bg-slate-300 hidden sm:block" />

          <div className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-none">
            <span>Clients</span>
            <span className="mx-1.5">/</span>
            <span className="font-semibold text-slate-900">{client.primaryName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View Tab Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => setActiveTab('holdings')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'holdings'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Holdings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('statement')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'statement'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Statement</span>
            </button>
          </div>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Statement</span>
            <span className="sm:hidden">Print</span>
          </button>
        </div>
      </div>

      {/* Client Overview Header (Screen only) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Client Portfolio
              </span>
              <div className="flex items-center gap-1">
                {client.sources.map((src) => (
                  <SourceBadge key={src} source={src} size="sm" />
                ))}
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {client.primaryName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
              Consolidated holding snapshot across CAMS & KFintech RTAs
            </p>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Total Portfolio (AUM)
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-0.5 block">
                {formatCurrency(client.totalAum)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Active Positions
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-700 mt-0.5 block">
                {client.activeHoldingsCount} Holdings
              </span>
            </div>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-4 sm:mt-5">
          <div className="p-3 sm:p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
              Consolidated AUM
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-900 mt-1 block font-mono truncate">
              {formatCurrency(client.totalAum)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 block truncate">
              {client.totalSchemesCount} Schemes • {client.totalFoliosCount} Folios
            </span>
          </div>

          <div className="p-3 sm:p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
            <span className="text-[10px] sm:text-[11px] font-semibold text-blue-700 uppercase tracking-wider block truncate">
              CAMS Value
            </span>
            <span className="text-sm sm:text-base font-bold text-blue-950 mt-1 block font-mono truncate">
              {formatCurrency(client.camsAum)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-blue-600 mt-0.5 block truncate">
              {client.camsRecordCount} positions
            </span>
          </div>

          <div className="p-3 sm:p-3.5 bg-purple-50/60 border border-purple-100 rounded-xl">
            <span className="text-[10px] sm:text-[11px] font-semibold text-purple-700 uppercase tracking-wider block truncate">
              KFintech Value
            </span>
            <span className="text-sm sm:text-base font-bold text-purple-950 mt-1 block font-mono truncate">
              {formatCurrency(client.kfintechAum)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-purple-600 mt-0.5 block truncate">
              {client.kfintechRecordCount} positions
            </span>
          </div>

          <div className="p-3 sm:p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
              Holdings Status
            </span>
            <div className="text-[11px] sm:text-xs text-slate-700 space-y-0.5 mt-1">
              <div>
                <strong>{client.activeHoldingsCount}</strong> Active Holdings
              </div>
              <div className="text-slate-400">
                <strong>{client.zeroBalanceCount}</strong> Zero-Balance
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: Interactive Holdings View */}
      {activeTab === 'holdings' && (
        <div className="space-y-4 print:hidden">
          {/* Table Filters & Search Toolbar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Source tabs with horizontal scrolling on mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-0.5">
              <button
                type="button"
                onClick={() => setSourceFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition ${
                  sourceFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Sources ({client.records.length})
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter('CAMS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition ${
                  sourceFilter === 'CAMS'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                CAMS ({client.camsRecordCount})
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter('KFINTECH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition ${
                  sourceFilter === 'KFINTECH'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                KFintech ({client.kfintechRecordCount})
              </button>
            </div>

            {/* Right controls: AMC filter, search, hide-zero */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              {/* AMC Filter */}
              {clientAmcOptions.length > 1 && (
                <select
                  value={selectedAmc}
                  onChange={(e) => setSelectedAmc(e.target.value)}
                  className="w-full sm:w-auto px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">All AMCs ({clientAmcOptions.length})</option>
                  {clientAmcOptions.map((amc) => (
                    <option key={amc} value={amc}>
                      {amc}
                    </option>
                  ))}
                </select>
              )}

              {/* Search input */}
              <div className="relative w-full sm:min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search scheme or folio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Hide zero balance toggle */}
              <button
                type="button"
                onClick={() => setHideZeroHoldings(!hideZeroHoldings)}
                className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white transition select-none cursor-pointer shrink-0"
              >
                {hideZeroHoldings ? (
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Hide Zero ({client.zeroBalanceCount})</span>
              </button>
            </div>
          </div>

          {/* Interactive Holdings Table */}

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 font-semibold select-none">
                  <tr>
                    <th className="px-4 py-3 text-left">Source</th>
                    <th className="px-4 py-3 text-left">AMC</th>
                    <th className="px-4 py-3 text-left">Scheme Name</th>
                    <th className="px-4 py-3 text-left">Folio No.</th>
                    <th className="px-3.5 py-3 text-right">Units</th>
                    <th className="px-3.5 py-3 text-right">NAV (₹)</th>
                    <th className="px-4 py-3 text-right">Current Value (AUM)</th>
                    <th className="px-3.5 py-3 text-center">As of Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredRecords.map((rec) => {
                    const isZero = rec.currentValue === 0 && rec.units === 0;
                    return (
                      <tr
                        key={rec.id}
                        className={`hover:bg-slate-50/80 transition ${
                          isZero ? 'opacity-50 bg-slate-50/20 italic' : ''
                        }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <SourceBadge source={rec.source} size="sm" />
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                          {rec.amc}
                        </td>
                        <td className="px-4 py-3 text-slate-700 max-w-sm">
                          <div className="font-semibold text-slate-900">{rec.scheme}</div>
                          {rec.taxStatus && (
                            <span className="text-[10px] text-slate-400">
                              Status: {rec.taxStatus}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                          {rec.folio}
                        </td>
                        <td className="px-3.5 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                          {formatUnits(rec.units)}
                        </td>
                        <td className="px-3.5 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                          {formatNav(rec.nav)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(rec.currentValue)}
                        </td>
                        <td className="px-3.5 py-3 text-center text-slate-400 text-[11px] whitespace-nowrap">
                          {rec.asOfDate}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 italic">
                        No investment records match your current filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table bottom subtotal bar */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Showing {filteredRecords.length} of {client.records.length} total entries
              </span>
              <div className="flex items-center gap-6 font-mono font-bold">
                <span className="text-slate-600">
                  Visible Units:{' '}
                  {formatUnits(filteredRecords.reduce((sum, r) => sum + (r.units || 0), 0))}
                </span>
                <span className="text-slate-900 text-sm">
                  Visible Total:{' '}
                  {formatCurrency(filteredRecords.reduce((sum, r) => sum + (r.currentValue || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Valuation Statement & Printable Document */}
      {(activeTab === 'statement' || true) && (
        <div className={activeTab === 'statement' ? 'space-y-4' : 'hidden print:block'}>
          {/* Statement Toolbar Controls (Screen only) */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Valuation Statement Preview
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {/* Toggle: Group by AMC vs Flat */}
              <button
                type="button"
                onClick={() => setStatementGroupByAmc(!statementGroupByAmc)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg border border-slate-700 transition"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>{statementGroupByAmc ? 'Grouped by AMC' : 'Flat List'}</span>
              </button>

              {/* Hide zero holdings */}
              <button
                type="button"
                onClick={() => setHideZeroHoldings(!hideZeroHoldings)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg border border-slate-700 transition"
              >
                {hideZeroHoldings ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Hide Zero ({client.zeroBalanceCount})</span>
              </button>

              {/* Print Action Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>

          {/* A4 Printable Document Container */}
          <div
            id="statement-printable-content"
            className="bg-white text-slate-900 rounded-xl shadow-md p-4 sm:p-8 lg:p-10 border border-slate-200 print:border-none print:shadow-none print:p-0"
          >

            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block mb-1.5">
                    Consolidated Investment Report
                  </span>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    MUTUAL FUND VALUATION STATEMENT
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Consolidated portfolio valuation aggregated across CAMS & KFintech RTAs
                  </p>
                </div>

                <div className="text-right text-xs space-y-1 sm:self-start">
                  <div className="text-slate-500">
                    Statement Date: <span className="font-semibold text-slate-800">{generatedDate}</span>
                  </div>
                  <div className="text-slate-500">
                    Valuation As of Date: <span className="font-semibold text-slate-800">{latestValuationDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Investor Details Card (Investor Name only, as requested) */}
            <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-lg statement-no-break">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Investor Name
                  </span>
                  <span className="text-base font-bold text-slate-900 block mt-0.5">
                    {client.primaryName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-xs text-slate-500 mr-1 font-medium">Source RTAs:</span>
                  {client.sources.map((src) => (
                    <SourceBadge key={src} source={src} size="sm" />
                  ))}
                </div>
              </div>
            </div>

            {/* Portfolio Summary Overview Cards */}
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 statement-no-break">
              <div className="p-3 bg-slate-900 text-white rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold block">
                  Total Portfolio Valuation
                </span>
                <span className="text-lg font-black block mt-0.5 font-mono">
                  {formatCurrency(statementTotalValuation)}
                </span>
                <span className="text-[10px] text-slate-300 block mt-0.5">
                  {statementRecords.length} Active Positions
                </span>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-blue-700 font-semibold block">
                  CAMS Holdings
                </span>
                <span className="text-base font-bold text-blue-950 block mt-0.5 font-mono">
                  {formatCurrency(camsVisibleAum)}
                </span>
                <span className="text-[10px] text-blue-600 block mt-0.5">
                  {statementRecords.filter((r) => r.source === 'CAMS').length} positions
                </span>
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-purple-700 font-semibold block">
                  KFintech Holdings
                </span>
                <span className="text-base font-bold text-purple-950 block mt-0.5 font-mono">
                  {formatCurrency(kfintechVisibleAum)}
                </span>
                <span className="text-[10px] text-purple-600 block mt-0.5">
                  {statementRecords.filter((r) => r.source === 'KFINTECH').length} positions
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                  Folios & Schemes
                </span>
                <div className="text-xs text-slate-800 space-y-0.5 mt-1 font-medium">
                  <div>{client.totalSchemesCount} Total Schemes</div>
                  <div>{client.totalFoliosCount} Total Folios</div>
                </div>
              </div>
            </div>

            {/* Statement Holdings Breakdown */}
            <div className="mt-7">
              <div className="mb-3 border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Portfolio Holdings Breakdown
                </h3>
              </div>


              {statementGroupByAmc ? (
                // Grouped by AMC
                <div className="space-y-6">
                  {amcGroups.map((group) => (
                    <div
                      key={group.amcName}
                      className="border border-slate-200 rounded-lg overflow-hidden statement-group-block"
                    >
                      {/* AMC Subheader */}
                      <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 text-sm">{group.amcName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">
                            {group.records.length} {group.records.length === 1 ? 'Holding' : 'Holdings'}
                          </span>
                          <span className="font-bold font-mono text-slate-900">
                            Subtotal: {formatCurrency(group.totalValue)}
                          </span>
                        </div>
                      </div>

                      {/* AMC Holdings Table */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs divide-y divide-slate-200">
                          <thead className="bg-slate-50 text-slate-600 font-semibold">
                            <tr>
                              <th className="px-3 py-2 text-left">Scheme Name</th>
                              <th className="px-3 py-2 text-left">Folio No.</th>
                              <th className="px-3 py-2 text-center">RTA</th>
                              <th className="px-3 py-2 text-right">Units</th>
                              <th className="px-3 py-2 text-right">NAV (₹)</th>
                              <th className="px-3 py-2 text-right">Current Value (₹)</th>
                              <th className="px-3 py-2 text-center">As of Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {group.records.map((rec) => {
                              const isZero = rec.currentValue === 0 && rec.units === 0;
                              return (
                                <tr
                                  key={rec.id}
                                  className={`hover:bg-slate-50/50 ${isZero ? 'opacity-50 italic' : ''}`}
                                >
                                  <td className="px-3 py-2 text-slate-900 font-medium max-w-sm">
                                    <div>{rec.scheme}</div>
                                    {rec.taxStatus && (
                                      <span className="text-[10px] text-slate-400">
                                        Tax Status: {rec.taxStatus}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap">
                                    {rec.folio}
                                  </td>
                                  <td className="px-3 py-2 text-center whitespace-nowrap">
                                    <SourceBadge source={rec.source} size="sm" />
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-600 whitespace-nowrap">
                                    {formatUnits(rec.units)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-600 whitespace-nowrap">
                                    {formatNav(rec.nav)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                    {formatCurrency(rec.currentValue)}
                                  </td>
                                  <td className="px-3 py-2 text-center text-slate-400 text-[11px] whitespace-nowrap">
                                    {rec.asOfDate}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Flat Table View
                <div className="border border-slate-200 rounded-lg overflow-x-auto statement-group-block">
                  <table className="min-w-full text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-slate-600 font-semibold">
                      <tr>
                        <th className="px-3 py-2 text-left">AMC</th>
                        <th className="px-3 py-2 text-left">Scheme Name</th>
                        <th className="px-3 py-2 text-left">Folio No.</th>
                        <th className="px-3 py-2 text-center">RTA</th>
                        <th className="px-3 py-2 text-right">Units</th>
                        <th className="px-3 py-2 text-right">NAV (₹)</th>
                        <th className="px-3 py-2 text-right">Current Value (₹)</th>
                        <th className="px-3 py-2 text-center">As of Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {statementRecords.map((rec) => {
                        const isZero = rec.currentValue === 0 && rec.units === 0;
                        return (
                          <tr
                            key={rec.id}
                            className={`hover:bg-slate-50/50 ${isZero ? 'opacity-50 italic' : ''}`}
                          >
                            <td className="px-3 py-2 font-medium text-slate-800 whitespace-nowrap">
                              {rec.amc}
                            </td>
                            <td className="px-3 py-2 text-slate-900 max-w-xs font-medium">
                              {rec.scheme}
                            </td>
                            <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap">
                              {rec.folio}
                            </td>
                            <td className="px-3 py-2 text-center whitespace-nowrap">
                              <SourceBadge source={rec.source} size="sm" />
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 whitespace-nowrap">
                              {formatUnits(rec.units)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 whitespace-nowrap">
                              {formatNav(rec.nav)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                              {formatCurrency(rec.currentValue)}
                            </td>
                            <td className="px-3 py-2 text-center text-slate-400 text-[11px] whitespace-nowrap">
                              {rec.asOfDate}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Consolidated Grand Total */}
              <div className="mt-4 p-3 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-between text-xs font-bold statement-no-break">
                <span className="uppercase text-slate-700 tracking-wider">
                  Total Consolidated Portfolio Value:
                </span>
                <div className="flex items-center gap-6 font-mono">
                  <span className="text-slate-600">Total Units: {formatUnits(statementTotalUnits)}</span>
                  <span className="text-sm text-slate-950 font-black">
                    {formatCurrency(statementTotalValuation)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes & Regulatory Disclaimers */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-1.5 statement-no-break">
              <p className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                Notes & Regulatory Disclaimers:
              </p>
              <p>
                1. <strong>Mutual Fund investments are subject to market risks</strong>. Read all scheme-related
                documents carefully before investing.
              </p>
              <p>
                2. <strong>Valuation Basis</strong>: Current portfolio valuation is computed using the latest available
                Net Asset Value (NAV) reported in the source statements as of the specified valuation date. NAVs and
                values fluctuate based on market movements.
              </p>
              <div className="pt-2 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-100">
                <span>Report Generated on {generatedDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
