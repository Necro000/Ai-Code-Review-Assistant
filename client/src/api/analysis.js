import api from './axios';

/**
 * Create a new project
 */
export const createProjectAPI = async (projectName, githubUrl) => {
  const { data } = await api.post('/projects', { projectName, githubUrl });
  return data;
};

/**
 * List all projects of current user
 */
export const listProjectsAPI = async () => {
  const { data } = await api.get('/projects');
  return data;
};

/**
 * Get project details
 */
export const getProjectAPI = async (id) => {
  const { data } = await api.get(`/projects/${id}`);
  return data;
};

/**
 * Update project details
 */
export const updateProjectAPI = async (id, projectData) => {
  const { data } = await api.put(`/projects/${id}`, projectData);
  return data;
};

/**
 * Delete project
 */
export const deleteProjectAPI = async (id) => {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
};

/**
 * Submit code snippet for review
 */
export const submitSnippetAPI = async (code, language, projectId) => {
  const { data } = await api.post('/analysis/snippet', { code, language, projectId });
  return data;
};

/**
 * Upload source files for review
 * Expects a FormData object containing 'files' and 'projectId'
 */
export const uploadFilesAPI = async (formData) => {
  const { data } = await api.post('/analysis/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
