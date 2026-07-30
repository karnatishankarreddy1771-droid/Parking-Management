import React, { useEffect, useState } from 'react';
import { Car, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle, VehicleType } from '../../types';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MyVehicles: React.FC = () => {
  const { userProfile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [vNumber, setVNumber] = useState('');
  const [vType, setVType] = useState<VehicleType>('Car');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribe = vehicleService.listenToVehiclesByOwner(
      userProfile.uid,
      (data) => {
        setVehicles(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vNumber.trim() || !userProfile?.uid) return;

    setSaving(true);
    try {
      await vehicleService.addVehicle({
        ownerId: userProfile.uid,
        vehicleNumber: vNumber.trim().toUpperCase(),
        vehicleType: vType,
        make: make.trim() || 'Honda',
        model: model.trim() || 'Civic',
        color: color.trim() || 'White'
      });

      setVNumber('');
      setMake('');
      setModel('');
      setColor('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (window.confirm('Remove vehicle from profile?')) {
      await vehicleService.deleteVehicle(vehicleId);
    }
  };

  if (loading) return <LoadingSpinner label="Loading Vehicles..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            My Registered Vehicles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered resident vehicles linked to security gate barrier system
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <Car className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No vehicles added yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Vehicle Now
            </button>
          </div>
        ) : (
          vehicles.map((v) => (
            <div
              key={v.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-lg border border-indigo-200 dark:border-indigo-800">
                    {v.vehicleType}
                  </span>
                  {v.id && (
                    <button
                      onClick={() => handleDelete(v.id!)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-black font-mono text-slate-900 dark:text-white">
                  {v.vehicleNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {v.make} {v.model} • {v.color}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Gate Auto-Pass Enabled
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register New Vehicle">
        <form onSubmit={handleAddVehicle} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Vehicle License Number
            </label>
            <input
              type="text"
              required
              value={vNumber}
              onChange={e => setVNumber(e.target.value)}
              placeholder="e.g. KA05MN2024"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Type
              </label>
              <select
                value={vType}
                onChange={e => setVType(e.target.value as VehicleType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="Car">Car</option>
                <option value="Bike">Bike / Two-Wheeler</option>
                <option value="SUV">SUV</option>
                <option value="EV">EV Electric</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Make / Manufacturer
              </label>
              <input
                type="text"
                value={make}
                onChange={e => setMake(e.target.value)}
                placeholder="Honda / Tesla"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Model
              </label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="Civic / Model 3"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="White / Black"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
            >
              {saving ? 'Saving...' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
