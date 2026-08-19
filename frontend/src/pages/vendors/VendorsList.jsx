import React, { useState, useEffect } from 'react';
import { getVendors, createVendor, updateVendor, deleteVendor } from '../../api/vendorApi';
import { getUsers } from '../../api/userApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  UserCheck,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const VendorsList = () => {
  const [vendors, setVendors] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    status: 'ACTIVE',
    managerId: '',
    password: 'Password123!'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchVendorsList = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const [vData, uData] = await Promise.all([
        getVendors(),
        getUsers({ role: 'MANAGER' })
      ]);
      const vList = Array.isArray(vData) ? vData : (vData?.content || vData?.data?.content || vData?.data || []);
      const uList = Array.isArray(uData) ? uData : (uData?.content || uData?.data?.content || uData?.data || []);
      setVendors(vList);
      setManagers(uList.filter(u => u.role === 'MANAGER'));
    } catch (error) {
      console.error("Failed to fetch vendors", error);
      setVendors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      status: 'ACTIVE',
      managerId: managers.length > 0 ? managers[0].id : '',
      password: 'Password123!'
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
      setSuccessMsg('Vendor created and mapped to Manager successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsAddModalOpen(false);
      fetchVendorsList(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create vendor.');
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
      status: vendor.status || 'ACTIVE',
      managerId: vendor.managerId || (managers.length > 0 ? managers[0].id : '')
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
      fetchVendorsList(true);
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
      fetchVendorsList(true);
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
    const mgr = (v.managerName || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || email.includes(query) || contact.includes(query) || mgr.includes(query);
  });

  const columns = [
    { 
      header: 'Vendor Agency', 
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-semibold text-xs shrink-0">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block text-xs leading-tight">
              {row.vendorName || row.name || 'Unnamed Vendor'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              {row.contactPerson ? `Contact: ${row.contactPerson}` : (row.email || '')}
            </span>
          </div>
        </div>
      )
    },
    { 
      header: 'Assigned Manager', 
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs text-xs">
            <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
            {row.managerName || 'Unassigned'}
          </span>
          {row.managerEmail && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-1">
              {row.managerEmail}
            </span>
          )}
        </div>
      )
    },

    { 
      header: 'Contractors Mapped', 
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          {row.contractorCount ?? row.activeContractors ?? 0} Contractors
        </span>
      )
    },
    { 
      header: 'Contact Info', 
      cell: (row) => (
        <div className="text-xs space-y-0.5 text-slate-600 dark:text-slate-400">
          <div className="font-medium text-slate-900 dark:text-slate-200">{row.email || '-'}</div>
          <div className="text-[11px]">{row.phone || '-'}</div>
        </div>
      ) 
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status || 'ACTIVE'} /> },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => openViewModal(row)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800 transition-colors"
            title="View Details & Mapping"
          >
            <Eye className="h-4 w-4" />
          </button>
          {(role === 'ADMIN' || role === 'MANAGER') && (
            <>
              <button 
                onClick={() => openEditModal(row)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors"
                title="Edit Vendor & Manager"
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
    }
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
            Vendor Agencies
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage partner vendor companies, contract terms, and their assigned Account/Project Managers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            onClick={() => fetchVendorsList(true)} 
            isLoading={refreshing}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          {(role === 'ADMIN' || role === 'MANAGER') && (
            <Button onClick={openAddModal} className="flex items-center gap-1.5 text-xs shadow-sm">
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          )}
        </div>
      </div>

      {/* Hierarchy Info Banner */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-0.5">Organizational Hierarchy Structure:</strong>
          <span>
            Every <strong>Contractor</strong> is mapped to a partner <strong>Vendor Agency</strong>, and each Vendor Agency is directly assigned to an enterprise <strong>Project / Account Manager</strong> for authorization workflows.
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Registered Agencies ({vendors.length})
          </span>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendor or assigned manager..." 
            className="h-8.5 w-72 rounded-lg border border-slate-300 bg-white px-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" 
          />
        </div>

        {filteredVendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No vendors found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add vendor agencies and map them to Project Managers to begin onboarding contractors.
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredVendors} keyField="id" />
        )}
      </div>

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Vendor Agency"
      >
        <form onSubmit={handleCreateVendor} className="space-y-4 py-2">
          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <FormInput
            label="Vendor Company Name *"
            value={formData.vendorName}
            onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
            placeholder="e.g. Apex Global Technologies"
            required
          />

          {/* Assigned Manager Selection & Details */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-indigo-950 dark:text-indigo-200">
                Assigned Account / Project Manager <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded">
                Supervisory Mapping
              </span>
            </div>
            <select
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500 font-medium"
              required
            >
              <option value="">-- Select Manager to Supervise this Vendor --</option>
              {managers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
            {(() => {
              const selectedMgr = managers.find(m => String(m.id) === String(formData.managerId));
              if (!selectedMgr) return null;
              return (
                <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100 dark:border-slate-800 mt-1 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                      {selectedMgr.name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{selectedMgr.name}</span>
                      <span className="text-slate-500 dark:text-slate-400">{selectedMgr.email}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {selectedMgr.phone || 'Enterprise Manager'}
                  </span>
                </div>
              );
            })()}
            <p className="text-[11px] text-slate-500 mt-0.5">
              This Manager oversees this Vendor and approves their project deliverables and timesheets.
            </p>
          </div>


          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Contact Person"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="e.g. Victor Vendor"
            />
            <FormInput
              label="Email Address *"
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

          <FormInput
            label="Vendor Portal Login Password"
            type="password"
            value={formData.password || ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="e.g. Password123!"
            helperText="Credentials will be provisioned in the database so the vendor can log in immediately."
          />

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
        title="Edit Vendor & Manager Mapping"
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

          {/* Assigned Manager Selection & Details */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-indigo-950 dark:text-indigo-200">
                Assigned Account / Project Manager
              </label>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded">
                Supervisory Mapping
              </span>
            </div>
            <select
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500 font-medium"
            >
              <option value="">-- Select Manager to Supervise this Vendor --</option>
              {managers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
            {(() => {
              const selectedMgr = managers.find(m => String(m.id) === String(formData.managerId));
              if (!selectedMgr) return null;
              return (
                <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100 dark:border-slate-800 mt-1 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                      {selectedMgr.name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{selectedMgr.name}</span>
                      <span className="text-slate-500 dark:text-slate-400">{selectedMgr.email}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {selectedMgr.phone || 'Enterprise Manager'}
                  </span>
                </div>
              );
            })()}
          </div>


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
        title="Vendor Agency Profile"
      >
        {selectedVendor && (
          <div className="space-y-4 py-2 text-sm">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-lg">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedVendor.vendorName || selectedVendor.name}
                  </h3>
                  <StatusBadge status={selectedVendor.status || 'ACTIVE'} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Contact: {selectedVendor.contactPerson || 'Not provided'}
                </p>
              </div>
            </div>

            {/* Mapped Manager Card */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">
                    Assigned Account Manager
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {selectedVendor.managerName || 'Unassigned'}
                  </span>
                </div>
              </div>
              {selectedVendor.managerEmail && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedVendor.managerEmail}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Mail className="h-3.5 w-3.5" /> Email Address</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{selectedVendor.email || '-'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Phone className="h-3.5 w-3.5" /> Phone Number</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{selectedVendor.phone || '-'}</p>
              </div>
            </div>

            {selectedVendor.address && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 text-xs space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><MapPin className="h-3.5 w-3.5" /> Headquarters Address</span>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedVendor.address}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Calendar className="h-3.5 w-3.5" /> Contract Start</span>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedVendor.contractStartDate || 'N/A'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Calendar className="h-3.5 w-3.5" /> Contract End</span>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedVendor.contractEndDate || 'Ongoing'}</p>
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

      {/* Delete Vendor Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Vendor Deletion"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete vendor <strong className="text-slate-900 dark:text-white">{selectedVendor?.vendorName}</strong>?
          </p>
          <p className="text-xs text-red-600 dark:text-red-400">
            Warning: All associated contractor links and vendor profiles may be affected.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteVendor} isLoading={submitting}>
              Delete Vendor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
