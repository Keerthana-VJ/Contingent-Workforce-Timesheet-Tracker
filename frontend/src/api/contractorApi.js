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

export const getContractors = async () => {
  const response = await apiClient.get('/contractors');
  return extractData(response);
};

export const getContractor = async (id) => {
  const response = await apiClient.get(`/contractors/${id}`);
  return extractData(response);
};

export const createContractor = async (data) => {
  const response = await apiClient.post('/contractors', data);
  return extractData(response);
};

export const updateContractor = async (id, data) => {
  const response = await apiClient.put(`/contractors/${id}`, data);
  return extractData(response);
};

export const deleteContractor = async (id) => {
  const response = await apiClient.delete(`/contractors/${id}`);
  return extractData(response);
};

