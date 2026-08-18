import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/userApi';
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
  UserCheck, 
  Mail, 
  Phone, 
  Shield, 
  KeyRound, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ManagersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const { role: currentUserRole } = useAuth();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'MANAGER',
    password: 'Password123!',
    status: 'ACTIVE'
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsersList = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getUsers();
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setUsers(list);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'MANAGER',
      password: 'Password123!',
      status: 'ACTIVE'
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and Email are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await createUser(formData);
      setSuccessMsg(`Manager account for ${formData.name} created successfully with login credentials!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsAddModalOpen(false);
      fetchUsersList(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create manager account.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'MANAGER',
      password: '', // blank unless resetting
      status: user.status || 'ACTIVE'
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and Email are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await updateUser(selectedUser.id, formData);
      setSuccessMsg('User profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsEditModalOpen(false);
      fetchUsersList(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await deleteUser(selectedUser.id);
      setSuccessMsg('User account removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsDeleteModalOpen(false);
      fetchUsersList(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    return name.includes(query) || email.includes(query) || phone.includes(query);
  });

  const columns = [
    {
      header: 'Manager Name',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {row.name ? row.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-xs block leading-tight">
              {row.name}
            </span>
            <span className="text-[11px] text-slate-400">
              ID: {String(row.id || '').substring(0, 8)}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Email Address / Login ID',
      cell: (row) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {row.email}
        </span>
      )
    },
    {
      header: 'Role',
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {row.role}
        </span>
      )
    },
    {
      header: 'Phone',
      cell: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {row.phone || 'N/A'}
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
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => openViewModal(row)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors"
            title="Edit / Reset Password"
          >
            <Edit className="h-4 w-4" />
          </button>
          {row.email !== 'admin@example.com' && (
            <button
              onClick={() => openDeleteModal(row)}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 transition-colors"
              title="Delete Account"
            >
              <Trash2 className="h-4 w-4" />
            </button>
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
            Managers & Identity Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Create project manager logins, configure system access roles, and provision login passwords.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            onClick={() => fetchUsersList(true)} 
            isLoading={refreshing}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          {currentUserRole === 'ADMIN' && (
            <Button onClick={openAddModal} className="flex items-center gap-1.5 text-xs shadow-sm">
              <Plus className="h-4 w-4" />
              Add Manager
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3.5 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg">
            {[
              { key: 'ALL', label: `All Users (${users.length})` },
              { key: 'MANAGER', label: `Managers (${users.filter(u => u.role === 'MANAGER').length})` },
              { key: 'ADMIN', label: `Admins (${users.filter(u => u.role === 'ADMIN').length})` },
              { key: 'VENDOR', label: `Vendors (${users.filter(u => u.role === 'VENDOR').length})` },
              { key: 'CONTRACTOR', label: `Contractors (${users.filter(u => u.role === 'CONTRACTOR').length})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setRoleFilter(tab.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  roleFilter === tab.key
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
              placeholder="Search by name, email, phone..."
              className="h-8.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-3">
              <UserCheck className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No accounts found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Click "Add Manager" to create credentials and provision access to the portal.
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredUsers} keyField="id" />
        )}
      </div>

      {/* Add Manager / User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Project Manager / User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 py-2">
          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <FormInput
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Michael Manager"
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Email Address (Login Username)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. manager@example.com"
              required
            />
            <FormInput
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0102"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Account Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="MANAGER">MANAGER (Project Manager)</option>
                <option value="ADMIN">ADMIN (System Administrator)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <FormInput
            label="Initial Login Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="e.g. Password123!"
            required
            helperText="This password will be encrypted and saved in the database for login."
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Credentials
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User & Reset Password"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4 py-2">
          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <FormInput
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <FormInput
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="VENDOR">VENDOR</option>
                <option value="CONTRACTOR">CONTRACTOR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 border shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <FormInput
            label="Reset Password (Leave blank to keep unchanged)"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter new password to reset"
          />

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

      {/* View User Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="User Account Details"
      >
        {selectedUser && (
          <div className="space-y-4 py-2 text-sm">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{selectedUser.name}</h3>
                  <StatusBadge status={selectedUser.status || 'ACTIVE'} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Role: <strong className="text-slate-800 dark:text-slate-200">{selectedUser.role}</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Mail className="h-3.5 w-3.5" /> Email Address</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedUser.email}</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 p-3 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium"><Phone className="h-3.5 w-3.5" /> Phone</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedUser.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove User Account"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to remove the account for <strong className="text-slate-900 dark:text-white">{selectedUser?.name}</strong> ({selectedUser?.email})?
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteUser} isLoading={submitting}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
