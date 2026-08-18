import React, { useState, useEffect } from 'react';
import { getInvoices, approveInvoice, rejectInvoice, markPaidInvoice } from '../../api/invoiceApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Plus, Eye, CheckCircle, XCircle, DollarSign, AlertTriangle, FileText, Building2, Calendar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { role } = useAuth();

  // Modals state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchInvoicesList = async () => {
    setLoading(true);
    try {
      const data = await getInvoices();
      const list = Array.isArray(data) ? data : (data?.content || data?.data?.content || data?.data || []);
      setInvoices(list);
    } catch (error) {
      console.error("Failed to fetch invoices", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesList();
  }, []);

  const openViewModal = (invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleApprove = async (invoice) => {
    setActionLoading(true);
    try {
      await approveInvoice(invoice.id);
      setFeedbackMsg(`Invoice ${invoice.invoiceNumber || invoice.id} approved successfully!`);
      setTimeout(() => setFeedbackMsg(''), 3000);
      fetchInvoicesList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (invoice) => {
    setSelectedInvoice(invoice);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || !selectedInvoice) return;
    setActionLoading(true);
    try {
      await rejectInvoice(selectedInvoice.id, rejectReason);
      setFeedbackMsg(`Invoice ${selectedInvoice.invoiceNumber} rejected.`);
      setTimeout(() => setFeedbackMsg(''), 3000);
      setIsRejectModalOpen(false);
      fetchInvoicesList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (invoice) => {
    setActionLoading(true);
    try {
      await markPaidInvoice(invoice.id);
      setFeedbackMsg(`Invoice ${invoice.invoiceNumber || invoice.id} marked as PAID!`);
      setTimeout(() => setFeedbackMsg(''), 3000);
      fetchInvoicesList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark invoice as paid');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const num = (inv.invoiceNumber || '').toLowerCase();
    const vendor = (inv.vendor?.vendorName || inv.vendorName || '').toLowerCase();
    const proj = (inv.projectName || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return num.includes(query) || vendor.includes(query) || proj.includes(query);
  });

  const columns = [
    { 
      header: 'Invoice #', 
      cell: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-900 dark:text-white">
            {row.invoiceNumber || (row.id ? `INV-${String(row.id).substring(0, 8).toUpperCase()}` : 'INV-001')}
          </span>
        </div>
      ) 
    },
    { 
      header: 'Vendor', 
      cell: (row) => (
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {row.vendor?.vendorName || row.vendorName || 'Vendor'}
        </span>
      ) 
    },
    { 
      header: 'Project', 
      cell: (row) => (
        <span className="text-slate-600 dark:text-slate-400">
          {row.projectName || row.project?.projectName || '-'}
        </span>
      ) 
    },
    { 
      header: 'Period', 
      cell: (row) => {
        if (row.billingPeriodStart && row.billingPeriodEnd) {
          return `${row.billingPeriodStart} → ${row.billingPeriodEnd}`;
        }
        return row.billingPeriod || '-';
      }
    },
    { 
      header: 'Total Amount', 
      cell: (row) => {
        const total = Number(row.totalAmount || 0);
        const diff = Number(row.differenceAmount || 0);
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 dark:text-white">
              ${total.toLocaleString()}
            </span>
            {diff > 0 && (
              <span className="flex items-center text-[11px] font-semibold text-red-600 dark:text-red-400 mt-0.5" title={`Variance: $${diff.toLocaleString()}`}>
                <AlertTriangle className="mr-1 h-3 w-3 shrink-0" /> Variance ${diff.toLocaleString()}
              </span>
            )}
          </div>
        );
      } 
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status || 'DRAFT'} /> },
    { 
      header: 'Submitted', 
      cell: (row) => {
        const d = row.submittedAt || row.submittedDate || row.createdAt;
        return d ? new Date(d).toLocaleDateString() : '-';
      }
    },
    { 
      header: 'Actions', 
      cell: (row) => {
        const isUnderReview = row.status === 'UNDER_REVIEW' || row.status === 'Under Review' || row.status === 'SUBMITTED';
        const isApproved = row.status === 'APPROVED';
        return (
          <div className="flex items-center space-x-1.5">
            <button 
              onClick={() => openViewModal(row)}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800 transition-colors"
              title="View Invoice Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            {(role === 'MANAGER' || role === 'ADMIN') && isUnderReview && (
              <>
                <button 
                  onClick={() => handleApprove(row)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 transition-colors"
                  title="Approve Invoice"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => openRejectModal(row)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 transition-colors"
                  title="Reject Invoice"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </>
            )}
            {(role === 'ADMIN' || role === 'MANAGER') && isApproved && (
              <button 
                onClick={() => handleMarkPaid(row)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-green-600 dark:hover:bg-slate-800 transition-colors"
                title="Mark as Paid"
              >
                <DollarSign className="h-4 w-4" />
              </button>
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
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="h-4 w-4" />
          {feedbackMsg}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Invoices
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Automated billing verification, discrepancy detection, and approval workflow.
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
              placeholder="Search by invoice #, vendor, or project..." 
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" 
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filteredInvoices.length} invoice{filteredInvoices.length === 1 ? '' : 's'}
          </span>
        </div>
        <DataTable columns={columns} data={filteredInvoices} keyField="id" />
      </div>

      {/* View Invoice Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Invoice Details"
      >
        {selectedInvoice && (
          <div className="space-y-4 py-2 text-sm">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedInvoice.invoiceNumber || 'INV-2026-001'}
                  </h3>
                  <StatusBadge status={selectedInvoice.status || 'UNDER_REVIEW'} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Vendor: {selectedInvoice.vendor?.vendorName || selectedInvoice.vendorName || 'Apex Global'}
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 font-medium">Billed Subtotal</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  ${(Number(selectedInvoice.subtotal || selectedInvoice.totalAmount) || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 font-medium">Tax / Additional</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  ${(Number(selectedInvoice.tax) || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1 bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 font-medium">Total Payable</span>
                <p className="font-bold text-primary-600 dark:text-primary-400 text-base">
                  ${(Number(selectedInvoice.totalAmount) || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Automated Validation Breakdown */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 p-4 space-y-2 text-xs bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4 text-primary-500" /> Automated Validation Engine Audit
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Calculated Verified Amount (Timesheets + Milestones):</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ${(Number(selectedInvoice.calculatedAmount || selectedInvoice.totalAmount) || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Difference / Unapproved Variance:</span>
                <span className={`font-semibold ${Number(selectedInvoice.differenceAmount) > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  ${(Number(selectedInvoice.differenceAmount) || 0).toLocaleString()} {Number(selectedInvoice.differenceAmount) > 0 ? '(Mismatch Flagged)' : '(0 Discrepancy)'}
                </span>
              </div>
            </div>

            {/* Billing Period Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Calendar className="h-3.5 w-3.5" /> Billing Period</span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {selectedInvoice.billingPeriodStart ? `${selectedInvoice.billingPeriodStart} to ${selectedInvoice.billingPeriodEnd}` : (selectedInvoice.billingPeriod || 'Current Period')}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Calendar className="h-3.5 w-3.5" /> Submitted Date</span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {selectedInvoice.submittedAt ? new Date(selectedInvoice.submittedAt).toLocaleDateString() : (selectedInvoice.submittedDate || 'Recent')}
                </p>
              </div>
            </div>

            {selectedInvoice.rejectionReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-400 space-y-1">
                <span className="font-bold">Rejection Comments:</span>
                <p>{selectedInvoice.rejectionReason}</p>
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

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Invoice"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Provide a reason for rejecting invoice <strong className="text-slate-900 dark:text-white">{selectedInvoice?.invoiceNumber}</strong>:
          </p>
          <FormInput
            label="Rejection Comments (Required)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Unapproved timesheet hours included; please revise."
            required
          />
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} isLoading={actionLoading} disabled={!rejectReason.trim()}>
              Confirm Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
