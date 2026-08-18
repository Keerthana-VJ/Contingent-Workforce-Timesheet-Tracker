import apiClient from './axios';

export const getDashboardMetrics = async () => {
  const response = await apiClient.get('/reports/dashboard');
  return response.data;
};

export const getBillingReport = async () => {
  const response = await apiClient.get('/reports/billing');
  return response.data;
};
