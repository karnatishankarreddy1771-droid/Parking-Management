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
import { NotificationItem } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationService = {
  async getUserNotifications(userId: string): Promise<NotificationItem[]> {
    try {
      const q = query(collection(db, NOTIFICATIONS_COLLECTION), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationItem));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, NOTIFICATIONS_COLLECTION);
      return [];
    }
  },

  listenToUserNotifications(userId: string, callback: (notifications: NotificationItem[]) => void) {
    const q = query(collection(db, NOTIFICATIONS_COLLECTION), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snap) => {
        const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationItem));
        // Sort descending by createdAt
        notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(notifications);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, NOTIFICATIONS_COLLECTION);
      }
    );
  },

  async sendNotification(notification: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>): Promise<string> {
    try {
      const docRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
      const newNotif: NotificationItem = {
        ...notification,
        id: docRef.id,
        read: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(docRef, newNotif);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, NOTIFICATIONS_COLLECTION);
      throw error;
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${NOTIFICATIONS_COLLECTION}/${notificationId}`);
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${NOTIFICATIONS_COLLECTION}/${notificationId}`);
    }
  }
};
