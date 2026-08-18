import React, { useState, useEffect } from 'react';
import { getContractors, createContractor, updateContractor, deleteContractor } from '../../api/contractorApi';
import { getVendors } from '../../api/vendorApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Plus, Eye, Edit, Trash2, User, Building2, CheckCircle, AlertCircle, Phone, Mail, DollarSign, Calendar, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ContractorsList = () => {
  const [contractors, setContractors] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { role } = useAuth();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vendorId: '',
    jobRole: '',
    hourlyRate: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchContractorsList = async () => {
    setLoading(true);
    try {
      const [contractorsData, vendorsData] = await Promise.all([
        getContractors(),
        getVendors()
      ]);
      const cList = Array.isArray(contractorsData) ? contractorsData : (contractorsData?.content || contractorsData?.data?.content || contractorsData?.data || []);
      const vList = Array.isArray(vendorsData) ? vendorsData : (vendorsData?.content || vendorsData?.data?.content || vendorsData?.data || []);
      setContractors(cList);
      setVendors(vList);
    } catch (error) {
      console.error("Failed to fetch contractors", error);
      setContractors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractorsList();
  }, []);

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      vendorId: vendors.length > 0 ? vendors[0].id : '',
      jobRole: '',
      hourlyRate: '65',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE'
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCreateContractor = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.vendorId || !formData.jobRole.trim() || !formData.hourlyRate) {
      setFormError('Please fill in all required fields (Name, Email, Vendor, Job Role, Rate).');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await createContractor({
        ...formData,
        hourlyRate: Number(formData.hourlyRate)
      });
      setSuccessMsg('Contractor added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsAddModalOpen(false);
      fetchContractorsList();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create contractor profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const openViewModal = (contractor) => {
    setSelectedContractor(contractor);
    setIsViewModalOpen(true);
  };

  const openEditModal = (contractor) => {
    setSelectedContractor(contractor);
    setFormData({
      name: contractor.user?.name || contractor.name || '',
      email: contractor.user?.email || contractor.email || '',
      phone: contractor.user?.phone || contractor.phone || '',
      vendorId: contractor.vendor?.id || contractor.vendorId || (vendors[0]?.id || ''),
      jobRole: contractor.jobRole || '',
      hourlyRate: String(contractor.hourlyRate || '0'),
      startDate: contractor.startDate || '',
      endDate: contractor.endDate || '',
      status: contractor.status || 'ACTIVE'
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateContractor = async (e) => {
    e.preventDefault();
    if (!formData.jobRole.trim() || !formData.hourlyRate) {
      setFormError('Job Role and Hourly Rate are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await updateContractor(selectedContractor.id, {
        ...formData,
        hourlyRate: Number(formData.hourlyRate)
      });
      setSuccessMsg('Contractor updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsEditModalOpen(false);
      fetchContractorsList();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update contractor.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (contractor) => {
    setSelectedContractor(contractor);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteContractor = async () => {
    if (!selectedContractor) return;
    setSubmitting(true);
    try {
      await deleteContractor(selectedContractor.id);
      setSuccessMsg('Contractor profile deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsDeleteModalOpen(false);
      fetchContractorsList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete contractor.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredContractors = contractors.filter(c => {
    const name = (c.user?.name || c.name || '').toLowerCase();
    const email = (c.user?.email || c.email || '').toLowerCase();
    const roleName = (c.jobRole || '').toLowerCase();
    const vendorName = (c.vendor?.vendorName || c.vendorName || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || email.includes(query) || roleName.includes(query) || vendorName.includes(query);
  });

  const columns = [
    { 
      header: 'Contractor Name', 
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold text-xs shrink-0">
            <User className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block leading-tight">
              {row.user?.name || row.name || 'Contractor'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {row.user?.email || row.email || (row.id ? String(row.id).substring(0, 8) : '')}
            </span>
          </div>
        </div>
      )
    },
    { 
      header: 'Vendor Agency', 
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {row.vendor?.vendorName || row.vendorName || 'Unassigned'}
        </span>
      )
    },
    { 
      header: 'Job Role', 
      cell: (row) => <span className="font-medium text-slate-800 dark:text-slate-200">{row.jobRole || row.role || '-'}</span>
    },
    { 
      header: 'Hourly Rate', 
      cell: (row) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          ${Number(row.hourlyRate || 0).toLocaleString()}/hr
        </span>
      ) 
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status || 'ACTIVE'} /> },
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
            <>
              <button 
                onClick={() => openEditModal(row)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors"
                title="Edit Profile"
              >
                <Edit className="h-4 w-4" />
              </button>
              {(role === 'ADMIN' || role === 'MANAGER') && (
                <button 
                  onClick={() => openDeleteModal(row)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 transition-colors"
                  title="Delete Contractor"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
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
            Contractors
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage external talent profiles, billing rates, and vendor affiliations.
          </p>
        </div>
        {(role === 'ADMIN' || role === 'MANAGER' || role === 'VENDOR') && (
          <Button onClick={openAddModal} className="flex items-center gap-1.5 self-start sm:self-auto shadow-sm">
            <Plus className="h-4 w-4" />
            Add Contractor
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
              placeholder="Search contractors by name, role, or vendor..." 
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" 
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filteredContractors.length} contractor{filteredContractors.length === 1 ? '' : 's'}
          </span>
        </div>
        <DataTable columns={columns} data={filteredContractors} keyField="id" />
      </div>

      {/* Add Contractor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Contractor"
      >
        <form onSubmit={handleCreateContractor} className="space-y-4 py-2">
          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Doe"
              required
            />
            <FormInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. john.doe@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0199"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Vendor Company <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {vendors.length === 0 ? (
                  <option value="">No vendors available</option>
                ) : (
                  vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.vendorName || v.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Job Role"
              value={formData.jobRole}
              onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
              placeholder="e.g. Senior Full Stack Engineer"
              required
            />
            <FormInput
              label="Hourly Rate ($/hr)"
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              placeholder="65"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormInput
              label="Contract Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <FormInput
              label="Contract End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ON_LEAVE">ON_LEAVE</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Add Contractor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Contractor Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Contractor Profile"
      >
        <form onSubmit={handleUpdateContractor} className="space-y-4 py-2">
          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor</label>
            <select
              value={formData.vendorId}
              onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
              className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vendorName || v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Job Role"
              value={formData.jobRole}
              onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
              required
            />
            <FormInput
              label="Hourly Rate ($/hr)"
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormInput
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <FormInput
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ON_LEAVE">ON_LEAVE</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Contractor Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Contractor Profile"
      >
        {selectedContractor && (
          <div className="space-y-4 py-2 text-sm">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedContractor.user?.name || selectedContractor.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={selectedContractor.status || 'ACTIVE'} />
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                    ${Number(selectedContractor.hourlyRate || 0).toLocaleString()}/hr
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Mail className="h-3.5 w-3.5" /> Email</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedContractor.user?.email || selectedContractor.email || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Phone className="h-3.5 w-3.5" /> Phone</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedContractor.user?.phone || selectedContractor.phone || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Briefcase className="h-3.5 w-3.5" /> Job Role</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedContractor.jobRole || '-'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Building2 className="h-3.5 w-3.5" /> Vendor</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedContractor.vendor?.vendorName || selectedContractor.vendorName || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Calendar className="h-3.5 w-3.5" /> Start Date</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedContractor.startDate || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Calendar className="h-3.5 w-3.5" /> End Date</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedContractor.endDate || 'N/A'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Contractor"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete contractor <strong className="text-slate-900 dark:text-white">{selectedContractor?.user?.name || selectedContractor?.name}</strong>?
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteContractor} isLoading={submitting}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
