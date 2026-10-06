const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Otp, sequelize } = require('../models');
const { generateOtp, generate6CharUuidPassword, generateInviteToken } = require('../utils/mailer');
const generateToken = require('../utils/generateToken');
const EmailService = require('./emailService');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

class AuthService {
  /**
   * Register a new user & dispatch OTP
   */
  static async signup({ name, email, password }) {
    if (!name || !email || !password) {
      throw { statusCode: 400, message: 'Please provide name, email, and password' };
    }

    if (password.length < 6) {
      throw { statusCode: 400, message: 'Password must be at least 6 characters long' };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let existingUser = await User.findOne({ where: { email: normalizedEmail } });

    if (existingUser && existingUser.isVerified) {
      throw { statusCode: 400, message: 'An account with this email is already registered. Please login.' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name.trim();
      existingUser.password = hashedPassword;
      await existingUser.save();
    } else {
      existingUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        isVerified: false,
        isProfileCompleted: false
      });
    }

    // Invalidate previous signup OTPs
    await Otp.update(
      { isUsed: true },
      { where: { email: normalizedEmail, purpose: 'SIGNUP_VERIFICATION', isUsed: false } }
    );

    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.create({
      email: normalizedEmail,
      otp,
      purpose: 'SIGNUP_VERIFICATION',
      expiresAt
    });

    // Send email with OTP (fail-safe so signup flow completes and OTP is created in DB)
    try {
      await EmailService.sendSignupOtp(normalizedEmail, name, otp);
    } catch (emailErr) {
      console.error('Email dispatch error during signup:', emailErr?.message || emailErr);
      console.log(`\n========================================\n[SIGNUP OTP for ${normalizedEmail}]: ${otp}\n========================================\n`);
    }

    return {
      email: normalizedEmail,
      message: 'Signup successful! Verification OTP sent to your email address.'
    };
  }

  /**
   * Verify signup OTP and issue JWT token
   */
  static async verifySignupOtp({ email, otp }) {
    if (!email || !otp) {
      throw { statusCode: 400, message: 'Please provide both email and OTP' };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find valid active OTP
    const validOtp = await Otp.findOne({
      where: {
        email: normalizedEmail,
        otp: otp.toString().trim(),
        purpose: 'SIGNUP_VERIFICATION',
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['createdAt', 'DESC']]
    });

    if (!validOtp) {
      throw { statusCode: 400, message: 'Invalid or expired OTP. Please request a new one.' };
    }

    // Mark OTP as used
    validOtp.isUsed = true;
    await validOtp.save();

    // Mark user as verified
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      throw { statusCode: 404, message: 'User account not found' };
    }

    user.isVerified = true;
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    return {
      token,
      user,
      message: 'Email verified successfully! Please complete your aspirant profile details.'
    };
  }

