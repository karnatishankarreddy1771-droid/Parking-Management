import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { UserProfile, UserRole } from '../types';

const USERS_COLLECTION = 'users';

export const userService = {
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${USERS_COLLECTION}/${uid}`);
      return null;
    }
  },

  async createUserProfile(profile: UserProfile): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, profile.uid);
      await setDoc(userRef, profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${USERS_COLLECTION}/${profile.uid}`);
    }
  },

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${USERS_COLLECTION}/${uid}`);
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const colRef = collection(db, USERS_COLLECTION);
      const snap = await getDocs(colRef);
      return snap.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
      return [];
    }
  },

  listenToUsers(callback: (users: UserProfile[]) => void) {
    const colRef = collection(db, USERS_COLLECTION);
    return onSnapshot(
      colRef,
      (snap) => {
        const users = snap.docs.map(doc => doc.data() as UserProfile);
        callback(users);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
      }
    );
  },

  async getUsersByRole(role: UserRole): Promise<UserProfile[]> {
    try {
      const q = query(collection(db, USERS_COLLECTION), where('role', '==', role));
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
      return [];
    }
  },

  async deleteUser(uid: string): Promise<void> {
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${USERS_COLLECTION}/${uid}`);
    }
  }
};
