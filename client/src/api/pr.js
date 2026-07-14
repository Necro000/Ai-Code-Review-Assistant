import api from './axios';

export const reviewPRAPI = async ({ owner, repo, pullNumber, projectId }) => {
  const { data } = await api.post('/pr/review', { owner, repo, pullNumber, projectId });
  return data;
};
