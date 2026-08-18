import apiClient from './axios';

const extractData = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content;
  if (d?.data !== undefined) return d.data;
  return d || [];
};

export const getAllApprovals = async () => {
  try {
    const [timesheetsRes, invoicesRes] = await Promise.all([
      apiClient.get('/timesheets'),
      apiClient.get('/invoices')
    ]);

    const timesheets = extractData(timesheetsRes);
    const invoices = extractData(invoicesRes);
    
    const formattedTimesheets = (Array.isArray(timesheets) ? timesheets : []).map(t => {
      const s = (t.status || '').toUpperCase();
      let normalizedStatus = 'PENDING';
      if (s === 'APPROVED') normalizedStatus = 'APPROVED';
      else if (s === 'REJECTED') normalizedStatus = 'REJECTED';
      else if (s === 'SUBMITTED' || s === 'UNDER_REVIEW' || s === 'REVIEW REQUIRED') normalizedStatus = 'PENDING';
      else normalizedStatus = s;

      return {
        id: `ts-${t.id}`,
        originalId: t.id,
        type: 'Timesheet',
        reference: `TS-${(t.id || '').toString().substring(0, 8).toUpperCase()}`,
        submittedBy: t.contractorName || t.contractor?.user?.name || 'Contractor',
        project: t.projectName || t.project?.projectName || 'General Delivery',
        amountOrHours: `${t.totalHours || 0} hrs`,
        date: t.submittedDate || t.workDate || (t.createdAt ? new Date(t.createdAt).toLocaleDateString() : new Date().toISOString().split('T')[0]),
        status: normalizedStatus,
        rawStatus: t.status,
        rejectionReason: t.rejectionReason,
        approverName: t.approvedBy?.name || 'Manager'
      };
    });

    const formattedInvoices = (Array.isArray(invoices) ? invoices : []).map(i => {
      const s = (i.status || '').toUpperCase();
      let normalizedStatus = 'PENDING';
      if (s === 'APPROVED' || s === 'PAID') normalizedStatus = 'APPROVED';
      else if (s === 'REJECTED') normalizedStatus = 'REJECTED';
      else if (s === 'SUBMITTED' || s === 'UNDER_REVIEW' || s === 'UNDER REVIEW') normalizedStatus = 'PENDING';
      else normalizedStatus = s;

      return {
        id: `inv-${i.id}`,
        originalId: i.id,
        type: 'Invoice',
        reference: i.invoiceNumber || `INV-${(i.id || '').toString().substring(0, 8).toUpperCase()}`,
        submittedBy: i.vendorName || i.vendor?.vendorName || 'Vendor Partner',
        project: i.projectName || i.project?.projectName || 'Project',
        amountOrHours: `$${(Number(i.totalAmount) || 0).toLocaleString()}`,
        date: i.submittedDate || (i.submittedAt ? new Date(i.submittedAt).toLocaleDateString() : (i.createdAt ? new Date(i.createdAt).toLocaleDateString() : new Date().toISOString().split('T')[0])),
        status: normalizedStatus,
        rawStatus: i.status,
        rejectionReason: i.rejectionReason,
        approverName: i.approvedBy?.name || 'Manager'
      };
    });

    return [...formattedTimesheets, ...formattedInvoices];
  } catch (error) {
    console.error("Error fetching approvals", error);
    return [];
  }
};

export const getPendingApprovals = async () => {
  const all = await getAllApprovals();
  return all.filter(a => a.status === 'PENDING');
};

export const approveApprovalItem = async (item) => {
  const type = (item.type || '').toLowerCase();
  if (type === 'timesheet') {
    const res = await apiClient.post(`/timesheets/${item.originalId}/approve`);
    return extractData(res);
  } else if (type === 'invoice') {
    const res = await apiClient.post(`/invoices/${item.originalId}/approve`);
    return extractData(res);
  } else {
    const res = await apiClient.post(`/approvals/${item.id || item.originalId}/approve`);
    return extractData(res);
  }
};

export const rejectApprovalItem = async (item, reason) => {
  const type = (item.type || '').toLowerCase();
  if (type === 'timesheet') {
    const res = await apiClient.post(`/timesheets/${item.originalId}/reject`, { reason });
    return extractData(res);
  } else if (type === 'invoice') {
    const res = await apiClient.post(`/invoices/${item.originalId}/reject`, { reason });
    return extractData(res);
  } else {
    const res = await apiClient.post(`/approvals/${item.id || item.originalId}/reject`, { reason });
    return extractData(res);
  }
};