  /**
   * Resend signup verification OTP
   */
  static async resendSignupOtp({ email }) {
    if (!email) {
      throw { statusCode: 400, message: 'Please provide email address' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      throw { statusCode: 404, message: 'No account found with this email' };
    }

    if (user.isVerified) {
      throw { statusCode: 400, message: 'This account is already verified. Please login.' };
    }

    // Invalidate previous OTPs
    await Otp.update(
      { isUsed: true },
      { where: { email: normalizedEmail, purpose: 'SIGNUP_VERIFICATION', isUsed: false } }
    );

    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.create({
      email: normalizedEmail,
      otp,
      purpose: 'SIGNUP_VERIFICATION',
      expiresAt
    });

    try {
      await EmailService.sendSignupOtp(normalizedEmail, user.name, otp);
    } catch (emailErr) {
      console.error('Email dispatch error during resend OTP:', emailErr?.message || emailErr);
      console.log(`\n========================================\n[RESEND OTP for ${normalizedEmail}]: ${otp}\n========================================\n`);
    }

    return {
      message: 'New verification OTP sent to your email.'
    };
  }

  /**
   * Login user & issue JWT
   */
  static async login({ email, password }) {
    if (!email || !password) {
      throw { statusCode: 400, message: 'Please provide email and password' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    if (!user.isVerified) {
      throw {
        statusCode: 403,
        message: 'Email address is not verified. Please verify your account before logging in.',
        isVerified: false,
        email: user.email
      };
    }

    const token = generateToken(user);

    return {
      token,
      user,
      message: 'Logged in successfully'
    };
  }

  /**
   * Request password reset OTP via email
   */
  static async forgotPassword({ email }) {
    if (!email) {
      throw { statusCode: 400, message: 'Please provide email address' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      throw { statusCode: 404, message: 'No account found with this email address' };
    }

    // Invalidate previous password reset OTPs
    await Otp.update(
      { isUsed: true },
      { where: { email: normalizedEmail, purpose: 'PASSWORD_RESET', isUsed: false } }
    );

    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.create({
      email: normalizedEmail,
      otp,
      purpose: 'PASSWORD_RESET',
      expiresAt
    });

    try {
      await EmailService.sendPasswordResetOtp(normalizedEmail, user.name, otp);
    } catch (emailErr) {
      console.error('Email dispatch error during forgot password:', emailErr?.message || emailErr);
      console.log(`\n========================================\n[PASSWORD RESET OTP for ${normalizedEmail}]: ${otp}\n========================================\n`);
    }

    return {
      email: normalizedEmail,
      message: 'Password reset OTP has been sent to your email.'
    };
  }

  /**
   * Validate password reset OTP
   */
  static async verifyResetOtp({ email, otp }) {
    if (!email || !otp) {
      throw { statusCode: 400, message: 'Please provide email and OTP' };
    }

    const normalizedEmail = email.toLowerCase().trim();

    const validOtp = await Otp.findOne({
      where: {
        email: normalizedEmail,
        otp: otp.toString().trim(),
        purpose: 'PASSWORD_RESET',
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['createdAt', 'DESC']]
    });

    if (!validOtp) {
      throw { statusCode: 400, message: 'Invalid or expired OTP' };
    }

    return {
      message: 'OTP verified successfully. You may now reset your password.'
    };
  }

  /**
   * Reset password using OTP
   */
  static async resetPassword({ email, otp, newPassword }) {
    if (!email || !otp || !newPassword) {
      throw { statusCode: 400, message: 'Please provide email, OTP, and newPassword' };
    }

    if (newPassword.length < 6) {
      throw { statusCode: 400, message: 'New password must be at least 6 characters long' };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    const validOtp = await Otp.findOne({
      where: {
        email: normalizedEmail,
        otp: otp.toString().trim(),
        purpose: 'PASSWORD_RESET',
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['createdAt', 'DESC']]
    });

    if (!validOtp) {
      throw { statusCode: 400, message: 'Invalid or expired OTP. Please initiate password reset again.' };
    }

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    // Check duplicate password
    const isSameAsPrevious = await bcrypt.compare(newPassword, user.password);
    if (isSameAsPrevious) {
      throw {
        statusCode: 400,
        message: 'New password cannot be the same as your current password. Please choose a different password.'
      };
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Mark OTP used
    validOtp.isUsed = true;
    await validOtp.save();

    return {
      message: 'Password has been reset successfully! You can now login with your new password.'
    };
  }

  /**
   * Verify Admin 24-Hour Invite Token
   */
  static async verifyAdminInviteToken({ token, email }) {
    if (!token || !email) {
      throw { statusCode: 400, message: 'Please provide both setup token and email address' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      throw { statusCode: 404, message: 'Admin account not found' };
    }

    // Check if token matches
    if (!user.inviteToken || user.inviteToken !== token.trim()) {
      return {
        valid: false,
        used: true,
        expired: false,
        message: 'This activation link is invalid or has already been used. Please request a new link if needed.'
      };
    }

    // Check 24-hour expiration
    if (!user.inviteTokenExpiry || new Date(user.inviteTokenExpiry) < new Date()) {
      return {
        valid: false,
        used: false,
        expired: true,
        message: 'This activation link has expired. Activation links are valid for 24 hours. Please request a new link below.'
      };
    }

    return {
      valid: true,
      email: user.email,
      name: user.name,
      expiry: user.inviteTokenExpiry,
      message: 'Invite link is valid. Please set your new password.'
    };
  }

  /**
   * Request a new 24-hour Admin Invite Link when expired or needed
   */
  static async requestAdminInviteLink({ email }) {
    if (!email) {
      throw { statusCode: 400, message: 'Please provide your admin email address' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      throw { statusCode: 404, message: 'No admin account found with this email address' };
    }

    // Generate fresh 6-character UUID password
    const tempPassword = generate6CharUuidPassword();

    // Generate fresh secure invite token
    const inviteToken = generateInviteToken();

    // Fresh 24-hour expiry
    const inviteTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Hash initial password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    user.password = hashedPassword;
    user.inviteToken = inviteToken;
    user.inviteTokenExpiry = inviteTokenExpiry;
    user.status = 'pending';
    user.isPasswordSet = false;
    await user.save();

    const setupLink = `${FRONTEND_URL}/admin/setup-password?token=${inviteToken}&email=${encodeURIComponent(user.email)}`;

    // Dispatch email
    await EmailService.sendAdminInvitation(user.email, user.name, tempPassword, setupLink, 24);

    return {
      message: `A new 24-hour activation link and temporary password have been emailed to ${user.email}.`
    };
  }

  /**
   * Set Admin Password & Immediately Deactivate Invite Link
   */
  static async setupAdminPassword({ token, email, newPassword }) {
    if (!token || !email || !newPassword) {
      throw { statusCode: 400, message: 'Please provide email, token, and new password' };
    }

    if (newPassword.length < 6) {
      throw { statusCode: 400, message: 'New password must be at least 6 characters long' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      throw { statusCode: 404, message: 'Admin account not found' };
    }

    // Validate invite token
    if (!user.inviteToken || user.inviteToken !== token.trim()) {
      throw {
        statusCode: 400,
        message: 'This activation link is invalid or has already been deactivated. Please request a new link.'
      };
    }

    // Check 24-hour expiry
    if (!user.inviteTokenExpiry || new Date(user.inviteTokenExpiry) < new Date()) {
      throw {
        statusCode: 400,
        message: 'This activation link has expired (24 hours passed). Please request a new link.'
      };
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and DEACTIVATE link immediately
    user.password = hashedPassword;
    user.inviteToken = null;
    user.inviteTokenExpiry = null;
    user.isPasswordSet = true;
    user.isVerified = true;
    user.status = 'active';
    await user.save();

    // Issue JWT token for immediate access
    const authToken = generateToken(user);

    return {
      token: authToken,
      user,
      message: 'Password configured successfully! Your admin account is now active.'
    };
  }

  /**
   * Create or setup SuperAdmin account (Initial setup / Postman bootstrap)
   */
  static async setupSuperAdmin({ name, email, password, phone }) {
    if (!name || !email || !password) {
      throw { statusCode: 400, message: 'Please provide name, email, and password for superadmin' };
    }

    if (password.length < 6) {
      throw { statusCode: 400, message: 'Password must be at least 6 characters long' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ where: { email: normalizedEmail } });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (user) {
      user.name = name.trim();
      user.password = hashedPassword;
      user.role = 'superadmin';
      user.status = 'active';
      user.isVerified = true;
      user.isPasswordSet = true;
      if (phone) user.phone = phone.trim();
      await user.save();
    } else {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
        role: 'superadmin',
        status: 'active',
        isVerified: true,
        isPasswordSet: true,
        isProfileCompleted: true
      });
    }

    const token = generateToken(user);

    return {
      token,
      user,
      message: 'SuperAdmin account created/configured successfully!'
    };
  }

  /**
   * Create or setup Supreme Root User (Upper level above SuperAdmins, Invisible to SuperAdmins & Admins)
   * Strictly Single Root: Only ONE root user can exist in the entire application.
   */
  static async setupRootUser({ name, email, password, phone, secretKey }) {
    const expectedSecret = process.env.ROOT_SETUP_SECRET || 'raj_exam_vault_root_master_key_2026';
    if (secretKey && secretKey !== expectedSecret) {
      throw { statusCode: 403, message: 'Invalid root authorization secret key' };
    }

    if (!name || !email || !password) {
      throw { statusCode: 400, message: 'Please provide name, email, and password for root user' };
    }

    if (password.length < 6) {
      throw { statusCode: 400, message: 'Password must be at least 6 characters long' };
    }

    // Ensure database table ENUM column allows 'root'
    try {
      if (sequelize) {
        await sequelize.query("ALTER TABLE `users` MODIFY COLUMN `role` ENUM('user', 'admin', 'superadmin', 'root') NOT NULL DEFAULT 'user';");
      }
    } catch (_) {}
    try {
      if (sequelize) {
        await sequelize.query("ALTER TABLE `Users` MODIFY COLUMN `role` ENUM('user', 'admin', 'superadmin', 'root') NOT NULL DEFAULT 'user';");
      }
    } catch (_) {}

    const normalizedEmail = email.toLowerCase().trim();

    // STRICT SINGLETON ROOT ENFORCEMENT: Check if a different root user already exists
    const existingRoot = await User.findOne({ where: { role: 'root' } });
    if (existingRoot && existingRoot.email.toLowerCase() !== normalizedEmail) {
      throw {
        statusCode: 403,
        message: 'A supreme root user already exists in the system. Only ONE root user is allowed. Root ownership must be transferred by the current root user.'
      };
    }

    let user = await User.findOne({ where: { email: normalizedEmail } });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (user) {
      user.name = name.trim();
      user.password = hashedPassword;
      user.role = 'root';
      user.status = 'active';
      user.isVerified = true;
      user.isPasswordSet = true;
      user.isProfileCompleted = true;
      if (phone) user.phone = phone.trim();
      await user.save();
    } else {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
        role: 'root',
        status: 'active',
        isVerified: true,
        isPasswordSet: true,
        isProfileCompleted: true
      });
    }

    const token = generateToken(user);

    return {
      token,
      user,
      message: 'Supreme Root User established successfully. All-level control enabled.'
    };
  }

  /**
   * Transfer Root Ownership (Only callable by active Root user)
   * Demotes previous root to superadmin/admin and promotes target user to root.
   */
  static async transferRootOwnership(currentRootUser, { targetEmail, newRoleForPreviousRoot = 'superadmin', password }) {
    if (!currentRootUser || currentRootUser.role !== 'root') {
      throw { statusCode: 403, message: 'Forbidden. Only the active Root user can transfer root ownership.' };
    }

    if (!targetEmail || !password) {
      throw { statusCode: 400, message: 'Please provide target email and your current root password for verification.' };
    }

    // Verify current root password
    const rootUserInDb = await User.findByPk(currentRootUser.id);
    if (!rootUserInDb || rootUserInDb.role !== 'root') {
      throw { statusCode: 403, message: 'Root account authentication failed' };
    }

    const isMatch = await bcrypt.compare(password, rootUserInDb.password);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid root password. Ownership transfer rejected.' };
    }

    const normalizedTargetEmail = targetEmail.toLowerCase().trim();
    if (normalizedTargetEmail === rootUserInDb.email.toLowerCase().trim()) {
      throw { statusCode: 400, message: 'Target user is already the current root owner.' };
    }

    const targetUser = await User.findOne({ where: { email: normalizedTargetEmail } });
    if (!targetUser) {
      throw { statusCode: 404, message: `No user found with email '${normalizedTargetEmail}' to receive root ownership.` };
    }

    // Transactional atomic handover
    const t = await sequelize.transaction();
    try {
      // 1. Demote previous root
      rootUserInDb.role = ['superadmin', 'admin', 'user'].includes(newRoleForPreviousRoot) ? newRoleForPreviousRoot : 'superadmin';
      await rootUserInDb.save({ transaction: t });

      // 2. Promote target user to new supreme root
      targetUser.role = 'root';
      targetUser.status = 'active';
      targetUser.isVerified = true;
      targetUser.isPasswordSet = true;
      await targetUser.save({ transaction: t });

      await t.commit();

      return {
        message: `Root ownership successfully transferred to ${targetUser.name} (${targetUser.email}). Your account role is now '${rootUserInDb.role}'.`,
        previousRoot: rootUserInDb,
        newRoot: targetUser
      };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

module.exports = AuthService;
