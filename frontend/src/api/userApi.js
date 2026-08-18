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

export const getUsers = async (params) => {
  const response = await apiClient.get('/users', { params });
  return extractData(response);
};

export const getUser = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  return extractData(response);
};

export const createUser = async (data) => {
  const response = await apiClient.post('/users', data);
  return extractData(response);
};

export const updateUser = async (id, data) => {
  const response = await apiClient.put(`/users/${id}`, data);
  return extractData(response);
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/users/${id}`);
  return extractData(response);
};
