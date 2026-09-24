import React, { useState } from 'react';
import { DataSource, ImportBatch, ParsedCsvResult } from '../../types/investment';
import { UploadCard } from './UploadCard';
import { ImportPreviewModal } from './ImportPreviewModal';
import { ReplaceConfirmModal } from './ReplaceConfirmModal';
import { parseInvestmentCsv } from '../../lib/csvParser';
import { db } from '../../lib/db';
import { loadSampleData } from '../../lib/sampleDataLoader';
import { ShieldCheck, Info } from 'lucide-react';

interface UploadViewProps {
  camsBatch?: ImportBatch;
  kfintechBatch?: ImportBatch;
  onDataChanged: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  camsBatch,
  kfintechBatch,
  onDataChanged,
}) => {
  const [activePreview, setActivePreview] = useState<ParsedCsvResult | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Replacement modal state
  const [replaceTarget, setReplaceTarget] = useState<{
    source: DataSource;
    preview: ParsedCsvResult;
  } | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  // Sample loading states
  const [loadingSampleSource, setLoadingSampleSource] = useState<DataSource | null>(null);

  const handleFileSelected = async (file: File, source: DataSource) => {
    try {
      const text = await file.text();
      const parsed = await parseInvestmentCsv(text, file.name, source);
      setActivePreview(parsed);

      const existingBatch = source === 'CAMS' ? camsBatch : kfintechBatch;
      if (existingBatch && existingBatch.recordCount > 0) {
        // If data already exists, prepare replacement flow
        setReplaceTarget({
          source,
          preview: parsed,
        });
      } else {
        // Otherwise open preview directly
        setIsPreviewOpen(true);
      }
    } catch (err) {
      alert(`Error reading file: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleConfirmImport = async (parsed: ParsedCsvResult) => {
    setIsSaving(true);
    try {
      const batch: ImportBatch = {
        id: `batch_${parsed.source.toLowerCase()}_${Date.now()}`,
        source: parsed.source,
        fileName: parsed.fileName,
        recordCount: parsed.validRowCount,
        clientCount: parsed.uniqueClientsCount,
        totalAum: parsed.totalAum,
        uploadedAt: Date.now(),
        asOfDate: parsed.asOfDate,
        detectedHeaders: parsed.detectedHeaders,
      };

      if (parsed.source === 'CAMS') {
        await db.replaceCamsData(parsed.records, batch);
      } else {
        await db.replaceKfintechData(parsed.records, batch);
      }

      setIsPreviewOpen(false);
      setActivePreview(null);
      setReplaceTarget(null);
      onDataChanged();
    } catch (err) {
      alert(`Error saving to IndexedDB: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReplace = async () => {
    if (!replaceTarget) return;
    setIsReplacing(true);
    try {
      await handleConfirmImport(replaceTarget.preview);
    } finally {
      setIsReplacing(false);
      setReplaceTarget(null);
    }
  };

  const handleRemove = async (source: DataSource) => {
    if (window.confirm(`Are you sure you want to remove all local ${source} investment data?`)) {
      await db.clearSource(source);
      onDataChanged();
    }
  };

  const handleLoadSample = async (source: DataSource) => {
    setLoadingSampleSource(source);
    try {
      await loadSampleData(source);
      onDataChanged();
    } catch (err) {
      alert(`Failed to load sample: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoadingSampleSource(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Import Mutual Fund Data</h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload latest holding CSV statements from CAMS and KFintech. Both datasets are maintained independently in your browser.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Local-Only Processing — Zero Server Uploads</span>
        </div>
      </div>

      {/* Info Tip */}
      <div className="flex items-start gap-3 bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-900">Format Notice: </span>
          CAMS holding exports typically use columns such as <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900">INV_NAME, CLOSING_ASSETS, UNITS, NAV, FOLIO</code>.
          KFintech exports use <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900">Investor Name, AUM, Balance, NAV, Folio Number</code>.
          You can test both formats instantly using the <strong>Load Sample Data</strong> buttons below.
        </div>
      </div>

      {/* Independent Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadCard
          source="CAMS"
          title="CAMS Investment Data"
          description="Supports CAMS WBR9 / Asset Holding statements with CLOSING_ASSETS and unit balances."
          batch={camsBatch}
          onFileSelected={handleFileSelected}
          onRemove={handleRemove}
          onLoadSample={handleLoadSample}
          isLoadingSample={loadingSampleSource === 'CAMS'}
        />

        <UploadCard
          source="KFINTECH"
          title="KFintech Investment Data"
          description="Supports KFintech Asset / Holding statements with AUM, Balance, and investor address details."
          batch={kfintechBatch}
          onFileSelected={handleFileSelected}
          onRemove={handleRemove}
          onLoadSample={handleLoadSample}
          isLoadingSample={loadingSampleSource === 'KFINTECH'}
        />
      </div>

      {/* Import Preview Modal */}
      <ImportPreviewModal
        preview={activePreview}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setActivePreview(null);
        }}
        onConfirm={() => activePreview && handleConfirmImport(activePreview)}
        isSaving={isSaving}
      />

      {/* Replace Confirmation Modal */}
      {replaceTarget && (
        <ReplaceConfirmModal
          source={replaceTarget.source}
          isOpen={true}
          currentCount={
            (replaceTarget.source === 'CAMS' ? camsBatch?.recordCount : kfintechBatch?.recordCount) || 0
          }
          newCount={replaceTarget.preview.validRowCount}
          onClose={() => setReplaceTarget(null)}
          onConfirm={handleConfirmReplace}
          isReplacing={isReplacing}
        />
      )}
    </div>
  );
};
