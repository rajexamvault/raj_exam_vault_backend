const announcementService = require('../services/announcementService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

class AnnouncementController {
  /**
   * @route GET /api/announcements
   */
  async getAllAnnouncements(req, res) {
    try {
      const data = await announcementService.getAllAnnouncements(req.query);
      return successResponse(res, 200, 'Announcements retrieved successfully', data);
    } catch (err) {
      console.error('Get announcements error:', err);
      return errorResponse(res, 500, 'Failed to fetch announcements', err);
    }
  }

  /**
   * @route GET /api/announcements/flash-ticker
   */
  async getFlashTicker(req, res) {
    try {
      const alerts = await announcementService.getFlashTickerAlerts();
      return successResponse(res, 200, 'Flash ticker alerts loaded', { alerts });
    } catch (err) {
      console.error('Flash ticker error:', err);
      return errorResponse(res, 500, 'Failed to load flash ticker alerts', err);
    }
  }

  /**
   * @route GET /api/announcements/stats
   */
  async getStats(req, res) {
    try {
      const stats = await announcementService.getStats();
      return successResponse(res, 200, 'Announcement stats loaded', { stats });
    } catch (err) {
      console.error('Announcement stats error:', err);
      return errorResponse(res, 500, 'Failed to load stats', err);
    }
  }

  /**
   * @route GET /api/announcements/:idOrSlug
   */
  async getAnnouncement(req, res) {
    try {
      const announcement = await announcementService.getAnnouncementBySlugOrId(req.params.idOrSlug);
      return successResponse(res, 200, 'Announcement details loaded', { announcement });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      return errorResponse(res, 500, 'Failed to retrieve announcement details', err);
    }
  }

  /**
   * @route POST /api/announcements (Protected: announcement:create)
   */
  async createAnnouncement(req, res) {
    try {
      const announcement = await announcementService.createAnnouncement(req.body, req.user?.id);
      return successResponse(res, 201, 'Announcement published successfully 📢', { announcement });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Create announcement error:', err);
      return errorResponse(res, 500, 'Failed to create announcement', err);
    }
  }

  /**
   * @route PUT /api/announcements/:id (Protected: announcement:update)
   */
  async updateAnnouncement(req, res) {
    try {
      const announcement = await announcementService.updateAnnouncement(req.params.id, req.body);
      return successResponse(res, 200, 'Announcement updated successfully ✏️', { announcement });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Update announcement error:', err);
      return errorResponse(res, 500, 'Failed to update announcement', err);
    }
  }

  /**
   * @route DELETE /api/announcements/:id (Protected: announcement:delete)
   */
  async deleteAnnouncement(req, res) {
    try {
      const result = await announcementService.deleteAnnouncement(req.params.id);
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Delete announcement error:', err);
      return errorResponse(res, 500, 'Failed to delete announcement', err);
    }
  }
}

module.exports = new AnnouncementController();
