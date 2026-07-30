import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { Violation, ViolationStatus } from '../types';

const VIOLATIONS_COLLECTION = 'violations';

export const violationService = {
  async createViolation(violation: Omit<Violation, 'id' | 'createdAt' | 'status'>): Promise<string> {
    try {
      const docRef = doc(collection(db, VIOLATIONS_COLLECTION));
      const newViolation: Violation = {
        ...violation,
        id: docRef.id,
        status: 'Open',
        createdAt: new Date().toISOString()
      };
      await setDoc(docRef, newViolation);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, VIOLATIONS_COLLECTION);
      throw error;
    }
  },

  async getAllViolations(): Promise<Violation[]> {
    try {
      const snap = await getDocs(collection(db, VIOLATIONS_COLLECTION));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Violation));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, VIOLATIONS_COLLECTION);
      return [];
    }
  },

  listenToViolations(callback: (violations: Violation[]) => void) {
    const colRef = collection(db, VIOLATIONS_COLLECTION);
    return onSnapshot(
      colRef,
      (snap) => {
        const violations = snap.docs.map(d => ({ id: d.id, ...d.data() } as Violation));
        callback(violations);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, VIOLATIONS_COLLECTION);
      }
    );
  },

  async updateViolationStatus(violationId: string, status: ViolationStatus): Promise<void> {
    try {
      await updateDoc(doc(db, VIOLATIONS_COLLECTION, violationId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${VIOLATIONS_COLLECTION}/${violationId}`);
    }
  },

  async reportViolation(violation: Omit<Violation, 'id' | 'createdAt' | 'status'> & { status?: ViolationStatus }): Promise<string> {
    return this.createViolation(violation);
  },

  async resolveViolation(violationId: string): Promise<void> {
    return this.updateViolationStatus(violationId, 'Resolved');
  },

  async deleteViolation(violationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, VIOLATIONS_COLLECTION, violationId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${VIOLATIONS_COLLECTION}/${violationId}`);
    }
  }
};
