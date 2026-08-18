import React, { useState, useEffect } from 'react';
import { getBillingReport } from '../../api/reportApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export const ReportsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState([]);

  // Mock additional data for the other charts
  const contractorHoursData = [
    { project: 'Frontend Revamp', hours: 320 },
    { project: 'Backend Migration', hours: 450 },
    { project: 'Mobile App', hours: 150 },
  ];

  const vendorPerformanceData = [
    { name: 'Acme Corp', score: 95 },
    { name: 'Global Tech', score: 88 },
    { name: 'DevSolutions', score: 92 },
  ];

  const invoiceStatusData = [
    { name: 'Paid', value: 45, color: '#10b981' },
    { name: 'Pending', value: 15, color: '#f59e0b' },
    { name: 'Rejected', value: 5, color: '#ef4444' },
  ];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const billing = await getBillingReport();
        const data = billing?.data || billing;
        if (Array.isArray(data)) {
          setBillingData(data);
        } else if (Array.isArray(data?.monthlyBilling)) {
          setBillingData(data.monthlyBilling.map(b => ({
            month: b.month || 'N/A',
            amount: Number(b.amount || 0)
          })));
        } else {
          setBillingData([
            { month: 'Jan', amount: 40000 },
            { month: 'Feb', amount: 30000 },
            { month: 'Mar', amount: 45000 },
            { month: 'Apr', amount: 50000 },
            { month: 'May', amount: 48000 },
            { month: 'Jun', amount: 60000 },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch billing report", error);
        setBillingData([
          { month: 'Jan', amount: 40000 },
          { month: 'Feb', amount: 30000 },
          { month: 'Mar', amount: 45000 },
          { month: 'Apr', amount: 50000 },
          { month: 'May', amount: 48000 },
          { month: 'Jun', amount: 60000 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reports Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Monthly Billing */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Monthly Billing</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={billingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contractor Hours by Project */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Contractor Hours by Project</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={contractorHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="project" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Performance */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Vendor Performance Score</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorPerformanceData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} className="text-xs" />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} className="text-xs" width={100} />
                <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="score" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Invoice Status Distribution</h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={invoiceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {invoiceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
