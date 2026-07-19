import api from './axios';

export const reviewPRAPI = async ({ owner, repo, pullNumber, prUrl, projectId }) => {
  const { data } = await api.post('/pr/review', { owner, repo, pullNumber, prUrl, projectId });
  return data;
};
