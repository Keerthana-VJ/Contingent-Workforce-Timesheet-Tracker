import React from 'react';
import { cn } from '../../utils/cn';

export const StatCard = ({ title, value, icon: Icon, trend, trendValue, className }) => {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
            <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
        )}
      </div>
      {(trend || trendValue) && (
        <div className="mt-4 flex items-center text-sm">
          {trend === 'up' && <span className="text-emerald-600 dark:text-emerald-400 font-medium mr-2">↑ {trendValue}</span>}
          {trend === 'down' && <span className="text-red-600 dark:text-red-400 font-medium mr-2">↓ {trendValue}</span>}
          <span className="text-slate-500 dark:text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};
