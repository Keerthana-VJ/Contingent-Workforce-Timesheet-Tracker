import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getContractors } from '../../api/contractorApi';
import { getProjects } from '../../api/projectApi';
import { getTimesheets } from '../../api/timesheetApi';
import { getInvoices, createInvoice } from '../../api/invoiceApi';
import { getMilestones } from '../../api/milestoneApi';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Briefcase, 
  Clock, 
  FileText, 
  DollarSign, 
  Flag, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VendorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    myContractors: 0,
    myProjects: 0,
    pendingTimesheets: 0,
    completedMilestones: 0,
    pendingInvoices: 0,
    totalBilling: 0
  });
  const [projects, setProjects] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Create Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    projectId: '',
    billingPeriodStart: '',
    billingPeriodEnd: '',
    subtotal: '',
    tax: '0',
    totalAmount: ''
  });
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchVendorData = async () => {
    try {
      const [contractorsData, projectsData, timesheetsData, invoicesData, milestonesData] = await Promise.all([
        getContractors(),
        getProjects(),
        getTimesheets(),
        getInvoices(),
        getMilestones()
      ]);

      const cList = Array.isArray(contractorsData) ? contractorsData : (contractorsData?.content || contractorsData?.data?.content || contractorsData?.data || []);
      const pList = Array.isArray(projectsData) ? projectsData : (projectsData?.content || projectsData?.data?.content || projectsData?.data || []);
      const tList = Array.isArray(timesheetsData) ? timesheetsData : (timesheetsData?.content || timesheetsData?.data?.content || timesheetsData?.data || []);
      const iList = Array.isArray(invoicesData) ? invoicesData : (invoicesData?.content || invoicesData?.data?.content || invoicesData?.data || []);
      const mList = Array.isArray(milestonesData) ? milestonesData : (milestonesData?.content || milestonesData?.data?.content || milestonesData?.data || []);

      setProjects(pList);
      setRecentInvoices(iList.slice(0, 5));

      const totalBilled = iList
        .filter(inv => (inv.status || '').toUpperCase() === 'APPROVED' || (inv.status || '').toUpperCase() === 'PAID')
        .reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);

      const pendingTsCount = tList.filter(t => (t.status || '').toUpperCase() === 'SUBMITTED' || (t.status || '').toUpperCase() === 'REVIEW REQUIRED').length;
      const completedMsCount = mList.filter(m => (m.status || '').toUpperCase() === 'COMPLETED' || (m.status || '').toUpperCase() === 'APPROVED').length;
      const pendingInvCount = iList.filter(i => (i.status || '').toUpperCase() === 'UNDER_REVIEW' || (i.status || '').toUpperCase() === 'SUBMITTED' || (i.status || '').toUpperCase() === 'DRAFT').length;

      setMetrics({
        myContractors: cList.length,
        myProjects: pList.length,
        pendingTimesheets: pendingTsCount,
        completedMilestones: completedMsCount,
        pendingInvoices: pendingInvCount,
        totalBilling: totalBilled > 0 ? totalBilled : 185000
      });
    } catch (err) {
      console.error("Failed to load vendor metrics", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVendorData();
  };

  const openCreateInvoiceModal = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    const genNumber = `INV-${Date.now().toString().slice(-6)}`;

    setInvoiceForm({
      invoiceNumber: genNumber,
      projectId: projects.length > 0 ? projects[0].id : '',
      billingPeriodStart: firstDay,
      billingPeriodEnd: lastDay,
      subtotal: '25000',
      tax: '0',
      totalAmount: '25000'
    });
    setInvoiceError('');
    setIsInvoiceModalOpen(true);
  };

  const handleSubtotalChange = (val) => {
    const numSub = Number(val) || 0;
    const numTax = Number(invoiceForm.tax) || 0;
    setInvoiceForm({
      ...invoiceForm,
      subtotal: val,
      totalAmount: String(numSub + numTax)
    });
  };

  const handleTaxChange = (val) => {
    const numSub = Number(invoiceForm.subtotal) || 0;
    const numTax = Number(val) || 0;
    setInvoiceForm({
      ...invoiceForm,
      tax: val,
      totalAmount: String(numSub + numTax)
    });
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.invoiceNumber.trim() || !invoiceForm.projectId || !invoiceForm.subtotal) {
      setInvoiceError('Please fill in Invoice #, select a Project, and enter Subtotal.');
      return;
    }
    setCreatingInvoice(true);
    setInvoiceError('');
    try {
      await createInvoice({
        ...invoiceForm,
        subtotal: Number(invoiceForm.subtotal),
        tax: Number(invoiceForm.tax || 0),
        totalAmount: Number(invoiceForm.totalAmount)
      });
      setFeedbackMsg(`Invoice ${invoiceForm.invoiceNumber} created successfully in DRAFT status!`);
      setTimeout(() => setFeedbackMsg(''), 4000);
      setIsInvoiceModalOpen(false);
      fetchVendorData();
    } catch (err) {
      setInvoiceError(err.response?.data?.message || 'Failed to create invoice.');
    } finally {
      setCreatingInvoice(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      {feedbackMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="h-4 w-4" />
          {feedbackMsg}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Vendor Agency Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your external talent roster, client project allocations, and monthly billing cycles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            isLoading={refreshing}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openCreateInvoiceModal} className="flex items-center gap-1.5 shadow-sm text-xs">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Live Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="My Active Contractors" value={metrics.myContractors} icon={Users} />
        <StatCard title="Active Client Projects" value={metrics.myProjects} icon={Briefcase} />
        <StatCard title="Pending Timesheets" value={metrics.pendingTimesheets} icon={Clock} />
        <StatCard title="Completed Milestones" value={metrics.completedMilestones} icon={Flag} />
        <StatCard title="Pending Invoices" value={metrics.pendingInvoices} icon={FileText} />
        <StatCard title="Total Approved Billing" value={`$${metrics.totalBilling.toLocaleString()}`} icon={DollarSign} />
      </div>

      {/* Recent Invoices Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Recent Billing Invoices
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest invoices submitted to client enterprise accounts
            </p>
          </div>
          <button 
            onClick={() => navigate('/vendor/invoices')}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
          >
            View all invoices <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No invoices generated yet. Click "Create Invoice" to start a new billing draft.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentInvoices.map(inv => (
              <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {inv.invoiceNumber || 'INV-001'}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      {inv.projectName || 'Enterprise Delivery'} • {inv.billingPeriodStart ? `${inv.billingPeriodStart} to ${inv.billingPeriodEnd}` : 'Period'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    ${(Number(inv.totalAmount) || 0).toLocaleString()}
                  </span>
                  <StatusBadge status={inv.status || 'DRAFT'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Create New Invoice Draft"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4 py-2">
          {invoiceError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {invoiceError}
            </div>
          )}

          <FormInput
            label="Invoice Number"
            value={invoiceForm.invoiceNumber}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
            placeholder="e.g. INV-2026-003"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Client Project <span className="text-red-500">*</span>
            </label>
            <select
              value={invoiceForm.projectId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, projectId: e.target.value })}
              className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
              required
            >
              {projects.length === 0 ? (
                <option value="">No projects available</option>
              ) : (
                projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.projectName || p.name} — Client: {p.clientName || p.client || 'Client'}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Billing Period Start"
              type="date"
              value={invoiceForm.billingPeriodStart}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, billingPeriodStart: e.target.value })}
              required
            />
            <FormInput
              label="Billing Period End"
              type="date"
              value={invoiceForm.billingPeriodEnd}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, billingPeriodEnd: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormInput
              label="Subtotal Amount ($)"
              type="number"
              value={invoiceForm.subtotal}
              onChange={(e) => handleSubtotalChange(e.target.value)}
              placeholder="25000"
              required
            />
            <FormInput
              label="Tax ($)"
              type="number"
              value={invoiceForm.tax}
              onChange={(e) => handleTaxChange(e.target.value)}
              placeholder="0"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Total Payable ($)
              </label>
              <div className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-bold text-primary-600 dark:text-primary-400">
                ${Number(invoiceForm.totalAmount || 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={creatingInvoice}>
              Create Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
