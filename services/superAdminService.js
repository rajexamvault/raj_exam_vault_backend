const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Exam, StudyMaterial } = require('../models');
const { generate6CharUuidPassword, generateInviteToken } = require('../utils/mailer');
const EmailService = require('./emailService');
const { formatAdminResponse, formatUserResponse } = require('../views/userView');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

class SuperAdminService {
  /**
   * Get Superadmin dashboard KPIs and overview stats
   */
  static async getDashboardStats() {
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalAdmins = await User.count({ 
      where: { 
        role: { [Op.in]: ['admin', 'superadmin'] } 
      } 
    });
    const activeAdmins = await User.count({ 
      where: { 
        role: { [Op.in]: ['admin', 'superadmin'] }, 
        status: 'active',
        isPasswordSet: true 
      } 
    });
    
    const now = new Date();
    const pendingInvites = await User.count({
      where: {
        role: { [Op.in]: ['admin', 'superadmin'] },
        isPasswordSet: false,
        inviteTokenExpiry: { [Op.gt]: now }
      }
    });

    const expiredInvites = await User.count({
      where: {
        role: { [Op.in]: ['admin', 'superadmin'] },
        isPasswordSet: false,
        inviteTokenExpiry: { [Op.lt]: now }
      }
    });

    const totalExams = await Exam.count();
    const totalMaterials = await StudyMaterial.count();
    const totalPyqs = await StudyMaterial.count({ where: { materialType: 'pyq' } });
    const totalNotes = await StudyMaterial.count({ where: { materialType: 'notes' } });

    return {
      totalUsers,
      totalAdmins,
      activeAdmins,
      pendingInvites,
      expiredInvites,
      totalExams,
      totalMaterials,
      totalPyqs,
      totalNotes
    };
  }

  /**
   * Get paginated list of admins with search and status filtering
   */
  static async getAdmins({ page = 1, limit = 10, search = '', status = 'all', role = 'all' }) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const whereClause = {
      role: role && role !== 'all' && role !== 'root' ? role : { [Op.in]: ['admin', 'superadmin'] }
    };

    if (status && status !== 'all') {
      if (status === 'expired') {
        whereClause.isPasswordSet = false;
        whereClause.inviteTokenExpiry = { [Op.lt]: new Date() };
      } else if (status === 'pending') {
        whereClause.isPasswordSet = false;
        whereClause.inviteTokenExpiry = { [Op.gt]: new Date() };
      } else {
        whereClause.status = status;
      }
    }

    if (search && search.trim()) {
      const searchVal = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { name: { [Op.like]: searchVal } },
        { email: { [Op.like]: searchVal } },
        { phone: { [Op.like]: searchVal } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parsedLimit,
      offset: offset,
      attributes: { exclude: ['password'] }
    });

