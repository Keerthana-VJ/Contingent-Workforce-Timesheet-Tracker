import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Clock, 
  Flag, 
  FileText, 
  CheckSquare, 
  BarChart3,
  Building2,
  Bell,
  ChevronRight,
  Pin,
  PinOff,
  LogOut
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Logo } from './Logo';

const getNavigationByRole = (role) => {
  const routes = {
    ADMIN: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Vendors', href: '/admin/vendors', icon: Building2 },
      { name: 'Contractors', href: '/admin/contractors', icon: Users },
      { name: 'Projects', href: '/admin/projects', icon: Briefcase },
      { name: 'Timesheets', href: '/admin/timesheets', icon: Clock },
      { name: 'Milestones', href: '/admin/milestones', icon: Flag },
      { name: 'Invoices', href: '/admin/invoices', icon: FileText },
      { name: 'Approvals', href: '/admin/approvals', icon: CheckSquare },
      { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ],
    VENDOR: [
      { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
      { name: 'Contractors', href: '/vendor/contractors', icon: Users },
      { name: 'Projects', href: '/vendor/projects', icon: Briefcase },
      { name: 'Milestones', href: '/vendor/milestones', icon: Flag },
      { name: 'Invoices', href: '/vendor/invoices', icon: FileText },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ],
    CONTRACTOR: [
      { name: 'Dashboard', href: '/contractor/dashboard', icon: LayoutDashboard },
      { name: 'Projects', href: '/contractor/projects', icon: Briefcase },
      { name: 'Timesheets', href: '/contractor/timesheets', icon: Clock },
      { name: 'Milestones', href: '/contractor/milestones', icon: Flag },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ],
    MANAGER: [
      { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
      { name: 'Projects', href: '/manager/projects', icon: Briefcase },
      { name: 'Timesheets', href: '/manager/timesheets', icon: Clock },
      { name: 'Milestones', href: '/manager/milestones', icon: Flag },
      { name: 'Invoices', href: '/manager/invoices', icon: FileText },
      { name: 'Approvals', href: '/manager/approvals', icon: CheckSquare },
      { name: 'Reports', href: '/manager/reports', icon: BarChart3 },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ]
  };

  return routes[role] || [];
};

export const Sidebar = () => {
  const { role, user, logout } = useAuth();
  const navigation = getNavigationByRole(role);

  // Hover expand / collapse state
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('sidebar_pinned') === 'true';
  });

  const isExpanded = isPinned || isHovered;

  const togglePin = () => {
    setIsPinned(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_pinned', String(next));
      return next;
    });
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 ease-in-out relative z-40 select-none shadow-sm",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      {/* Top Header Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Logo size="md" collapsed={!isExpanded} />
        </div>

        {isExpanded && (
          <button
            onClick={togglePin}
            title={isPinned ? "Unpin sidebar (auto-collapse on mouse leave)" : "Pin sidebar open"}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2">
        {navigation.map((item, index) => {
          const Icon = item.icon;
          // Add visual divider before Notifications or Reports
          const isDivider = item.name === 'Reports' || (item.name === 'Notifications' && role !== 'ADMIN');

          return (
            <React.Fragment key={item.name}>
              {isDivider && (
                <div className="my-2 border-t border-slate-100 dark:border-slate-800/80 mx-2" />
              )}

              <NavLink
                to={item.href}
                title={!isExpanded ? item.name : undefined}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-150 relative",
                    isExpanded ? "px-3" : "justify-center px-0",
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300",
                        isExpanded ? "mr-3" : "mr-0"
                      )}
                    />

                    {isExpanded && (
                      <span className="truncate whitespace-nowrap text-xs font-semibold animate-in fade-in duration-150">
                        {item.name}
                      </span>
                    )}

                    {/* Active side indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary-600 dark:bg-primary-400" />
                    )}
                  </>
                )}
              </NavLink>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer User Info & Logout */}
      <div className="border-t border-slate-200 p-2.5 dark:border-slate-800 shrink-0">
        <div className={cn("flex items-center", isExpanded ? "justify-between" : "justify-center")}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-400 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {isExpanded && (
              <div className="overflow-hidden text-left whitespace-nowrap animate-in fade-in duration-200">
                <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name || 'User'}</p>
                <p className="truncate text-[10px] font-medium text-slate-400 capitalize">{role?.toLowerCase() || 'member'}</p>
              </div>
            )}
          </div>

          {isExpanded && (
            <button
              onClick={logout}
              title="Sign Out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
