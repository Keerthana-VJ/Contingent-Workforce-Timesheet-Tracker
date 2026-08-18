import React from 'react';
import { cn } from '../../utils/cn';

export const EmptyState = ({ title, description, icon: Icon, action, className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
