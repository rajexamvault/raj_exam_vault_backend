const SuperAdminService = require('../services/superAdminService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

class SuperAdminController {
  /**
   * @route GET /api/superadmin/stats
   */
  static async getStats(req, res) {
    try {
      const stats = await SuperAdminService.getDashboardStats();
      return successResponse(res, 200, 'Dashboard statistics fetched successfully', { stats });
    } catch (err) {
      console.error('Superadmin getStats error:', err);
      return errorResponse(res, 500, 'Failed to retrieve dashboard statistics', err);
    }
  }

  /**
   * @route GET /api/superadmin/admins
   */
  static async getAdmins(req, res) {
    try {
      const { page, limit, search, status } = req.query;
      const result = await SuperAdminService.getAdmins({ page, limit, search, status });
      return successResponse(res, 200, 'Admins retrieved successfully', result);
    } catch (err) {
      console.error('Superadmin getAdmins error:', err);
      return errorResponse(res, 500, 'Failed to fetch admin accounts', err);
    }
  }

  /**
   * @route POST /api/superadmin/admins
   */
  static async createAdmin(req, res) {
    try {
      const { name, email, phone, role } = req.body;
      const result = await SuperAdminService.createAdmin({ name, email, phone, role });
      return successResponse(res, 201, result.message, {
        admin: result.admin,
        tempPassword: result.tempPassword,
        setupLink: result.setupLink
      });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Superadmin createAdmin error:', err);
      return errorResponse(res, 500, 'Internal server error while creating admin', err);
    }
  }

  /**
   * @route GET /api/superadmin/users
   */
  static async getUsers(req, res) {
    try {
      const { page, limit, search, exam, status, category, role } = req.query;
      const result = await SuperAdminService.getUsers({ page, limit, search, exam, status, category, role });
      return successResponse(res, 200, 'Registered users retrieved successfully', result);
    } catch (err) {
      console.error('Superadmin getUsers error:', err);
      return errorResponse(res, 500, 'Failed to fetch registered users', err);
    }
  }

  /**
   * @route GET /api/superadmin/users/:id
   */
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await SuperAdminService.getUserById(id);
      return successResponse(res, 200, 'User profile retrieved successfully', { user });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Superadmin getUserById error:', err);
      return errorResponse(res, 500, 'Failed to fetch user profile', err);
    }
  }

  /**
   * @route PUT /api/superadmin/users/:id/status
   */
  static async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await SuperAdminService.toggleUserStatus(id, status);
      return successResponse(res, 200, result.message, { user: result.user });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Superadmin toggleUserStatus error:', err);
      return errorResponse(res, 500, 'Failed to update user status', err);
    }
  }

  /**
   * @route PUT /api/superadmin/users/:id/role
   */
  static async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const result = await SuperAdminService.updateUserRole(id, role);
      return successResponse(res, 200, result.message, { user: result.user });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Superadmin updateUserRole error:', err);
      return errorResponse(res, 500, 'Failed to update user role', err);
    }
  }

  /**
   * @route DELETE /api/superadmin/users/:id
   */
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await SuperAdminService.deleteUser(id);
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Superadmin deleteUser error:', err);
      return errorResponse(res, 500, 'Failed to delete user', err);
    }
  }

  /**
   * @route POST /api/superadmin/admins/:id/resend-invite
   */
  static async resendInvite(req, res) {
    try {
      const { id } = req.params;
      const result = await SuperAdminService.resendAdminInvite(id);
      return successResponse(res, 200, result.message, {
        admin: result.admin,
        tempPassword: result.tempPassword,
        setupLink: result.setupLink
      });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Superadmin resendInvite error:', err);
      return errorResponse(res, 500, 'Failed to resend admin invitation', err);
    }
  }

  /**
   * @route PUT /api/superadmin/admins/:id/status
   */
  static async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await SuperAdminService.toggleAdminStatus(id, status);
      return successResponse(res, 200, result.message, { admin: result.admin });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Superadmin toggleStatus error:', err);
      return errorResponse(res, 500, 'Failed to update admin status', err);
    }
  }

  /**
   * @route DELETE /api/superadmin/admins/:id
   */
  static async deleteAdmin(req, res) {
    try {
      const { id } = req.params;
      const result = await SuperAdminService.deleteAdmin(id);
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Superadmin deleteAdmin error:', err);
      return errorResponse(res, 500, 'Failed to delete admin', err);
    }
  }

  /**
   * @route GET /api/superadmin/roles
   */
  static async getRoles(req, res) {
    try {
      const roles = await SuperAdminService.getRoles();
      return successResponse(res, 200, 'Roles retrieved successfully', { roles });
    } catch (err) {
      console.error('Superadmin getRoles error:', err);
      return errorResponse(res, 500, 'Failed to retrieve roles', err);
    }
  }

  /**
   * @route GET /api/superadmin/permissions
   */
  static async getPermissions(req, res) {
    try {
      const permissions = await SuperAdminService.getPermissions();
      return successResponse(res, 200, 'Permissions retrieved successfully', { permissions });
    } catch (err) {
      console.error('Superadmin getPermissions error:', err);
      return errorResponse(res, 500, 'Failed to retrieve permissions', err);
    }
  }

  /**
   * @route PUT /api/superadmin/roles/:id/permissions
   */
  static async updateRolePermissions(req, res) {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;
      const result = await SuperAdminService.updateRolePermissions(id, permissionIds);
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Superadmin updateRolePermissions error:', err);
      return errorResponse(res, 500, 'Failed to update role permissions', err);
    }
  }
}

module.exports = SuperAdminController;
