import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  UserCheck, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  Clock,
  QrCode,
  Car
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { bookingService } from '../../services/bookingService';
import { visitorLogService } from '../../services/visitorLogService';
import { violationService } from '../../services/violationService';
import { VisitorBooking, VisitorLog, Violation } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const SecurityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [todayBookings, setTodayBookings] = useState<VisitorBooking[]>([]);
  const [activeLogs, setActiveLogs] = useState<VisitorLog[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<VisitorBooking | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    // Realtime listener for today's bookings
    const unsubscribeBookings = bookingService.listenToTodayBookings((data) => {
      setTodayBookings(data);
      setLoading(false);
      clearTimeout(timer);
    });

    // Realtime listener for visitor logs
    const unsubscribeLogs = visitorLogService.listenToVisitorLogs((logs) => {
      setActiveLogs(logs.filter(l => l.status === 'Inside'));
    });

    // Realtime listener for violations
    const unsubscribeViolations = violationService.listenToViolations((vList) => {
      setViolations(vList.filter(v => v.status === 'Open'));
    });

    return () => {
      clearTimeout(timer);
      if (typeof unsubscribeBookings === 'function') unsubscribeBookings();
      if (typeof unsubscribeLogs === 'function') unsubscribeLogs();
      if (typeof unsubscribeViolations === 'function') unsubscribeViolations();
    };
  }, []);

  const handleGateVerifySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearched(true);
    const result = await bookingService.findBookingByPassCodeOrVehicle(searchQuery.trim());
    setSearchResult(result);
  };

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
    setSearchResult(null);
    setSearchQuery('');
    setSearched(false);
  };

  const handleCheckOut = async (logId: string, bookingId: string) => {
    await visitorLogService.logExit(logId);
    await bookingService.updateBookingStatus(bookingId, 'Checked Out');
  };

  if (loading) return <LoadingSpinner label="Initializing Security Console..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Security Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-xl shadow-cyan-600/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
            Security Gate Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Gatekeeper Console • Guard {userProfile?.name}
          </h1>
          <p className="text-xs text-cyan-100 mt-1">
            Realtime verification of visitor passcodes and vehicle entry/exit logs
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/security/entry"
            className="px-4 py-2.5 rounded-2xl bg-white text-cyan-800 font-extrabold text-xs hover:bg-cyan-50 transition-colors shadow-md flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4" /> Entry Check-In
          </Link>
          <Link
            to="/security/violations"
            className="px-4 py-2.5 rounded-2xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-400/40 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" /> Log Violation
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Visitors Inside Property"
          value={activeLogs.length}
          subtitle="Currently Active On-Premise"
          icon={UserCheck}
          color="cyan"
        />
        <StatCard
          title="Today's Visitor Passes"
          value={todayBookings.length}
          subtitle="Scheduled for Check-In"
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Open Violations"
          value={violations.length}
          subtitle="Requires Gate Action"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Instant Gate Verification Search Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
          Instant Gate Passcode / License Plate Search
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Enter 6-digit gate passcode or license plate number to verify arrival
        </p>

        <form onSubmit={handleGateVerifySearch} className="flex gap-2">
          <div className="relative grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g. #849201 or KA05MN2024"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-2xl shadow-md transition-colors"
          >
            Verify Pass
          </button>
        </form>

        {searched && (
          <div className="mt-4 p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
            {searchResult ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {searchResult.guestName}
                    </span>
                    <Badge status={searchResult.status} />
                  </div>
                  <p className="text-slate-500">
                    Visiting Flat <strong>{searchResult.flatNumber || 'A-101'}</strong> ({searchResult.residentName})
                  </p>
                  <p className="text-slate-500 font-mono">
                    Vehicle: <strong>{searchResult.vehicleNumber}</strong> ({searchResult.vehicleType})
                  </p>
                </div>

                {searchResult.status === 'Approved' ? (
                  <button
                    onClick={() => handleCheckIn(searchResult)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Grant Gate Entry
                  </button>
                ) : (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Pass is currently {searchResult.status}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-rose-500 font-semibold">
                ❌ No matching pass found for "{searchQuery}". Please verify with resident.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Lists: Currently On-Premise & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* On-Premise Visitors */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Visitors Currently Inside
              </h3>
              <p className="text-xs text-slate-500">Active entry logs awaiting exit check-out</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              {activeLogs.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {activeLogs.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No active visitors on premise.</p>
            ) : (
              activeLogs.map(log => (
                <div key={log.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">{log.guestName}</p>
                    <p className="text-slate-500 font-mono">
                      {log.vehicleNumber} • Flat {log.flatNumber || 'A-101'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Entered at {new Date(log.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {log.id && (
                    <button
                      onClick={() => handleCheckOut(log.id!, log.bookingId)}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Check Out
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Expected Visitor Passes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Today's Visitor Schedule
              </h3>
              <p className="text-xs text-slate-500">Expected arrivals for today</p>
            </div>
            <Link to="/security/visitors-today" className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {todayBookings.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No scheduled visitors today.</p>
            ) : (
              todayBookings.slice(0, 4).map(b => (
                <div key={b.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{b.guestName}</span>
                      <Badge status={b.status} />
                    </div>
                    <p className="text-slate-500 font-mono">
                      {b.vehicleNumber} • #{b.passCode}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Time: {b.startTime} - {b.endTime}
                    </p>
                  </div>

                  {b.status === 'Approved' && (
                    <button
                      onClick={() => handleCheckIn(b)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Check In
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
