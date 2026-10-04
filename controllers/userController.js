const UserService = require('../services/userService');
const { formatUserResponse } = require('../views/userView');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

/**
 * UserController - Modern ES6+ Arrow Functions for User Profile & Account Management
 */

/**
 * @route GET /api/auth/me or GET /api/user/me
 */
const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return failResponse(res, 401, 'Unauthorized request');
    }

    const user = await UserService.getUserById(userId);
    return successResponse(res, 200, 'Profile retrieved successfully', {
      user: formatUserResponse(user)
    });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Get profile error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch user profile', err);
  }
};

/**
 * @route PUT /api/auth/profile or PUT /api/user/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return failResponse(res, 401, 'Unauthorized request');
    }

    const updatedUser = await UserService.updateProfile(userId, req.body ?? {});
    return successResponse(res, 200, 'Profile updated successfully', {
      user: formatUserResponse(updatedUser)
    });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Update profile error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to update profile', err);
  }
};

/**
 * @route PUT /api/auth/change-password or PUT /api/user/change-password
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return failResponse(res, 401, 'Unauthorized request');
    }

    const result = await UserService.changePassword(userId, req.body ?? {});
    return successResponse(res, 200, result?.message ?? 'Password updated successfully');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Change password error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to change password', err);
  }
};

/**
 * @route POST /api/auth/profile-image or POST /api/user/profile-image
 */
const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return failResponse(res, 401, 'Unauthorized request');
    }

    const updatedUser = await UserService.uploadProfileImage(userId, req.file);
    return successResponse(res, 200, 'Profile photo updated successfully', {
      user: formatUserResponse(updatedUser)
    });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Profile image upload error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to upload profile image', err);
  }
};

/**
 * @route DELETE /api/auth/profile-image or DELETE /api/user/profile-image
 */
const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return failResponse(res, 401, 'Unauthorized request');
    }

    const updatedUser = await UserService.deleteProfileImage(userId);
    return successResponse(res, 200, 'Profile photo removed successfully', {
      user: formatUserResponse(updatedUser)
    });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Delete profile image error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to delete profile image', err);
  }
};

/**
 * @route GET /api/auth/check-username?username=...
 */
const checkUsername = async (req, res) => {
  try {
    const { username } = req.query ?? {};
    const currentUserId = req.user?.id ?? null;
    const result = await UserService.checkUsernameAvailability(username, currentUserId);
    return res.status(200).json({
      status: 'success',
      available: result?.available ?? false,
      message: result?.message ?? ''
    });
  } catch (err) {
    console.error('Check username error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to check username availability', err);
  }
};

const UserController = {
  getMe,
  updateProfile,
  changePassword,
  uploadProfileImage,
  deleteProfileImage,
  checkUsername
};

module.exports = {
  UserController,
  getMe,
  updateProfile,
  changePassword,
  uploadProfileImage,
  deleteProfileImage,
  checkUsername
};
