import React, { useState, useEffect } from 'react';
import { getPendingApprovals, approveApprovalItem, rejectApprovalItem } from '../../api/approvalApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { CheckCircle, XCircle, Eye, Clock, AlertCircle, FileText, Calendar, DollarSign, User, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ApprovalsCenter = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');
  const { role } = useAuth();
  
  // Modal states
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchApprovalsList();
  }, []);

  const fetchApprovalsList = async () => {
    setLoading(true);
    try {
      const data = await getPendingApprovals();
      setApprovals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch approvals", error);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approval) => {
    setActionLoading(true);
    try {
      await approveApprovalItem(approval);
      setFeedbackType('success');
      setFeedbackMsg(`Successfully approved ${approval.type} (${approval.reference || approval.id})`);
      setTimeout(() => setFeedbackMsg(''), 3500);
      fetchApprovalsList();
    } catch (err) {
      console.error("Approval error", err);
      setFeedbackType('error');
      setFeedbackMsg(err.response?.data?.message || 'Failed to approve item');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const openViewModal = (approval) => {
    setSelectedApproval(approval);
    setIsViewModalOpen(true);
  };

  const openRejectModal = (approval) => {
    setSelectedApproval(approval);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || !selectedApproval) return;
    setActionLoading(true);
    try {
      await rejectApprovalItem(selectedApproval, rejectReason);
      setFeedbackType('success');
      setFeedbackMsg(`Rejected ${selectedApproval.type} (${selectedApproval.reference || selectedApproval.id}) with reason recorded.`);
      setTimeout(() => setFeedbackMsg(''), 3500);
      setIsRejectModalOpen(false);
      fetchApprovalsList();
    } catch (err) {
      console.error("Rejection error", err);
      setFeedbackType('error');
      setFeedbackMsg(err.response?.data?.message || 'Failed to reject item');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApprovals = activeTab === 'All' 
    ? approvals 
    : approvals.filter(a => a.type.toLowerCase() === activeTab.toLowerCase());

  const columns = [
    { 
      header: 'Type', 
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          row.type.toLowerCase() === 'timesheet' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' 
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
        }`}>
          {row.type}
        </span>
      )
    },
    { 
      header: 'Reference', 
      cell: (row) => (
        <span className="font-mono font-medium text-slate-900 dark:text-white text-xs">
          {row.reference}
        </span>
      )
    },
    { 
      header: 'Submitted By', 
      cell: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {row.submittedBy || 'Contractor / Agency'}
        </span>
      )
    },
    { 
      header: 'Project', 
      cell: (row) => (
        <span className="text-slate-600 dark:text-slate-300">
          {row.project || 'General Delivery'}
        </span>
      )
    },
    { 
      header: 'Amount / Hours', 
      cell: (row) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          {row.amountOrHours}
        </span>
      )
    },
    { 
      header: 'Submitted Date', 
      cell: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {row.date}
        </span>
      )
    },
    { 
      header: 'Status', 
      cell: (row) => <StatusBadge status={row.status || 'SUBMITTED'} /> 
    },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => openViewModal(row)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800 transition-colors" 
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button 
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 transition-colors" 
            title="Approve"
            onClick={() => handleApprove(row)}
            disabled={actionLoading}
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button 
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 transition-colors" 
            title="Reject"
            onClick={() => openRejectModal(row)}
            disabled={actionLoading}
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
      {feedbackMsg && (
        <div className={`flex items-center gap-2 rounded-lg p-4 text-sm font-medium border ${
          feedbackType === 'success' 
            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
            : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800'
        }`}>
          {feedbackType === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {feedbackMsg}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Approvals Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Review and sign-off pending timesheet logs and vendor invoices in one unified queue.
          </p>
        </div>
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 flex space-x-2">
          {[
            { key: 'All', label: 'All Items' },
            { key: 'Timesheet', label: 'Timesheets' },
            { key: 'Invoice', label: 'Invoices' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === tab.key 
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label} ({tab.key === 'All' ? approvals.length : approvals.filter(a => a.type.toLowerCase() === tab.key.toLowerCase()).length})
            </button>
          ))}
        </div>
        
        {filteredApprovals.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-3">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">All Caught Up!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              There are currently no pending approvals requiring your action.
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredApprovals} keyField="id" />
        )}
      </div>

      {/* View Item Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`${selectedApproval?.type || 'Item'} Approval Details`}
      >
        {selectedApproval && (
          <div className="space-y-4 py-2 text-sm">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedApproval.reference}
                  </h3>
                  <StatusBadge status={selectedApproval.status || 'SUBMITTED'} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Type: {selectedApproval.type}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><User className="h-3.5 w-3.5" /> Submitted By</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedApproval.submittedBy}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Briefcase className="h-3.5 w-3.5" /> Project</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedApproval.project}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><DollarSign className="h-3.5 w-3.5" /> Amount / Hours</span>
                <span className="font-bold text-primary-600 dark:text-primary-400 text-sm">{selectedApproval.amountOrHours}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Calendar className="h-3.5 w-3.5" /> Submitted Date</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedApproval.date}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button 
                variant="danger" 
                onClick={() => {
                  setIsViewModalOpen(false);
                  openRejectModal(selectedApproval);
                }}
              >
                Reject
              </Button>
              <Button 
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleApprove(selectedApproval);
                }}
              >
                Approve Now
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Submission"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Please enter your reason for rejecting {selectedApproval?.type?.toLowerCase()} <strong className="text-slate-900 dark:text-white">{selectedApproval?.reference}</strong>:
          </p>
          <FormInput
            label="Rejection Reason (Required)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Overlapping hours logged or unverified variance."
            required
          />
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} isLoading={actionLoading} disabled={!rejectReason.trim()}>
              Confirm Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
