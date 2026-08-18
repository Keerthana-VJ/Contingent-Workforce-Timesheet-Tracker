import React, { useState, useEffect } from 'react';
import { getVendors } from '../../api/vendorApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

export const VendorsList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await getVendors();
        setVendors(data);
      } catch (error) {
        console.error("Failed to fetch vendors", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const columns = [
    { header: 'Vendor ID', accessor: 'id' },
    { header: 'Vendor Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Active Contractors', accessor: 'activeContractors' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex space-x-2">
          <button className="text-slate-400 hover:text-primary-600 transition-colors">
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-slate-400 hover:text-blue-600 transition-colors">
            <Edit className="h-4 w-4" />
          </button>
          <button className="text-slate-400 hover:text-red-600 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) 
    },
  ];

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Vendors
        </h1>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="flex gap-2">
             <input type="text" placeholder="Search vendors..." className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          </div>
        </div>
        <DataTable columns={columns} data={vendors} keyField="id" />
      </div>
    </div>
  );
};
