const express = require('express');
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/auth');
const {
  validateUpdateProfile,
  validateChangePassword,
} = require('../middleware/validator');

const router = express.Router();

// All user routes require authentication
router.use(verifyToken);

router.get('/me', userController.getProfile);
router.put('/me', validateUpdateProfile, userController.updateProfile);
router.put('/me/password', validateChangePassword, userController.changePassword);

module.exports = router;
