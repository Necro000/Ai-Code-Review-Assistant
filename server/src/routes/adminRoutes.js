const express = require('express');
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// Apply auth & role validation middleware to all admin endpoints
router.use(verifyToken);
router.use(requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.get('/reviews', adminController.listReviews);

module.exports = router;
