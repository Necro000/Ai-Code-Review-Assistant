const AppError = require('../utils/AppError');

const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return next(new AppError('Forbidden: Admin access required', 403, 'FORBIDDEN'));
  }
  next();
};

module.exports = requireAdmin;
