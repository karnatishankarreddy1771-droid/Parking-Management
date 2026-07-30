import React, { useEffect, useState } from 'react';
import { SquareParking, Car, MapPin, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { parkingService } from '../../services/parkingService';
import { vehicleService } from '../../services/vehicleService';
import { ParkingSlot, Vehicle } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MyParking: React.FC = () => {
  const { userProfile } = useAuth();
  const [slot, setSlot] = useState<ParkingSlot | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;

    parkingService.getResidentSlot(userProfile.uid).then(res => {
      setSlot(res);
      setLoading(false);
    });

    vehicleService.getVehiclesByOwner(userProfile.uid).then(vehs => {
      setVehicles(vehs);
    });
  }, [userProfile?.uid]);

  if (loading) return <LoadingSpinner label="Loading Parking Slot details..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          My Assigned Parking Slot
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed location, building mapping, and vehicle access rights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Slot Overview Card */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30">
                <SquareParking className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Designated Slot
                </span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                  {slot ? slot.slotNumber : 'Slot A-101'}
                </h2>
              </div>
            </div>

            <Badge status={slot?.status || 'Occupied'} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 font-semibold block mb-1">Building</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-500" />
                {slot?.building || 'Building A - North'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 font-semibold block mb-1">Floor</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-500" />
                {slot?.floor || '1st Floor'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 font-semibold block mb-1">Slot Category</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                {slot?.type || 'Resident Designated'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <p className="font-bold">Automated Gate Authorization Enabled</p>
              <p className="mt-0.5 opacity-90 leading-relaxed">
                Your registered vehicles are pre-approved at security gates for instant barrier lift upon entry.
              </p>
            </div>
          </div>
        </div>

        {/* Vehicles Authorized Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
            Authorized Vehicles
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Vehicles permitted in slot {slot?.slotNumber || 'A-101'}
          </p>

          <div className="space-y-3">
            {vehicles.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No vehicles registered.</p>
            ) : (
              vehicles.map(v => (
                <div key={v.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                      {v.vehicleNumber}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {v.make} {v.model} ({v.color})
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
