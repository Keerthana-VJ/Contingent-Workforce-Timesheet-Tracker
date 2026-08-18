import React, { useState, useEffect } from 'react';
import { getTimesheets } from '../../api/timesheetApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Plus, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TimesheetWizardModal } from '../../components/timesheets/TimesheetWizardModal';

export const TimesheetsList = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { role } = useAuth();

  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        const data = await getTimesheets();
        setTimesheets(data);
      } catch (error) {
        console.error("Failed to fetch timesheets", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimesheets();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await getTimesheets();
      setTimesheets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      header: 'Timesheet ID', 
      cell: (row) => (row.id ? (typeof row.id === 'string' && row.id.length > 8 ? row.id.substring(0, 8) : row.id) : '-')
    },
    { 
      header: 'Contractor', 
      cell: (row) => row.contractor?.user?.name || row.contractorName || row.contractor?.name || 'Contractor' 
    },
    { 
      header: 'Project', 
      cell: (row) => row.projectName || row.project?.projectName || 'Project' 
    },
    { 
      header: 'Date', 
      cell: (row) => row.workDate || row.date || row.submittedDate || '-' 
    },
    { 
      header: 'Hours', 
      cell: (row) => `${row.totalHours ?? 0} hrs` 
    },
    { 
      header: 'Status', 
      cell: (row) => <StatusBadge status={row.status || 'Draft'} /> 
    },

    {
      header: 'Risk',
      cell: (row) => {
        let reasons = '';
        if (row.riskReasons) {
          try {
            const parsed = JSON.parse(row.riskReasons);
            if (Array.isArray(parsed)) {
              reasons = parsed.map(r => r.message).join(' | ');
            }
          } catch (e) { }
        }
        return (
          <span title={reasons} className={`cursor-help px-2 py-1 text-xs font-semibold rounded-full border ${row.riskLevel === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
            row.riskLevel === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
              row.riskLevel === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
            {row.riskLevel || 'LOW'} {row.riskScore ? `(${row.riskScore})` : ''}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button className="text-slate-400 hover:text-primary-600 transition-colors" title="View Details">
            <Eye className="h-4 w-4" />
          </button>
          {(role === 'MANAGER' || role === 'ADMIN') && row.status === 'Submitted' && (
            <>
              <button className="text-slate-400 hover:text-emerald-600 transition-colors" title="Approve">
                <CheckCircle className="h-4 w-4" />
              </button>
              <button className="text-slate-400 hover:text-red-600 transition-colors" title="Reject">
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )
    },
  ];

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Timesheets
        </h1>
        {role === 'CONTRACTOR' && (
          <Button className="flex items-center" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Timesheet
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <DataTable columns={columns} data={timesheets} keyField="id" />
      </div>

      <TimesheetWizardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
};