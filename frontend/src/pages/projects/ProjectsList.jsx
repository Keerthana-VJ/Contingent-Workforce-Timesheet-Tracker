import React, { useState, useEffect } from 'react';
import { getProjects, getMyProjects, createProject, assignContractorToProject } from '../../api/projectApi';
import { getContractors } from '../../api/contractorApi';
import { getVendors } from '../../api/vendorApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Plus, Eye, UserPlus, CheckCircle, AlertCircle, Briefcase, Building2, User, Calendar, DollarSign, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { role } = useAuth();

  // Create Project Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    projectName: '',
    clientName: '',
    vendorId: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
    description: ''
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // View Details Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProject, setViewProject] = useState(null);

  // Assign Contractor Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProjectsData = async () => {
    setLoading(true);
    try {
      let data;
      if (role === 'CONTRACTOR') {
        data = await getMyProjects();
      } else {
        data = await getProjects();
      }
      const list = Array.isArray(data) ? data : (data?.content || data?.data?.content || data?.data || []);
      setProjects(list);

      const vendorsData = await getVendors();
      const vList = Array.isArray(vendorsData) ? vendorsData : (vendorsData?.content || vendorsData?.data?.content || vendorsData?.data || []);
      setVendors(vList);
    } catch (error) {
      console.error("Failed to fetch projects", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();
  }, [role]);

  const openCreateModal = () => {
    setCreateFormData({
      projectName: '',
      clientName: '',
      vendorId: vendors.length > 0 ? vendors[0].id : '',
      budget: '150000',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE',
      description: ''
    });
    setCreateError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!createFormData.projectName.trim() || !createFormData.budget) {
      setCreateError('Project Name and Budget are required.');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      await createProject({
        ...createFormData,
        budget: Number(createFormData.budget)
      });
      setSuccessMsg('Project created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsCreateModalOpen(false);
      fetchProjectsData();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const openViewModal = (project) => {
    setViewProject(project);
    setIsViewModalOpen(true);
  };

  const openAssignModal = async (project) => {
    setSelectedProject(project);
    setAssignSuccess('');
    setIsAssignModalOpen(true);
    try {
      const data = await getContractors();
      const list = Array.isArray(data) ? data : (data?.content || data?.data?.content || data?.data || []);
      
      const projVendorId = project.vendor?.id || project.vendorId;
      const projVendorName = project.vendor?.vendorName || project.vendorName;

      let filtered = list;
      if (projVendorId || projVendorName) {
        const vendorContractors = list.filter(c => 
          (projVendorId && (c.vendor?.id === projVendorId || c.vendorId === projVendorId)) ||
          (projVendorName && (c.vendor?.vendorName === projVendorName || c.vendorName === projVendorName))
        );
        if (vendorContractors.length > 0) {
          filtered = vendorContractors;
        }
      }

      setContractors(filtered);
      if (filtered.length > 0) {
        setSelectedContractorId(filtered[0].id);
      } else {
        setSelectedContractorId('');
      }
    } catch (err) {
      console.error("Failed to load contractors", err);
    }
  };

  const handleAssignContractor = async () => {
    if (!selectedContractorId || !selectedProject) return;
    setAssigning(true);
    setAssignSuccess('');
    try {
      await assignContractorToProject(selectedProject.id, {
        contractorId: selectedContractorId,
        status: 'ACTIVE'
      });
      setAssignSuccess('Contractor assigned to project successfully!');
      setTimeout(() => {
        setIsAssignModalOpen(false);
        fetchProjectsData();
      }, 1200);
    } catch (err) {
      console.error("Failed to assign contractor", err);
      alert(err.response?.data?.message || 'Failed to assign contractor');
    } finally {
      setAssigning(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const name = (p.projectName || p.name || '').toLowerCase();
    const client = (p.clientName || p.client || '').toLowerCase();
    const vendorName = (p.vendor?.vendorName || p.vendorName || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || client.includes(query) || vendorName.includes(query);
  });

  const columns = [
    { 
      header: 'Project Name', 
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold text-xs shrink-0">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block leading-tight">
              {row.projectName || row.name || 'Untitled Project'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {row.clientName ? `Client: ${row.clientName}` : (row.id ? String(row.id).substring(0, 8) : '')}
            </span>
          </div>
        </div>
      )
    },
    { 
      header: 'Vendor Partner', 
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {row.vendor?.vendorName || row.vendorName || 'Unassigned'}
        </span>
      )
    },
    { 
      header: 'Project Manager', 
      cell: (row) => row.manager?.name || row.managerName || 'Assigned Manager' 
    },
    { 
      header: 'Budget', 
      cell: (row) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          ${Number(row.budget || 0).toLocaleString()}
        </span>
      ) 
    },
    { 
      header: 'Status', 
      cell: (row) => <StatusBadge status={row.status || 'ACTIVE'} /> 
    },
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
          {(role === 'ADMIN' || role === 'MANAGER' || role === 'VENDOR') && (
            <button 
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 transition-colors" 
              title="Assign Contractor from Vendor"
              onClick={() => openAssignModal(row)}
            >
              <UserPlus className="h-4 w-4" />
            </button>
          )}
        </div>
      ) 
    },
  ];

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {role === 'CONTRACTOR' ? 'My Projects' : 'Projects'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage enterprise delivery statements, budget tracking, and vendor staffing.
          </p>
        </div>
        {(role === 'ADMIN' || role === 'MANAGER') && (
          <Button onClick={openCreateModal} className="flex items-center gap-1.5 self-start sm:self-auto shadow-sm">
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        )}
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="relative w-full max-w-sm">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects by name, client, or vendor..." 
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" 
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'}
          </span>
        </div>
        <DataTable columns={columns} data={filteredProjects} keyField="id" />
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4 py-2">
          {createError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {createError}
            </div>
          )}

          <FormInput
            label="Project Name"
            value={createFormData.projectName}
            onChange={(e) => setCreateFormData({ ...createFormData, projectName: e.target.value })}
            placeholder="e.g. Enterprise Cloud Migration"
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Client Name"
              value={createFormData.clientName}
              onChange={(e) => setCreateFormData({ ...createFormData, clientName: e.target.value })}
              placeholder="e.g. FinTech Global Corp"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Vendor Partner
              </label>
              <select
                value={createFormData.vendorId}
                onChange={(e) => setCreateFormData({ ...createFormData, vendorId: e.target.value })}
                className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.vendorName || v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Budget ($)"
              type="number"
              value={createFormData.budget}
              onChange={(e) => setCreateFormData({ ...createFormData, budget: e.target.value })}
              placeholder="650000"
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={createFormData.status}
                onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value })}
                className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ON_HOLD">ON_HOLD</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Start Date"
              type="date"
              value={createFormData.startDate}
              onChange={(e) => setCreateFormData({ ...createFormData, startDate: e.target.value })}
            />
            <FormInput
              label="End Date"
              type="date"
              value={createFormData.endDate}
              onChange={(e) => setCreateFormData({ ...createFormData, endDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              value={createFormData.description}
              onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              rows={3}
              placeholder="Overview of project deliverables, milestones, and scope..."
              className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={creating}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Project Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Project Details"
      >
        {viewProject && (
          <div className="space-y-4 py-2 text-sm">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {viewProject.projectName || viewProject.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={viewProject.status || 'ACTIVE'} />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Budget: ${Number(viewProject.budget || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Building2 className="h-3.5 w-3.5" /> Client</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{viewProject.clientName || viewProject.client || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Building2 className="h-3.5 w-3.5" /> Vendor Partner</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{viewProject.vendor?.vendorName || viewProject.vendorName || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><User className="h-3.5 w-3.5" /> Project Manager</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{viewProject.manager?.name || viewProject.managerName || 'Michael Manager'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Calendar className="h-3.5 w-3.5" /> Period</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{viewProject.startDate || 'Start'} → {viewProject.endDate || 'End'}</span>
              </div>
            </div>

            {viewProject.description && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 text-xs space-y-1">
                <span className="text-slate-500 font-medium">Description</span>
                <p className="text-slate-800 dark:text-slate-200">{viewProject.description}</p>
              </div>
            )}

            {Array.isArray(viewProject.members) && viewProject.members.length > 0 && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 text-xs space-y-2">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Assigned Team Members ({viewProject.members.length})
                </span>
                <div className="space-y-1.5">
                  {viewProject.members.map((m, idx) => (
                    <div key={m.id || idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {m.contractor?.user?.name || m.contractorName || 'Contractor'}
                      </span>
                      <StatusBadge status={m.status || 'ACTIVE'} />
                    </div>
                  ))}
                </div>
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

      {/* Assign Contractor Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Contractor to ${selectedProject?.projectName || selectedProject?.name || 'Project'}`}
      >
        <div className="space-y-4 py-2">
          {assignSuccess && (
            <div className="flex items-center p-3 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              {assignSuccess}
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-md border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <div className="text-slate-500">Project Vendor:</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {selectedProject?.vendor?.vendorName || selectedProject?.vendorName || 'Unassigned'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Vendor Contractor
            </label>
            <select
              value={selectedContractorId}
              onChange={(e) => setSelectedContractorId(e.target.value)}
              className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              {contractors.length === 0 ? (
                <option value="">No contractors available from this vendor</option>
              ) : (
                contractors.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.user?.name || c.name} — {c.jobRole || c.role || 'Contractor'}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignContractor} isLoading={assigning} disabled={!selectedContractorId || contractors.length === 0}>
              Assign Contractor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

