import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from './lib/db';
import {
  InvestmentRecord,
  ImportBatch,
  ClientHoldingSummary,
  DashboardMetrics,
  AmcSummary,
  SchemeSummary,
  DataSource,
} from './types/investment';
import { groupRecordsByClient } from './lib/clientMatcher';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ClientList } from './components/clients/ClientList';
import { UploadView } from './components/upload/UploadView';
import { BackupRestore } from './components/backup/BackupRestore';
import { ClientPortfolioPage } from './components/clients/ClientPortfolioPage';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { loadSampleData } from './lib/sampleDataLoader';
import { ShieldCheck, Sparkles, UploadCloud, Menu } from 'lucide-react';
import { formatCompactCurrency } from './lib/formatters';

export function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'clients' | 'upload' | 'backup'>('dashboard');
  const [camsRecords, setCamsRecords] = useState<InvestmentRecord[]>([]);
  const [kfintechRecords, setKfintechRecords] = useState<InvestmentRecord[]>([]);
  const [camsBatch, setCamsBatch] = useState<ImportBatch | undefined>();
  const [kfintechBatch, setKfintechBatch] = useState<ImportBatch | undefined>();
  const [selectedClient, setSelectedClient] = useState<ClientHoldingSummary | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);

  // Load datasets from IndexedDB
  const refreshData = useCallback(async () => {
    try {
      const [camsData, kfinData, batches] = await Promise.all([
        db.cams_dataset.toArray(),
        db.kfintech_dataset.toArray(),
        db.batches.toArray(),
      ]);

      setCamsRecords(camsData);
      setKfintechRecords(kfinData);

      const cBatch = batches.find((b) => b.source === 'CAMS');
      const kBatch = batches.find((b) => b.source === 'KFINTECH');
      setCamsBatch(cBatch);
      setKfintechBatch(kBatch);
    } catch (err) {
      console.error('Failed to load data from IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Combined records
  const allRecords = useMemo(() => {
    return [...camsRecords, ...kfintechRecords];
  }, [camsRecords, kfintechRecords]);

  // Grouped clients summary using exact/token matching rules
  const clientSummaries = useMemo(() => {
    return groupRecordsByClient(allRecords);
  }, [allRecords]);

  // Dashboard Metrics
  const metrics: DashboardMetrics = useMemo(() => {
    const camsAum = camsRecords.reduce((acc, r) => acc + (r.currentValue || 0), 0);
    const kfintechAum = kfintechRecords.reduce((acc, r) => acc + (r.currentValue || 0), 0);
    const totalAum = camsAum + kfintechAum;

    const foliosSet = new Set<string>();
    const schemesSet = new Set<string>();
    let activeHoldings = 0;

    allRecords.forEach((r) => {
      if (r.folio) foliosSet.add(r.folio);
      if (r.scheme) schemesSet.add(r.scheme);
      if (r.currentValue > 0 || r.units > 0) activeHoldings++;
    });

    const camsClientsCount = new Set(camsRecords.map((r) => r.normalizedClientName)).size;
    const kfintechClientsCount = new Set(kfintechRecords.map((r) => r.normalizedClientName)).size;

    const sharedClients = clientSummaries.filter(
      (c) => c.sources.includes('CAMS') && c.sources.includes('KFINTECH')
    ).length;

    return {
      totalClients: clientSummaries.length,
      totalAum: Math.round(totalAum * 100) / 100,
      camsAum: Math.round(camsAum * 100) / 100,
      kfintechAum: Math.round(kfintechAum * 100) / 100,
      camsClientsCount,
      kfintechClientsCount,
      sharedClientsCount: sharedClients,
      totalSchemes: schemesSet.size,
      totalFolios: foliosSet.size,
      totalRecords: allRecords.length,
      activeHoldingsCount: activeHoldings,
    };
  }, [allRecords, camsRecords, kfintechRecords, clientSummaries]);

  // AMC Summaries
  const amcSummaries = useMemo(() => {
    const map = new Map<string, {
      clients: Set<string>;
      schemes: Set<string>;
      totalAum: number;
      camsAum: number;
      kfintechAum: number;
    }>();

    allRecords.forEach((r) => {
      const amc = r.amc || 'Other Mutual Fund';
      if (!map.has(amc)) {
        map.set(amc, {
          clients: new Set(),
          schemes: new Set(),
          totalAum: 0,
          camsAum: 0,
          kfintechAum: 0,
        });
      }
      const item = map.get(amc)!;
      item.clients.add(r.normalizedClientName);
      if (r.scheme) item.schemes.add(r.scheme);
      item.totalAum += r.currentValue || 0;
      if (r.source === 'CAMS') item.camsAum += r.currentValue || 0;
      else item.kfintechAum += r.currentValue || 0;
    });

    const list: AmcSummary[] = [];
    map.forEach((val, key) => {
      list.push({
        amcName: key,
        clientsCount: val.clients.size,
        schemesCount: val.schemes.size,
        totalAum: Math.round(val.totalAum * 100) / 100,
        camsAum: Math.round(val.camsAum * 100) / 100,
        kfintechAum: Math.round(val.kfintechAum * 100) / 100,
      });
    });

    return list.sort((a, b) => b.totalAum - a.totalAum);
  }, [allRecords]);

  // Top Schemes
  const topSchemes = useMemo(() => {
    const map = new Map<string, {
      amc: string;
      clients: Set<string>;
      totalAum: number;
      sources: Set<DataSource>;
    }>();

    allRecords.forEach((r) => {
      const scheme = r.scheme;
      if (!map.has(scheme)) {
        map.set(scheme, {
          amc: r.amc,
          clients: new Set(),
          totalAum: 0,
          sources: new Set(),
        });
      }
      const item = map.get(scheme)!;
      item.clients.add(r.normalizedClientName);
      item.totalAum += r.currentValue || 0;
      item.sources.add(r.source);
    });

    const list: SchemeSummary[] = [];
    map.forEach((val, key) => {
      const srcList = Array.from(val.sources);
      list.push({
        schemeName: key,
        amcName: val.amc,
        clientsCount: val.clients.size,
        totalAum: Math.round(val.totalAum * 100) / 100,
        source: srcList.length > 1 ? 'BOTH' : srcList[0],
      });
    });

    return list.sort((a, b) => b.totalAum - a.totalAum);
  }, [allRecords]);

  // Top Clients
  const topClients = useMemo(() => {
    return clientSummaries.slice(0, 10);
  }, [clientSummaries]);

  // Distinct AMC options for filter dropdown
  const amcOptions = useMemo(() => {
    return amcSummaries.map((a) => a.amcName);
  }, [amcSummaries]);

  // Load both samples in 1-click
  const handleLoadAllSamples = async () => {
    setIsLoadingSamples(true);
    try {
      await loadSampleData('CAMS');
      await loadSampleData('KFINTECH');
      await refreshData();
    } catch (err) {
      alert(`Error loading sample data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoadingSamples(false);
    }
  };

  const handleTabChange = (tab: 'dashboard' | 'clients' | 'upload' | 'backup') => {
    setSelectedClient(null);
    setIsMobileMenuOpen(false);
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar Navigation (Desktop Persistent + Mobile Drawer) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        camsBatch={camsBatch}
        kfintechBatch={kfintechBatch}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Hamburger Button on Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-sm sm:text-base font-bold text-slate-800 capitalize truncate max-w-[190px] sm:max-w-none">
              {selectedClient
                ? `${selectedClient.primaryName} • Portfolio`
                : currentTab === 'dashboard'
                ? 'Investment Overview'
                : currentTab === 'clients'
                ? 'Client Investment Portfolios'
                : currentTab === 'upload'
                ? 'Upload CSV Datasets'
                : 'Backup & Local Storage'}
            </h1>
            {metrics.totalAum > 0 && (
              <span className="hidden sm:inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                AUM: {formatCompactCurrency(metrics.totalAum)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {metrics.totalRecords === 0 && (
              <button
                onClick={handleLoadAllSamples}
                disabled={isLoadingSamples}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isLoadingSamples ? 'Loading...' : 'Load Sample Data'}</span>
              </button>
            )}

            <button
              onClick={() => handleTabChange('upload')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Import</span>
            </button>

            <div className="hidden md:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline & Local</span>
            </div>
          </div>
        </header>

        {/* Dynamic Body Content with Mobile-Adaptive Padding & Bottom Nav clearance */}
        <main className="p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
              Loading local portfolio datasets...
            </div>
          ) : selectedClient ? (
            <ClientPortfolioPage
              client={selectedClient}
              onBack={() => setSelectedClient(null)}
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  metrics={metrics}
                  topClients={topClients}
                  topSchemes={topSchemes}
                  amcSummaries={amcSummaries}
                  camsBatch={camsBatch}
                  kfintechBatch={kfintechBatch}
                  onNavigateToUpload={() => handleTabChange('upload')}
                  onNavigateToClients={() => handleTabChange('clients')}
                  onSelectClient={(client) => setSelectedClient(client)}
                  onLoadAllSamples={handleLoadAllSamples}
                  isLoadingSamples={isLoadingSamples}
                />
              )}

              {currentTab === 'clients' && (
                <ClientList
                  clients={clientSummaries}
                  onSelectClient={(client) => setSelectedClient(client)}
                  amcOptions={amcOptions}
                />
              )}

              {currentTab === 'upload' && (
                <UploadView
                  camsBatch={camsBatch}
                  kfintechBatch={kfintechBatch}
                  onDataChanged={refreshData}
                />
              )}

              {currentTab === 'backup' && (
                <BackupRestore
                  camsBatch={camsBatch}
                  kfintechBatch={kfintechBatch}
                  onDataChanged={refreshData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <MobileBottomNav currentTab={currentTab} setCurrentTab={handleTabChange} />
    </div>


  );
}

export default App;
