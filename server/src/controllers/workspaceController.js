const workspaceService = require('../services/workspaceService');
const { sendSuccess } = require('../utils/responseFormatter');

const create = async (req, res, next) => {
  try {
    const { name } = req.body;
    const workspace = await workspaceService.createWorkspace(name, req.userId);
    return sendSuccess(res, {
      data: { workspace },
      message: 'Workspace created successfully',
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const workspaces = await workspaceService.listWorkspaces(req.userId);
    return sendSuccess(res, {
      data: { workspaces },
      message: 'Workspaces retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const workspace = await workspaceService.getWorkspaceById(req.params.id, req.userId);
    return sendSuccess(res, {
      data: { workspace },
      message: 'Workspace details retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

const invite = async (req, res, next) => {
  try {
    const { email } = req.body;
    const member = await workspaceService.inviteMember(req.params.id, req.userId, email);
    return sendSuccess(res, {
      data: { member },
      message: 'Member invited successfully',
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await workspaceService.removeMember(req.params.id, req.userId, req.params.userId);
    return sendSuccess(res, {
      message: 'Member removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

const deleteWorkspace = async (req, res, next) => {
  try {
    const result = await workspaceService.deleteWorkspace(req.params.id, req.userId);
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
  invite,
  remove,
  delete: deleteWorkspace,
};
