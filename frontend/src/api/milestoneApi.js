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

export const getMilestones = async (params) => {
  const response = await apiClient.get('/milestones', { params });
  return extractData(response);
};

export const getMilestone = async (id) => {
  const response = await apiClient.get(`/milestones/${id}`);
  return extractData(response);
};

export const createMilestone = async (data) => {
  const response = await apiClient.post('/milestones', data);
  return extractData(response);
};

export const updateMilestone = async (id, data) => {
  const response = await apiClient.put(`/milestones/${id}`, data);
  return extractData(response);
};

export const approveMilestone = async (id) => {
  const response = await apiClient.post(`/milestones/${id}/approve`);
  return extractData(response);
};

export const completeMilestone = async (id) => {
  const response = await apiClient.post(`/milestones/${id}/complete`);
  return extractData(response);
};

export const deleteMilestone = async (id) => {
  const response = await apiClient.delete(`/milestones/${id}`);
  return extractData(response);
};
