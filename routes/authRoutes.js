const express = require('express');
const router = express.Router();
const {
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
  setupSuperAdmin
} = require('../controllers/authController');

const {
  getMe,
  updateProfile,
  changePassword,
  uploadProfileImage,
  deleteProfileImage,
  checkUsername
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public Authentication & Verification Routes
router.post('/signup', signup);
router.post('/verify-signup-otp', verifySignupOtp);
router.post('/resend-signup-otp', resendSignupOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.get('/check-username', checkUsername);

// SuperAdmin Initialization Route
router.post('/setup-superadmin', setupSuperAdmin);

// Admin Invitation & Password Setup Routes
router.get('/verify-admin-invite', verifyAdminInvite);
router.post('/request-admin-invite-link', requestAdminInviteLink);
router.post('/setup-admin-password', setupAdminPassword);

// Protected User Profile & Account Routes (under /api/auth for backward compatibility)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/profile-image', protect, upload.single('image'), uploadProfileImage);
router.delete('/profile-image', protect, deleteProfileImage);

module.exports = router;
