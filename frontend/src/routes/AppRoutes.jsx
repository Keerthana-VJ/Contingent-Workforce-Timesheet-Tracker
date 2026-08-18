import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth
import { Login } from '../pages/auth/Login';

// Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { VendorsList } from '../pages/vendors/VendorsList';
import { ContractorsList } from '../pages/contractors/ContractorsList';
import { ProjectsList } from '../pages/projects/ProjectsList';
import { TimesheetsList } from '../pages/timesheets/TimesheetsList';
import { MilestonesList } from '../pages/milestones/MilestonesList';
import { InvoicesList } from '../pages/invoices/InvoicesList';
import { ApprovalsCenter } from '../pages/approvals/ApprovalsCenter';
import { ManagersList } from '../pages/admin/ManagersList';

import { VendorDashboard } from '../pages/vendor/VendorDashboard';
import { ContractorDashboard } from '../pages/contractor/ContractorDashboard';
import { ManagerDashboard } from '../pages/manager/ManagerDashboard';
import { ReportsDashboard } from '../pages/reports/ReportsDashboard';

import { NotificationsPage } from '../pages/notifications/NotificationsPage';

export const AppRoutes = () => {
  const { isAuthenticated, role } = useAuth();

  const getHomeRoute = () => {
    if (!isAuthenticated) return '/login';
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'VENDOR') return '/vendor/dashboard';
    if (role === 'CONTRACTOR') return '/contractor/dashboard';
    if (role === 'MANAGER') return '/manager/dashboard';
    return '/login';
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={getHomeRoute()} replace /> : <Login />
        } />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="vendors" element={<VendorsList />} />
          <Route path="contractors" element={<ContractorsList />} />
          <Route path="managers" element={<ManagersList />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="timesheets" element={<TimesheetsList />} />
          <Route path="milestones" element={<MilestonesList />} />
          <Route path="invoices" element={<InvoicesList />} />
          <Route path="approvals" element={<ApprovalsCenter />} />
          <Route path="reports" element={<ReportsDashboard />} />
        </Route>
      </Route>

      {/* Vendor Routes */}
      <Route path="/vendor" element={<ProtectedRoute allowedRoles={['VENDOR']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="contractors" element={<ContractorsList />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="timesheets" element={<TimesheetsList />} />
          <Route path="approvals" element={<ApprovalsCenter />} />
          <Route path="milestones" element={<MilestonesList />} />
          <Route path="invoices" element={<InvoicesList />} />
        </Route>
      </Route>

      {/* Common Notifications Route inside DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Contractor Routes */}
      <Route path="/contractor" element={<ProtectedRoute allowedRoles={['CONTRACTOR']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<ContractorDashboard />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="timesheets" element={<TimesheetsList />} />
          <Route path="milestones" element={<MilestonesList />} />
        </Route>
      </Route>

      {/* Manager Routes */}
      <Route path="/manager" element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="timesheets" element={<TimesheetsList />} />
          <Route path="milestones" element={<MilestonesList />} />
          <Route path="approvals" element={<ApprovalsCenter />} />
          <Route path="invoices" element={<InvoicesList />} />
          <Route path="reports" element={<ReportsDashboard />} />
        </Route>
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
