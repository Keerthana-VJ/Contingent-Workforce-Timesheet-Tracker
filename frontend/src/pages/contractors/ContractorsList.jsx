import React, { useState, useEffect } from 'react';
import { getContractors } from '../../api/contractorApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

export const ContractorsList = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const data = await getContractors();
        setContractors(data);
      } catch (error) {
        console.error("Failed to fetch contractors", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContractors();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Vendor', accessor: 'vendorName' },
    { header: 'Project', accessor: 'projectName' },
    { header: 'Role', accessor: 'jobRole' },
    { header: 'Rate', cell: (row) => `$${row.hourlyRate}/hr` },
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
          Contractors
        </h1>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Contractor
        </Button>
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <DataTable columns={columns} data={contractors} keyField="id" />
      </div>
    </div>
  );
};
