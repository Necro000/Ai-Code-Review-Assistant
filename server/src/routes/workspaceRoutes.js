const express = require('express');
const workspaceController = require('../controllers/workspaceController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

router.post('/', workspaceController.create);
router.get('/', workspaceController.list);
router.get('/:id', workspaceController.getById);
router.post('/:id/invite', workspaceController.invite);
router.delete('/:id/members/:userId', workspaceController.remove);
router.delete('/:id', workspaceController.delete);

module.exports = router;
