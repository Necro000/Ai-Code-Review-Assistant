const leaderboardService = require('../services/leaderboardService');
const { sendSuccess } = require('../utils/responseFormatter');

const get = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const leaderboard = await leaderboardService.getLeaderboard(limit);
    return sendSuccess(res, {
      data: { leaderboard },
      message: 'Leaderboard compiled successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  get,
};
