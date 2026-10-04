const vaultService = require('../services/vaultService');

/**
 * VaultController - Modern ES6+ Arrow Functions for Candidate Vault & Analytics
 */

/**
 * Get Aspirant Performance & Vault Stats
 */
const getStats = async (req, res) => {
  try {
    const stats = await vaultService.getVaultStats(req.user?.id);
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error('Vault stats error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve vault stats',
      error: err?.message ?? 'Internal server error'
    });
  }
};

/**
 * Get User Bookmarks
 */
const getBookmarks = async (req, res) => {
  try {
    const { type } = req.query ?? {};
    const bookmarks = await vaultService.getBookmarks(req.user?.id, type);
    return res.status(200).json({
      success: true,
      data: bookmarks
    });
  } catch (err) {
    console.error('Bookmarks fetch error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookmarks',
      error: err?.message ?? 'Internal server error'
    });
  }
};

/**
 * Toggle Bookmark (Save / Unsave)
 */
const toggleBookmark = async (req, res) => {
  try {
    const result = await vaultService.toggleBookmark(req.user?.id, req.body ?? {});
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Bookmark toggle error:', err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err?.message ?? 'Bookmark toggle failed'
    });
  }
};

/**
 * Remove Bookmark
 */
const removeBookmark = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await vaultService.removeBookmark(req.user?.id, id);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Remove bookmark error:', err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err?.message ?? 'Failed to remove bookmark'
    });
  }
};

/**
 * Get User Mock Test History
 */
const getTestAttempts = async (req, res) => {
  try {
    const attempts = await vaultService.getUserTestAttempts(req.user?.id);
    return res.status(200).json({
      success: true,
      data: attempts
    });
  } catch (err) {
    console.error('Test attempts error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve mock test history',
      error: err?.message ?? 'Internal server error'
    });
  }
};

/**
 * Get Subject Strengths and Weak Area Radar
 */
const getSubjectStrengths = async (req, res) => {
  try {
    const strengths = await vaultService.getSubjectStrengths(req.user?.id);
    return res.status(200).json({
      success: true,
      data: strengths
    });
  } catch (err) {
    console.error('Subject strengths error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate subject strengths',
      error: err?.message ?? 'Internal server error'
    });
  }
};

const VaultController = {
  getStats,
  getBookmarks,
  toggleBookmark,
  removeBookmark,
  getTestAttempts,
  getSubjectStrengths
};

module.exports = VaultController;
module.exports.getStats = getStats;
module.exports.getBookmarks = getBookmarks;
module.exports.toggleBookmark = toggleBookmark;
module.exports.removeBookmark = removeBookmark;
module.exports.getTestAttempts = getTestAttempts;
module.exports.getSubjectStrengths = getSubjectStrengths;
