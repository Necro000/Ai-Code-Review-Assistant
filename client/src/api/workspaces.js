import api from './axios';

export const createWorkspaceAPI = async (name) => {
  const { data } = await api.post('/workspaces', { name });
  return data;
};

export const listWorkspacesAPI = async () => {
  const { data } = await api.get('/workspaces');
  return data;
};

export const getWorkspaceAPI = async (id) => {
  const { data } = await api.get(`/workspaces/${id}`);
  return data;
};

export const inviteMemberAPI = async (id, email) => {
  const { data } = await api.post(`/workspaces/${id}/invite`, { email });
  return data;
};

export const removeMemberAPI = async (id, userId) => {
  const { data } = await api.delete(`/workspaces/${id}/members/${userId}`);
  return data;
};

export const deleteWorkspaceAPI = async (id) => {
  const { data } = await api.delete(`/workspaces/${id}`);
  return data;
};
