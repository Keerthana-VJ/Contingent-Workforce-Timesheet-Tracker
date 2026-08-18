import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Users, Briefcase, Clock, FileText, IndianRupee, Flag } from 'lucide-react';

export const VendorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Mock fetch for vendor dashboard metrics
    const fetchMetrics = async () => {
      // In a real app, this would be an API call to a vendor-specific endpoint
      setTimeout(() => {
        setMetrics({
          myContractors: 12,
          myProjects: 3,
          pendingTimesheets: 5,
          completedMilestones: 2,
          pendingInvoices: 1,
          totalBilling: 125000
        });
        setLoading(false);
      }, 500);
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Vendor Dashboard
        </h1>
        <div className="flex space-x-3">
          <button className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
            Create Invoice
          </button>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="My Contractors" value={metrics.myContractors} icon={Users} />
          <StatCard title="My Projects" value={metrics.myProjects} icon={Briefcase} />
          <StatCard title="Pending Timesheets" value={metrics.pendingTimesheets} icon={Clock} />
          <StatCard title="Completed Milestones" value={metrics.completedMilestones} icon={Flag} />
          <StatCard title="Pending Invoices" value={metrics.pendingInvoices} icon={FileText} />
          <StatCard title="Total Billing" value={`$${metrics.totalBilling.toLocaleString()}`} icon={IndianRupee} />
        </div>
      )}
    </div>
  );
};
