import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { AnalyticsSummary, ParkingSlot, VisitorBooking, VisitorLog, Violation } from '../types';

export const analyticsService = {
  async getSummary(): Promise<AnalyticsSummary> {
    try {
      const [slotsSnap, bookingsSnap, logsSnap, violationsSnap] = await Promise.all([
        getDocs(collection(db, 'parkingSlots')),
        getDocs(query(collection(db, 'visitorBookings'), where('date', '==', new Date().toISOString().split('T')[0]))),
        getDocs(query(collection(db, 'visitorLogs'), where('status', '==', 'Inside'))),
        getDocs(query(collection(db, 'violations'), where('status', '==', 'Open')))
      ]);

      const slots = slotsSnap.docs.map(d => d.data() as ParkingSlot);
      const totalSlots = slots.length;
      const occupiedSlots = slots.filter(s => s.status === 'Occupied' || s.status === 'Reserved').length;
      const availableSlots = slots.filter(s => s.status === 'Available').length;
      const utilizationRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

      return {
        totalSlots,
        occupiedSlots,
        availableSlots,
        activeVisitors: logsSnap.size,
        todayBookingsCount: bookingsSnap.size,
        openViolationsCount: violationsSnap.size,
        utilizationRate
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'analytics');
      return {
        totalSlots: 0,
        occupiedSlots: 0,
        availableSlots: 0,
        activeVisitors: 0,
        todayBookingsCount: 0,
        openViolationsCount: 0,
        utilizationRate: 0
      };
    }
  },

  async getBuildingOccupancy() {
    try {
      const snap = await getDocs(collection(db, 'parkingSlots'));
      const slots = snap.docs.map(d => d.data() as ParkingSlot);
      
      const buildingMap: Record<string, { total: number; occupied: number }> = {};
      slots.forEach(slot => {
        const b = slot.building || 'Main';
        if (!buildingMap[b]) buildingMap[b] = { total: 0, occupied: 0 };
        buildingMap[b].total += 1;
        if (slot.status === 'Occupied' || slot.status === 'Reserved') {
          buildingMap[b].occupied += 1;
        }
      });

      return Object.entries(buildingMap).map(([name, data]) => ({
        building: name,
        Occupied: data.occupied,
        Available: data.total - data.occupied,
        Total: data.total
      }));
    } catch (error) {
      return [];
    }
  },

  async getViolationSeverityData() {
    try {
      const snap = await getDocs(collection(db, 'violations'));
      const violations = snap.docs.map(d => d.data() as Violation);
      const counts = { Low: 0, Medium: 0, High: 0 };
      violations.forEach(v => {
        if (counts[v.severity] !== undefined) counts[v.severity] += 1;
      });
      return [
        { name: 'Low', value: counts.Low, color: '#10B981' },
        { name: 'Medium', value: counts.Medium, color: '#F59E0B' },
        { name: 'High', value: counts.High, color: '#EF4444' }
      ];
    } catch (error) {
      return [];
    }
  }
};
