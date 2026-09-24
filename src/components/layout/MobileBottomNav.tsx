import React from 'react';
import { LayoutDashboard, Users, UploadCloud, DatabaseBackup } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'dashboard' | 'clients' | 'upload' | 'backup';
  setCurrentTab: (tab: 'dashboard' | 'clients' | 'upload' | 'backup') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'upload', label: 'Import', icon: UploadCloud },
    { id: 'backup', label: 'Backup', icon: DatabaseBackup },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg lg:hidden print:hidden select-none"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
