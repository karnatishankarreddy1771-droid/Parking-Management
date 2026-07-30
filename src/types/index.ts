export type UserRole = 'Resident' | 'Security' | 'Admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  flatNumber?: string;
  phone?: string;
  profilePhoto?: string;
  createdAt: string;
}

export type SlotType = 'Resident' | 'Visitor' | 'EV Charging' | 'Accessible';
export type SlotStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export interface ParkingSlot {
  id?: string;
  slotId: string;
  slotNumber: string;
  building: string;
  floor: string;
  type: SlotType;
  assignedResident?: string; // User UID or flat number
  assignedResidentName?: string;
  status: SlotStatus;
}

export type VehicleType = 'Car' | 'Bike' | 'SUV' | 'EV' | 'Other';

export interface Vehicle {
  id?: string;
  vehicleId: string;
  ownerId: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  make?: string;
  model?: string;
  color?: string;
}

export type BookingStatus = 'Pending' | 'Approved' | 'Checked In' | 'Checked Out' | 'Cancelled' | 'Expired';

export interface VisitorBooking {
  id?: string;
  bookingId: string;
  residentId: string;
  residentName?: string;
  flatNumber?: string;
  guestName: string;
  guestPhone?: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  slotId?: string;
  slotNumber?: string;
  status: BookingStatus;
  passCode?: string;
  createdAt: string;
}

export interface VisitorLog {
  id?: string;
  bookingId: string;
  guestName?: string;
  vehicleNumber?: string;
  flatNumber?: string;
  entryTime: string;
  exitTime?: string;
  securityId: string;
  securityName?: string;
  status: 'Inside' | 'Exited';
}

export type User = UserProfile;
export type SystemSettings = AppSettings;
export type ViolationSeverity = 'Low' | 'Medium' | 'High' | string;
export type ViolationStatus = 'Open' | 'Under Review' | 'Resolved' | 'Dismissed' | string;
export type ViolationType = 'Unauthorized Parking' | 'Overstay' | 'Blocked Driveway' | 'Improper Parking' | 'No Pass' | string;

export interface Violation {
  id?: string;
  residentId?: string;
  slotId?: string;
  slotNumber?: string;
  vehicleNumber: string;
  type?: string;
  description: string;
  severity: ViolationSeverity;
  status: ViolationStatus;
  createdAt?: string;
  reportedAt?: string;
  reporterName?: string;
  reportedBy?: string;
  photoUrl?: string;
}

export type NotificationType = 'Booking' | 'Security' | 'Violation' | 'System';

export interface NotificationItem {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface AppSettings {
  maxVisitorSlots: number;
  maxHoursPerBooking: number;
  advanceBookingDays: number;
  autoApproveVisitors: boolean;
  buildings: string[];
}

export interface AnalyticsSummary {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  activeVisitors: number;
  todayBookingsCount: number;
  openViolationsCount: number;
  utilizationRate: number;
}
