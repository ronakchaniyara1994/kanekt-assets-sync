import React from 'react';
import { Modal } from '../ui/Modal';
import { DataSource } from '../../types/investment';
import { AlertTriangle } from 'lucide-react';

interface ReplaceConfirmModalProps {
  source: DataSource;
  isOpen: boolean;
  currentCount: number;
  newCount: number;
  onClose: () => void;
  onConfirm: () => void;
  isReplacing: boolean;
}

export const ReplaceConfirmModal: React.FC<ReplaceConfirmModalProps> = ({
  source,
  isOpen,
  currentCount,
  newCount,
  onClose,
  onConfirm,
  isReplacing,
}) => {
  const otherSource = source === 'CAMS' ? 'KFintech' : 'CAMS';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Replace ${source} Data?`}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p>
            This action will replace the entire active <strong>{source}</strong> dataset with the newly uploaded records.
          </p>
        </div>

        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2 text-sm">
          <div className="flex justify-between items-center text-slate-600">
            <span>Existing records in {source}:</span>
            <span className="font-semibold text-slate-800">{currentCount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>New records to be imported:</span>
            <span className="font-bold text-indigo-600">{newCount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          <strong>Important:</strong> {otherSource} data will remain completely intact and unchanged.
        </p>

        <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isReplacing}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isReplacing}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs"
          >
            {isReplacing ? 'Replacing...' : 'Replace Dataset'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
