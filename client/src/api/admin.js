import api from './axios';

export const getAdminStatsAPI = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

export const listUsersAPI = async (page = 1, limit = 10) => {
  const { data } = await api.get(`/admin/users?page=${page}&limit=${limit}`);
  return data;
};

export const updateUserRoleAPI = async (userId, role) => {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role });
  return data;
};

export const deleteUserAPI = async (userId) => {
  const { data } = await api.delete(`/admin/users/${userId}`);
  return data;
};
