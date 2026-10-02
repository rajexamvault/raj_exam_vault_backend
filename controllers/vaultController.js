const vaultService = require('../services/vaultService');

class VaultController {
  /**
   * Get Aspirant Performance & Vault Stats
   */
  async getStats(req, res) {
    try {
      const stats = await vaultService.getVaultStats(req.user.id);
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      console.error('Vault stats error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve vault stats',
        error: err.message
      });
    }
  }

  /**
   * Get User Bookmarks
   */
  async getBookmarks(req, res) {
    try {
      const { type } = req.query;
      const bookmarks = await vaultService.getBookmarks(req.user.id, type);
      return res.status(200).json({
        success: true,
        data: bookmarks
      });
    } catch (err) {
      console.error('Bookmarks fetch error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve bookmarks',
        error: err.message
      });
    }
  }

  /**
   * Toggle Bookmark (Save / Unsave)
   */
  async toggleBookmark(req, res) {
    try {
      const result = await vaultService.toggleBookmark(req.user.id, req.body);
      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      console.error('Bookmark toggle error:', err);
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Bookmark toggle failed'
      });
    }
  }

  /**
   * Remove Bookmark
   */
  async removeBookmark(req, res) {
    try {
      const result = await vaultService.removeBookmark(req.user.id, req.params.id);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Remove bookmark error:', err);
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Failed to remove bookmark'
      });
    }
  }

  /**
   * Get User Mock Test History
   */
  async getTestAttempts(req, res) {
    try {
      const attempts = await vaultService.getUserTestAttempts(req.user.id);
      return res.status(200).json({
        success: true,
        data: attempts
      });
    } catch (err) {
      console.error('Test attempts error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve mock test history',
        error: err.message
      });
    }
  }

  /**
   * Get Subject Strengths and Weak Area Radar
   */
  async getSubjectStrengths(req, res) {
    try {
      const strengths = await vaultService.getSubjectStrengths(req.user.id);
      return res.status(200).json({
        success: true,
        data: strengths
      });
    } catch (err) {
      console.error('Subject strengths error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate subject strengths',
        error: err.message
      });
    }
  }
}

module.exports = new VaultController();
