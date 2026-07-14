const express = require('express');
const prController = require('../controllers/prController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all PR actions
router.use(verifyToken);

router.post('/review', prController.reviewPR);

module.exports = router;
