import React, { useState, useEffect } from 'react';
import { getDashboardMetrics, getBillingReport } from '../../api/reportApi';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Users, Building2, Briefcase, Clock, FileText, IndianRupee } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, billing] = await Promise.all([
          getDashboardMetrics(),
          getBillingReport()
        ]);
        setMetrics(metricsData);
        setBillingData(billing);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>
        <div className="flex space-x-3">
          {/* Quick Actions */}
          <button className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700">
            Add Vendor
          </button>
          <button className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
            Create Project
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Vendors" value={metrics.totalVendors} icon={Building2} trend="up" trendValue="2" />
          <StatCard title="Total Contractors" value={metrics.totalContractors} icon={Users} trend="up" trendValue="15" />
          <StatCard title="Active Projects" value={metrics.activeProjects} icon={Briefcase} />
          <StatCard title="Pending Timesheets" value={metrics.pendingTimesheets} icon={Clock} />
          <StatCard title="Pending Invoices" value={metrics.pendingInvoices} icon={FileText} />
          <StatCard title="Total Billing" value={`$${metrics.totalBilling.toLocaleString()}`} icon={IndianRupee} />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Monthly Billing</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={billingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
          <div className="space-y-4">
            {/* Mock Activity List */}
            {[
              { id: 1, text: 'Timesheet TS-1023 was approved by Jane Smith', time: '2 hours ago' },
              { id: 2, text: 'New contractor John Doe added by Acme Corp', time: '5 hours ago' },
              { id: 3, text: 'Invoice INV-2025-002 submitted by Global Tech', time: '1 day ago' },
              { id: 4, text: 'Milestone "Phase 1 Delivery" completed', time: '2 days ago' },
            ].map((activity) => (
              <div key={activity.id} className="flex space-x-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                </div>
                <div className="flex flex-col">
                  <span>{activity.text}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
