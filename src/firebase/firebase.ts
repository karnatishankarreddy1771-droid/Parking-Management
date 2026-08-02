import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
}

export const getFirebaseConfig = (): FirebaseCustomConfig => {
  if (firebaseAppletConfig && firebaseAppletConfig.apiKey && firebaseAppletConfig.apiKey.length > 10) {
    return {
      apiKey: firebaseAppletConfig.apiKey,
      authDomain: firebaseAppletConfig.authDomain,
      projectId: firebaseAppletConfig.projectId,
      storageBucket: firebaseAppletConfig.storageBucket,
      messagingSenderId: firebaseAppletConfig.messagingSenderId,
      appId: firebaseAppletConfig.appId,
      firestoreDatabaseId: firebaseAppletConfig.firestoreDatabaseId
    };
  }

  const saved = typeof window !== 'undefined' ? localStorage.getItem('parkings_firebase_config') : null;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId && parsed.projectId !== "parking-management-4b40e") {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved Firebase config', e);
    }
  }

  const env = (import.meta as any).env || {};
  return {
    apiKey: env.VITE_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "parking-management-4b40e.firebaseapp.com",
    projectId: env.VITE_FIREBASE_PROJECT_ID || "parking-management-4b40e",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "parking-management-4b40e.firebasestorage.app",
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
  return cfg.apiKey !== "YOUR_FIREBASE_API_KEY" && cfg.apiKey.length > 10;
};

export const firebaseConfig = getFirebaseConfig();

// Initialize Firebase app singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
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
  // Return message rather than throwing uncaught exception in listeners
  return errInfo;
}

export default app;
