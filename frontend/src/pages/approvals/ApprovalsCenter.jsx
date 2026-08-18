import React, { useState, useEffect } from 'react';
import { getAllApprovals, approveApprovalItem, rejectApprovalItem } from '../../api/approvalApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  AlertCircle, 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Briefcase, 
  History, 
  CheckCheck, 
  Clock,
  ShieldCheck,
  Building2,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ApprovalsCenter = () => {
  const { role } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('PENDING'); // PENDING | APPROVED | REJECTED | ALL
  
  // Default type filter based on role: Vendors approve Timesheets; Managers approve Invoices
  const [typeFilter, setTypeFilter] = useState(() => {
    if (role === 'VENDOR') return 'Timesheet';
    if (role === 'MANAGER') return 'Invoice';
    return 'ALL';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');
  
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
      const data = await getAllApprovals();
      setApprovals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch approvals", error);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const canApproveItem = (item) => {
    if (!item || item.status !== 'PENDING') return false;
    if (role === 'ADMIN') return true;
    if (role === 'VENDOR' && item.type.toLowerCase() === 'timesheet') return true;
    if (role === 'MANAGER' && item.type.toLowerCase() === 'invoice') return true;
    return false;
  };

  const handleApprove = async (approval) => {
    setActionLoading(true);
    try {
      await approveApprovalItem(approval);
      setFeedbackType('success');
      setFeedbackMsg(`Successfully approved ${approval.type} (${approval.reference || approval.id}). Moved to Approved history.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
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
      setFeedbackMsg(`Rejected ${selectedApproval.type} (${selectedApproval.reference || selectedApproval.id}). Moved to Rejected history.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
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

  // Filter based on active role relevance
  const roleFilteredApprovals = approvals.filter(a => {
    if (role === 'VENDOR') return a.type.toLowerCase() === 'timesheet';
    if (role === 'MANAGER') return a.type.toLowerCase() === 'invoice';
    return true;
  });

  // Counts for status tabs
  const pendingCount = roleFilteredApprovals.filter(a => a.status === 'PENDING').length;
  const approvedCount = roleFilteredApprovals.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = roleFilteredApprovals.filter(a => a.status === 'REJECTED').length;

  const filteredApprovals = roleFilteredApprovals.filter(a => {
    // Status filter
    if (statusTab !== 'ALL' && a.status !== statusTab) {
      return false;
    }
    // Type filter (for Admin who can toggle ALL | Timesheet | Invoice)
    if (typeFilter !== 'ALL' && a.type.toLowerCase() !== typeFilter.toLowerCase()) {
      return false;
    }
    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const ref = (a.reference || '').toLowerCase();
      const submitter = (a.submittedBy || '').toLowerCase();
      const proj = (a.project || '').toLowerCase();
      return ref.includes(q) || submitter.includes(q) || proj.includes(q);
    }
    return true;
  });

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
      header: 'Reference #', 
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
      cell: (row) => <StatusBadge status={row.rawStatus || row.status} /> 
    },
    { 
      header: 'Actions', 
      cell: (row) => {
        const canAction = canApproveItem(row);
        return (
          <div className="flex items-center space-x-1.5">
            <button 
              onClick={() => openViewModal(row)}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800 transition-colors" 
              title="View Submission Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            {canAction && (
              <>
                <button 
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 transition-colors" 
                  title={`Approve ${row.type}`}
                  onClick={() => handleApprove(row)}
                  disabled={actionLoading}
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button 
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 transition-colors" 
                  title={`Reject ${row.type}`}
                  onClick={() => openRejectModal(row)}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        );
      } 
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

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {role === 'VENDOR' ? 'Contractor Timesheets Approvals' : (role === 'MANAGER' ? 'Vendor Invoices Approvals' : 'Approvals Center')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {role === 'VENDOR' 
              ? 'Review and sign off timesheets submitted by your contracted talent before compiling invoices.' 
              : (role === 'MANAGER' 
                  ? 'Inspect and authorize vendor-submitted invoices verified against delivered milestones and sprint hours.' 
                  : 'Enterprise authorization hub for timesheets and vendor invoice payouts.')}
          </p>
        </div>
      </div>

      {/* Two-Tier Governance Role Guide */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-0.5">Two-Tier Governance Approval Workflow:</strong>
          <span>
            1. <strong>Vendors approve Contractor Timesheets</strong> $\rightarrow$ Talent submits timesheets which are verified by their partner Vendor Agency.<br/>
            2. <strong>Managers approve Vendor Invoices</strong> $\rightarrow$ Vendor aggregates approved deliverables into an invoice submitted to the Enterprise Manager.
          </span>
        </div>
      </div>

      {/* Main Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { key: 'PENDING', label: 'Pending Review', count: pendingCount, icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
          { key: 'APPROVED', label: 'Approved History', count: approvedCount, icon: CheckCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
          { key: 'REJECTED', label: 'Rejected History', count: rejectedCount, icon: XCircle, color: 'text-red-600 bg-red-50 dark:bg-red-950/40' },
          { key: 'ALL', label: 'All Records', count: roleFilteredApprovals.length, icon: History, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                statusTab === tab.key
                  ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-500'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${statusTab === tab.key ? 'bg-primary-700 text-white' : tab.color}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3.5 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          {/* Sub-Filter by Item Type (Admin only or role toggle) */}
          {role === 'ADMIN' ? (
            <div className="flex space-x-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg">
              {['ALL', 'Timesheet', 'Invoice'].map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    typeFilter === type
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {type === 'ALL' ? 'All Types' : `${type}s`}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {role === 'VENDOR' ? (
                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                  <User className="h-3.5 w-3.5" />
                  Contractor Timesheets Queue
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <FileText className="h-3.5 w-3.5" />
                  Vendor Invoices Queue
                </span>
              )}
            </div>
          )}

          <div className="relative w-full max-w-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference, submitter, project..."
              className="h-8.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
        
        {filteredApprovals.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-3">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {statusTab === 'PENDING' ? 'All caught up! No pending items requiring your sign-off.' : 'No records found in this view.'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {statusTab === 'PENDING' 
                ? 'Check the Approved or Rejected History tabs to review previously processed items.' 
                : 'Approved and rejected items will automatically appear here.'}
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
                  <StatusBadge status={selectedApproval.rawStatus || selectedApproval.status} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Type: {selectedApproval.type} • Status: {selectedApproval.status}
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

            {selectedApproval.rejectionReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs text-red-700 dark:text-red-300 space-y-1">
                <span className="font-bold block">Rejection Feedback & Reason:</span>
                <p className="leading-relaxed">{selectedApproval.rejectionReason}</p>
              </div>
            )}

            {selectedApproval.status === 'APPROVED' && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Verified and approved.</span>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              {canApproveItem(selectedApproval) && (
                <>
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
                </>
              )}
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
