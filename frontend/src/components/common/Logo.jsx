import React from 'react';
import { cn } from '../../utils/cn';

export const Logo = ({ size = 'md', collapsed = false, className = '' }) => {
  const iconSizeClasses = {
    sm: 'h-7 w-7 rounded-lg text-xs',
    md: 'h-9 w-9 rounded-xl text-sm',
    lg: 'h-13 w-13 rounded-2xl text-xl'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl'
  };

  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      {/* Blue Square with Bold CW */}
      <div 
        className={cn(
          "flex shrink-0 items-center justify-center font-extrabold tracking-tight text-white bg-blue-600 shadow-sm shadow-blue-500/20",
          iconSizeClasses[size] || iconSizeClasses.md
        )}
      >
        CW
      </div>

      {/* Brand Text */}
      {!collapsed && (
        <span 
          className={cn(
            "font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap",
            textSizeClasses[size] || textSizeClasses.md
          )}
        >
          WorkforceHub
        </span>
      )}
    </div>
  );
};
