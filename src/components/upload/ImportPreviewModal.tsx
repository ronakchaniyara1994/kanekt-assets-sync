import React from 'react';
import { Modal } from '../ui/Modal';
import { ParsedCsvResult } from '../../types/investment';
import { formatCurrency, formatUnits, formatNav } from '../../lib/formatters';
import { CheckCircle2, AlertTriangle, AlertCircle, FileText } from 'lucide-react';
import { SourceBadge } from '../ui/SourceBadge';

interface ImportPreviewModalProps {
  preview: ParsedCsvResult | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSaving: boolean;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  preview,
  isOpen,
  onClose,
  onConfirm,
  isSaving,
}) => {
  if (!preview) return null;

  const hasCriticalErrors = preview.errors.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Preview"
      subtitle={`Verify parsed records before saving to local browser storage`}
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* Source and File summary */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">{preview.fileName}</span>
                <SourceBadge source={preview.source} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {preview.asOfDate ? `Snapshot Date: ${preview.asOfDate}` : 'Point-in-time holding statement'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Records</span>
              <span className="font-bold text-slate-900 text-base">
                {preview.validRowCount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Unique Clients</span>
              <span className="font-bold text-indigo-600 text-base">
                {preview.uniqueClientsCount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total AUM</span>
              <span className="font-bold text-emerald-600 text-base">
                {formatCurrency(preview.totalAum)}
              </span>
            </div>
          </div>
        </div>

        {/* Warnings or Errors */}
        {preview.errors.length > 0 && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 mb-1">Import Halted - Critical Validation Errors:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {preview.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {preview.warnings.length > 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 mb-0.5">Notice:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {preview.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Detected Headers */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Detected Columns ({preview.detectedHeaders.length})
          </h4>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            {preview.detectedHeaders.map((header, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white text-[11px] font-mono border border-slate-200 text-slate-700 shadow-2xs"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {header}
              </span>
            ))}
          </div>
        </div>

        {/* Sample parsed records table */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Sample Parsed Holdings (First {preview.sampleRows.length} Rows)
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Investor Name</th>
                  <th className="px-3 py-2 text-left font-semibold">AMC</th>
                  <th className="px-3 py-2 text-left font-semibold">Scheme</th>
                  <th className="px-3 py-2 text-left font-semibold">Folio</th>
                  <th className="px-3 py-2 text-right font-semibold">Units</th>
                  <th className="px-3 py-2 text-right font-semibold">NAV</th>
                  <th className="px-3 py-2 text-right font-semibold">Current Value (AUM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {preview.sampleRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2 font-medium text-slate-900 whitespace-nowrap">{row.clientName}</td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.amc}</td>
                    <td className="px-3 py-2 text-slate-600 max-w-xs truncate" title={row.scheme}>
                      {row.scheme}
                    </td>
                    <td className="px-3 py-2 text-slate-600 font-mono whitespace-nowrap">{row.folio}</td>
                    <td className="px-3 py-2 text-right text-slate-600 font-mono whitespace-nowrap">{formatUnits(row.units)}</td>
                    <td className="px-3 py-2 text-right text-slate-600 font-mono whitespace-nowrap">{formatNav(row.nav)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {formatCurrency(row.currentValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={hasCriticalErrors || isSaving}
            className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition shadow-xs flex items-center gap-2 ${
              hasCriticalErrors
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSaving ? 'Importing into IndexedDB...' : `Confirm & Import ${preview.validRowCount.toLocaleString('en-IN')} Records`}
          </button>
        </div>
      </div>
    </Modal>
  );
};
