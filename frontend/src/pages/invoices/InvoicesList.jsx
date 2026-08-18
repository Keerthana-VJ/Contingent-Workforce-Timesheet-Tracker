import React, { useState, useEffect } from 'react';
import { getInvoices } from '../../api/invoiceApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Plus, Eye, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getInvoices();
        setInvoices(data);
      } catch (error) {
        console.error("Failed to fetch invoices", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const columns = [
    { header: 'Invoice #', accessor: 'invoiceNumber' },
    { header: 'Vendor', accessor: 'vendorName' },
    { header: 'Project', accessor: 'projectName' },
    { header: 'Period', accessor: 'billingPeriod' },
    { 
      header: 'Total Amount', 
      cell: (row) => (
        <div className="flex flex-col">
          <span>${row.totalAmount.toLocaleString()}</span>
          {row.differenceAmount > 0 && (
            <span className="flex items-center text-xs font-semibold text-red-600 dark:text-red-400 mt-1" title={`Difference: $${row.differenceAmount.toLocaleString()}`}>
              <AlertTriangle className="mr-1 h-3 w-3" /> Mismatch
            </span>
          )}
        </div>
      ) 
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Submitted', accessor: 'submittedDate' },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex space-x-2">
          <button className="text-slate-400 hover:text-primary-600 transition-colors">
            <Eye className="h-4 w-4" />
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
          Invoices
        </h1>
        {role === 'VENDOR' && (
          <Button className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        )}
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <DataTable columns={columns} data={invoices} keyField="id" />
      </div>
    </div>
  );
};
