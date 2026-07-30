import React, { useEffect, useState } from 'react';
import { SquareParking, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { parkingService } from '../../services/parkingService';
import { ParkingSlot, SlotType, SlotStatus } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ManageSlots: React.FC = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [slotNumber, setSlotNumber] = useState('');
  const [building, setBuilding] = useState('Building A');
  const [floor, setFloor] = useState('1st Floor');
  const [type, setType] = useState<SlotType>('Resident');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = parkingService.listenToSlots((data) => {
      setSlots(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotNumber.trim()) return;

    setSaving(true);
    try {
      await parkingService.createSlot({
        slotId: `slot-${slotNumber.trim().toUpperCase()}`,
        slotNumber: slotNumber.trim().toUpperCase(),
        building: building.trim(),
        floor: floor.trim(),
        type,
        status: 'Available'
      });

      setSlotNumber('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (slotId: string, currentStatus: SlotStatus) => {
    const nextStatus: SlotStatus = currentStatus === 'Available' ? 'Occupied' : 'Available';
    await parkingService.updateSlotStatus(slotId, nextStatus);
  };

  if (loading) return <LoadingSpinner label="Loading Parking Slots from Firestore..." />;

  const columns: Column<ParkingSlot>[] = [
    {
      header: 'Slot Number',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
          {row.slotNumber}
        </span>
      )
    },
    {
      header: 'Building',
      accessor: 'building'
    },
    {
      header: 'Floor',
      accessor: 'floor'
    },
    {
      header: 'Slot Type',
      accessor: (row) => (
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
          {row.type}
        </span>
      )
    },
    {
      header: 'Current Status',
      accessor: (row) => <Badge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Parking Slot Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Realtime CRUD operations on property parking capacity
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Parking Slot
        </button>
      </div>

      <DataTable
        data={slots}
        columns={columns}
        searchPlaceholder="Search slots by number, building or type..."
        searchFilterKey={(row) => `${row.slotNumber} ${row.building} ${row.type}`}
        actions={(row) => (
          row.id ? (
            <button
              onClick={() => handleToggleStatus(row.id!, row.status)}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Toggle {row.status === 'Available' ? 'Occupied' : 'Available'}
            </button>
          ) : null
        )}
      />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Parking Slot">
        <form onSubmit={handleAddSlot} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Slot Code / Number
            </label>
            <input
              type="text"
              required
              value={slotNumber}
              onChange={e => setSlotNumber(e.target.value)}
              placeholder="e.g. Slot A-105"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Building Wing
              </label>
              <input
                type="text"
                value={building}
                onChange={e => setBuilding(e.target.value)}
                placeholder="Building A"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Floor
              </label>
              <input
                type="text"
                value={floor}
                onChange={e => setFloor(e.target.value)}
                placeholder="1st Floor"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as SlotType)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Resident">Resident Reserved</option>
              <option value="Visitor">Visitor Slot</option>
              <option value="EV Charging">EV Charging Station</option>
              <option value="Handicapped">Handicapped Accessible</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
            >
              {saving ? 'Creating...' : 'Create Slot'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
