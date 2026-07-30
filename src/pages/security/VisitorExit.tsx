import React, { useEffect, useState } from 'react';
import { LogOut, Search, CheckCircle2, UserCheck } from 'lucide-react';
import { visitorLogService } from '../../services/visitorLogService';
import { bookingService } from '../../services/bookingService';
import { VisitorLog } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const VisitorExit: React.FC = () => {
  const [activeLogs, setActiveLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const unsubscribe = visitorLogService.listenToVisitorLogs((logs) => {
      setActiveLogs(logs.filter(l => l.status === 'Inside'));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCheckOut = async (log: VisitorLog) => {
    if (!log.id) return;
    await visitorLogService.logExit(log.id);
    if (log.bookingId) {
      await bookingService.updateBookingStatus(log.bookingId, 'Checked Out');
    }
  };

  const filtered = activeLogs.filter(l => 
    (l.guestName || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (l.vehicleNumber || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (l.flatNumber || '').toLowerCase().includes(filterText.toLowerCase())
  );

  if (loading) return <LoadingSpinner label="Loading active visitors inside property..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Security Visitor Exit Check-Out
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Mark visitor departures to free up parking capacity and log departure timestamp
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            placeholder="Search active visitor by guest name, vehicle, or flat number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-3 pt-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No active visitors currently inside property matching search.</p>
            </div>
          ) : (
            filtered.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {log.guestName}
                  </p>
                  <p className="text-slate-500 font-mono">
                    Vehicle: <strong>{log.vehicleNumber}</strong> • Visiting Flat {log.flatNumber || 'A-101'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Entered: {new Date(log.entryTime).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleCheckOut(log)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" /> Check Out & Open Exit Gate
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
