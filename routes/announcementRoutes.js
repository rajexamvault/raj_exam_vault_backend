const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { protect, hasPermission } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', (req, res) => announcementController.getAllAnnouncements(req, res));
router.get('/flash-ticker', (req, res) => announcementController.getFlashTicker(req, res));
router.get('/stats', (req, res) => announcementController.getStats(req, res));
router.get('/:idOrSlug', (req, res) => announcementController.getAnnouncement(req, res));

// Admin / Staff Protected Endpoints
router.post('/', protect, hasPermission('announcement:create'), (req, res) => announcementController.createAnnouncement(req, res));
router.put('/:id', protect, hasPermission('announcement:update'), (req, res) => announcementController.updateAnnouncement(req, res));
router.delete('/:id', protect, hasPermission('announcement:delete'), (req, res) => announcementController.deleteAnnouncement(req, res));

module.exports = router;
