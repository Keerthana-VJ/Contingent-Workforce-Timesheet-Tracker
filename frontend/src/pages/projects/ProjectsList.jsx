import React, { useState, useEffect } from 'react';
import { getProjects, getMyProjects, assignContractorToProject } from '../../api/projectApi';
import { getContractors } from '../../api/contractorApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Plus, Eye, Edit, UserPlus, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();

  // Assign Contractor Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');

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

  const openAssignModal = async (project) => {
    setSelectedProject(project);
    setAssignSuccess('');
    setIsAssignModalOpen(true);
    try {
      const data = await getContractors();
      const list = Array.isArray(data) ? data : (data?.content || data?.data?.content || data?.data || []);
      
      // Filter contractors belonging to this project's vendor
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

  const columns = [
    { 
      header: 'Project Name', 
      cell: (row) => <span className="font-medium text-slate-900 dark:text-white">{row.projectName || row.name || 'Untitled'}</span> 
    },
    { 
      header: 'Client', 
      cell: (row) => row.clientName || row.client || 'N/A' 
    },
    { 
      header: 'Vendor', 
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {row.vendor?.vendorName || row.vendorName || 'N/A'}
        </span>
      )
    },
    { 
      header: 'Manager', 
      cell: (row) => row.manager?.name || row.managerName || 'N/A' 
    },
    { 
      header: 'Budget', 
      cell: (row) => row.budget != null ? `$${Number(row.budget).toLocaleString()}` : '$0' 
    },
    { 
      header: 'Status', 
      cell: (row) => <StatusBadge status={row.status || 'Active'} /> 
    },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex space-x-2">
          <button className="text-slate-400 hover:text-primary-600 transition-colors" title="View Details">
            <Eye className="h-4 w-4" />
          </button>
          {(role === 'ADMIN' || role === 'MANAGER' || role === 'VENDOR') && (
            <button 
              className="text-slate-400 hover:text-emerald-600 transition-colors" 
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {role === 'CONTRACTOR' ? 'My Projects' : 'Projects'}
        </h1>
        {(role === 'ADMIN' || role === 'MANAGER') && (

          <Button className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        )}
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <DataTable columns={columns} data={projects} keyField="id" />
      </div>

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

