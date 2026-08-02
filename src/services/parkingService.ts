import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { ParkingSlot, SlotStatus } from '../types';

const SLOTS_COLLECTION = 'parkingSlots';

export const parkingService = {
  async getAllSlots(): Promise<ParkingSlot[]> {
    try {
      const snap = await getDocs(collection(db, SLOTS_COLLECTION));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ParkingSlot));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, SLOTS_COLLECTION);
      return [];
    }
  },

  listenToSlots(callback: (slots: ParkingSlot[]) => void) {
    const colRef = collection(db, SLOTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snap) => {
        const slots = snap.docs.map(d => ({ id: d.id, ...d.data() } as ParkingSlot));
        callback(slots);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, SLOTS_COLLECTION);
        callback([]);
      }
    );
  },

  async addSlot(slot: Omit<ParkingSlot, 'id'>): Promise<string> {
    try {
      const docRef = doc(collection(db, SLOTS_COLLECTION));
      const newSlot: ParkingSlot = { ...slot, id: docRef.id, slotId: docRef.id };
      await setDoc(docRef, newSlot);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, SLOTS_COLLECTION);
      throw error;
    }
  },

  async createSlot(slot: Omit<ParkingSlot, 'id'>): Promise<string> {
    return this.addSlot(slot);
  },

  async updateSlot(slotId: string, updates: Partial<ParkingSlot>): Promise<void> {
    try {
      const slotRef = doc(db, SLOTS_COLLECTION, slotId);
      await updateDoc(slotRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${SLOTS_COLLECTION}/${slotId}`);
    }
  },

  async updateSlotStatus(slotId: string, status: SlotStatus): Promise<void> {
    return this.updateSlot(slotId, { status });
  },

  async deleteSlot(slotId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, SLOTS_COLLECTION, slotId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${SLOTS_COLLECTION}/${slotId}`);
    }
  },

  async getResidentSlot(residentUidOrFlat: string): Promise<ParkingSlot | null> {
    try {
      const q = query(collection(db, SLOTS_COLLECTION), where('assignedResident', '==', residentUidOrFlat));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return { id: snap.docs[0].id, ...snap.docs[0].data() } as ParkingSlot;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, SLOTS_COLLECTION);
      return null;
    }
  }
};
