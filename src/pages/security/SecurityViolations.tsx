import React, { useEffect, useState } from 'react';
import { AlertTriangle, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { violationService } from '../../services/violationService';
import { Violation, ViolationType, ViolationSeverity } from '../../types';
import { Modal } from '../../components/common/Modal';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const SecurityViolations: React.FC = () => {
  const { userProfile } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [vPlate, setVPlate] = useState('');
  const [slotNum, setSlotNum] = useState('');
  const [vType, setVType] = useState<ViolationType>('Unauthorized Parking');
  const [severity, setSeverity] = useState<ViolationSeverity>('Medium');
  const [description, setDescription] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    const unsubscribe = violationService.listenToViolations((data) => {
      setViolations(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vPlate.trim() || !userProfile?.uid) return;

    setReporting(true);
    try {
      await violationService.reportViolation({
        vehicleNumber: vPlate.trim().toUpperCase(),
        slotNumber: slotNum.trim() || 'A-101',
        type: vType,
        severity,
        description: description.trim() || 'Vehicle parked in unassigned resident slot without pass.',
        reportedBy: userProfile.uid,
        status: 'Open'
      });

      setVPlate('');
      setSlotNum('');
      setDescription('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setReporting(false);
    }
  };

  const handleResolve = async (vId: string) => {
    if (window.confirm('Mark this violation as resolved?')) {
      await violationService.resolveViolation(vId);
    }
  };

  if (loading) return <LoadingSpinner label="Loading violations..." />;

  const columns: Column<Violation>[] = [
    {
      header: 'Vehicle Plate',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          {row.vehicleNumber}
        </span>
      )
    },
    {
      header: 'Location / Slot',
      accessor: (row) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Slot {row.slotNumber}
        </span>
      )
    },
    {
      header: 'Violation Type',
      accessor: (row) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {row.type}
        </span>
      )
    },
    {
      header: 'Severity',
      accessor: (row) => <Badge status={row.severity} />
    },
    {
      header: 'Reported At',
      accessor: (row) => (
        <span className="text-[11px] text-slate-500">
          {new Date(row.reportedAt).toLocaleString()}
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
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Parking Violations Register
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Log and manage unauthorized parking, overstays, or driveway blockages
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
        >
          <AlertTriangle className="w-4 h-4" /> Report Violation
        </button>
      </div>

      <DataTable
        data={violations}
        columns={columns}
        searchPlaceholder="Search vehicle, slot, or violation type..."
        searchFilterKey={(row) => `${row.vehicleNumber} ${row.slotNumber} ${row.type}`}
        actions={(row) => (
          row.status === 'Open' && row.id ? (
            <button
              onClick={() => handleResolve(row.id!)}
              className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              Resolve
            </button>
          ) : null
        )}
      />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Report Parking Violation">
        <form onSubmit={handleCreateViolation} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Offending Vehicle License Plate
            </label>
            <input
              type="text"
              required
              value={vPlate}
              onChange={e => setVPlate(e.target.value)}
              placeholder="e.g. KA05MN2024"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono uppercase text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Violation Category
              </label>
              <select
                value={vType}
                onChange={e => setVType(e.target.value as ViolationType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Unauthorized Parking">Unauthorized Parking</option>
                <option value="Overstay">Pass Overstay</option>
                <option value="Blocked Driveway">Blocked Driveway</option>
                <option value="Improper Parking">Improper Parking</option>
                <option value="No Pass">No Pass Displayed</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as ViolationSeverity)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Tow Warning)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Parking Slot / Location
            </label>
            <input
              type="text"
              value={slotNum}
              onChange={e => setSlotNum(e.target.value)}
              placeholder="e.g. Slot A-104 or Building Gate 2"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Violation Notes / Details
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide details about the infraction..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
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
              disabled={reporting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl"
            >
              {reporting ? 'Reporting...' : 'Submit Violation Report'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
