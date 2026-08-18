import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Clock, Flag, FileText, IndianRupee } from 'lucide-react';
import { ApprovalsCenter } from '../approvals/ApprovalsCenter';

export const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Mock fetch for manager dashboard metrics
    const fetchMetrics = async () => {
      setTimeout(() => {
        setMetrics({
          pendingTimesheets: 12,
          pendingMilestones: 3,
          pendingInvoices: 4,
          totalPendingAmount: 85000
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
          Manager Dashboard
        </h1>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Pending Timesheets" value={metrics.pendingTimesheets} icon={Clock} />
          <StatCard title="Pending Milestones" value={metrics.pendingMilestones} icon={Flag} />
          <StatCard title="Pending Invoices" value={metrics.pendingInvoices} icon={FileText} />
          <StatCard title="Total Pending Amount" value={`$${metrics.totalPendingAmount.toLocaleString()}`} icon={IndianRupee} />
        </div>
      )}

      {/* Embed the approvals queue in the dashboard */}
      <div className="mt-8">
        <ApprovalsCenter />
      </div>
    </div>
  );
};
