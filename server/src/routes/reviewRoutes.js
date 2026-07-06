const express = require('express');
const reviewController = require('../controllers/reviewController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Secured by token verification
router.use(verifyToken);

router.get('/', reviewController.list);
router.get('/search', reviewController.search);
router.get('/stats', reviewController.getStats);
router.get('/:id', reviewController.getById);
router.delete('/:id', reviewController.delete);

module.exports = router;
