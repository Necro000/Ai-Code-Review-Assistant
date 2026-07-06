const reviewService = require('../services/reviewService');
const { sendSuccess } = require('../utils/responseFormatter');

/**
 * List Reviews Controller (Paginated)
 */
const list = async (req, res, next) => {
  try {
    const { page, limit, sort, order } = req.query;
    const result = await reviewService.listReviews(req.userId, { page, limit, sort, order });

    return sendSuccess(res, {
      data: { reviews: result.reviews },
      meta: result.meta,
      message: 'Reviews retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Review Details Controller
 */
const getById = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(req.userId, req.params.id);
    return sendSuccess(res, {
      data: { review },
      message: 'Review details retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Review Controller
 */
const deleteReview = async (req, res, next) => {
  try {
    const result = await reviewService.deleteReview(req.userId, req.params.id);
    return sendSuccess(res, {
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search and Filter Reviews Controller
 */
const search = async (req, res, next) => {
  try {
    const { q, severity, reviewType, page, limit } = req.query;
    const result = await reviewService.searchReviews(req.userId, { q, severity, reviewType, page, limit });

    return sendSuccess(res, {
      data: { reviews: result.reviews },
      meta: result.meta,
      message: 'Search query completed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch Dashboard Stats Controller
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await reviewService.getDashboardStats(req.userId);
    return sendSuccess(res, {
      data: { stats },
      message: 'Dashboard metrics compiled successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  getById,
  delete: deleteReview,
  search,
  getStats,
};
