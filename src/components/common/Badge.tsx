import React from 'react';

type Variant = 
  | 'Available' | 'Occupied' | 'Reserved' | 'Maintenance'
  | 'Approved' | 'Pending' | 'Checked In' | 'Checked Out' | 'Cancelled' | 'Expired'
  | 'Resident' | 'Security' | 'Admin'
  | 'Low' | 'Medium' | 'High'
  | 'Open' | 'Under Review' | 'Resolved' | 'Dismissed'
  | 'Inside' | 'Exited'
  | 'info' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  status: Variant | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getStyles = (val: string): string => {
    switch (val) {
      case 'Available':
      case 'Approved':
      case 'Resolved':
      case 'success':
      case 'Exited':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      
      case 'Occupied':
      case 'Checked In':
      case 'High':
      case 'Open':
      case 'danger':
      case 'Inside':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';

      case 'Reserved':
      case 'Pending':
      case 'Under Review':
      case 'Medium':
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';

      case 'Maintenance':
      case 'Checked Out':
      case 'Cancelled':
      case 'Expired':
      case 'Dismissed':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

      case 'Resident':
      case 'info':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';

      case 'Security':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';

      case 'Admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';

      case 'Low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';

      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${getStyles(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
};
