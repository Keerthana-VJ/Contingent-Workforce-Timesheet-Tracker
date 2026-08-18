import apiClient from './axios';

export const getPendingApprovals = async () => {
  // For mock purposes, we'll just fetch timesheets and invoices and filter them here, 
  // or we could define a specific endpoint. Let's just use the mock endpoint we can add or construct from others.
  // We didn't define /approvals/pending in mock yet, but we can just use timesheets and invoices API in the component for now, or add it to mock.
  // Actually, let's just make a mock call and we will handle it in mockAdapter if we want, or handle it via timesheets/invoices.
  
  // To keep it simple, we'll fetch from /timesheets and /invoices and filter in the frontend for the demo if the endpoint isn't there.
  try {
    const [timesheets, invoices] = await Promise.all([
      apiClient.get('/timesheets'),
      apiClient.get('/invoices')
    ]);
    
    const pendingTimesheets = timesheets.data
      .filter(t => t.status === 'Submitted')
      .map(t => ({
        id: `ts-${t.id}`,
        originalId: t.id,
        type: 'Timesheet',
        reference: `TS-${t.id.toUpperCase()}`,
        submittedBy: t.contractorName,
        project: t.projectName,
        amountOrHours: `${t.totalHours} hrs`,
        date: t.submittedDate,
        status: t.status
      }));

    const pendingInvoices = invoices.data
      .filter(i => i.status === 'Under Review')
      .map(i => ({
        id: `inv-${i.id}`,
        originalId: i.id,
        type: 'Invoice',
        reference: i.invoiceNumber,
        submittedBy: i.vendorName,
        project: i.projectName,
        amountOrHours: `$${i.totalAmount.toLocaleString()}`,
        date: i.submittedDate,
        status: i.status
      }));

    return [...pendingTimesheets, ...pendingInvoices];
  } catch (error) {
    console.error("Error fetching approvals", error);
    return [];
  }
};
