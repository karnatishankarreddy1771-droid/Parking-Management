import React, { useState } from 'react';
import { Settings, Database, RefreshCw, CheckCircle2, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { seedInitialData } from '../../utils/seedData';
import { FirebaseSetupModal } from '../../components/common/FirebaseSetupModal';

export const AdminSettings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedSuccess(false);
    try {
      await seedInitialData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          System Settings & Firebase Config
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage Firebase SDK configuration, database health, theme preferences and test data
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Firebase Config Status */}
        <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-600 text-white font-bold">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Firebase Firestore & Auth Config
              </h3>
              <p className="text-xs text-slate-500">
                Connected via custom credentials or fallback placeholders
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFirebaseModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-xs"
          >
            Configure Keys
          </button>
        </div>

        {/* Theme Settings */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Interface Dark / Light Mode
            </h4>
            <p className="text-xs text-slate-500">Currently active theme: <strong className="capitalize">{theme}</strong></p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" /> Switch to Light
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" /> Switch to Dark
              </>
            )}
          </button>
        </div>

        {/* Seed Data Trigger */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Reset / Seed Initial Database Data
            </h4>
            <p className="text-xs text-slate-500">
              Populates default parking slots (Slots A-101 to A-110) and system settings in Firestore
            </p>
          </div>

          {seedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Initial Firestore sample data successfully created!</span>
            </div>
          )}

          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding Firestore...' : 'Seed Initial Data'}
          </button>
        </div>

      </div>

      <FirebaseSetupModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
      />
    </div>
  );
};
