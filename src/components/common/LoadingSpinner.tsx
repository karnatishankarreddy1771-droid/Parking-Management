import React from 'react';

export const LoadingSpinner: React.FC<{ label?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  label = 'Loading Parking\'s...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-9 h-9 border-3',
    lg: 'w-14 h-14 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-slate-600 dark:text-slate-300">
      <div
        className={`${sizeClasses[size]} border-indigo-600 border-t-transparent rounded-full animate-spin dark:border-indigo-400 dark:border-t-transparent`}
      />
      {label && <p className="mt-3 text-sm font-medium animate-pulse">{label}</p>}
    </div>
  );
};
