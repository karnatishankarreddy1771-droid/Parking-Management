import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { Vehicle } from '../types';

const VEHICLES_COLLECTION = 'vehicles';

export const vehicleService = {
  async getVehiclesByOwner(ownerId: string): Promise<Vehicle[]> {
    try {
      const q = query(collection(db, VEHICLES_COLLECTION), where('ownerId', '==', ownerId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, VEHICLES_COLLECTION);
      return [];
    }
  },

  listenToVehiclesByOwner(ownerId: string, callback: (vehicles: Vehicle[]) => void) {
    const q = query(collection(db, VEHICLES_COLLECTION), where('ownerId', '==', ownerId));
    return onSnapshot(
      q,
      (snap) => {
        const vehicles = snap.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle));
        callback(vehicles);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, VEHICLES_COLLECTION);
      }
    );
  },

  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const snap = await getDocs(collection(db, VEHICLES_COLLECTION));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, VEHICLES_COLLECTION);
      return [];
    }
  },

  async addVehicle(vehicle: Omit<Vehicle, 'id' | 'vehicleId'>): Promise<string> {
    try {
      const docRef = doc(collection(db, VEHICLES_COLLECTION));
      const newVehicle: Vehicle = {
        ...vehicle,
        id: docRef.id,
        vehicleId: docRef.id
      };
      await setDoc(docRef, newVehicle);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, VEHICLES_COLLECTION);
      throw error;
    }
  },

  async updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<void> {
    try {
      await updateDoc(doc(db, VEHICLES_COLLECTION, vehicleId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${VEHICLES_COLLECTION}/${vehicleId}`);
    }
  },

  async deleteVehicle(vehicleId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, VEHICLES_COLLECTION, vehicleId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${VEHICLES_COLLECTION}/${vehicleId}`);
    }
  }
};
