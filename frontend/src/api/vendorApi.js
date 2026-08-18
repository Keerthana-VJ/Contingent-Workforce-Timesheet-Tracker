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

export const getVendors = async () => {
  const response = await apiClient.get('/vendors');
  return extractData(response);
};

export const getVendor = async (id) => {
  const response = await apiClient.get(`/vendors/${id}`);
  return extractData(response);
};

export const createVendor = async (data) => {
  const response = await apiClient.post('/vendors', data);
  return extractData(response);
};

export const updateVendor = async (id, data) => {
  const response = await apiClient.put(`/vendors/${id}`, data);
  return extractData(response);
};

export const deleteVendor = async (id) => {
  const response = await apiClient.delete(`/vendors/${id}`);
  return extractData(response);
};

