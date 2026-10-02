const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const { uploadSingleImage, deleteImage } = require('../utils/cloudinary');

class UserService {
  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }
    return user;
  }

  /**
   * Check if a username is valid and available (unique)
   */
  static async checkUsernameAvailability(rawUsername, currentUserId = null) {
    if (!rawUsername || !rawUsername.trim()) {
      return { available: false, message: 'Username cannot be empty' };
    }

    const username = rawUsername.toLowerCase().trim();

    // Username format rule: 3-30 characters, letters, numbers, and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return {
        available: false,
        message: 'Username must be 3-30 characters (letters, numbers & underscores only)'
      };
    }

    const whereClause = { username };
    if (currentUserId) {
      whereClause.id = { [Op.ne]: currentUserId };
    }

    const existingUser = await User.findOne({ where: whereClause });
    if (existingUser) {
      return { available: false, message: 'Username is already taken' };
    }

    return { available: true, message: 'Username is available' };
  }

  /**
   * Update candidate profile details & mark onboarding completion
   */
  static async updateProfile(userId, updateData) {
    const user = await this.getUserById(userId);
    const { name, username, category, phone, whatsappNumber, dob, targetExam, higherQualification, age, state } = updateData;

    if (name && name.trim()) user.name = name.trim();

    // Unique Username handling
    if (username !== undefined && username !== null && username.trim() !== '') {
      const normalizedUsername = username.toLowerCase().trim();
      const availability = await this.checkUsernameAvailability(normalizedUsername, userId);
      if (!availability.available) {
        throw { statusCode: 400, message: availability.message };
      }
      user.username = normalizedUsername;
    }

    if (category !== undefined) user.category = category ? category.trim() : 'General';
    if (phone !== undefined) user.phone = phone ? phone.trim() : null;
    if (whatsappNumber !== undefined) user.whatsappNumber = whatsappNumber ? whatsappNumber.trim() : null;

    if (dob !== undefined) {
      user.dob = dob ? dob.trim() : null;
      // Auto-compute age from date of birth if age is not explicitly set
      if (user.dob && !age) {
        const birthDate = new Date(user.dob);
        if (!isNaN(birthDate.getTime())) {
          const diffMs = Date.now() - birthDate.getTime();
          const ageDate = new Date(diffMs);
          user.age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }
      }
    }

    if (targetExam !== undefined) user.targetExam = targetExam ? targetExam.trim() : null;
    if (higherQualification !== undefined) user.higherQualification = higherQualification ? higherQualification.trim() : null;
    if (age !== undefined && age !== null && age !== '') user.age = Number(age);
    if (state !== undefined) user.state = state ? state.trim() : 'Rajasthan';

    // Mark completed if required fields are filled (targetExam, whatsappNumber, dob, username)
    if (user.targetExam && (user.whatsappNumber || user.phone) && (user.dob || user.age) && user.username) {
      user.isProfileCompleted = true;
    }

    await user.save();
    return user;
  }

  /**
   * Change authenticated user password
   */
  static async changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw { statusCode: 400, message: 'Please provide both current and new password' };
    }

    if (newPassword.length < 6) {
      throw { statusCode: 400, message: 'New password must be at least 6 characters long' };
    }

    const user = await this.getUserById(userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw { statusCode: 400, message: 'Incorrect current password' };
    }

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      throw { statusCode: 400, message: 'New password cannot be the same as your current password' };
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Upload and set profile avatar to Cloudinary
   */
  static async uploadProfileImage(userId, file) {
    if (!file) {
      throw { statusCode: 400, message: 'Please select an image file to upload' };
    }

    if (!process.env.CLOUDINARY_API_SECRET) {
      throw {
        statusCode: 500,
        message: 'CLOUDINARY_API_SECRET is missing in backend .env file. Please add your Cloudinary API Secret to .env'
      };
    }

    const user = await this.getUserById(userId);

    // Delete existing old profile image from Cloudinary if it exists
    if (user.profileImagePublicId) {
      await deleteImage(user.profileImagePublicId);
    }

    // Upload new image to Cloudinary folder
    const uploadResult = await uploadSingleImage(file, 'raj_exam_vault/profiles');

    user.profileImage = uploadResult.url;
    user.profileImagePublicId = uploadResult.public_id;
    await user.save();

    return user;
  }

  /**
   * Remove profile image from Cloudinary & Database
   */
  static async deleteProfileImage(userId) {
    const user = await this.getUserById(userId);

    if (user.profileImagePublicId) {
      await deleteImage(user.profileImagePublicId);
    }

    user.profileImage = null;
    user.profileImagePublicId = null;
    await user.save();

    return user;
  }
}

module.exports = UserService;
