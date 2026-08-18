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

export const getNotifications = async (params) => {
  const response = await apiClient.get('/notifications', { params });
  return extractData(response);
};

export const markNotificationAsRead = async (id) => {
  const response = await apiClient.put(/notifications//read);
  return extractData(response);
};

export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.put('/notifications/read-all');
  return extractData(response);
};

export const getUnreadNotificationsCount = async () => {
  const response = await apiClient.get('/notifications/unread-count');
  return extractData(response);
};
