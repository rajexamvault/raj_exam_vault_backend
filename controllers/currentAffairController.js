const currentAffairService = require('../services/currentAffairService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

/**
 * CurrentAffairController - Modern ES6+ Arrow Functions for Daily Rajasthan Current Affairs
 */

/**
 * @route GET /api/current-affairs
 */
const getAllCurrentAffairs = async (req, res) => {
  try {
    const data = await currentAffairService.getAllCurrentAffairs(req.query ?? {});
    return successResponse(res, 200, 'Current affairs retrieved successfully', data);
  } catch (err) {
    console.error('Get current affairs error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch current affairs', err);
  }
};

/**
 * @route GET /api/current-affairs/digest
 */
const getDailyDigest = async (req, res) => {
  try {
    const date = req.query?.date;
    const data = await currentAffairService.getDailyDigest(date);
    return successResponse(res, 200, 'Daily current affairs digest loaded', data);
  } catch (err) {
    console.error('Daily digest error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to generate daily digest', err);
  }
};

/**
 * @route GET /api/current-affairs/stats
 */
const getStats = async (req, res) => {
  try {
    const stats = await currentAffairService.getStats();
    return successResponse(res, 200, 'Current affairs statistics loaded', { stats });
  } catch (err) {
    console.error('Current affairs stats error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch stats', err);
  }
};

/**
 * @route GET /api/current-affairs/:idOrSlug
 */
const getCurrentAffair = async (req, res) => {
  try {
    const { idOrSlug } = req.params ?? {};
    const article = await currentAffairService.getCurrentAffairBySlugOrId(idOrSlug);
    return successResponse(res, 200, 'Article details loaded', { article });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    return errorResponse(res, 500, err?.message ?? 'Failed to retrieve article details', err);
  }
};

/**
 * @route POST /api/current-affairs/view/:id
 */
const trackView = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await currentAffairService.incrementView(id);
    return successResponse(res, 200, 'View recorded', result);
  } catch (err) {
    return errorResponse(res, 500, err?.message ?? 'Failed to track view', err);
  }
};

/**
 * @route POST /api/current-affairs/like/:id
 */
const trackLike = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await currentAffairService.incrementLike(id);
    return successResponse(res, 200, 'Liked article', result);
  } catch (err) {
    return errorResponse(res, 500, err?.message ?? 'Failed to track like', err);
  }
};

/**
 * @route POST /api/current-affairs (Protected: current_affairs:create)
 */
const createCurrentAffair = async (req, res) => {
  try {
    const article = await currentAffairService.createCurrentAffair(req.body ?? {}, req.user?.id);
    return successResponse(res, 201, 'Current affairs article published 📰', { article });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Create article error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to create current affairs article', err);
  }
};

/**
 * @route PUT /api/current-affairs/:id (Protected: current_affairs:update)
 */
const updateCurrentAffair = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const article = await currentAffairService.updateCurrentAffair(id, req.body ?? {});
    return successResponse(res, 200, 'Current affairs article updated ✏️', { article });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Update article error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to update current affairs article', err);
  }
};

/**
 * @route DELETE /api/current-affairs/:id (Protected: current_affairs:delete)
 */
const deleteCurrentAffair = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await currentAffairService.deleteCurrentAffair(id);
    return successResponse(res, 200, result?.message ?? 'Article deleted successfully');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Delete article error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to delete article', err);
  }
};

const CurrentAffairController = {
  getAllCurrentAffairs,
  getDailyDigest,
  getStats,
  getCurrentAffair,
  trackView,
  trackLike,
  createCurrentAffair,
  updateCurrentAffair,
  deleteCurrentAffair
};

module.exports = CurrentAffairController;
module.exports.getAllCurrentAffairs = getAllCurrentAffairs;
module.exports.getDailyDigest = getDailyDigest;
module.exports.getStats = getStats;
module.exports.getCurrentAffair = getCurrentAffair;
module.exports.trackView = trackView;
module.exports.trackLike = trackLike;
module.exports.createCurrentAffair = createCurrentAffair;
module.exports.updateCurrentAffair = updateCurrentAffair;
module.exports.deleteCurrentAffair = deleteCurrentAffair;
