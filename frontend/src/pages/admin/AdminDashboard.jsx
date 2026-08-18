import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardMetrics } from '../../api/reportApi';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Users, Building2, Briefcase, Clock, FileText, IndianRupee, Plus, ArrowUpRight, Activity, Calendar } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [billingData, setBillingData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const metricsData = await getDashboardMetrics();
        const data = metricsData?.data || metricsData || {};
        setMetrics(data);

        // Parse monthly billing
        if (Array.isArray(data.monthlyBilling)) {
          setBillingData(data.monthlyBilling.map(b => ({
            month: b.month || 'N/A',
            amount: Number(b.amount || 0),
            hours: Number(b.hours || 0)
          })));
        } else {
          setBillingData([]);
        }

        // Parse recent activities
        if (Array.isArray(data.recentActivities)) {
          setActivities(data.recentActivities);
        } else {
          setActivities([]);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setMetrics({
          totalVendors: 0,
          totalContractors: 0,
          activeProjects: 0,
          pendingTimesheets: 0,
          pendingInvoices: 0,
          totalBilling: 0
        });
        setBillingData([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" className="mt-20" />;
  }

  const totalBillingFormatted = typeof metrics?.totalBilling === 'number' 
    ? metrics.totalBilling.toLocaleString()
    : (Number(metrics?.totalBilling) || 0).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview of contingent workforce operations, active contracts, and spend analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/vendors')}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700 transition-colors"
          >
            <Building2 className="h-4 w-4 text-slate-500" />
            Manage Vendors
          </button>
          <button 
            onClick={() => navigate('/admin/projects')}
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
          >
            <Briefcase className="h-4 w-4" />
            Manage Projects
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Vendors" 
          value={metrics?.totalVendors ?? 0} 
          icon={Building2} 
          trend="up" 
          trendValue="Active" 
        />
        <StatCard 
          title="Total Contractors" 
          value={metrics?.totalContractors ?? 0} 
          icon={Users} 
          trend="up" 
          trendValue="Assigned" 
        />
        <StatCard 
          title="Active Projects" 
          value={metrics?.activeProjects ?? 0} 
          icon={Briefcase} 
        />
        <StatCard 
          title="Pending Timesheets" 
          value={metrics?.pendingTimesheets ?? 0} 
          icon={Clock} 
        />
        <StatCard 
          title="Pending Invoices" 
          value={metrics?.pendingInvoices ?? 0} 
          icon={FileText} 
        />
        <StatCard 
          title="Total Billed" 
          value={`$${totalBillingFormatted}`} 
          icon={IndianRupee} 
        />
      </div>

      {/* Charts & Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Billing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Spend Overview</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total invoice billing by period</p>
            </div>
            <button 
              onClick={() => navigate('/admin/reports')}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
            >
              Full Report <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={billingData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs text-slate-500" />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  className="text-xs text-slate-500" 
                  tickFormatter={(val) => val >= 1000 ? `$${Math.round(val / 1000)}k` : `$${val}`} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }} 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '10px', 
                    border: 'none', 
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Billed']}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary-500" />
                Recent Approvals & Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live operational events from workflow audit log</p>
            </div>
            <button 
              onClick={() => navigate('/admin/approvals')}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
            >
              Approvals Center <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800">
            {activities.slice(0, 5).map((activity, idx) => (
              <div key={activity.id || idx} className={`flex items-start gap-3 text-sm ${idx > 0 ? 'pt-3' : ''}`}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 mt-0.5">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                      {activity.title || activity.text}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 ml-2">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (activity.time || 'recently')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {activity.description || activity.text}
                  </p>
                  {activity.actorName && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      By {activity.actorName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

