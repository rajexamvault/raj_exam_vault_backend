const UserService = require('../services/userService');
const { formatUserResponse } = require('../views/userView');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

/**
 * UserController - Handles HTTP requests for User Profile & Account Management
 */
class UserController {
  /**
   * @route GET /api/auth/me or GET /api/user/me
   */
  static async getMe(req, res) {
    try {
      const user = await UserService.getUserById(req.user.id);
      return successResponse(res, 200, 'Profile retrieved successfully', {
        user: formatUserResponse(user)
      });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Get profile error:', err);
      return errorResponse(res, 500, 'Failed to fetch user profile', err);
    }
  }

  /**
   * @route PUT /api/auth/profile or PUT /api/user/profile
   */
  static async updateProfile(req, res) {
    try {
      const updatedUser = await UserService.updateProfile(req.user.id, req.body);
      return successResponse(res, 200, 'Profile updated successfully', {
        user: formatUserResponse(updatedUser)
      });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Update profile error:', err);
      return errorResponse(res, 500, 'Failed to update profile', err);
    }
  }

  /**
   * @route PUT /api/auth/change-password or PUT /api/user/change-password
   */
  static async changePassword(req, res) {
    try {
      const result = await UserService.changePassword(req.user.id, req.body);
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Change password error:', err);
      return errorResponse(res, 500, 'Failed to change password', err);
    }
  }

  /**
   * @route POST /api/auth/profile-image or POST /api/user/profile-image
   */
  static async uploadProfileImage(req, res) {
    try {
      const updatedUser = await UserService.uploadProfileImage(req.user.id, req.file);
      return successResponse(res, 200, 'Profile photo updated successfully', {
        user: formatUserResponse(updatedUser)
      });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Profile image upload error:', err);
      return errorResponse(res, 500, err.message || 'Failed to upload profile image', err);
    }
  }

  /**
   * @route DELETE /api/auth/profile-image or DELETE /api/user/profile-image
   */
  static async deleteProfileImage(req, res) {
    try {
      const updatedUser = await UserService.deleteProfileImage(req.user.id);
      return successResponse(res, 200, 'Profile photo removed successfully', {
        user: formatUserResponse(updatedUser)
      });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Delete profile image error:', err);
      return errorResponse(res, 500, 'Failed to delete profile image', err);
    }
  }

  /**
   * @route GET /api/auth/check-username?username=...
   */
  static async checkUsername(req, res) {
    try {
      const { username } = req.query;
      const currentUserId = req.user ? req.user.id : null;
      const result = await UserService.checkUsernameAvailability(username, currentUserId);
      return res.status(200).json({
        status: 'success',
        available: result.available,
        message: result.message
      });
    } catch (err) {
      console.error('Check username error:', err);
      return errorResponse(res, 500, 'Failed to check username availability', err);
    }
  }
}

module.exports = {
  UserController,
  getMe: UserController.getMe,
  updateProfile: UserController.updateProfile,
  changePassword: UserController.changePassword,
  uploadProfileImage: UserController.uploadProfileImage,
  deleteProfileImage: UserController.deleteProfileImage,
  checkUsername: UserController.checkUsername
};
