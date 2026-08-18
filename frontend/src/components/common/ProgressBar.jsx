import React from 'react';
import { cn } from '../../utils/cn';

export const ProgressBar = ({ progress, className, label, showPercentage = true }) => {
  const percentage = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="mb-1 flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div 
          className="h-full bg-primary-600 transition-all duration-500 ease-out dark:bg-primary-500" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
