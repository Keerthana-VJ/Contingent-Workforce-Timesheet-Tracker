import React, { useState, useEffect } from 'react';
import { getMilestones } from '../../api/milestoneApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Eye, Edit } from 'lucide-react';

export const MilestonesList = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const data = await getMilestones();
        setMilestones(data);
      } catch (error) {
        console.error("Failed to fetch milestones", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
  }, []);

  const columns = [
    { header: 'Milestone Name', accessor: 'name' },
    { header: 'Project', accessor: 'projectName' },
    { header: 'Due Date', accessor: 'dueDate' },
    { header: 'Amount', cell: (row) => `$${row.billingAmount.toLocaleString()}` },
    { header: 'Progress', cell: (row) => <ProgressBar progress={row.completionPercentage} className="w-32" /> },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex space-x-2">
          <button className="text-slate-400 hover:text-primary-600 transition-colors">
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-slate-400 hover:text-blue-600 transition-colors">
            <Edit className="h-4 w-4" />
          </button>
        </div>
      ) 
    },
  ];

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Milestones
        </h1>
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <DataTable columns={columns} data={milestones} keyField="id" />
      </div>
    </div>
  );
};
