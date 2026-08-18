import React, { useState, useEffect } from 'react';
import { getContractors, createContractor, updateContractor, deleteContractor } from '../../api/contractorApi';
import { getVendors } from '../../api/vendorApi';
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
  User, 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Mail, 
  DollarSign, 
  Calendar, 
  Briefcase,
  UserCheck,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ContractorsList = () => {
  const [contractors, setContractors] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { role, user } = useAuth();

  // Find vendor company for logged in vendor user
  const myVendor = role === 'VENDOR'
    ? (vendors.find(v => 
        (v.email && user?.email && v.email.toLowerCase() === user.email.toLowerCase()) || 
        (v.contactPerson && user?.name && v.contactPerson.toLowerCase() === user.name.toLowerCase())
      ) || vendors[0])
    : null;

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
    status: 'ACTIVE',
    password: 'Password123!'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchContractorsList = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContractorsList();
  }, []);

  const openAddModal = () => {
    const defaultVendorId = myVendor?.id || (vendors.length > 0 ? vendors[0].id : '');
    setFormData({
      name: '',
      email: '',
      phone: '',
      vendorId: defaultVendorId,
      jobRole: '',
      hourlyRate: '65',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE',
      password: 'Password123!'
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCreateContractor = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.vendorId || !formData.jobRole.trim() || !formData.hourlyRate) {
      setFormError('Please fill in all required fields (Name, Email, Vendor Agency, Job Role, Rate).');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await createContractor({
        ...formData,
        hourlyRate: Number(formData.hourlyRate)
      });
      setSuccessMsg('Contractor registered and mapped to Vendor successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsAddModalOpen(false);
      fetchContractorsList(true);
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
    if (!formData.name.trim() || !formData.email.trim() || !formData.jobRole.trim() || !formData.hourlyRate) {
      setFormError('Name, Email, Job Role, and Hourly Rate are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await updateContractor(selectedContractor.id, {
        ...formData,
        hourlyRate: Number(formData.hourlyRate)
      });
      setSuccessMsg('Contractor profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsEditModalOpen(false);
      fetchContractorsList(true);
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
      setSuccessMsg('Contractor removed successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsDeleteModalOpen(false);
      fetchContractorsList(true);
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
    const vName = (c.vendor?.vendorName || c.vendorName || '').toLowerCase();
    const mgrName = (c.vendor?.managerName || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || email.includes(query) || roleName.includes(query) || vName.includes(query) || mgrName.includes(query);
  });

  const columns = [
    { 
      header: 'Contractor Name', 
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold text-xs shrink-0">
            <User className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block text-xs leading-tight">
              {row.user?.name || row.name || 'Contractor'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              {row.user?.email || row.email || (row.id ? String(row.id).substring(0, 8) : '')}
            </span>
          </div>
        </div>
      )
    },
    { 
      header: 'Vendor Agency', 
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Building2 className="h-3 w-3" />
            {row.vendor?.vendorName || row.vendorName || 'Unassigned'}
          </span>
        </div>
      )
    },
    { 
      header: 'Assigned Manager', 
      cell: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <UserCheck className="h-3 w-3 text-indigo-500" />
          {row.vendor?.managerName || 'Unassigned'}
        </span>
      )
    },
    { 
      header: 'Job Role', 
      cell: (row) => <span className="font-medium text-xs text-slate-800 dark:text-slate-200">{row.jobRole || row.role || '-'}</span>
    },
    { 
      header: 'Hourly Rate', 
      cell: (row) => (
        <span className="font-bold text-xs text-slate-900 dark:text-white">
          ${Number(row.hourlyRate || 0).toLocaleString()}/hr
        </span>
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
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-in fade-in duration-200">
          <CheckCircle className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Contractors
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage external talent profiles, billing rates, vendor affiliations, and supervisory hierarchy.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            onClick={() => fetchContractorsList(true)} 
            isLoading={refreshing}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          {(role === 'ADMIN' || role === 'MANAGER' || role === 'VENDOR') && (
            <Button onClick={openAddModal} className="flex items-center gap-1.5 self-start sm:self-auto shadow-sm text-xs">
              <Plus className="h-4 w-4" />
              Add Contractor
            </Button>
          )}
        </div>
      </div>

      {/* Hierarchy Info Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/30 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-0.5">Two-Tier Governance Hierarchy:</strong>
          <span>
            <strong>Contractor</strong> is mapped to a partner <strong>Vendor Agency</strong>, which is supervised by an enterprise <strong>Project Manager</strong>.
          </span>
        </div>
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Active Workforce ({contractors.length})
          </span>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contractor, vendor agency, or manager..." 
            className="h-8.5 w-80 rounded-lg border border-slate-300 bg-white px-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" 
          />
        </div>
        {filteredContractors.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <User className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No contractors found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add contractors and map them to active vendor agencies to begin managing timesheets.
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredContractors} keyField="id" />
        )}
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
              label="Full Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Doe"
              required
            />
            <FormInput
              label="Email Address *"
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
                Vendor Agency <span className="text-red-500">*</span>
              </label>
              {role === 'VENDOR' ? (
                <div className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 px-3 py-2 text-sm font-medium">
                  {myVendor ? (myVendor.vendorName || myVendor.name) : 'Your Agency'}
                </div>
              ) : (
                <select
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500 font-medium"
                  required
                >
                  <option value="">-- Select Vendor Agency --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.vendorName || v.name} {v.managerName ? `(Manager: ${v.managerName})` : ''}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[11px] text-slate-500 mt-1">
                Every contractor must be mapped to an authorized vendor partner.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Job Role *"
              value={formData.jobRole}
              onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
              placeholder="e.g. Senior Full Stack Engineer"
              required
            />
            <FormInput
              label="Hourly Rate ($/hr) *"
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

          <FormInput
            label="Contractor Portal Login Password"
            type="password"
            value={formData.password || ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="e.g. Password123!"
            helperText="User credentials will be created in the database so the contractor can log in directly."
          />

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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Mapped Vendor Agency
            </label>
            <select
              value={formData.vendorId}
              onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
              className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500 font-medium"
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vendorName || v.name} {v.managerName ? `(Manager: ${v.managerName})` : ''}
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
        title="Contractor Governance Profile"
      >
        {selectedContractor && (
          <div className="space-y-4 py-2 text-sm">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedContractor.user?.name || selectedContractor.name}
                  </h3>
                  <StatusBadge status={selectedContractor.status || 'ACTIVE'} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    ${Number(selectedContractor.hourlyRate || 0).toLocaleString()}/hr
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {selectedContractor.jobRole || 'Contractor'}
                  </span>
                </div>
              </div>
            </div>

            {/* Complete Hierarchy Card */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/30 space-y-2">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Two-Tier Mapping Chain
              </span>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-slate-700 shadow-xs">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>Vendor: {selectedContractor.vendor?.vendorName || selectedContractor.vendorName || 'N/A'}</span>
                </div>
                <span className="text-blue-500 font-bold">➔</span>
                <div className="flex items-center gap-1.5 font-semibold text-indigo-900 dark:text-indigo-200 bg-indigo-100/70 dark:bg-indigo-950/60 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  <span>Manager: {selectedContractor.vendor?.managerName || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Mail className="h-3.5 w-3.5" /> Email Address</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedContractor.user?.email || selectedContractor.email || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Phone className="h-3.5 w-3.5" /> Phone Number</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedContractor.user?.phone || selectedContractor.phone || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Calendar className="h-3.5 w-3.5" /> Start Date</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedContractor.startDate || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Calendar className="h-3.5 w-3.5" /> End Date</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedContractor.endDate || 'Ongoing'}</span>
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
