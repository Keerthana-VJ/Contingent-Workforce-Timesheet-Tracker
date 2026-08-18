import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export const SelectInput = React.forwardRef(({ label, options, error, className, id, ...props }, ref) => {
  const inputId = id || Math.random().toString(36).substr(2, 9);
  
  return (
    <div className={cn("flex flex-col space-y-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 pr-8 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-primary-400",
            error && "border-red-500 focus:ring-red-500"
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
});
SelectInput.displayName = "SelectInput";
