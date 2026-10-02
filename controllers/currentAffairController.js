const currentAffairService = require('../services/currentAffairService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

class CurrentAffairController {
  /**
   * @route GET /api/current-affairs
   */
  async getAllCurrentAffairs(req, res) {
    try {
      const data = await currentAffairService.getAllCurrentAffairs(req.query);
      return successResponse(res, 200, 'Current affairs retrieved successfully', data);
    } catch (err) {
      console.error('Get current affairs error:', err);
      return errorResponse(res, 500, 'Failed to fetch current affairs', err);
    }
  }

  /**
   * @route GET /api/current-affairs/digest
   */
  async getDailyDigest(req, res) {
    try {
      const data = await currentAffairService.getDailyDigest(req.query.date);
      return successResponse(res, 200, 'Daily current affairs digest loaded', data);
    } catch (err) {
      console.error('Daily digest error:', err);
      return errorResponse(res, 500, 'Failed to generate daily digest', err);
    }
  }

  /**
   * @route GET /api/current-affairs/stats
   */
  async getStats(req, res) {
    try {
      const stats = await currentAffairService.getStats();
      return successResponse(res, 200, 'Current affairs statistics loaded', { stats });
    } catch (err) {
      console.error('Current affairs stats error:', err);
      return errorResponse(res, 500, 'Failed to fetch stats', err);
    }
  }

  /**
   * @route GET /api/current-affairs/:idOrSlug
   */
  async getCurrentAffair(req, res) {
    try {
      const article = await currentAffairService.getCurrentAffairBySlugOrId(req.params.idOrSlug);
      return successResponse(res, 200, 'Article details loaded', { article });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      return errorResponse(res, 500, 'Failed to retrieve article details', err);
    }
  }

  /**
   * @route POST /api/current-affairs/view/:id
   */
  async trackView(req, res) {
    try {
      const result = await currentAffairService.incrementView(req.params.id);
      return successResponse(res, 200, 'View recorded', result);
    } catch (err) {
      return errorResponse(res, 500, 'Failed to track view', err);
    }
  }

  /**
   * @route POST /api/current-affairs/like/:id
   */
  async trackLike(req, res) {
    try {
      const result = await currentAffairService.incrementLike(req.params.id);
      return successResponse(res, 200, 'Liked article', result);
    } catch (err) {
      return errorResponse(res, 500, 'Failed to track like', err);
    }
  }

  /**
   * @route POST /api/current-affairs (Protected: current_affairs:create)
   */
  async createCurrentAffair(req, res) {
    try {
      const article = await currentAffairService.createCurrentAffair(req.body, req.user?.id);
      return successResponse(res, 201, 'Current affairs article published 📰', { article });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Create article error:', err);
      return errorResponse(res, 500, 'Failed to create current affairs article', err);
    }
  }

  /**
   * @route PUT /api/current-affairs/:id (Protected: current_affairs:update)
   */
  async updateCurrentAffair(req, res) {
    try {
      const article = await currentAffairService.updateCurrentAffair(req.params.id, req.body);
      return successResponse(res, 200, 'Current affairs article updated ✏️', { article });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Update article error:', err);
      return errorResponse(res, 500, 'Failed to update current affairs article', err);
    }
  }

  /**
   * @route DELETE /api/current-affairs/:id (Protected: current_affairs:delete)
   */
  async deleteCurrentAffair(req, res) {
    try {
      const result = await currentAffairService.deleteCurrentAffair(req.params.id);
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Delete article error:', err);
      return errorResponse(res, 500, 'Failed to delete article', err);
    }
  }
}

module.exports = new CurrentAffairController();
