import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { AppSettings } from '../types';

const SETTINGS_COLLECTION = 'settings';
const DEFAULT_SETTINGS_DOC = 'app_config';

const DEFAULT_APP_SETTINGS: AppSettings = {
  maxVisitorSlots: 15,
  maxHoursPerBooking: 8,
  advanceBookingDays: 7,
  autoApproveVisitors: true,
  buildings: ['Building A - North', 'Building B - South', 'Tower C - West', 'Tower D - East']
};

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    try {
      const snap = await getDoc(doc(db, SETTINGS_COLLECTION, DEFAULT_SETTINGS_DOC));
      if (snap.exists()) {
        return snap.data() as AppSettings;
      }
      return DEFAULT_APP_SETTINGS;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${DEFAULT_SETTINGS_DOC}`);
      return DEFAULT_APP_SETTINGS;
    }
  },

  async updateSettings(settings: AppSettings): Promise<void> {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, DEFAULT_SETTINGS_DOC), settings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${DEFAULT_SETTINGS_DOC}`);
    }
  }
};
