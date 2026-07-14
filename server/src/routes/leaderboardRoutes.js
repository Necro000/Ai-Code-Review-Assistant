const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Apply token validation
router.use(verifyToken);

router.get('/', leaderboardController.get);

module.exports = router;
