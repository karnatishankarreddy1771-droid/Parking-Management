import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const getFirebaseConfig = (): FirebaseCustomConfig => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('parkings_firebase_config') : null;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved Firebase config', e);
    }
  }

  const env = (import.meta as any).env || {};
  return {
    apiKey: env.VITE_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "parkings-demo.firebaseapp.com",
    projectId: env.VITE_FIREBASE_PROJECT_ID || "parkings-demo",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "parkings-demo.firebasestorage.app",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "100000000000",
    appId: env.VITE_FIREBASE_APP_ID || "1:100000000000:web:1234567890abcdef"
  };
};

export const saveFirebaseConfig = (config: FirebaseCustomConfig) => {
  localStorage.setItem('parkings_firebase_config', JSON.stringify(config));
  window.location.reload();
};

export const isFirebaseConfigured = (): boolean => {
  const cfg = getFirebaseConfig();
  return cfg.apiKey !== "YOUR_FIREBASE_API_KEY" && cfg.projectId !== "parkings-demo";
};

export const firebaseConfig = getFirebaseConfig();

// Initialize Firebase app singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default app;
