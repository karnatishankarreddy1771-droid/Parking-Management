import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  CalendarPlus, 
  Ticket, 
  SquareParking, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  QrCode
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { parkingService } from '../../services/parkingService';
import { bookingService } from '../../services/bookingService';
import { vehicleService } from '../../services/vehicleService';
import { ParkingSlot, VisitorBooking, Vehicle } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ResidentDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  
  const [assignedSlot, setAssignedSlot] = useState<ParkingSlot | null>(null);
  const [activeBookings, setActiveBookings] = useState<VisitorBooking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userProfile?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    // Fetch assigned slot
    parkingService.getResidentSlot(userProfile.uid).then(slot => {
      setAssignedSlot(slot);
    }).catch(() => {});

    // Realtime listen to resident bookings
    const unsubscribeBookings = bookingService.listenToUserBookings(
      userProfile.uid,
      (bookingsList) => {
        setActiveBookings(bookingsList);
        setLoading(false);
        clearTimeout(timer);
      }
    );

    // Realtime listen to resident vehicles
    const unsubscribeVehicles = vehicleService.listenToVehiclesByOwner(
      userProfile.uid,
      (vehList) => {
        setVehicles(vehList);
      }
    );

    return () => {
      clearTimeout(timer);
      if (typeof unsubscribeBookings === 'function') unsubscribeBookings();
      if (typeof unsubscribeVehicles === 'function') unsubscribeVehicles();
    };
  }, [userProfile?.uid]);

  if (loading) {
    return <LoadingSpinner label="Fetching Resident Dashboard..." />;
  }

  const upcomingPasses = activeBookings.filter(b => b.status === 'Approved' || b.status === 'Checked In');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
            Resident Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Welcome back, {userProfile?.name}!
          </h1>
          <p className="text-xs text-indigo-100 mt-1">
            Flat {userProfile?.flatNumber || 'A-101'} • Active Visitor Passes & Parking Slot Sync
          </p>
        </div>

        <Link
          to="/resident/booking"
          className="px-5 py-3 rounded-2xl bg-white text-indigo-700 font-extrabold text-xs hover:bg-indigo-50 transition-colors shadow-lg shrink-0 flex items-center justify-center gap-2"
        >
          <CalendarPlus className="w-4 h-4" /> Book Visitor Slot
        </Link>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Parking Slot"
          value={assignedSlot ? assignedSlot.slotNumber : 'Slot A-101'}
          subtitle={assignedSlot ? `${assignedSlot.building} • ${assignedSlot.floor}` : 'Building A - North'}
          icon={SquareParking}
          color="indigo"
        />
        <StatCard
          title="Active Visitor Passes"
          value={upcomingPasses.length}
          subtitle={`${activeBookings.length} Total Passes Created`}
          icon={Ticket}
          color="emerald"
        />
        <StatCard
          title="Registered Vehicles"
          value={vehicles.length}
          subtitle="Linked to Resident Profile"
          icon={Car}
          color="purple"
        />
      </div>

      {/* Main Grid: Upcoming Visitor Passes & My Vehicles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Visitor Passes */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Active & Upcoming Visitor Passes
              </h3>
              <p className="text-xs text-slate-500">
                Realtime Firestore sync with Security Gate
              </p>
            </div>
            <Link
              to="/resident/my-bookings"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All Passes →
            </Link>
          </div>

          {activeBookings.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <Ticket className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No visitor passes created yet.</p>
              <p className="mt-1">Create a pass so your guests can enter seamlessly.</p>
              <Link
                to="/resident/booking"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md"
              >
                <Plus className="w-4 h-4" /> Book First Visitor
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBookings.slice(0, 4).map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {booking.guestName}
                      </span>
                      <Badge status={booking.status} />
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Vehicle: <strong>{booking.vehicleNumber}</strong> ({booking.vehicleType})</span>
                      <span>Date: <strong>{booking.date}</strong></span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Time Window: {booking.startTime} - {booking.endTime}
                    </p>
                  </div>

                  {booking.passCode && (
                    <div className="px-3.5 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-right shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                        Gate Code
                      </span>
                      <span className="text-base font-black font-mono text-indigo-700 dark:text-indigo-300">
                        #{booking.passCode}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Registered Vehicles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  My Vehicles
                </h3>
                <p className="text-xs text-slate-500">
                  Registered for resident parking
                </p>
              </div>
              <Link
                to="/resident/vehicles"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-slate-200"
              >
                <Plus className="w-4 h-4" />
              </Link>
            </div>

            {vehicles.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Car className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p>No vehicles registered yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                        {v.vehicleNumber}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {v.make} {v.model} • {v.color}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-lg border border-indigo-200 dark:border-indigo-800">
                      {v.vehicleType}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/resident/vehicles"
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              Manage Vehicles
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
