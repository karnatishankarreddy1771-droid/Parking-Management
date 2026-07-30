import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { VisitorLog } from '../types';

const LOGS_COLLECTION = 'visitorLogs';

export const visitorLogService = {
  async logEntry(logData: Omit<VisitorLog, 'id' | 'entryTime' | 'status'>): Promise<string> {
    try {
      const docRef = doc(collection(db, LOGS_COLLECTION));
      const newLog: VisitorLog = {
        ...logData,
        id: docRef.id,
        entryTime: new Date().toISOString(),
        status: 'Inside'
      };
      await setDoc(docRef, newLog);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, LOGS_COLLECTION);
      throw error;
    }
  },

  async logExit(logId: string): Promise<void> {
    try {
      await updateDoc(doc(db, LOGS_COLLECTION, logId), {
        exitTime: new Date().toISOString(),
        status: 'Exited'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${LOGS_COLLECTION}/${logId}`);
    }
  },

  listenToVisitorLogs(callback: (logs: VisitorLog[]) => void) {
    const colRef = collection(db, LOGS_COLLECTION);
    return onSnapshot(
      colRef,
      (snap) => {
        const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as VisitorLog));
        callback(logs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, LOGS_COLLECTION);
      }
    );
  },

  async getAllLogs(): Promise<VisitorLog[]> {
    try {
      const snap = await getDocs(collection(db, LOGS_COLLECTION));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as VisitorLog));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, LOGS_COLLECTION);
      return [];
    }
  },

  async getActiveVisitors(): Promise<VisitorLog[]> {
    try {
      const q = query(collection(db, LOGS_COLLECTION), where('status', '==', 'Inside'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as VisitorLog));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, LOGS_COLLECTION);
      return [];
    }
  }
};
