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

export const getProjects = async () => {
  const response = await apiClient.get('/projects');
  return extractData(response);
};

export const getProject = async (id) => {
  const response = await apiClient.get(`/projects/${id}`);
  return extractData(response);
};

export const createProject = async (data) => {
  const response = await apiClient.post('/projects', data);
  return extractData(response);
};

export const updateProject = async (id, data) => {
  const response = await apiClient.put(`/projects/${id}`, data);
  return extractData(response);
};

export const getMyProjects = async () => {
  const response = await apiClient.get('/projects/my-projects');
  return extractData(response);
};

export const assignContractorToProject = async (projectId, data) => {
  const response = await apiClient.post(`/projects/${projectId}/members`, data);
  return extractData(response);
};

export const getProjectMembers = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/members`);
  return extractData(response);
};


