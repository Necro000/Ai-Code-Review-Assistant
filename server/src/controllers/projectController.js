const projectService = require('../services/projectService');
const { sendSuccess } = require('../utils/responseFormatter');

/**
 * Create Project Controller
 */
const create = async (req, res, next) => {
  try {
    const { projectName, githubUrl, workspaceId } = req.body;
    const project = await projectService.createProject(req.userId, projectName, githubUrl, workspaceId);
    
    return sendSuccess(res, {
      data: { project },
      message: 'Project created successfully',
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List Projects Controller
 */
const list = async (req, res, next) => {
  try {
    const projects = await projectService.listProjects(req.userId);
    return sendSuccess(res, {
      data: { projects },
      message: 'Projects retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Project Details Controller
 */
const getById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.userId, req.params.id);
    return sendSuccess(res, {
      data: { project },
      message: 'Project details retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Project Controller
 */
const update = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.userId, req.params.id, req.body);
    return sendSuccess(res, {
      data: { project },
      message: 'Project updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Project Controller
 */
const deleteProj = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.userId, req.params.id);
    return sendSuccess(res, {
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  list,
  getById,
  update,
  delete: deleteProj,
};
