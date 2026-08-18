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

export const getTimesheets = async (params) => {
  const response = await apiClient.get('/timesheets', { params });
  return extractData(response);
};

export const getTimesheet = async (id) => {
  const response = await apiClient.get(`/timesheets/${id}`);
  return extractData(response);
};

export const submitTimesheet = async (id) => {
  const response = await apiClient.post(`/timesheets/${id}/submit`);
  return extractData(response);
};

export const approveTimesheet = async (id) => {
  const response = await apiClient.post(`/timesheets/${id}/approve`);
  return extractData(response);
};

export const rejectTimesheet = async (id, reason) => {
  const response = await apiClient.post(`/timesheets/${id}/reject`, { reason });
  return extractData(response);
};

