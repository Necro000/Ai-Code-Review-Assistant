import api from './axios';

/**
 * Fetch dashboard statistics
 */
export const getStatsAPI = async () => {
  const { data } = await api.get('/reviews/stats');
  return data;
};

/**
 * List all reviews for the current user (paginated)
 */
export const listReviewsAPI = async (params = {}) => {
  const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = params;
  const { data } = await api.get('/reviews', {
    params: { page, limit, sort, order },
  });
  return data;
};

/**
 * Get review detail by ID
 */
export const getReviewAPI = async (id) => {
  const { data } = await api.get(`/reviews/${id}`);
  return data;
};

/**
 * Search reviews with filters
 */
export const searchReviewsAPI = async (params = {}) => {
  const { q = '', severity = '', reviewType = '', page = 1, limit = 10 } = params;
  const { data } = await api.get('/reviews/search', {
    params: { q, severity, reviewType, page, limit },
  });
  return data;
};

/**
 * Delete a review
 */
export const deleteReviewAPI = async (id) => {
  const { data } = await api.delete(`/reviews/${id}`);
  return data;
};
