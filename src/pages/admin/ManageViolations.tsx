import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { violationService } from '../../services/violationService';
import { Violation } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ManageViolations: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = violationService.listenToViolations((data) => {
      setViolations(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleResolve = async (vId: string) => {
    if (window.confirm('Mark this violation as resolved?')) {
      await violationService.resolveViolation(vId);
    }
  };

  if (loading) return <LoadingSpinner label="Loading violations log..." />;

  const columns: Column<Violation>[] = [
    {
      header: 'Vehicle Number',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          {row.vehicleNumber}
        </span>
      )
    },
    {
      header: 'Location / Slot',
      accessor: 'slotNumber'
    },
    {
      header: 'Type',
      accessor: (row) => row.type || 'Unauthorized Parking'
    },
    {
      header: 'Severity',
      accessor: (row) => <Badge status={row.severity} />
    },
    {
      header: 'Details',
      accessor: (row) => (
        <span className="text-slate-500 text-xs truncate max-w-xs block">
          {row.description}
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
          Admin Violation Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, track fines, and resolve reported parking infractions across property
        </p>
      </div>

      <DataTable
        data={violations}
        columns={columns}
        searchPlaceholder="Search violations by vehicle, slot, type..."
        searchFilterKey={(row) => `${row.vehicleNumber} ${row.slotNumber} ${row.type}`}
        actions={(row) => (
          row.status === 'Open' && row.id ? (
            <button
              onClick={() => handleResolve(row.id!)}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-500 transition-colors"
            >
              Resolve
            </button>
          ) : null
        )}
      />
    </div>
  );
};
