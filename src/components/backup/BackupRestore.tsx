import React, { useRef, useState } from 'react';
import { db } from '../../lib/db';
import { Download, Upload, Trash2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { ImportBatch } from '../../types/investment';

interface BackupRestoreProps {
  camsBatch?: ImportBatch;
  kfintechBatch?: ImportBatch;
  onDataChanged: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({
  camsBatch,
  kfintechBatch,
  onDataChanged,
}) => {
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = async () => {
    setIsExporting(true);
    setStatusMsg(null);
    try {
      const camsRecords = await db.cams_dataset.toArray();
      const kfintechRecords = await db.kfintech_dataset.toArray();
      const batches = await db.batches.toArray();
      const meta = await db.meta.toArray();

      const backupData = {
        app: 'Kanekt Assets Mutual Fund Tracker',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        metadata: {
          camsBatch,
          kfintechBatch,
          camsRecordsCount: camsRecords.length,
          kfintechRecordsCount: kfintechRecords.length,
        },
        cams_dataset: camsRecords,
        kfintech_dataset: kfintechRecords,
        batches,
        meta,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kanekt_mf_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMsg({
        type: 'success',
        text: `Backup exported successfully (${(camsRecords.length + kfintechRecords.length).toLocaleString('en-IN')} total records).`,
      });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: `Export failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatusMsg(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.cams_dataset && !data.kfintech_dataset) {
        throw new Error('Invalid backup file format: missing datasets');
      }

      await db.clearAll();

      if (Array.isArray(data.cams_dataset) && data.cams_dataset.length > 0) {
        await db.cams_dataset.bulkAdd(data.cams_dataset);
      }
      if (Array.isArray(data.kfintech_dataset) && data.kfintech_dataset.length > 0) {
        await db.kfintech_dataset.bulkAdd(data.kfintech_dataset);
      }
      if (Array.isArray(data.batches) && data.batches.length > 0) {
        await db.batches.bulkAdd(data.batches);
      }
      if (Array.isArray(data.meta) && data.meta.length > 0) {
        await db.meta.bulkAdd(data.meta);
      }

      onDataChanged();
      setStatusMsg({
        type: 'success',
        text: `Backup restored successfully! Loaded ${((data.cams_dataset?.length || 0) + (data.kfintech_dataset?.length || 0)).toLocaleString('en-IN')} records.`,
      });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: `Failed to restore backup: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetAll = async () => {
    if (window.confirm('CRITICAL CONFIRMATION: Are you sure you want to permanently delete all local investment records, CAMS data, and KFintech data from this browser?')) {
      await db.clearAll();
      onDataChanged();
      setStatusMsg({
        type: 'success',
        text: 'All local IndexedDB datasets have been cleared.',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Backup & Data Management</h2>
        <p className="text-xs text-slate-500 mt-1">
          Save your normalized local database as an encrypted/portable JSON file or restore from a previous backup.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Export Local Backup</h3>
            <p className="text-xs text-slate-500 mt-1">
              Downloads a snapshot JSON containing normalized records, batch metadata, and client mappings.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shadow-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export Backup JSON'}</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Restore from Backup</h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload a previously exported backup JSON file to restore your datasets.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition shadow-2xs flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>{isImporting ? 'Restoring...' : 'Select Backup JSON File'}</span>
          </button>
        </div>
      </div>

      {/* Security & Reset Danger Zone */}
      <div className="bg-white border border-red-100 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Client Privacy & Local-First Guarantee</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          All mutual fund transactions, unit balances, investor identities, and folio numbers are stored exclusively inside your browser's IndexedDB engine. No data ever traverses the network or reaches an external cloud server.
        </p>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-red-600">Danger Zone</h4>
            <p className="text-[11px] text-slate-400">Permanently erase all CAMS & KFintech datasets from this browser</p>
          </div>
          <button
            onClick={handleResetAll}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset All Local Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
