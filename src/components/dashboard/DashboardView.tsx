import React from 'react';
import {
  DashboardMetrics,
  ClientHoldingSummary,
  SchemeSummary,
  AmcSummary,
  ImportBatch,
} from '../../types/investment';
import { MetricCards } from './MetricCards';
import { SourceBreakdownChart } from './SourceBreakdownChart';
import { TopClientsCard } from './TopClientsCard';
import { TopSchemesCard } from './TopSchemesCard';
import { AmcSummaryTable } from './AmcSummaryTable';
import { UploadCloud, Sparkles, AlertCircle } from 'lucide-react';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  topClients: ClientHoldingSummary[];
  topSchemes: SchemeSummary[];
  amcSummaries: AmcSummary[];
  camsBatch?: ImportBatch;
  kfintechBatch?: ImportBatch;
  onNavigateToUpload: () => void;
  onNavigateToClients: () => void;
  onSelectClient: (client: ClientHoldingSummary) => void;
  onLoadAllSamples: () => void;
  isLoadingSamples: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  topClients,
  topSchemes,
  amcSummaries,
  camsBatch,
  kfintechBatch,
  onNavigateToUpload,
  onNavigateToClients,
  onSelectClient,
  onLoadAllSamples,
  isLoadingSamples,
}) => {
  const hasData = metrics.totalRecords > 0;
  const isSingleSource = (camsBatch && !kfintechBatch) || (!camsBatch && kfintechBatch);

  if (!hasData) {
    return (
      <div className="max-w-3xl mx-auto my-12 text-center py-16 px-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">No investment data available</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Upload your CAMS or KFintech CSV holding statements to view your client portfolios, AMC exposures, and consolidated AUM.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onNavigateToUpload}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
          >
            Upload CSV Statements
          </button>
          <button
            onClick={onLoadAllSamples}
            disabled={isLoadingSamples}
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-2xs transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>{isLoadingSamples ? 'Loading Samples...' : 'Load Attached Sample Data (1-Click)'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 pt-4">
          All data is parsed and stored entirely inside your browser's IndexedDB. No external servers or APIs are involved.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Single source alert if applicable (Prompt Section 31) */}
      {isSingleSource && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {camsBatch ? (
                <>Only <strong>CAMS</strong> data is loaded. <strong>KFintech</strong> data has not been uploaded yet.</>
              ) : (
                <>Only <strong>KFintech</strong> data is loaded. <strong>CAMS</strong> data has not been uploaded yet.</>
              )}
            </span>
          </div>
          <button
            onClick={onNavigateToUpload}
            className="font-semibold text-indigo-600 hover:underline shrink-0 ml-3"
          >
            Upload {camsBatch ? 'KFintech' : 'CAMS'} CSV &rarr;
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <MetricCards metrics={metrics} />

      {/* Charts & Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SourceBreakdownChart metrics={metrics} />
        </div>
        <div className="lg:col-span-2">
          <TopClientsCard
            topClients={topClients}
            onSelectClient={onSelectClient}
            onViewAllClients={onNavigateToClients}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TopSchemesCard topSchemes={topSchemes} />
        </div>
        <div className="lg:col-span-2">
          <AmcSummaryTable amcSummaries={amcSummaries} />
        </div>
      </div>
    </div>
  );
};
