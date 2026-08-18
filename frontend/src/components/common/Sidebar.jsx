import React from 'react';
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
  Bell
} from 'lucide-react';
import { cn } from '../../utils/cn';

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
    ],
    VENDOR: [
      { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
      { name: 'My Contractors', href: '/vendor/contractors', icon: Users },
      { name: 'My Projects', href: '/vendor/projects', icon: Briefcase },
      { name: 'Milestones', href: '/vendor/milestones', icon: Flag },
      { name: 'Invoices', href: '/vendor/invoices', icon: FileText },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ],
    CONTRACTOR: [
      { name: 'Dashboard', href: '/contractor/dashboard', icon: LayoutDashboard },
      { name: 'My Projects', href: '/contractor/projects', icon: Briefcase },
      { name: 'My Timesheets', href: '/contractor/timesheets', icon: Clock },
      { name: 'My Milestones', href: '/contractor/milestones', icon: Flag },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ],
    MANAGER: [
      { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
      { name: 'My Projects', href: '/manager/projects', icon: Briefcase },
      { name: 'Timesheets', href: '/manager/timesheets', icon: Clock },
      { name: 'Milestones', href: '/manager/milestones', icon: Flag },
      { name: 'Invoices', href: '/manager/invoices', icon: FileText },
      { name: 'Approvals', href: '/manager/approvals', icon: CheckSquare },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ]
  };

  return routes[role] || [];
};

export const Sidebar = () => {
  const { role, user, logout } = useAuth();
  const navigation = getNavigationByRole(role);

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm shadow-sm">
            CW
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">WorkforceHub</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-semibold"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-400">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden text-left">
              <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'User'}</p>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400 capitalize">{role?.toLowerCase() || 'member'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out to Login"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
