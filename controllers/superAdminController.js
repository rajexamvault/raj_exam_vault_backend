const SuperAdminService = require('../services/superAdminService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

/**
 * SuperAdminController - Modern ES6+ Arrow Functions for Root Staff Management & Platform Health
 */

/**
 * @route GET /api/superadmin/stats
 */
const getStats = async (req, res) => {
  try {
    const stats = await SuperAdminService.getDashboardStats();
    return successResponse(res, 200, 'Dashboard statistics fetched successfully', { stats });
  } catch (err) {
    console.error('Superadmin getStats error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to retrieve dashboard statistics', err);
  }
};

/**
 * @route GET /api/superadmin/admins
 */
const getAdmins = async (req, res) => {
  try {
    const { page, limit, search, status } = req.query ?? {};
    const result = await SuperAdminService.getAdmins({ page, limit, search, status });
    return successResponse(res, 200, 'Admins retrieved successfully', result);
  } catch (err) {
    console.error('Superadmin getAdmins error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch admin accounts', err);
  }
};

/**
 * @route POST /api/superadmin/admins
 */
const createAdmin = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body ?? {};
    const result = await SuperAdminService.createAdmin({ name, email, phone, role });
    return successResponse(res, 201, result?.message ?? 'Admin created successfully', {
      admin: result?.admin,
      tempPassword: result?.tempPassword,
      setupLink: result?.setupLink
    });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Superadmin createAdmin error:', err);
    return errorResponse(res, 500, err?.message ?? 'Internal server error while creating admin', err);
  }
};

/**
 * @route GET /api/superadmin/users
 */
const getUsers = async (req, res) => {
  try {
    const { page, limit, search, exam, status, category, role } = req.query ?? {};
    const result = await SuperAdminService.getUsers({ page, limit, search, exam, status, category, role });
    return successResponse(res, 200, 'Registered users retrieved successfully', result);
  } catch (err) {
    console.error('Superadmin getUsers error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch registered users', err);
  }
};

/**
 * @route GET /api/superadmin/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const user = await SuperAdminService.getUserById(id);
    return successResponse(res, 200, 'User profile retrieved successfully', { user });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Superadmin getUserById error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch user profile', err);
  }
};

/**
 * @route PUT /api/superadmin/users/:id/status
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const { status } = req.body ?? {};
    const result = await SuperAdminService.toggleUserStatus(id, status);
    return successResponse(res, 200, result?.message ?? 'User status updated', { user: result?.user });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Superadmin toggleUserStatus error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to update user status', err);
  }
};

/**
 * @route PUT /api/superadmin/users/:id/role
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const { role } = req.body ?? {};
    const result = await SuperAdminService.updateUserRole(id, role);
    return successResponse(res, 200, result?.message ?? 'User role updated', { user: result?.user });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Superadmin updateUserRole error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to update user role', err);
  }
};

/**
 * @route DELETE /api/superadmin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await SuperAdminService.deleteUser(id);
    return successResponse(res, 200, result?.message ?? 'User deleted successfully');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Superadmin deleteUser error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to delete user', err);
  }
};

/**
 * @route POST /api/superadmin/admins/:id/resend-invite
 */
const resendInvite = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await SuperAdminService.resendAdminInvite(id);
    return successResponse(res, 200, result?.message ?? 'Invite resent successfully', {
      admin: result?.admin,
      tempPassword: result?.tempPassword,
      setupLink: result?.setupLink
    });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Superadmin resendInvite error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to resend admin invitation', err);
  }
};

/**
 * @route PUT /api/superadmin/admins/:id/status
 */
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const { status } = req.body ?? {};
    const result = await SuperAdminService.toggleAdminStatus(id, status);
    return successResponse(res, 200, result?.message ?? 'Admin status updated', { admin: result?.admin });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Superadmin toggleStatus error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to update admin status', err);
  }
};

/**
 * @route DELETE /api/superadmin/admins/:id
 */
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await SuperAdminService.deleteAdmin(id);
    return successResponse(res, 200, result?.message ?? 'Admin deleted successfully');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Superadmin deleteAdmin error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to delete admin', err);
  }
};

/**
 * @route GET /api/superadmin/roles
 */
const getRoles = async (req, res) => {
  try {
    const roles = await SuperAdminService.getRoles();
    return successResponse(res, 200, 'Roles retrieved successfully', { roles });
  } catch (err) {
    console.error('Superadmin getRoles error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to retrieve roles', err);
  }
};

/**
 * @route GET /api/superadmin/permissions
 */
const getPermissions = async (req, res) => {
  try {
    const permissions = await SuperAdminService.getPermissions();
    return successResponse(res, 200, 'Permissions retrieved successfully', { permissions });
  } catch (err) {
    console.error('Superadmin getPermissions error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to retrieve permissions', err);
  }
};

/**
 * @route PUT /api/superadmin/roles/:id/permissions
 */
const updateRolePermissions = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const { permissionIds } = req.body ?? {};
    const result = await SuperAdminService.updateRolePermissions(id, permissionIds);
    return successResponse(res, 200, result?.message ?? 'Permissions updated');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Superadmin updateRolePermissions error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to update role permissions', err);
  }
};

const SuperAdminController = {
  getStats,
  getAdmins,
  createAdmin,
  getUsers,
  getUserById,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
  resendInvite,
  toggleStatus,
  deleteAdmin,
  getRoles,
  getPermissions,
  updateRolePermissions
};

module.exports = SuperAdminController;
module.exports.getStats = getStats;
module.exports.getAdmins = getAdmins;
module.exports.createAdmin = createAdmin;
module.exports.getUsers = getUsers;
module.exports.getUserById = getUserById;
module.exports.toggleUserStatus = toggleUserStatus;
module.exports.updateUserRole = updateUserRole;
module.exports.deleteUser = deleteUser;
module.exports.resendInvite = resendInvite;
module.exports.toggleStatus = toggleStatus;
module.exports.deleteAdmin = deleteAdmin;
module.exports.getRoles = getRoles;
module.exports.getPermissions = getPermissions;
module.exports.updateRolePermissions = updateRolePermissions;
