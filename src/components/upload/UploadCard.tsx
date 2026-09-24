import React, { useRef, useState } from 'react';
import { DataSource, ImportBatch } from '../../types/investment';
import { UploadCloud, FileCheck, Trash2, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '../../lib/formatters';
import { SourceBadge } from '../ui/SourceBadge';

interface UploadCardProps {
  source: DataSource;
  title: string;
  description: string;
  batch?: ImportBatch;
  onFileSelected: (file: File, source: DataSource) => void;
  onRemove: (source: DataSource) => void;
  onLoadSample: (source: DataSource) => void;
  isLoadingSample: boolean;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  source,
  title,
  description,
  batch,
  onFileSelected,
  onRemove,
  onLoadSample,
  isLoadingSample,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMsg(null);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcess(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcess(file);
    }
    // reset input value so re-uploading same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateAndProcess = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMsg('Please select a valid .csv file.');
      return;
    }
    setErrorMsg(null);
    onFileSelected(file, source);
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <SourceBadge source={source} size="sm" />
          </div>
          {batch && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Active Dataset
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">{description}</p>
      </div>

      {/* Main Body */}
      <div className="p-6 space-y-5">
        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerBrowse}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,text/csv"
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">
              Drag & Drop {source} CSV here, or <span className="text-indigo-600 hover:underline">Browse</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Supports UTF-8 CSV exports with holding AUM records</p>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Existing Loaded Data Metadata (Section 18) */}
        {batch ? (
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Current File
              </span>
              <span className="font-semibold text-slate-800 truncate max-w-[180px]" title={batch.fileName}>
                {batch.fileName}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Records</span>
                <span className="font-bold text-slate-800 text-sm">{batch.recordCount.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Clients</span>
                <span className="font-bold text-indigo-600 text-sm">{batch.clientCount.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total AUM</span>
                <span className="font-bold text-emerald-600 text-xs truncate block" title={formatCurrency(batch.totalAum)}>
                  {formatCompactCurrency(batch.totalAum)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Imported: {new Date(batch.uploadedAt).toLocaleDateString()}</span>
              {batch.asOfDate && <span>Valuation Date: {batch.asOfDate}</span>}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 px-2 border border-slate-100 rounded-xl bg-slate-50/40">
            <p className="text-xs text-slate-400 italic">No {source} file uploaded yet</p>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onLoadSample(source)}
          disabled={isLoadingSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition shadow-2xs"
          title="Load the attached reference CSV sample"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>{isLoadingSample ? 'Loading...' : 'Load Sample Data'}</span>
        </button>

        <div className="flex items-center gap-2">
          {batch && (
            <button
              type="button"
              onClick={() => onRemove(source)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title={`Remove ${source} Data`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={triggerBrowse}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{batch ? `Replace ${source}` : `Upload CSV`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
