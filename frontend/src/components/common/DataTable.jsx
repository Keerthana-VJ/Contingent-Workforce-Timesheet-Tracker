import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const DataTable = ({ columns, data, keyField = 'id', className, onRowClick }) => {
  const items = Array.isArray(data)
    ? data
    : (Array.isArray(data?.content)
      ? data.content
      : (Array.isArray(data?.data?.content)
        ? data.data.content
        : (Array.isArray(data?.data)
          ? data.data
          : [])));

  if (!items || items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-slate-200 border-dashed dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">No data available.</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-auto rounded-md border border-slate-200 dark:border-slate-800", className)}>
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-3 font-medium tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {items.map((row, rowIdx) => (
            <tr 
              key={row[keyField] || rowIdx} 
              onClick={() => onRowClick && onRowClick(row)}
              className={cn(
                "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50", 
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((col, idx) => (
                <td key={idx} className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                  {col.cell ? col.cell(row) : (row[col.accessor] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Basic Pagination Footer Placeholder */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Showing {items.length} entries
        </span>
        <div className="flex items-center space-x-2">
          <button className="rounded-md border border-slate-300 dark:border-slate-700 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="rounded-md border border-slate-300 dark:border-slate-700 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

