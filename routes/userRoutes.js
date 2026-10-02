const express = require('express');
const router = express.Router();
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

const vaultController = require('../controllers/vaultController');

// Public username check
router.get('/check-username', checkUsername);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/profile-image', upload.single('image'), uploadProfileImage);
router.delete('/profile-image', deleteProfileImage);

// Aspirant Personal Vault & Analytics Endpoints
router.get('/vault/stats', (req, res) => vaultController.getStats(req, res));
router.get('/vault/bookmarks', (req, res) => vaultController.getBookmarks(req, res));
router.post('/vault/bookmarks', (req, res) => vaultController.toggleBookmark(req, res));
router.delete('/vault/bookmarks/:id', (req, res) => vaultController.removeBookmark(req, res));
router.get('/vault/attempts', (req, res) => vaultController.getTestAttempts(req, res));
router.get('/vault/subject-strengths', (req, res) => vaultController.getSubjectStrengths(req, res));

module.exports = router;
