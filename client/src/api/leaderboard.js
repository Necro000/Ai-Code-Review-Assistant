import api from './axios';

export const getLeaderboardAPI = async (limit = 10) => {
  const { data } = await api.get(`/leaderboard?limit=${limit}`);
  return data;
};
