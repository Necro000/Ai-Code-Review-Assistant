import api from './axios';

/**
 * Register a new user
 */
export const registerAPI = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
};

/**
 * Log in a user
 */
export const loginAPI = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

/**
 * Log out a user
 */
export const logoutAPI = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

/**
 * Request password reset link/token
 */
export const forgotPasswordAPI = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

/**
 * Reset password with token
 */
export const resetPasswordAPI = async (token, password) => {
  const { data } = await api.post('/auth/reset-password', { token, password });
  return data;
};

/**
 * Get current user profile
 */
export const getProfileAPI = async () => {
  const { data } = await api.get('/users/me');
  return data;
};

/**
 * Update user profile details
 */
export const updateProfileAPI = async (profileData) => {
  const { data } = await api.put('/users/me', profileData);
  return data;
};

/**
 * Change password
 */
export const changePasswordAPI = async (oldPassword, newPassword) => {
  const { data } = await api.put('/users/me/password', { oldPassword, newPassword });
  return data;
};
