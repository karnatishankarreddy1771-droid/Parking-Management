import React, { useEffect, useState } from 'react';
import { History, Search } from 'lucide-react';
import { visitorLogService } from '../../services/visitorLogService';
import { VisitorLog } from '../../types';
import { Badge } from '../../components/common/Badge';
import { DataTable, Column } from '../../components/common/DataTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const VisitorLogs: React.FC = () => {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = visitorLogService.listenToVisitorLogs((data) => {
      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingSpinner label="Fetching visitor entry logs..." />;

  const columns: Column<VisitorLog>[] = [
    {
      header: 'Guest Name',
      accessor: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.guestName}
        </span>
      )
    },
    {
      header: 'Vehicle',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          {row.vehicleNumber}
        </span>
      )
    },
    {
      header: 'Flat',
      accessor: (row) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Flat {row.flatNumber || 'A-101'}
        </span>
      )
    },
    {
      header: 'Entry Time',
      accessor: (row) => (
        <span className="text-slate-600 dark:text-slate-400 text-xs">
          {new Date(row.entryTime).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Exit Time',
      accessor: (row) => (
        <span className="text-slate-600 dark:text-slate-400 text-xs">
          {row.exitTime ? new Date(row.exitTime).toLocaleString() : '— Still On-Premise'}
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
          Visitor Entry & Exit Audit Logs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical log of all guest arrivals and departures recorded by security gate guards
        </p>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        searchPlaceholder="Search logs by guest, vehicle or flat..."
        searchFilterKey={(row) => `${row.guestName} ${row.vehicleNumber} ${row.flatNumber}`}
      />
    </div>
  );
};
