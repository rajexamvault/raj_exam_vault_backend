const express = require('express');
const router = express.Router();
const SuperAdminController = require('../controllers/superAdminController');
const { protect, requireAdminOrSuperAdmin, requireSuperAdmin } = require('../middleware/authMiddleware');

// Protect all SuperAdmin routes
router.use(protect);
router.use(requireAdminOrSuperAdmin);

// SuperAdmin KPI statistics
router.get('/stats', SuperAdminController.getStats);

// Admin Management CRUD & Invitations
router.get('/admins', SuperAdminController.getAdmins);
router.post('/admins', SuperAdminController.createAdmin);
router.post('/admins/:id/resend-invite', SuperAdminController.resendInvite);
router.put('/admins/:id/status', SuperAdminController.toggleStatus);
router.delete('/admins/:id', SuperAdminController.deleteAdmin);

// Aspirants / Registered Users Management
router.get('/users', SuperAdminController.getUsers);
router.get('/users/:id', SuperAdminController.getUserById);
router.put('/users/:id/status', SuperAdminController.toggleUserStatus);
router.put('/users/:id/role', requireSuperAdmin, SuperAdminController.updateUserRole);
router.delete('/users/:id', SuperAdminController.deleteUser);

// RBAC Roles & Permissions Management (SuperAdmin privilege)
router.get('/roles', SuperAdminController.getRoles);
router.get('/permissions', SuperAdminController.getPermissions);
router.put('/roles/:id/permissions', requireSuperAdmin, SuperAdminController.updateRolePermissions);

module.exports = router;
