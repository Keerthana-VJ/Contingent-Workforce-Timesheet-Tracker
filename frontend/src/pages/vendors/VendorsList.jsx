import React, { useState, useEffect } from 'react';
import { getVendors, createVendor, updateVendor, deleteVendor } from '../../api/vendorApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { Plus, Eye, Edit, Trash2, Building2, CheckCircle, AlertCircle, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const VendorsList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { role } = useAuth();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    vendorName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    contractStartDate: '',
    contractEndDate: '',
    status: 'ACTIVE'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchVendorsList = async () => {
    setLoading(true);
    try {
      const data = await getVendors();
      const list = Array.isArray(data) ? data : (data?.content || data?.data?.content || data?.data || []);
      setVendors(list);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorsList();
  }, []);

  const openAddModal = () => {
    setFormData({
      vendorName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      contractStartDate: new Date().toISOString().split('T')[0],
      contractEndDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE'
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    if (!formData.vendorName.trim() || !formData.email.trim()) {
      setFormError('Vendor Name and Email are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await createVendor(formData);
      setSuccessMsg('Vendor created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsAddModalOpen(false);
      fetchVendorsList();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create vendor. Check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const openViewModal = (vendor) => {
    setSelectedVendor(vendor);
    setIsViewModalOpen(true);
  };

  const openEditModal = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      vendorName: vendor.vendorName || vendor.name || '',
      contactPerson: vendor.contactPerson || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      contractStartDate: vendor.contractStartDate || '',
      contractEndDate: vendor.contractEndDate || '',
      status: vendor.status || 'ACTIVE'
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateVendor = async (e) => {
    e.preventDefault();
    if (!formData.vendorName.trim() || !formData.email.trim()) {
      setFormError('Vendor Name and Email are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await updateVendor(selectedVendor.id, formData);
      setSuccessMsg('Vendor updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsEditModalOpen(false);
      fetchVendorsList();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update vendor.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteVendor = async () => {
    if (!selectedVendor) return;
    setSubmitting(true);
    try {
      await deleteVendor(selectedVendor.id);
      setSuccessMsg('Vendor deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsDeleteModalOpen(false);
      fetchVendorsList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete vendor.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVendors = vendors.filter(v => {
    const name = (v.vendorName || v.name || '').toLowerCase();
    const email = (v.email || '').toLowerCase();
    const contact = (v.contactPerson || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || email.includes(query) || contact.includes(query);
  });

  const columns = [
    { 
      header: 'Vendor Name', 
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-semibold text-xs shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block leading-tight">
              {row.vendorName || row.name || 'Unnamed Vendor'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {row.contactPerson ? `Contact: ${row.contactPerson}` : (row.id ? String(row.id).substring(0, 8) : '')}
            </span>
          </div>
        </div>
      )
    },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Phone', 
      cell: (row) => row.phone || '-' 
    },
    { 
      header: 'Active Contractors', 
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          {row.contractorCount ?? row.activeContractors ?? 0} Contractors
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
          {(role === 'ADMIN' || role === 'MANAGER') && (
            <>
              <button 
                onClick={() => openEditModal(row)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors"
                title="Edit Vendor"
              >
                <Edit className="h-4 w-4" />
              </button>
              {role === 'ADMIN' && (
                <button 
                  onClick={() => openDeleteModal(row)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 transition-colors"
                  title="Delete Vendor"
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
            Vendors
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage agency partners, contracting firms, and staffing agreements.
          </p>
        </div>
        {(role === 'ADMIN' || role === 'MANAGER') && (
          <Button onClick={openAddModal} className="flex items-center gap-1.5 self-start sm:self-auto shadow-sm">
            <Plus className="h-4 w-4" />
            Add Vendor
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
              placeholder="Search vendors by name, contact, or email..." 
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" 
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filteredVendors.length} vendor{filteredVendors.length === 1 ? '' : 's'}
          </span>
        </div>
        <DataTable columns={columns} data={filteredVendors} keyField="id" />
      </div>

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Vendor"
      >
        <form onSubmit={handleCreateVendor} className="space-y-4 py-2">
          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <FormInput
            label="Vendor Company Name"
            value={formData.vendorName}
            onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
            placeholder="e.g. Apex Global Technologies"
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Contact Person"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="e.g. Victor Vendor"
            />
            <FormInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. vendor@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0100"
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
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>

          <FormInput
            label="Headquarters Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="100 Silicon Way, San Jose, CA"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Contract Start Date"
              type="date"
              value={formData.contractStartDate}
              onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
            />
            <FormInput
              label="Contract End Date"
              type="date"
              value={formData.contractEndDate}
              onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Vendor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Vendor Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Vendor"
      >
        <form onSubmit={handleUpdateVendor} className="space-y-4 py-2">
          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <FormInput
            label="Vendor Company Name"
            value={formData.vendorName}
            onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Contact Person"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />
            <FormInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>

          <FormInput
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Contract Start Date"
              type="date"
              value={formData.contractStartDate}
              onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
            />
            <FormInput
              label="Contract End Date"
              type="date"
              value={formData.contractEndDate}
              onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Vendor Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Vendor Profile"
      >
        {selectedVendor && (
          <div className="space-y-4 py-2 text-sm">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-lg">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedVendor.vendorName || selectedVendor.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={selectedVendor.status || 'ACTIVE'} />
                  <span className="text-xs text-slate-500">
                    {selectedVendor.contractorCount ?? selectedVendor.activeContractors ?? 0} active contractors
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Mail className="h-3.5 w-3.5" /> Email</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedVendor.email || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Phone className="h-3.5 w-3.5" /> Phone</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedVendor.phone || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Calendar className="h-3.5 w-3.5" /> Contract Start</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedVendor.contractStartDate || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Calendar className="h-3.5 w-3.5" /> Contract End</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedVendor.contractEndDate || 'N/A'}</span>
              </div>
            </div>

            {selectedVendor.address && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 text-xs space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><MapPin className="h-3.5 w-3.5" /> Address</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">{selectedVendor.address}</p>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Vendor"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete vendor <strong className="text-slate-900 dark:text-white">{selectedVendor?.vendorName || selectedVendor?.name}</strong>?
            This will remove all associated configurations.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteVendor} isLoading={submitting}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
