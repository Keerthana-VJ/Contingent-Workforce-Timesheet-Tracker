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

export const getMilestones = async () => {
  const response = await apiClient.get('/milestones');
  return extractData(response);
};

export const getMilestone = async (id) => {
  const response = await apiClient.get(`/milestones/${id}`);
  return extractData(response);
};

