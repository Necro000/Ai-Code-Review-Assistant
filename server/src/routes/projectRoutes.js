const express = require('express');
const projectController = require('../controllers/projectController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Secure all routes with authentication middleware
router.use(verifyToken);

router.post('/', projectController.create);
router.get('/', projectController.list);
router.get('/:id', projectController.getById);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);

module.exports = router;
