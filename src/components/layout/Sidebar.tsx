import React from 'react';
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  DatabaseBackup,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import { ImportBatch } from '../../types/investment';
import { formatCompactCurrency } from '../../lib/formatters';

interface SidebarProps {
  currentTab: 'dashboard' | 'clients' | 'upload' | 'backup';
  setCurrentTab: (tab: 'dashboard' | 'clients' | 'upload' | 'backup') => void;
  camsBatch?: ImportBatch;
  kfintechBatch?: ImportBatch;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  camsBatch,
  kfintechBatch,
  isOpen = false,
  onClose,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients & Portfolios', icon: Users },
    { id: 'upload', label: 'Upload CSV', icon: UploadCloud },
    { id: 'backup', label: 'Backup & Tools', icon: DatabaseBackup },
  ] as const;

  const handleNavClick = (id: 'dashboard' | 'clients' | 'upload' | 'backup') => {
    setCurrentTab(id);
    if (onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight tracking-tight text-base">
              Kanekt Assets
            </h1>
            <p className="text-xs text-slate-500 font-medium">MF Client Tracker</p>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Local Data Status Widget */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Local Data
          </span>
          <span
            className="flex items-center text-[11px] text-emerald-600 font-medium gap-1"
            title="Data stored only in this browser's IndexedDB"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            100% Local
          </span>
        </div>

        <div className="space-y-2">
          {/* CAMS Status Card */}
          <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800">CAMS</span>
              {camsBatch ? (
                <span className="flex items-center text-emerald-600 text-[11px] font-medium gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Loaded
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">Not Loaded</span>
              )}
            </div>
            {camsBatch ? (
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>{camsBatch.recordCount.toLocaleString('en-IN')} records</span>
                <span className="font-medium text-slate-700">
                  {formatCompactCurrency(camsBatch.totalAum)}
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No CAMS data imported</p>
            )}
          </div>

          {/* KFintech Status Card */}
          <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800">KFintech</span>
              {kfintechBatch ? (
                <span className="flex items-center text-emerald-600 text-[11px] font-medium gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Loaded
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">Not Loaded</span>
              )}
            </div>
            {kfintechBatch ? (
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>{kfintechBatch.recordCount.toLocaleString('en-IN')} records</span>
                <span className="font-medium text-slate-700">
                  {formatCompactCurrency(kfintechBatch.totalAum)}
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No KFintech data imported</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200 flex-col h-screen sticky top-0 print:hidden z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Off-Canvas Drawer (< 1024px) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden" role="dialog" aria-modal="true">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Slide-out Drawer */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
