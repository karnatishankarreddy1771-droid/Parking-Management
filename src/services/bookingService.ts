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
  where,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { VisitorBooking, BookingStatus } from '../types';

const BOOKINGS_COLLECTION = 'visitorBookings';

export const bookingService = {
  async createBooking(booking: Omit<VisitorBooking, 'id' | 'bookingId' | 'createdAt'>): Promise<string> {
    try {
      const docRef = doc(collection(db, BOOKINGS_COLLECTION));
      const passCode = Math.floor(100000 + Math.random() * 900000).toString();
      const newBooking: VisitorBooking = {
        ...booking,
        id: docRef.id,
        bookingId: docRef.id,
        passCode,
        createdAt: new Date().toISOString()
      };
      await setDoc(docRef, newBooking);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, BOOKINGS_COLLECTION);
      throw error;
    }
  },

  async getUserBookings(residentId: string): Promise<VisitorBooking[]> {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('residentId', '==', residentId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as VisitorBooking));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
      return [];
    }
  },

  listenToUserBookings(residentId: string, callback: (bookings: VisitorBooking[]) => void) {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('residentId', '==', residentId)
    );
    return onSnapshot(
      q,
      (snap) => {
        const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() } as VisitorBooking));
        callback(bookings);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
      }
    );
  },

  listenToAllBookings(callback: (bookings: VisitorBooking[]) => void) {
    const colRef = collection(db, BOOKINGS_COLLECTION);
    return onSnapshot(
      colRef,
      (snap) => {
        const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() } as VisitorBooking));
        callback(bookings);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
      }
    );
  },

  async getTodayBookings(): Promise<VisitorBooking[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const q = query(collection(db, BOOKINGS_COLLECTION), where('date', '==', today));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as VisitorBooking));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
      return [];
    }
  },

  listenToTodayBookings(callback: (bookings: VisitorBooking[]) => void) {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, BOOKINGS_COLLECTION), where('date', '==', today));
    return onSnapshot(
      q,
      (snap) => {
        const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() } as VisitorBooking));
        callback(bookings);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
      }
    );
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    try {
      await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COLLECTION}/${bookingId}`);
    }
  },

  async findBookingByPassCodeOrVehicle(queryStr: string): Promise<VisitorBooking | null> {
    try {
      // Check pass code first
      const qCode = query(collection(db, BOOKINGS_COLLECTION), where('passCode', '==', queryStr));
      const snapCode = await getDocs(qCode);
      if (!snapCode.empty) {
        return { id: snapCode.docs[0].id, ...snapCode.docs[0].data() } as VisitorBooking;
      }

      // Check vehicle number
      const qVeh = query(collection(db, BOOKINGS_COLLECTION), where('vehicleNumber', '==', queryStr.toUpperCase()));
      const snapVeh = await getDocs(qVeh);
      if (!snapVeh.empty) {
        return { id: snapVeh.docs[0].id, ...snapVeh.docs[0].data() } as VisitorBooking;
      }

      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, BOOKINGS_COLLECTION);
      return null;
    }
  },

  async deleteBooking(bookingId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${BOOKINGS_COLLECTION}/${bookingId}`);
    }
  }
};
