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

export const getInvoices = async () => {
  const response = await apiClient.get('/invoices');
  return extractData(response);
};

export const getInvoice = async (id) => {
  const response = await apiClient.get(`/invoices/${id}`);
  return extractData(response);
};

export const submitInvoice = async (id) => {
  const response = await apiClient.post(`/invoices/${id}/submit`);
  return extractData(response);
};

export const approveInvoice = async (id) => {
  const response = await apiClient.post(`/invoices/${id}/approve`);
  return extractData(response);
};

export const rejectInvoice = async (id, reason) => {
  const response = await apiClient.post(`/invoices/${id}/reject`, { reason });
  return extractData(response);
};

export const markPaidInvoice = async (id) => {
  const response = await apiClient.post(`/invoices/${id}/mark-paid`);
  return extractData(response);
};


