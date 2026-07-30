import React, { useEffect, useState } from 'react';
import { LogIn, LogOut, Search, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { visitorLogService } from '../../services/visitorLogService';
import { VisitorBooking } from '../../types';
import { Badge } from '../../components/common/Badge';
import { DataTable, Column } from '../../components/common/DataTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const TodaysVisitors: React.FC = () => {
  const { userProfile } = useAuth();
  const [todayBookings, setTodayBookings] = useState<VisitorBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = bookingService.listenToTodayBookings((data) => {
      setTodayBookings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCheckIn = async (booking: VisitorBooking) => {
    if (!userProfile?.uid || !booking.id) return;

    await visitorLogService.logEntry({
      bookingId: booking.id,
      guestName: booking.guestName,
      vehicleNumber: booking.vehicleNumber,
      flatNumber: booking.flatNumber,
      securityId: userProfile.uid,
      securityName: userProfile.name
    });

    await bookingService.updateBookingStatus(booking.id, 'Checked In');
  };

  if (loading) return <LoadingSpinner label="Fetching today's visitor schedule..." />;

  const columns: Column<VisitorBooking>[] = [
    {
      header: 'Passcode',
      accessor: (row) => (
        <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
          #{row.passCode || 'N/A'}
        </span>
      )
    },
    {
      header: 'Guest',
      accessor: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.guestName}</p>
          <p className="text-[10px] text-slate-400">{row.guestPhone}</p>
        </div>
      )
    },
    {
      header: 'Flat & Resident',
      accessor: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">Flat {row.flatNumber || 'A-101'}</p>
          <p className="text-[10px] text-slate-400">{row.residentName}</p>
        </div>
      )
    },
    {
      header: 'Vehicle',
      accessor: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 dark:text-white block">
            {row.vehicleNumber}
          </span>
          <span className="text-[10px] text-slate-400">{row.vehicleType}</span>
        </div>
      )
    },
    {
      header: 'Window',
      accessor: (row) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {row.startTime} - {row.endTime}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row) => <Badge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Today's Expected Visitors
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Visitor passes scheduled for entry check-in today
        </p>
      </div>

      <DataTable
        data={todayBookings}
        columns={columns}
        searchPlaceholder="Search guest, flat, vehicle, passcode..."
        searchFilterKey={(row) => `${row.guestName} ${row.vehicleNumber} ${row.passCode} ${row.flatNumber}`}
        actions={(row) => (
          row.status === 'Approved' ? (
            <button
              onClick={() => handleCheckIn(row)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" /> Check In
            </button>
          ) : null
        )}
      />
    </div>
  );
};
