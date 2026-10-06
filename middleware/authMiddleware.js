const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');
const appConfig = require('../config/appConfig');

/**
 * Protect route with JWT authentication
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, appConfig.jwt.secret);

      // Find active user and exclude password
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'User belonging to this token no longer exists'
        });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({
          status: 'fail',
          message: 'This account has been deactivated. Please contact support.'
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired authorization token',
        error: error.message
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Not authorized. Please provide a Bearer token in the Authorization header'
    });
  }
};

/**
 * Restrict route by user role(s)
 * @param  {...string} allowedRoles
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication required'
      });
    }

    // Root user always bypasses all restrictions
    if (req.user.role === 'root') {
      return next();
    }

    // Unverified users cannot access role-restricted features
    if (!req.user.isVerified) {
      return res.status(403).json({
        status: 'fail',
        isVerified: false,
        email: req.user.email,
        message: 'Email verification required. Please verify your email address to continue.'
      });
    }

    // SuperAdmin bypasses standard role restriction
    if (req.user.role === 'superadmin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: `Forbidden. Requires one of roles: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
};

/**
 * Require email verification for protected operations
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: 'fail', message: 'Authentication required' });
  }
  if (req.user.role === 'root' || req.user.isVerified) {
    return next();
  }
  return res.status(403).json({
    status: 'fail',
    isVerified: false,
    email: req.user.email,
    message: 'Email verification required. Please verify your email.'
  });
};

/**
 * Granular permission-level check middleware
 * @param {string} permissionName - e.g. 'exam:create', 'material:delete'
 */
const hasPermission = (permissionName) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication required'
      });
    }

    // Root and SuperAdmin have all permissions unconditionally
    if (req.user.role === 'root' || req.user.role === 'superadmin') {
      return next();
    }

    try {
      // Find user role and attached permissions
      const userRole = await Role.findOne({
        where: { name: req.user.role },
        include: [
          {
            model: Permission,
            as: 'permissions',
            attributes: ['name']
          }
        ]
      });

      if (!userRole) {
        // Safe fallback for built-in admin role if database RBAC table has not been seeded yet
        if (req.user.role === 'admin') {
          return next();
        }
        return res.status(403).json({
          status: 'fail',
          message: `Role '${req.user.role}' not recognized by policy engine`
        });
      }

      const userPermissions = (userRole.permissions || []).map((p) => p.name);

      if (!userPermissions.includes(permissionName)) {
        return res.status(403).json({
          status: 'fail',
          message: `Forbidden. Missing required permission: '${permissionName}'`
        });
      }

      next();
    } catch (err) {
      console.error('RBAC validation error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal error checking user permissions'
      });
    }
  };
};

// Convenience helpers
const requireRoot = requireRole('root');
const requireSuperAdmin = requireRole('superadmin');
const requireAdminOrSuperAdmin = requireRole('superadmin', 'admin');

module.exports = {
  protect,
  requireRole,
  requireVerified,
  hasPermission,
  requireRoot,
  requireSuperAdmin,
  requireAdminOrSuperAdmin
};
