const express = require('express');
const router = express.Router();
const currentAffairController = require('../controllers/currentAffairController');
const { protect, hasPermission } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', (req, res) => currentAffairController.getAllCurrentAffairs(req, res));
router.get('/digest', (req, res) => currentAffairController.getDailyDigest(req, res));
router.get('/stats', (req, res) => currentAffairController.getStats(req, res));
router.get('/:idOrSlug', (req, res) => currentAffairController.getCurrentAffair(req, res));
router.post('/view/:id', (req, res) => currentAffairController.trackView(req, res));
router.post('/like/:id', (req, res) => currentAffairController.trackLike(req, res));

// Admin / Content Manager Protected Endpoints
router.post('/', protect, hasPermission('current_affairs:create'), (req, res) => currentAffairController.createCurrentAffair(req, res));
router.put('/:id', protect, hasPermission('current_affairs:update'), (req, res) => currentAffairController.updateCurrentAffair(req, res));
router.delete('/:id', protect, hasPermission('current_affairs:delete'), (req, res) => currentAffairController.deleteCurrentAffair(req, res));

module.exports = router;
