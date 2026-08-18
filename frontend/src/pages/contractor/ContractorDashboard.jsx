import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getTimesheets } from '../../api/timesheetApi';
import { getMyProjects } from '../../api/projectApi';
import { getMilestones } from '../../api/milestoneApi';
import { Briefcase, Clock, FileText, CheckCircle, Flag, Plus, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ContractorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    assignedProjects: 0,
    currentMonthHours: 0,
    pendingTimesheets: 0,
    approvedTimesheets: 0,
    upcomingMilestones: 0
  });
  const [recentTimesheets, setRecentTimesheets] = useState([]);
  const navigate = useNavigate();

  const fetchLiveContractorData = async () => {
    try {
      const [timesheetsData, projectsData, milestonesData] = await Promise.all([
        getTimesheets(),
        getMyProjects(),
        getMilestones()
      ]);

      const tList = Array.isArray(timesheetsData) ? timesheetsData : (timesheetsData?.content || timesheetsData?.data?.content || timesheetsData?.data || []);
      const pList = Array.isArray(projectsData) ? projectsData : (projectsData?.content || projectsData?.data?.content || projectsData?.data || []);
      const mList = Array.isArray(milestonesData) ? milestonesData : (milestonesData?.content || milestonesData?.data?.content || milestonesData?.data || []);

      setRecentTimesheets(tList.slice(0, 5));

      const totalHours = tList.reduce((sum, t) => sum + (Number(t.totalHours) || 0), 0);
      const pendingCount = tList.filter(t => (t.status || '').toUpperCase() === 'SUBMITTED' || (t.status || '').toUpperCase() === 'REVIEW REQUIRED').length;
      const approvedCount = tList.filter(t => (t.status || '').toUpperCase() === 'APPROVED').length;
      const activeMs = mList.filter(m => (m.status || '').toUpperCase() === 'IN_PROGRESS' || (m.status || '').toUpperCase() === 'PENDING').length;

      setMetrics({
        assignedProjects: pList.length,
        currentMonthHours: totalHours,
        pendingTimesheets: pendingCount,
        approvedTimesheets: approvedCount,
        upcomingMilestones: activeMs
      });
    } catch (err) {
      console.error("Failed to fetch contractor live metrics", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveContractorData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLiveContractorData();
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Contractor Portal Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track your weekly sprint hours, submission approval statuses, and milestone deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            isLoading={refreshing}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={() => navigate('/contractor/timesheets')} 
            className="flex items-center gap-1.5 shadow-sm text-xs"
          >
            <Clock className="h-4 w-4" />
            Manage Timesheets
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Assigned Projects" value={metrics.assignedProjects} icon={Briefcase} />
        <StatCard title="Total Logged Hours" value={`${metrics.currentMonthHours} hrs`} icon={Clock} />
        <StatCard title="Pending Approvals" value={metrics.pendingTimesheets} icon={FileText} />
        <StatCard title="Approved Timesheets" value={metrics.approvedTimesheets} icon={CheckCircle} />
        <StatCard title="Upcoming Milestones" value={metrics.upcomingMilestones} icon={Flag} />
      </div>

      {/* Recent Timesheet Submissions */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Recent Timesheet Submissions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track approval status by project managers
            </p>
          </div>
          <button 
            onClick={() => navigate('/contractor/timesheets')}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
          >
            View all logs <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentTimesheets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No timesheets submitted yet. Click "Submit Timesheet" to log your sprint hours.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTimesheets.map(ts => (
              <div key={ts.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {ts.projectName || 'Enterprise Delivery'}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Work Date: {ts.workDate || ts.submittedDate || 'Recent'} • {ts.description || 'Sprint task development'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {ts.totalHours || ts.hours || 8} hrs
                  </span>
                  <StatusBadge status={ts.status || 'SUBMITTED'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
