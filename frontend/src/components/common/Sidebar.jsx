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
  const { role } = useAuth();
  const navigation = getNavigationByRole(role);

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-primary-600 dark:text-primary-400">Tracker</h1>
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
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
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
                        ? "text-primary-700 dark:text-primary-400"
                        : "text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400"
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
