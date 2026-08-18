import React, { useState, useEffect } from 'react';
import { getMilestones } from '../../api/milestoneApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Eye, Flag, Calendar, DollarSign, Briefcase, UserCheck } from 'lucide-react';

export const MilestonesList = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const data = await getMilestones();
        const list = Array.isArray(data) ? data : (data?.content || data?.data?.content || data?.data || []);
        setMilestones(list);
      } catch (error) {
        console.error("Failed to fetch milestones", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
  }, []);

  const openViewModal = (milestone) => {
    setSelectedMilestone(milestone);
    setIsViewModalOpen(true);
  };

  const filteredMilestones = milestones.filter(m => {
    const name = (m.milestoneName || m.name || '').toLowerCase();
    const proj = (m.projectName || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || proj.includes(query);
  });

  const columns = [
    { 
      header: 'Milestone Name', 
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-semibold text-xs shrink-0">
            <Flag className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block leading-tight">
              {row.milestoneName || row.name || 'Untitled Milestone'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {row.description ? row.description.substring(0, 45) + (row.description.length > 45 ? '...' : '') : (row.id ? String(row.id).substring(0, 8) : '')}
            </span>
          </div>
        </div>
      )
    },
    { 
      header: 'Project', 
      cell: (row) => (
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {row.projectName || row.project?.projectName || 'Project'}
        </span>
      )
    },
    { 
      header: 'Due Date', 
      cell: (row) => row.dueDate || '-' 
    },
    { 
      header: 'Billing Amount', 
      cell: (row) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          ${(Number(row.billingAmount) || 0).toLocaleString()}
        </span>
      ) 
    },
    { 
      header: 'Progress', 
      cell: (row) => <ProgressBar progress={row.completionPercentage || 0} className="w-28" /> 
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status || 'IN_PROGRESS'} /> },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => openViewModal(row)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ) 
    },
  ];

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Milestones
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track fixed-price project deliverables, completion percentage, and billing amounts.
          </p>
        </div>
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="relative w-full max-w-sm">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search milestones or project..." 
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" 
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filteredMilestones.length} milestone{filteredMilestones.length === 1 ? '' : 's'}
          </span>
        </div>
        <DataTable columns={columns} data={filteredMilestones} keyField="id" />
      </div>

      {/* View Milestone Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Milestone Details"
      >
        {selectedMilestone && (
          <div className="space-y-4 py-2 text-sm">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg">
                <Flag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedMilestone.milestoneName || selectedMilestone.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={selectedMilestone.status || 'IN_PROGRESS'} />
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {selectedMilestone.completionPercentage || 0}% Completed
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Briefcase className="h-3.5 w-3.5" /> Project</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedMilestone.projectName || 'General'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><DollarSign className="h-3.5 w-3.5" /> Billing Amount</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                  ${(Number(selectedMilestone.billingAmount) || 0).toLocaleString()}
                </span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Calendar className="h-3.5 w-3.5" /> Due Date</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedMilestone.dueDate || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><UserCheck className="h-3.5 w-3.5" /> Approved By</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  {selectedMilestone.approvedBy?.name || (selectedMilestone.status === 'COMPLETED' ? 'Manager Sign-off' : 'Pending')}
                </span>
              </div>
            </div>

            {selectedMilestone.description && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 text-xs space-y-1">
                <span className="text-slate-500 font-medium">Deliverable Scope & Criteria</span>
                <p className="text-slate-800 dark:text-slate-200">{selectedMilestone.description}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
