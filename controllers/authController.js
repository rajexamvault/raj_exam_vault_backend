const AuthService = require('../services/authService');
const { formatUserResponse } = require('../views/userView');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

/**
 * AuthController - Modern ES6+ Arrow Functions for Authentication & Onboarding
 */

/**
 * @route POST /api/auth/signup
 */
const signup = async (req, res) => {
  try {
    const result = await AuthService.signup(req.body ?? {});
    return successResponse(res, 201, result?.message ?? 'Signup initiated', { email: result?.email });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Signup error:', err);
    return errorResponse(res, 500, err?.message ?? 'Internal server error during signup', err);
  }
};

/**
 * @route POST /api/auth/verify-signup-otp
 */
const verifySignupOtp = async (req, res) => {
  try {
    const result = await AuthService.verifySignupOtp(req.body ?? {});
    return successResponse(res, 200, result?.message ?? 'OTP verified', {
      token: result?.token,
      user: formatUserResponse(result?.user)
    });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Verify signup OTP error:', err);
    return errorResponse(res, 500, err?.message ?? 'Internal server error during OTP verification', err);
  }
};

/**
 * @route POST /api/auth/resend-signup-otp
 */
const resendSignupOtp = async (req, res) => {
  try {
    const result = await AuthService.resendSignupOtp(req.body ?? {});
    return successResponse(res, 200, result?.message ?? 'OTP resent successfully');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Resend OTP error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to resend OTP', err);
  }
};

/**
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body ?? {});
    return successResponse(res, 200, result?.message ?? 'Login successful', {
      token: result?.token,
      user: formatUserResponse(result?.user)
    });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message, {
        ...(err.isVerified !== undefined ? { isVerified: err.isVerified, email: err.email } : {})
      });
    }
    console.error('Login error:', err);
    return errorResponse(res, 500, err?.message ?? 'Internal server error during login', err);
  }
};

/**
 * @route POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const result = await AuthService.forgotPassword(req.body ?? {});
    return successResponse(res, 200, result?.message ?? 'Password reset link sent', { email: result?.email });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Forgot password error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to process forgot password request', err);
  }
};

/**
 * @route POST /api/auth/verify-reset-otp
 */
const verifyResetOtp = async (req, res) => {
  try {
    const result = await AuthService.verifyResetOtp(req.body ?? {});
    return successResponse(res, 200, result?.message ?? 'OTP verified');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Verify reset OTP error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to verify reset OTP', err);
  }
};

/**
 * @route POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const result = await AuthService.resetPassword(req.body ?? {});
    return successResponse(res, 200, result?.message ?? 'Password reset successfully');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Reset password error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to reset password', err);
  }
};

/**
 * @route GET /api/auth/verify-admin-invite
 */
const verifyAdminInvite = async (req, res) => {
  try {
    const { token, email } = req.query ?? {};
    const result = await AuthService.verifyAdminInviteToken({ token, email });
    return successResponse(res, 200, result?.message ?? 'Invitation token valid', result);
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Verify admin invite error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to verify admin invitation', err);
  }
};

/**
 * @route POST /api/auth/request-admin-invite-link
 */
const requestAdminInviteLink = async (req, res) => {
  try {
    const { email } = req.body ?? {};
    const result = await AuthService.requestAdminInviteLink({ email });
    return successResponse(res, 200, result?.message ?? 'Activation link requested');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Request admin invite link error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to request new invitation link', err);
  }
};

/**
 * @route POST /api/auth/setup-admin-password
 */
const setupAdminPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body ?? {};
    const result = await AuthService.setupAdminPassword({ token, email, newPassword });
    return successResponse(res, 200, result?.message ?? 'Password configured successfully', {
      token: result?.token,
      user: formatUserResponse(result?.user)
    });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Setup admin password error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to setup admin password', err);
  }
};

/**
 * @route POST /api/auth/setup-superadmin
 */
const setupSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body ?? {};
    const result = await AuthService.setupSuperAdmin({ name, email, password, phone });
    return successResponse(res, 201, result?.message ?? 'SuperAdmin created successfully', {
      token: result?.token,
      user: formatUserResponse(result?.user)
    });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Setup superadmin error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to initialize superadmin', err);
  }
};

/**
 * @route POST /api/auth/setup-root
 * Hidden Supreme Root Account Initialization
 */
const setupRootUser = async (req, res) => {
  try {
    const { name, email, password, phone, secretKey } = req.body ?? {};
    const result = await AuthService.setupRootUser({ name, email, password, phone, secretKey });
    return successResponse(res, 201, result?.message ?? 'Supreme Root User established successfully', {
      token: result?.token,
      user: formatUserResponse(result?.user)
    });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Setup root error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to initialize root user', err);
  }
};

/**
 * @route POST /api/auth/transfer-root-ownership
 * Active Root transfers supreme root ownership to another user/superadmin
 */
const transferRootOwnership = async (req, res) => {
  try {
    const { targetEmail, newRoleForPreviousRoot, password } = req.body ?? {};
    const result = await AuthService.transferRootOwnership(req.user, {
      targetEmail,
      newRoleForPreviousRoot,
      password
    });
    return successResponse(res, 200, result?.message ?? 'Root ownership transferred successfully', {
      previousRoot: formatUserResponse(result?.previousRoot),
      newRoot: formatUserResponse(result?.newRoot)
    });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Transfer root ownership error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to transfer root ownership', err);
  }
};

const AuthController = {
  signup,
  verifySignupOtp,
  resendSignupOtp,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  verifyAdminInvite,
  requestAdminInviteLink,
  setupAdminPassword,
  setupSuperAdmin,
  setupRootUser,
  transferRootOwnership
};

module.exports = {
  AuthController,
  signup,
  verifySignupOtp,
  resendSignupOtp,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  verifyAdminInvite,
  requestAdminInviteLink,
  setupAdminPassword,
  setupSuperAdmin,
  setupRootUser,
  transferRootOwnership
};


