const AuthService = require('../services/authService');
const { formatUserResponse } = require('../views/userView');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

/**
 * AuthController - Handles HTTP requests for Authentication
 */
class AuthController {
  /**
   * @route POST /api/auth/signup
   */
  static async signup(req, res) {
    try {
      const result = await AuthService.signup(req.body);
      return successResponse(res, 201, result.message, { email: result.email });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Signup error:', err);
      return errorResponse(res, 500, 'Internal server error during signup', err);
    }
  }

  /**
   * @route POST /api/auth/verify-signup-otp
   */
  static async verifySignupOtp(req, res) {
    try {
      const result = await AuthService.verifySignupOtp(req.body);
      return successResponse(res, 200, result.message, {
        token: result.token,
        user: formatUserResponse(result.user)
      });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Verify signup OTP error:', err);
      return errorResponse(res, 500, 'Internal server error during OTP verification', err);
    }
  }

  /**
   * @route POST /api/auth/resend-signup-otp
   */
  static async resendSignupOtp(req, res) {
    try {
      const result = await AuthService.resendSignupOtp(req.body);
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Resend OTP error:', err);
      return errorResponse(res, 500, 'Failed to resend OTP', err);
    }
  }

  /**
   * @route POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const result = await AuthService.login(req.body);
      return successResponse(res, 200, result.message, {
        token: result.token,
        user: formatUserResponse(result.user)
      });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message, {
          ...(err.isVerified !== undefined ? { isVerified: err.isVerified, email: err.email } : {})
        });
      }
      console.error('Login error:', err);
      return errorResponse(res, 500, 'Internal server error during login', err);
    }
  }

  /**
   * @route POST /api/auth/forgot-password
   */
  static async forgotPassword(req, res) {
    try {
      const result = await AuthService.forgotPassword(req.body);
      return successResponse(res, 200, result.message, { email: result.email });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Forgot password error:', err);
      return errorResponse(res, 500, 'Failed to process forgot password request', err);
    }
  }

  /**
   * @route POST /api/auth/verify-reset-otp
   */
  static async verifyResetOtp(req, res) {
    try {
      const result = await AuthService.verifyResetOtp(req.body);
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Verify reset OTP error:', err);
      return errorResponse(res, 500, 'Failed to verify reset OTP', err);
    }
  }

  /**
   * @route POST /api/auth/reset-password
   */
  static async resetPassword(req, res) {
    try {
      const result = await AuthService.resetPassword(req.body);
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Reset password error:', err);
      return errorResponse(res, 500, 'Failed to reset password', err);
    }
  }

  /**
   * @route GET /api/auth/verify-admin-invite
   */
  static async verifyAdminInvite(req, res) {
    try {
      const { token, email } = req.query;
      const result = await AuthService.verifyAdminInviteToken({ token, email });
      return successResponse(res, 200, result.message, result);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Verify admin invite error:', err);
      return errorResponse(res, 500, 'Failed to verify admin invitation', err);
    }
  }

  /**
   * @route POST /api/auth/request-admin-invite-link
   */
  static async requestAdminInviteLink(req, res) {
    try {
      const { email } = req.body;
      const result = await AuthService.requestAdminInviteLink({ email });
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Request admin invite link error:', err);
      return errorResponse(res, 500, 'Failed to request new invitation link', err);
    }
  }

  /**
   * @route POST /api/auth/setup-admin-password
   */
  static async setupAdminPassword(req, res) {
    try {
      const { token, email, newPassword } = req.body;
      const result = await AuthService.setupAdminPassword({ token, email, newPassword });
      return successResponse(res, 200, result.message, {
        token: result.token,
        user: formatUserResponse(result.user)
      });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Setup admin password error:', err);
      return errorResponse(res, 500, 'Failed to setup admin password', err);
    }
  }

  /**
   * @route POST /api/auth/setup-superadmin
   */
  static async setupSuperAdmin(req, res) {
    try {
      const { name, email, password, phone } = req.body;
      const result = await AuthService.setupSuperAdmin({ name, email, password, phone });
      return successResponse(res, 201, result.message, {
        token: result.token,
        user: formatUserResponse(result.user)
      });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Setup superadmin error:', err);
      return errorResponse(res, 500, 'Failed to initialize superadmin', err);
    }
  }
}

// Export both class and destructured methods for maximum flexibility
module.exports = {
  AuthController,
  signup: AuthController.signup,
  verifySignupOtp: AuthController.verifySignupOtp,
  resendSignupOtp: AuthController.resendSignupOtp,
  login: AuthController.login,
  forgotPassword: AuthController.forgotPassword,
  verifyResetOtp: AuthController.verifyResetOtp,
  resetPassword: AuthController.resetPassword,
  verifyAdminInvite: AuthController.verifyAdminInvite,
  requestAdminInviteLink: AuthController.requestAdminInviteLink,
  setupAdminPassword: AuthController.setupAdminPassword,
  setupSuperAdmin: AuthController.setupSuperAdmin
};


