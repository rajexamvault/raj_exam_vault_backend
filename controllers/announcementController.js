const announcementService = require('../services/announcementService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

/**
 * AnnouncementController - Modern ES6+ Arrow Functions for Official Announcements & Breaking Tickers
 */

/**
 * @route GET /api/announcements
 */
const getAllAnnouncements = async (req, res) => {
  try {
    const data = await announcementService.getAllAnnouncements(req.query ?? {});
    return successResponse(res, 200, 'Announcements retrieved successfully', data);
  } catch (err) {
    console.error('Get announcements error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch announcements', err);
  }
};

/**
 * @route GET /api/announcements/flash-ticker
 */
const getFlashTicker = async (req, res) => {
  try {
    const alerts = await announcementService.getFlashTickerAlerts();
    return successResponse(res, 200, 'Flash ticker alerts loaded', { alerts });
  } catch (err) {
    console.error('Flash ticker error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to load flash ticker alerts', err);
  }
};

/**
 * @route GET /api/announcements/stats
 */
const getStats = async (req, res) => {
  try {
    const stats = await announcementService.getStats();
    return successResponse(res, 200, 'Announcement stats loaded', { stats });
  } catch (err) {
    console.error('Announcement stats error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to load stats', err);
  }
};

/**
 * @route GET /api/announcements/:idOrSlug
 */
const getAnnouncement = async (req, res) => {
  try {
    const { idOrSlug } = req.params ?? {};
    const announcement = await announcementService.getAnnouncementBySlugOrId(idOrSlug);
    return successResponse(res, 200, 'Announcement details loaded', { announcement });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    return errorResponse(res, 500, err?.message ?? 'Failed to retrieve announcement details', err);
  }
};

/**
 * @route POST /api/announcements (Protected: announcement:create)
 */
const createAnnouncement = async (req, res) => {
  try {
    const announcement = await announcementService.createAnnouncement(req.body ?? {}, req.user?.id);
    return successResponse(res, 201, 'Announcement published successfully 📢', { announcement });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Create announcement error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to create announcement', err);
  }
};

/**
 * @route PUT /api/announcements/:id (Protected: announcement:update)
 */
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const announcement = await announcementService.updateAnnouncement(id, req.body ?? {});
    return successResponse(res, 200, 'Announcement updated successfully ✏️', { announcement });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Update announcement error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to update announcement', err);
  }
};

/**
 * @route DELETE /api/announcements/:id (Protected: announcement:delete)
 */
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await announcementService.deleteAnnouncement(id);
    return successResponse(res, 200, result?.message ?? 'Announcement deleted successfully');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Delete announcement error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to delete announcement', err);
  }
};

const AnnouncementController = {
  getAllAnnouncements,
  getFlashTicker,
  getStats,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};

module.exports = AnnouncementController;
module.exports.getAllAnnouncements = getAllAnnouncements;
module.exports.getFlashTicker = getFlashTicker;
module.exports.getStats = getStats;
module.exports.getAnnouncement = getAnnouncement;
module.exports.createAnnouncement = createAnnouncement;
module.exports.updateAnnouncement = updateAnnouncement;
module.exports.deleteAnnouncement = deleteAnnouncement;
