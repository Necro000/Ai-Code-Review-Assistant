const adminService = require('../services/adminService');
const { sendSuccess } = require('../utils/responseFormatter');

const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    return sendSuccess(res, {
      data: { stats },
      message: 'System stats compiled successfully',
    });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await adminService.listUsers({ page, limit });
    return sendSuccess(res, {
      data: { users: result.users },
      meta: result.meta,
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await adminService.updateUserRole(req.params.id, role);
    return sendSuccess(res, {
      data: { user },
      message: 'User role updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await adminService.deleteUser(req.params.id);
    return sendSuccess(res, {
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const listReviews = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await adminService.listReviews({ page, limit });
    return sendSuccess(res, {
      data: { reviews: result.reviews },
      meta: result.meta,
      message: 'Platform reviews retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  listUsers,
  updateUserRole,
  deleteUser,
  listReviews,
};
