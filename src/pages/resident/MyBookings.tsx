import React, { useEffect, useState } from 'react';
import { Ticket, Search, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { VisitorBooking } from '../../types';
import { Badge } from '../../components/common/Badge';
import { DataTable, Column } from '../../components/common/DataTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MyBookings: React.FC = () => {
  const { userProfile } = useAuth();
  const [bookings, setBookings] = useState<VisitorBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribe = bookingService.listenToUserBookings(
      userProfile.uid,
      (data) => {
        setBookings(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const handleCancelPass = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this visitor pass?')) {
      await bookingService.updateBookingStatus(bookingId, 'Cancelled');
    }
  };

  if (loading) return <LoadingSpinner label="Syncing visitor passes from Firestore..." />;

  const columns: Column<VisitorBooking>[] = [
    {
      header: 'Passcode',
      accessor: (row) => (
        <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
          #{row.passCode || 'N/A'}
        </span>
      )
    },
    {
      header: 'Guest Name',
      accessor: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.guestName}</p>
          <p className="text-[10px] text-slate-400">{row.guestPhone}</p>
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
      header: 'Date & Time',
      accessor: (row) => (
        <div className="text-xs">
          <p className="font-medium text-slate-900 dark:text-white">{row.date}</p>
          <p className="text-[10px] text-slate-400">{row.startTime} - {row.endTime}</p>
        </div>
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
          My Visitor Passes
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Realtime visitor passes list synchronized with Security Gate
        </p>
      </div>

      <DataTable
        data={bookings}
        columns={columns}
        searchPlaceholder="Search guest, passcode or vehicle..."
        searchFilterKey={(row) => `${row.guestName} ${row.vehicleNumber} ${row.passCode}`}
        actions={(row) => (
          (row.status === 'Approved' || row.status === 'Pending') && row.id ? (
            <button
              onClick={() => handleCancelPass(row.id!)}
              className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel Pass
            </button>
          ) : null
        )}
      />
    </div>
  );
};
