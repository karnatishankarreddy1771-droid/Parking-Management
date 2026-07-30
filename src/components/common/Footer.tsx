import React from 'react';
import { Car, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              Parking's SaaS
            </p>
            <p className="text-[11px] text-slate-400">
              Smart Parking & Visitor Access Management Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" /> Firebase Realtime Sync Active
          </span>
          <span>© {new Date().getFullYear()} Parking's Inc.</span>
        </div>
      </div>
    </footer>
  );
};