    return {
      admins: rows.map(admin => formatAdminResponse(admin)),
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parseInt(page, 10),
        pageSize: parsedLimit
      }
    };
  }

  /**
   * Create a new Admin or SuperAdmin with 6-character UUID password and 24-hour setup link
   */
  static async createAdmin({ name, email, phone, role = 'admin' }) {
    if (!name || !email) {
      throw { statusCode: 400, message: 'Please provide both admin name and email address' };
    }

    const targetRole = ['admin', 'superadmin'].includes(role) ? role : 'admin';
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user/admin already exists
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      throw { statusCode: 400, message: `An account with email ${normalizedEmail} already exists.` };
    }

    // Generate 6-character UUID password snippet
    const tempPassword = generate6CharUuidPassword();

    // Generate secure invite token
    const inviteToken = generateInviteToken();

    // 24-hour expiration window
    const inviteTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Hash initial password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Create User record
    const admin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : null,
      password: hashedPassword,
      role: targetRole,
      status: 'pending',
      isVerified: false,
      isPasswordSet: false,
      inviteToken,
      inviteTokenExpiry
    });

    // Build 24-hour activation link
    const setupLink = `${FRONTEND_URL}/admin/setup-password?token=${inviteToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send invitation email
    try {
      await EmailService.sendAdminInvitation(normalizedEmail, name.trim(), tempPassword, setupLink, 24);
    } catch (mailError) {
      console.error('Failed to send admin invitation email:', mailError);
    }

    return {
      admin: formatAdminResponse(admin),
      tempPassword,
      setupLink,
      message: `${targetRole === 'superadmin' ? 'SuperAdmin' : 'Admin'} created successfully! 6-character UUID password generated and 24-hour activation link sent to ${normalizedEmail}.`
    };
  }

  /**
   * Get paginated list of registered students/aspirants (users)
   */
  static async getUsers({ page = 1, limit = 10, search = '', exam = 'all', status = 'all', category = 'all', role = 'all' }) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const whereClause = {};

    if (role && role !== 'all' && role !== 'root') {
      whereClause.role = role;
    } else {
      whereClause.role = { [Op.in]: ['user', 'moderator', 'content_manager', 'question_manager'] };
    }

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (exam && exam !== 'all') {
      whereClause.targetExam = exam;
    }

    if (search && search.trim()) {
      const searchVal = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { name: { [Op.like]: searchVal } },
        { email: { [Op.like]: searchVal } },
        { phone: { [Op.like]: searchVal } },
        { username: { [Op.like]: searchVal } },
        { targetExam: { [Op.like]: searchVal } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parsedLimit,
      offset: offset,
      attributes: { exclude: ['password'] }
    });

    return {
      users: rows.map(u => formatUserResponse(u)),
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parseInt(page, 10),
        pageSize: parsedLimit
      }
    };
  }

  /**
   * Get single aspirant / user profile by ID
   */
  static async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user || user.role === 'root') {
      throw { statusCode: 404, message: 'User account not found' };
    }
    return formatUserResponse(user);
  }

  /**
   * Toggle user account status (active / inactive / blocked)
   */
  static async toggleUserStatus(userId, status) {
    const user = await User.findByPk(userId);
    if (!user || user.role === 'root') {
      throw { statusCode: 404, message: 'User account not found' };
    }

    user.status = status;
    await user.save();

    return {
      user: formatUserResponse(user),
      message: `Account status for ${user.name} has been set to '${status}'.`
    };
  }

  /**
   * Change user role (SuperAdmin privilege)
   */
  static async updateUserRole(userId, newRole) {
    const validRoles = ['user', 'moderator', 'content_manager', 'question_manager', 'admin', 'superadmin'];
    if (!validRoles.includes(newRole)) {
      throw { statusCode: 400, message: `Invalid role. Must be one of: [${validRoles.join(', ')}]` };
    }

    const user = await User.findByPk(userId);
    if (!user || user.role === 'root') {
      throw { statusCode: 404, message: 'User account not found' };
    }

    user.role = newRole;
    await user.save();

    return {
      user: formatUserResponse(user),
      message: `Role for ${user.name} has been updated to '${newRole}'.`
    };
  }

  /**
   * Delete an aspirant / user
   */
  static async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user || user.role === 'root') {
      throw { statusCode: 404, message: 'User account not found' };
    }
    await user.destroy();
    return {
      message: `User ${user.name} (${user.email}) has been permanently deleted.`
    };
  }

  /**
   * Resend Admin Invite Link (Regenerate 6-char UUID password & 24h link)
   */
  static async resendAdminInvite(adminId) {
    const admin = await User.findByPk(adminId);
    if (!admin || admin.role === 'root') {
      throw { statusCode: 404, message: 'Admin account not found' };
    }

    if (!['admin', 'superadmin'].includes(admin.role)) {
      throw { statusCode: 400, message: 'Target user is not an administrator' };
    }

    // Generate new 6-character UUID password
    const tempPassword = generate6CharUuidPassword();

    // Generate new invite token
    const inviteToken = generateInviteToken();

    // Reset 24-hour expiry
    const inviteTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Hash initial password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    admin.password = hashedPassword;
    admin.inviteToken = inviteToken;
    admin.inviteTokenExpiry = inviteTokenExpiry;
    admin.status = 'pending';
    admin.isPasswordSet = false;
    await admin.save();

    const setupLink = `${FRONTEND_URL}/admin/setup-password?token=${inviteToken}&email=${encodeURIComponent(admin.email)}`;

    // Dispatch email
    await EmailService.sendAdminInvitation(admin.email, admin.name, tempPassword, setupLink, 24);

    return {
      admin: formatAdminResponse(admin),
      tempPassword,
      setupLink,
      message: `A fresh 24-hour activation link and new 6-character temporary password have been emailed to ${admin.email}.`
    };
  }

  /**
   * Toggle Admin Status (active, inactive, pending)
   */
  static async toggleAdminStatus(adminId, status) {
    const validStatuses = ['active', 'inactive', 'pending'];
    if (!validStatuses.includes(status)) {
      throw { statusCode: 400, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }

    const admin = await User.findByPk(adminId);
    if (!admin || admin.role === 'root') {
      throw { statusCode: 404, message: 'Admin account not found' };
    }

    if (!['admin', 'superadmin'].includes(admin.role)) {
      throw { statusCode: 400, message: 'Cannot modify non-admin users from this endpoint' };
    }

    admin.status = status;
    await admin.save();

    return {
      admin: formatAdminResponse(admin),
      message: `Admin status updated to ${status}`
    };
  }

  /**
   * Delete an admin
   */
  static async deleteAdmin(adminId) {
    const admin = await User.findByPk(adminId);
    if (!admin || admin.role === 'root') {
      throw { statusCode: 404, message: 'Admin account not found' };
    }

    if (!['admin', 'superadmin'].includes(admin.role)) {
      throw { statusCode: 400, message: 'Cannot delete non-admin user via this endpoint' };
    }

    await admin.destroy();

    return {
      message: `Admin ${admin.name} (${admin.email}) has been permanently deleted.`
    };
  }

  /**
   * Get all system roles with assigned permissions
   */
  static async getRoles() {
    const { Role, Permission } = require('../models');
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ],
      order: [['id', 'ASC']]
    });
    return roles;
  }

  /**
   * Get all available permissions grouped by module
   */
  static async getPermissions() {
    const { Permission } = require('../models');
    const permissions = await Permission.findAll({
      order: [['module', 'ASC'], ['name', 'ASC']]
    });
    return permissions;
  }

  /**
   * Update permissions for a specific role
   */
  static async updateRolePermissions(roleId, permissionIds = []) {
    const { Role, Permission, RolePermission } = require('../models');
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw { statusCode: 404, message: 'Role not found' };
    }

    if (role.name === 'superadmin') {
      throw { statusCode: 400, message: 'SuperAdmin role permissions are immutable (all-access)' };
    }

    // Delete existing mappings
    await RolePermission.destroy({ where: { roleId: role.id } });

    // Insert new mappings
    for (const pId of permissionIds) {
      await RolePermission.create({
        roleId: role.id,
        permissionId: pId
      });
    }

    return {
      message: `Permissions for role '${role.displayName}' updated successfully.`
    };
  }
}

module.exports = SuperAdminService;
