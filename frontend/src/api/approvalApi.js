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

export const getPendingApprovals = async () => {
  try {
    // Attempt to fetch from official approvals endpoint first
    const response = await apiClient.get('/approvals/pending');
    const data = extractData(response);
    if (Array.isArray(data) && data.length > 0) {
      return data.map(item => ({
        id: item.id || `app-${Math.random()}`,
        originalId: item.entityId || item.id,
        type: item.entityType ? (item.entityType.charAt(0) + item.entityType.slice(1).toLowerCase()) : 'Item',
        reference: item.entityId ? item.entityId.substring(0, 8) : 'REF-101',
        submittedBy: item.submittedBy?.name || 'Contractor',
        project: item.projectName || 'General',
        amountOrHours: item.amount ? `$${Number(item.amount).toLocaleString()}` : (item.hours ? `${item.hours} hrs` : '-'),
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Today',
        status: item.status || 'PENDING'
      }));
    }
  } catch {
    // Fallback to synthesizing from timesheets and invoices
  }

  try {
    const [timesheetsRes, invoicesRes] = await Promise.all([
      apiClient.get('/timesheets'),
      apiClient.get('/invoices')
    ]);

    const timesheets = extractData(timesheetsRes);
    const invoices = extractData(invoicesRes);
    
    const pendingTimesheets = (Array.isArray(timesheets) ? timesheets : [])
      .filter(t => t.status === 'Submitted' || t.status === 'SUBMITTED' || t.status === 'Review Required')
      .map(t => ({
        id: `ts-${t.id}`,
        originalId: t.id,
        type: 'Timesheet',
        reference: `TS-${(t.id || '').toString().substring(0, 8).toUpperCase()}`,
        submittedBy: t.contractorName || t.contractor?.user?.name || 'Contractor',
        project: t.projectName || t.project?.projectName || 'Project',
        amountOrHours: `${t.totalHours || 0} hrs`,
        date: t.submittedDate || t.workDate || new Date().toISOString().split('T')[0],
        status: t.status
      }));

    const pendingInvoices = (Array.isArray(invoices) ? invoices : [])
      .filter(i => i.status === 'Under Review' || i.status === 'UNDER_REVIEW' || i.status === 'Submitted' || i.status === 'SUBMITTED')
      .map(i => ({
        id: `inv-${i.id}`,
        originalId: i.id,
        type: 'Invoice',
        reference: i.invoiceNumber || `INV-${(i.id || '').toString().substring(0, 8).toUpperCase()}`,
        submittedBy: i.vendorName || i.vendor?.vendorName || 'Vendor',
        project: i.projectName || i.project?.projectName || 'Project',
        amountOrHours: `$${(Number(i.totalAmount) || 0).toLocaleString()}`,
        date: i.submittedDate || i.createdAt || new Date().toISOString().split('T')[0],
        status: i.status
      }));

    return [...pendingTimesheets, ...pendingInvoices];
  } catch (error) {
    console.error("Error fetching approvals", error);
    return [];
  }
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


