import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Briefcase, Clock, FileText, CheckCircle, Flag } from 'lucide-react';

export const ContractorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Mock fetch for contractor dashboard metrics
    const fetchMetrics = async () => {
      setTimeout(() => {
        setMetrics({
          assignedProjects: 2,
          currentMonthHours: 85,
          pendingTimesheets: 1,
          approvedTimesheets: 12,
          upcomingMilestones: 1
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
          Contractor Dashboard
        </h1>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Assigned Projects" value={metrics.assignedProjects} icon={Briefcase} />
          <StatCard title="Current Month Hours" value={`${metrics.currentMonthHours} hrs`} icon={Clock} />
          <StatCard title="Pending Timesheets" value={metrics.pendingTimesheets} icon={FileText} />
          <StatCard title="Approved Timesheets" value={metrics.approvedTimesheets} icon={CheckCircle} />
          <StatCard title="Upcoming Milestones" value={metrics.upcomingMilestones} icon={Flag} />
        </div>
      )}
    </div>
  );
};
