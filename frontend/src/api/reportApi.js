import apiClient from './axios';

const extractData = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content;
  if (d?.data !== undefined) return d.data;
  return d || {};
};

export const getDashboardMetrics = async () => {
  const response = await apiClient.get('/reports/dashboard');
  return extractData(response);
};

export const getBillingReport = async (params) => {
  const response = await apiClient.get('/reports/billing', { params });
  return extractData(response);
};

export const getVendorPerformanceReport = async () => {
  const response = await apiClient.get('/reports/vendor-performance');
  return extractData(response);
};

export const getContractorHoursReport = async (params) => {
  const response = await apiClient.get('/reports/contractor-hours', { params });
  return extractData(response);
};
