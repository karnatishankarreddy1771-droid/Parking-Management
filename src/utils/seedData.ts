import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ParkingSlot, AppSettings } from '../types';

const SAMPLE_SLOTS: Omit<ParkingSlot, 'id'>[] = [
  { slotId: 'slot-A101', slotNumber: 'A-101', building: 'Building A - North', floor: '1st Floor', type: 'Resident', assignedResident: 'res-101', assignedResidentName: 'Alex Johnson', status: 'Occupied' },
  { slotId: 'slot-A102', slotNumber: 'A-102', building: 'Building A - North', floor: '1st Floor', type: 'Resident', assignedResident: 'res-102', assignedResidentName: 'Sarah Smith', status: 'Available' },
  { slotId: 'slot-A103', slotNumber: 'A-103', building: 'Building A - North', floor: '1st Floor', type: 'Resident', assignedResident: 'res-103', assignedResidentName: 'David Miller', status: 'Available' },
  { slotId: 'slot-AV01', slotNumber: 'V-A01', building: 'Building A - North', floor: 'Ground Floor', type: 'Visitor', status: 'Available' },
  { slotId: 'slot-AV02', slotNumber: 'V-A02', building: 'Building A - North', floor: 'Ground Floor', type: 'Visitor', status: 'Reserved' },
  { slotId: 'slot-B201', slotNumber: 'B-201', building: 'Building B - South', floor: '2nd Floor', type: 'EV Charging', status: 'Available' },
  { slotId: 'slot-B202', slotNumber: 'B-202', building: 'Building B - South', floor: '2nd Floor', type: 'EV Charging', status: 'Occupied' },
  { slotId: 'slot-BV01', slotNumber: 'V-B01', building: 'Building B - South', floor: 'Ground Floor', type: 'Accessible', status: 'Available' },
  { slotId: 'slot-C301', slotNumber: 'C-301', building: 'Tower C - West', floor: '3rd Floor', type: 'Resident', assignedResident: 'res-301', assignedResidentName: 'Elena Rostova', status: 'Occupied' },
  { slotId: 'slot-CV01', slotNumber: 'V-C01', building: 'Tower C - West', floor: 'Ground Floor', type: 'Visitor', status: 'Available' }
];

export async function seedInitialFirestoreData() {
  try {
    // Check if slots exist
    const slotsSnap = await getDocs(collection(db, 'parkingSlots'));
    if (slotsSnap.empty) {
      console.log('Seeding parking slots...');
      for (const slot of SAMPLE_SLOTS) {
        await setDoc(doc(db, 'parkingSlots', slot.slotId), slot);
      }
    }

    // Seed default app settings
    const settingsDoc = doc(db, 'settings', 'app_config');
    const defaultSettings: AppSettings = {
      maxVisitorSlots: 15,
      maxHoursPerBooking: 8,
      advanceBookingDays: 7,
      autoApproveVisitors: true,
      buildings: ['Building A - North', 'Building B - South', 'Tower C - West', 'Tower D - East']
    };
    await setDoc(settingsDoc, defaultSettings, { merge: true });

    return { success: true, message: 'Firestore collections initialized successfully!' };
  } catch (error) {
    console.error('Seed Error:', error);
    return { success: false, error: String(error) };
  }
}

export const seedInitialData = seedInitialFirestoreData;
