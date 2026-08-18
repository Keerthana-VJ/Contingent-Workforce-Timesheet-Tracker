import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { getTimesheets, approveTimesheet, rejectTimesheet } from '../../api/timesheetApi';
import { getInvoices, approveInvoice, rejectInvoice } from '../../api/invoiceApi';
import { getMilestones } from '../../api/milestoneApi';
import { getProjects } from '../../api/projectApi';
import { 
  Clock, 
  Flag, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Eye, 
  RefreshCw, 
  Info, 
  AlertCircle
} from 'lucide-react';

export const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    pendingTimesheets: 0,
    pendingInvoices: 0,
    pendingMilestones: 0,
    totalPendingAmount: 0,
    activeProjects: 0
  });
  const [pendingQueue, setPendingQueue] = useState([]);

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: 'success' });

  const fetchLiveManagerData = async () => {
    try {
      const [timesheetsData, invoicesData, milestonesData, projectsData] = await Promise.all([
        getTimesheets(),
        getInvoices(),
        getMilestones(),
        getProjects()
      ]);

      const tsList = Array.isArray(timesheetsData) ? timesheetsData : (timesheetsData?.content || timesheetsData?.data?.content || timesheetsData?.data || []);
      const invList = Array.isArray(invoicesData) ? invoicesData : (invoicesData?.content || invoicesData?.data?.content || invoicesData?.data || []);
      const msList = Array.isArray(milestonesData) ? milestonesData : (milestonesData?.content || milestonesData?.data?.content || milestonesData?.data || []);
      const projList = Array.isArray(projectsData) ? projectsData : (projectsData?.content || projectsData?.data?.content || projectsData?.data || []);

      // Calculate Pending
      const pendingTs = tsList.filter(t => (t.status || '').toUpperCase() === 'SUBMITTED' || (t.status || '').toUpperCase() === 'REVIEW REQUIRED');
      const pendingInv = invList.filter(i => (i.status || '').toUpperCase() === 'UNDER_REVIEW' || (i.status || '').toUpperCase() === 'SUBMITTED');
      const pendingMs = msList.filter(m => (m.status || '').toUpperCase() === 'IN_PROGRESS' || (m.status || '').toUpperCase() === 'PENDING');

      // Total pending dollar value
      const invPendingSum = pendingInv.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
      const tsPendingEstSum = pendingTs.reduce((sum, t) => sum + ((Number(t.totalHours) || 0) * (Number(t.contractor?.hourlyRate) || 65)), 0);

      setMetrics({
        pendingTimesheets: pendingTs.length,
        pendingInvoices: pendingInv.length,
        pendingMilestones: pendingMs.length,
        totalPendingAmount: invPendingSum + tsPendingEstSum,
        activeProjects: projList.filter(p => (p.status || '').toUpperCase() === 'ACTIVE').length
      });

      // Construct Unified Pending Action Queue
      const queue = [
        ...pendingTs.map(t => ({
          id: t.id,
          type: 'Timesheet',
          reference: `TS-${String(t.id).substring(0, 8).toUpperCase()}`,
          submitter: t.contractor?.user?.name || t.contractorName || 'Contractor',
          project: t.projectName || t.project?.projectName || 'Project',
          amountOrHours: `${t.totalHours || 0} hrs`,
          date: t.submittedDate || t.workDate || (t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Today'),
          raw: t
        })),
        ...pendingInv.map(i => ({
          id: i.id,
          type: 'Invoice',
          reference: i.invoiceNumber || `INV-${String(i.id).substring(0, 8).toUpperCase()}`,
          submitter: i.vendor?.vendorName || i.vendorName || 'Vendor',
          project: i.projectName || i.project?.projectName || 'Project',
          amountOrHours: `$${(Number(i.totalAmount) || 0).toLocaleString()}`,
          date: i.submittedDate || (i.submittedAt ? new Date(i.submittedAt).toLocaleDateString() : 'Today'),
          raw: i
        }))
      ];

      setPendingQueue(queue);
    } catch (err) {
      console.error("Failed to load real-time manager data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveManagerData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLiveManagerData();
  };

  const handleApprove = async (item) => {
    setActionLoading(true);
    try {
      if (item.type === 'Timesheet') {
        await approveTimesheet(item.id);
      } else {
        await approveInvoice(item.id);
      }
      setFeedback({
        show: true,
        message: `${item.type} ${item.reference} approved successfully!`,
        type: 'success'
      });
      setTimeout(() => setFeedback({ show: false, message: '', type: 'success' }), 3500);
      fetchLiveManagerData();
    } catch (err) {
      setFeedback({
        show: true,
        message: err.response?.data?.message || `Failed to approve ${item.type}`,
        type: 'error'
      });
      setTimeout(() => setFeedback({ show: false, message: '', type: 'error' }), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (item) => {
    setSelectedItem(item);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || !selectedItem) return;
    setActionLoading(true);
    try {
      if (selectedItem.type === 'Timesheet') {
        await rejectTimesheet(selectedItem.id, rejectReason);
      } else {
        await rejectInvoice(selectedItem.id, rejectReason);
      }
      setFeedback({
        show: true,
        message: `${selectedItem.type} ${selectedItem.reference} rejected with reason logged.`,
        type: 'success'
      });
      setTimeout(() => setFeedback({ show: false, message: '', type: 'success' }), 3500);
      setIsRejectModalOpen(false);
      fetchLiveManagerData();
    } catch (err) {
      setFeedback({
        show: true,
        message: err.response?.data?.message || 'Failed to reject item',
        type: 'error'
      });
      setTimeout(() => setFeedback({ show: false, message: '', type: 'error' }), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const openViewModal = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const columns = [
    { 
      header: 'Item Type', 
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          row.type === 'Timesheet' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' 
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
        }`}>
          {row.type}
        </span>
      )
    },
    { 
      header: 'Reference', 
      cell: (row) => <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">{row.reference}</span>
    },
    { 
      header: 'Submitted By', 
      cell: (row) => <span className="font-medium text-slate-900 dark:text-slate-100">{row.submitter}</span>
    },
    { 
      header: 'Project', 
      cell: (row) => <span className="text-slate-600 dark:text-slate-300">{row.project}</span>
    },
    { 
      header: 'Amount / Hours', 
      cell: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.amountOrHours}</span>
    },
    { 
      header: 'Timestamp', 
      cell: (row) => <span className="text-xs text-slate-500">{row.date}</span>
    },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => openViewModal(row)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800 transition-colors"
            title="Inspect Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleApprove(row)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 transition-colors"
            title="Approve Submission"
            disabled={actionLoading}
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button 
            onClick={() => openRejectModal(row)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 transition-colors"
            title="Reject Submission"
            disabled={actionLoading}
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      {feedback.show && (
        <div className={`flex items-center gap-2 rounded-lg p-4 text-sm font-medium border ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
            : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {feedback.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Manager Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Live delivery metrics, vendor timesheet sign-offs, and automated invoice verification.
          </p>
        </div>

        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          isLoading={refreshing}
          className="flex items-center gap-1.5 self-start sm:self-auto text-xs"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Live Data
        </Button>
      </div>

      {/* Info Notice on Manager Actions */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/20 p-4 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-300">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold block mb-0.5">Manager Authorization Hub:</span>
          Action buttons in the queue below enable you to review and sign-off external timesheets and invoices before payment disbursement. Approving verifies contractor sprint delivery; rejecting logs feedback for revision.
        </div>
      </div>

      {/* Real-time Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Pending Timesheets" 
          value={metrics.pendingTimesheets} 
          icon={Clock} 
        />
        <StatCard 
          title="Pending Invoices" 
          value={metrics.pendingInvoices} 
          icon={FileText} 
        />
        <StatCard 
          title="Milestones In Progress" 
          value={metrics.pendingMilestones} 
          icon={Flag} 
        />
        <StatCard 
          title="Pending Authorization Value" 
          value={`$${metrics.totalPendingAmount.toLocaleString()}`} 
          icon={DollarSign} 
        />
      </div>

      {/* Actionable Pending Queue */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Pending Sign-off Queue ({pendingQueue.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immediate submissions requiring your review and authorization
            </p>
          </div>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-3">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Queue Clear!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              All contractor timesheets and vendor invoices are currently reviewed and authorized.
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={pendingQueue} keyField="id" />
        )}
      </div>

      {/* View Item Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`${selectedItem?.type || 'Submission'} Details`}
      >
        {selectedItem && (
          <div className="space-y-4 py-2 text-sm">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedItem.reference}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Type: {selectedItem.type} • Submitter: {selectedItem.submitter}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 font-medium">Project</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{selectedItem.project}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 font-medium">Amount / Hours</span>
                <p className="font-bold text-primary-600 dark:text-primary-400 text-sm">{selectedItem.amountOrHours}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 font-medium">Submitted Timestamp</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{selectedItem.date}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 font-medium">Validation Status</span>
                <p className="font-semibold text-amber-600 dark:text-amber-400 text-sm">Requires Manager Sign-off</p>
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
                  openRejectModal(selectedItem);
                }}
              >
                Reject
              </Button>
              <Button 
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleApprove(selectedItem);
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
        title={`Reject ${selectedItem?.type || 'Submission'}`}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Please enter your reason for rejecting <strong className="text-slate-900 dark:text-white">{selectedItem?.reference}</strong>:
          </p>
          <FormInput
            label="Rejection Feedback (Required)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Incomplete deliverables or unapproved overtime logged."
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
