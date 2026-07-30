import React, { useState } from 'react';
import { LogIn, Search, CheckCircle2, QrCode, AlertCircle, Car, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { visitorLogService } from '../../services/visitorLogService';
import { VisitorBooking } from '../../types';

export const VisitorEntry: React.FC = () => {
  const { userProfile } = useAuth();
  
  const [queryStr, setQueryStr] = useState('');
  const [foundBooking, setFoundBooking] = useState<VisitorBooking | null>(null);
  const [searched, setSearched] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryStr.trim()) return;

    setSuccessMsg(null);
    setSearched(true);
    const res = await bookingService.findBookingByPassCodeOrVehicle(queryStr.trim());
    setFoundBooking(res);
  };

  const handleCheckIn = async () => {
    if (!foundBooking || !userProfile?.uid) return;

    setCheckingIn(true);
    try {
      await visitorLogService.logEntry({
        bookingId: foundBooking.id || 'walkin',
        guestName: foundBooking.guestName,
        vehicleNumber: foundBooking.vehicleNumber,
        flatNumber: foundBooking.flatNumber || 'A-101',
        securityId: userProfile.uid,
        securityName: userProfile.name
      });

      if (foundBooking.id) {
        await bookingService.updateBookingStatus(foundBooking.id, 'Checked In');
      }

      setSuccessMsg(`✅ Entry approved for ${foundBooking.guestName} (${foundBooking.vehicleNumber}). Barrier raised.`);
      setFoundBooking(null);
      setQueryStr('');
      setSearched(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Security Visitor Entry Check-In
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify passcode or license plate to log physical entry at security gate
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Passcode or Vehicle License Plate
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={queryStr}
                onChange={e => setQueryStr(e.target.value)}
                placeholder="Enter 6-digit code e.g. #849201 or License Plate KA05MN2024"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Verify Pass Credentials
          </button>
        </form>

        {searched && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            {foundBooking ? (
              <div className="p-5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-cyan-600" />
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Pass Found: #{foundBooking.passCode}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {foundBooking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Guest Name</span>
                    <strong className="text-slate-900 dark:text-white">{foundBooking.guestName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Visiting Flat</span>
                    <strong className="text-slate-900 dark:text-white">Flat {foundBooking.flatNumber || 'A-101'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Vehicle Number</span>
                    <strong className="font-mono text-slate-900 dark:text-white">{foundBooking.vehicleNumber} ({foundBooking.vehicleType})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Valid Window</span>
                    <strong className="text-slate-900 dark:text-white">{foundBooking.startTime} - {foundBooking.endTime}</strong>
                  </div>
                </div>

                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  {checkingIn ? 'Recording Check-In...' : 'Confirm Entry & Lift Gate Barrier'}
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>No approved visitor pass found for "{queryStr}". Contact resident or check walk-in.</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
