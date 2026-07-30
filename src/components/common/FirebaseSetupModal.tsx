import React, { useState } from 'react';
import { Database, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { Modal } from './Modal';
import { getFirebaseConfig, saveFirebaseConfig, isFirebaseConfigured } from '../../firebase/firebase';
import { seedInitialFirestoreData } from '../../utils/seedData';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentConfig.apiKey);
  const [projectId, setProjectId] = useState(currentConfig.projectId);
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain);
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket);
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId);
  const [appId, setAppId] = useState(currentConfig.appId);

  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [loadingSeed, setLoadingSeed] = useState(false);

  const isConfigured = isFirebaseConfigured();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig({
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    });
  };

  const handleSeedData = async () => {
    setLoadingSeed(true);
    setSeedStatus(null);
    const result = await seedInitialFirestoreData();
    setLoadingSeed(false);
    if (result.success) {
      setSeedStatus('✅ Initial parking slots and app settings created in Firestore!');
    } else {
      setSeedStatus(`❌ Seeding failed: ${result.error}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Firebase Backend Setup" maxWidth="lg">
      <div className="space-y-5">
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          isConfigured 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-900 dark:text-emerald-200' 
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-900 dark:text-amber-200'
        }`}>
          <Database className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-semibold text-sm">
              {isConfigured ? 'Firebase SDK Connected' : 'Firebase Placeholder Configuration Active'}
            </p>
            <p className="mt-1">
              All services (Auth, Firestore, Storage) use Firebase SDK v11+. Paste your actual Firebase web config below or set environment variables in your environment.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 font-mono text-xs"
                placeholder="AIzaSy..."
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Project ID</label>
              <input
                type="text"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 font-mono text-xs"
                placeholder="parkings-app-123"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Auth Domain</label>
              <input
                type="text"
                value={authDomain}
                onChange={e => setAuthDomain(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Storage Bucket</label>
              <input
                type="text"
                value={storageBucket}
                onChange={e => setStorageBucket(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Messaging Sender ID</label>
              <input
                type="text"
                value={messagingSenderId}
                onChange={e => setMessagingSenderId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">App ID</label>
              <input
                type="text"
                value={appId}
                onChange={e => setAppId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 font-mono text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Save Config & Reload
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Database Initialization & Seed
          </h4>
          <p className="text-xs text-slate-500 mb-3">
            Populate default parking slots (Resident, Visitor, EV, Accessible) and settings in Firestore to verify SDK reads/writes instantly.
          </p>

          <button
            onClick={handleSeedData}
            disabled={loadingSeed}
            className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loadingSeed ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4 text-indigo-400" />}
            Seed Firestore Collections & Parking Slots
          </button>

          {seedStatus && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300">
              {seedStatus}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
