import React, { useState, useEffect } from 'react';
import { getMilestones, createMilestone, updateMilestone, completeMilestone, approveMilestone, deleteMilestone } from '../../api/milestoneApi';
import { getProjects } from '../../api/projectApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { 
  Eye, 
  Flag, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  UserCheck, 
  Plus, 
  CheckCircle, 
  Clock, 
  Users, 
  CheckSquare, 
  AlertCircle,
  RefreshCw,
  Edit,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MilestonesList = () => {
  const [milestones, setMilestones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { role: userRole } = useAuth();

  // Modals state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const [formData, setFormData] = useState({
    projectId: '',
    milestoneName: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    assignedDays: 10,
    billingAmount: '25000',
    completionPercentage: 0,
    status: 'IN_PROGRESS'
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchMilestonesList = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getMilestones();
      const list = Array.isArray(data) ? data : (data?.content || data?.data?.content || data?.data || []);
      setMilestones(list);
    } catch (error) {
      console.error("Failed to fetch milestones", error);
      setMilestones([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMilestonesList();
    const fetchProjectsList = async () => {
      try {
        const data = await getProjects();
        const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
        setProjects(list);
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    };
    fetchProjectsList();
  }, []);

  const openViewModal = (milestone) => {
    setSelectedMilestone(milestone);
    setIsViewModalOpen(true);
  };

  const openAddModal = () => {
    setFormData({
      projectId: projects[0]?.id || '',
      milestoneName: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      assignedDays: 10,
      billingAmount: '25000',
      completionPercentage: 0,
      status: 'IN_PROGRESS'
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!formData.projectId || !formData.milestoneName.trim() || !formData.billingAmount) {
      setFormError('Project, Milestone Name, and Billing Amount are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await createMilestone({
        ...formData,
        assignedDays: Number(formData.assignedDays) || 10,
        billingAmount: Number(formData.billingAmount) || 0
      });
      setSuccessMsg('Milestone created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsAddModalOpen(false);
      fetchMilestonesList(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create milestone.');
    } finally {
      setSubmitting(false);
    }
  };

  // Direct 1-click Milestone accomplishment by contractor/manager (no form filling required)
  const handleEndMilestone = async (milestoneId) => {
    try {
      await completeMilestone(milestoneId);
      setSuccessMsg('Milestone ended and marked as accomplished!');
      setTimeout(() => setSuccessMsg(''), 3500);
      if (isViewModalOpen) setIsViewModalOpen(false);
      fetchMilestonesList(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to end milestone.');
    }
  };

  const handleApproveMilestone = async (milestoneId) => {
    try {
      await approveMilestone(milestoneId);
      setSuccessMsg('Milestone approved for billing successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      if (isViewModalOpen) setIsViewModalOpen(false);
      fetchMilestonesList(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve milestone.');
    }
  };

  const filteredMilestones = milestones.filter(m => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    const name = (m.milestoneName || m.name || '').toLowerCase();
    const proj = (m.projectName || '').toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    return name.includes(query) || proj.includes(query);
  });

  const totalAssignedValue = milestones.reduce((sum, m) => sum + (Number(m.billingAmount) || 0), 0);
  const completedCount = milestones.filter(m => m.status === 'COMPLETED').length;
  const inProgressCount = milestones.filter(m => m.status === 'IN_PROGRESS' || m.status === 'NOT_STARTED').length;

  const columns = [
    { 
      header: 'Milestone & Deliverable', 
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 font-semibold text-xs shrink-0">
            <Flag className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block text-xs leading-tight">
              {row.milestoneName || row.name || 'Untitled Milestone'}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Project: <strong className="text-slate-700 dark:text-slate-300">{row.projectName || 'General'}</strong>
            </span>
          </div>
        </div>
      )
    },
    { 
      header: 'Timeline & Duration', 
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            Due: {row.dueDate || 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500">
            Assigned: <strong className="text-slate-800 dark:text-slate-200">{row.assignedDays || 10} days</strong>
          </div>
        </div>
      ) 
    },
    { 
      header: 'Timesheet Uploads', 
      cell: (row) => {
        const rawCompleted = row.completedDays !== undefined ? row.completedDays : 0;
        const assignedDays = row.assignedDays || 10;
        const completedDays = (row.status === 'COMPLETED' && rawCompleted === 0) ? assignedDays : rawCompleted;
        const loggedHours = row.loggedHours !== undefined ? row.loggedHours : 0;
        return (
          <div className="text-xs space-y-0.5">
            <div className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              {completedDays} days of work
            </div>
            <div className="text-[11px] text-slate-400">
              {loggedHours > 0 ? `${loggedHours} hrs logged` : (row.status === 'COMPLETED' ? 'Accomplished' : 'Awaiting uploads')}
            </div>
          </div>
        );
      } 
    },
    { 
      header: 'Days of Completion Progress', 
      cell: (row) => {
        const assignedDays = row.assignedDays || 10;
        const rawCompleted = row.completedDays !== undefined ? row.completedDays : 0;
        const isCompleted = row.status === 'COMPLETED';
        const completedDays = (isCompleted && rawCompleted === 0) ? assignedDays : rawCompleted;
        const pct = isCompleted ? 100 : (assignedDays > 0 ? Math.min(100, Math.round((completedDays / assignedDays) * 100)) : 0);

        return (
          <div className="w-36 space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {completedDays} / {assignedDays} days
              </span>
              <span className={`font-bold ${pct >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                {pct}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${
                  pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
              />
            </div>
          </div>
        );
      } 
    },
    { 
      header: 'Billing Amount', 
      cell: (row) => (
        <span className="font-bold text-slate-900 dark:text-white text-xs">
          ${(Number(row.billingAmount) || 0).toLocaleString()}
        </span>
      ) 
    },
    { 
      header: 'Status', 
      cell: (row) => <StatusBadge status={row.status || 'IN_PROGRESS'} /> 
    },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => openViewModal(row)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800 transition-colors"
            title="View Details & Timesheets"
          >
            <Eye className="h-4 w-4" />
          </button>
          
          {/* Direct 1-Click End Milestone Button for Contractor / Manager */}
          {row.status !== 'COMPLETED' ? (
            <button
              onClick={() => handleEndMilestone(row.id)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors shadow-xs"
              title="End / Mark Milestone Accomplished (1-Click)"
            >
              <Award className="h-3.5 w-3.5" />
              End
            </button>
          ) : (
            (userRole === 'MANAGER' || userRole === 'ADMIN') && !row.approvedAt && (
              <button
                onClick={() => handleApproveMilestone(row.id)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors shadow-xs"
                title="Approve for Billing"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Approve
              </button>
            )
          )}
        </div>
      ) 
    },
  ];

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-in fade-in duration-200">
          <CheckCircle className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Milestones Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Deliverables progress calculated strictly on days of completion out of days assigned. Contractors can end accomplished milestones with 1 click.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            onClick={() => fetchMilestonesList(true)} 
            isLoading={refreshing}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <Button onClick={openAddModal} className="flex items-center gap-1.5 text-xs shadow-sm">
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Milestones</span>
            <Flag className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{milestones.length}</div>
          <span className="text-[11px] text-slate-400">Total Value: ${totalAssignedValue.toLocaleString()}</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">In Progress Deliverables</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{inProgressCount}</div>
          <span className="text-[11px] text-slate-400">Progress tracked by timesheet days</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Accomplished / Completed</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</div>
          <span className="text-[11px] text-slate-400">100% days of work fulfilled</span>
        </div>
      </div>
      
      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex flex-wrap gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg">
            {[
              { key: 'ALL', label: `All (${milestones.length})` },
              { key: 'IN_PROGRESS', label: `In Progress (${inProgressCount})` },
              { key: 'COMPLETED', label: `Accomplished (${completedCount})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-xs">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search milestones or project..." 
              className="h-8.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" 
            />
          </div>
        </div>

        {filteredMilestones.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-3">
              <Flag className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No milestones found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Create a milestone for your projects so contractors can log their work and track days of completion.
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredMilestones} keyField="id" />
        )}
      </div>

      {/* Add Milestone Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Project Milestone"
      >
        <form onSubmit={handleCreateMilestone} className="space-y-4 py-2">
          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Associated Project *
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500 font-medium"
              required
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.projectName || p.name} — {p.clientName || 'Client'}
                </option>
              ))}
            </select>
          </div>

          <FormInput
            label="Milestone Deliverable Name"
            value={formData.milestoneName}
            onChange={(e) => setFormData({ ...formData, milestoneName: e.target.value })}
            placeholder="e.g. Microservices API Gateway"
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormInput
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <FormInput
              label="Target Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <FormInput
              label="Days Assigned to Work"
              type="number"
              min="1"
              value={formData.assignedDays}
              onChange={(e) => setFormData({ ...formData, assignedDays: e.target.value })}
              required
              helperText="Days required for completion"
            />
          </div>

          <FormInput
            label="Billing Amount ($)"
            type="number"
            value={formData.billingAmount}
            onChange={(e) => setFormData({ ...formData, billingAmount: e.target.value })}
            placeholder="50000"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Scope of Deliverables & Requirements
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm text-xs focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe deliverables and milestone success criteria..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Milestone
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Milestone Modal with Timesheet Contributions */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Milestone Deliverable Details"
      >
        {selectedMilestone && (() => {
          const assignedDays = selectedMilestone.assignedDays || 10;
          const rawCompleted = selectedMilestone.completedDays !== undefined ? selectedMilestone.completedDays : 0;
          const isCompleted = selectedMilestone.status === 'COMPLETED';
          const completedDays = (isCompleted && rawCompleted === 0) ? assignedDays : rawCompleted;
          const pct = isCompleted ? 100 : (assignedDays > 0 ? Math.min(100, Math.round((completedDays / assignedDays) * 100)) : 0);

          return (
            <div className="space-y-4 py-2 text-sm">
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg">
                  <Flag className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {selectedMilestone.milestoneName || selectedMilestone.name}
                    </h3>
                    <StatusBadge status={selectedMilestone.status || 'IN_PROGRESS'} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>Project: <strong className="text-slate-800 dark:text-slate-200">{selectedMilestone.projectName || 'General'}</strong></span>
                    <span>•</span>
                    <span>Due: <strong>{selectedMilestone.dueDate || 'N/A'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Progress breakdown based on days of completion */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    Days of Completion Progress
                  </span>
                  <span className={`font-bold ${pct >= 100 ? 'text-emerald-700 dark:text-emerald-300' : 'text-indigo-700 dark:text-indigo-300'}`}>
                    {completedDays} / {assignedDays} Days ({pct}%)
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedMilestone.timesheetsCount > 0 
                    ? `Calculated from ${selectedMilestone.timesheetsCount} uploaded timesheets across ${selectedMilestone.loggedHours || 0} working hours.`
                    : (isCompleted ? 'Marked as accomplished by contractor.' : 'No contractor timesheets uploaded yet for this milestone.')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                  <span className="text-slate-500 flex items-center gap-1 font-medium"><DollarSign className="h-3.5 w-3.5" /> Billing Amount</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                    ${(Number(selectedMilestone.billingAmount) || 0).toLocaleString()}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                  <span className="text-slate-500 flex items-center gap-1 font-medium"><UserCheck className="h-3.5 w-3.5" /> Approved Sign-off</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                    {selectedMilestone.approvedBy?.name || (isCompleted ? 'Accomplished (Pending Manager Approval)' : 'In Progress')}
                  </span>
                </div>
              </div>

              {/* Contributing Contractors */}
              {selectedMilestone.contributingContractors && selectedMilestone.contributingContractors.length > 0 && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 text-xs space-y-1.5">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> Contributing Contractors
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMilestone.contributingContractors.map((name, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMilestone.description && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 text-xs space-y-1">
                  <span className="text-slate-500 font-medium">Deliverable Scope & Criteria</span>
                  <p className="text-slate-800 dark:text-slate-200">{selectedMilestone.description}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                {!isCompleted ? (
                  <Button 
                    variant="success" 
                    onClick={() => handleEndMilestone(selectedMilestone.id)}
                    className="flex items-center gap-1.5 text-xs shadow-sm"
                  >
                    <Award className="h-4 w-4" />
                    End & Mark Accomplished
                  </Button>
                ) : (
                  (userRole === 'MANAGER' || userRole === 'ADMIN') && !selectedMilestone.approvedAt ? (
                    <Button 
                      variant="primary" 
                      onClick={() => handleApproveMilestone(selectedMilestone.id)}
                      className="flex items-center gap-1.5 text-xs shadow-sm"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Approve Milestone for Billing
                    </Button>
                  ) : <div />
                )}

                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
