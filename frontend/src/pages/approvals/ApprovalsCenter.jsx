import React, { useState, useEffect } from 'react';
import { getPendingApprovals } from '../../api/approvalApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

export const ApprovalsCenter = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  // Modal states
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const data = await getPendingApprovals();
      setApprovals(data);
    } catch (error) {
      console.error("Failed to fetch approvals", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (approval) => {
    // Call approve API
    console.log("Approving", approval);
    // Optimistic UI update for demo
    setApprovals(approvals.filter(a => a.id !== approval.id));
  };

  const openRejectModal = (approval) => {
    setSelectedApproval(approval);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = () => {
    if (!rejectReason) return;
    console.log("Rejecting", selectedApproval, "Reason:", rejectReason);
    // Call reject API
    // Optimistic UI update
    setApprovals(approvals.filter(a => a.id !== selectedApproval.id));
    setIsRejectModalOpen(false);
  };

  const filteredApprovals = activeTab === 'All' 
    ? approvals 
    : approvals.filter(a => a.type === activeTab);

  const columns = [
    { header: 'Type', accessor: 'type' },
    { header: 'Reference', accessor: 'reference' },
    { header: 'Submitted By', accessor: 'submittedBy' },
    { header: 'Project', accessor: 'project' },
    { header: 'Amount/Hours', accessor: 'amountOrHours' },
    { header: 'Submitted Date', accessor: 'date' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex space-x-2">
          <button className="text-slate-400 hover:text-primary-600 transition-colors" title="View Details">
            <Eye className="h-4 w-4" />
          </button>
          <button 
            className="text-slate-400 hover:text-emerald-600 transition-colors" 
            title="Approve"
            onClick={() => handleApprove(row)}
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button 
            className="text-slate-400 hover:text-red-600 transition-colors" 
            title="Reject"
            onClick={() => openRejectModal(row)}
          >
            <XCircle className="h-4 w-4" />
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
          Approvals Center
        </h1>
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 flex space-x-4">
          {['All', 'Timesheet', 'Invoice'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400' 
                  : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {tab}s
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={filteredApprovals} keyField="id" />
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Approval"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to reject {selectedApproval?.type.toLowerCase()} <strong>{selectedApproval?.reference}</strong>?
          </p>
          <FormInput
            label="Rejection Reason (Required)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejection"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} disabled={!rejectReason}>Confirm Reject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
