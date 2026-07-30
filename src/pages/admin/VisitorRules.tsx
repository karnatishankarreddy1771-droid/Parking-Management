import React, { useEffect, useState } from 'react';
import { Sliders, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { SystemSettings } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const VisitorRules: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    settingsService.getSettings().then(res => {
      setSettings(res);
      setLoading(false);
    });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSavedSuccess(false);
    try {
      await settingsService.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <LoadingSpinner label="Fetching visitor policy settings..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Community Visitor Policy & Rules
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Define visitor stay limits, gate approval workflows, and overnight curfews
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Visitor policy rules successfully updated in Firestore!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
          
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Duration & Allocation Limits
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Max Visitor Parking Duration (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={48}
                  value={settings.maxVisitorDurationHours}
                  onChange={e => setSettings({ ...settings, maxVisitorDurationHours: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Max Active Visitor Passes per Flat
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={settings.maxPassesPerResident}
                  onChange={e => setSettings({ ...settings, maxPassesPerResident: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Gate Controls & Curfew
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Night Curfew Start Time
                </label>
                <input
                  type="time"
                  value={settings.curfewStartTime}
                  onChange={e => setSettings({ ...settings, curfewStartTime: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Night Curfew End Time
                </label>
                <input
                  type="time"
                  value={settings.curfewEndTime}
                  onChange={e => setSettings({ ...settings, curfewEndTime: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
                <input
                  type="checkbox"
                  checked={settings.requireResidentApproval}
                  onChange={e => setSettings({ ...settings, requireResidentApproval: e.target.checked })}
                  className="w-4 h-4 rounded-md border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Require Resident Approval for Walk-in Visitor Passes</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
                <input
                  type="checkbox"
                  checked={settings.allowOvernightParking}
                  onChange={e => setSettings({ ...settings, allowOvernightParking: e.target.checked })}
                  className="w-4 h-4 rounded-md border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Permit Overnight Visitor Parking</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Policy...' : 'Save Visitor Rules'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
