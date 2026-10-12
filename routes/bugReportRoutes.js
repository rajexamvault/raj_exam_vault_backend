const express = require('express');
const router = express.Router();
const BugReportController = require('../controllers/bugReportController');
const upload = require('../middleware/uploadMiddleware');
const { protect, requireAdminOrSuperAdmin } = require('../middleware/authMiddleware');

// Middleware for optional authentication on submit
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

// Public/User: Submit a bug report (with optional screenshot attachment)
router.post('/', optionalProtect, upload.single('screenshot'), BugReportController.createReport);

// User: View my submitted bug reports
router.get('/my', protect, BugReportController.getMyReports);

// Admin/Superadmin: Get overview stats
router.get('/stats', protect, requireAdminOrSuperAdmin, BugReportController.getStats);

// Admin/Superadmin: Get all reports (with filters & search)
router.get('/', protect, requireAdminOrSuperAdmin, BugReportController.getAllReports);

// Admin/Superadmin: Get single report detail
router.get('/:id', protect, requireAdminOrSuperAdmin, BugReportController.getReportById);

// Admin/Superadmin: Update status / Resolve & trigger email
router.patch('/:id', protect, requireAdminOrSuperAdmin, BugReportController.updateReportStatus);
router.put('/:id', protect, requireAdminOrSuperAdmin, BugReportController.updateReportStatus);

// Admin/Superadmin: Delete report
router.delete('/:id', protect, requireAdminOrSuperAdmin, BugReportController.deleteReport);

module.exports = router;
