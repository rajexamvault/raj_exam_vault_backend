const questionService = require('../services/questionService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

class QuestionController {
  /**
   * @route GET /api/questions
   */
  async getQuestions(req, res) {
    try {
      const data = await questionService.getQuestions(req.query);
      return successResponse(res, 200, 'Questions retrieved successfully', data);
    } catch (err) {
      console.error('Get questions error:', err);
      return errorResponse(res, 500, 'Failed to fetch questions', err);
    }
  }

  /**
   * @route GET /api/questions/stats
   */
  async getStats(req, res) {
    try {
      const stats = await questionService.getQuestionStats(req.query.examId);
      return successResponse(res, 200, 'Question statistics loaded', { stats });
    } catch (err) {
      console.error('Get question stats error:', err);
      return errorResponse(res, 500, 'Failed to fetch question stats', err);
    }
  }

  /**
   * @route GET /api/questions/random-sample
   */
  async getRandomSample(req, res) {
    try {
      const questions = await questionService.getRandomSample(req.query);
      return successResponse(res, 200, 'Practice sample questions loaded', { questions });
    } catch (err) {
      console.error('Get random sample error:', err);
      return errorResponse(res, 500, 'Failed to generate practice sample', err);
    }
  }

  /**
   * @route GET /api/questions/:id
   */
  async getQuestionById(req, res) {
    try {
      const question = await questionService.getQuestionById(req.params.id);
      return successResponse(res, 200, 'Question details loaded', { question });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      return errorResponse(res, 500, 'Failed to fetch question details', err);
    }
  }

  /**
   * @route POST /api/questions (Protected: question:create)
   */
  async createQuestion(req, res) {
    try {
      const question = await questionService.createQuestion(req.body, req.user?.id);
      return successResponse(res, 201, 'Question added to Question Bank 🎯', { question });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Create question error:', err);
      return errorResponse(res, 500, 'Failed to create question', err);
    }
  }

  /**
   * @route POST /api/questions/bulk-import (Protected: question:create)
   */
  async bulkImport(req, res) {
    try {
      const { questions, defaultExamId } = req.body;
      const result = await questionService.bulkImport(questions, defaultExamId, req.user?.id);
      return successResponse(res, 201, result.message, result);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Bulk import error:', err);
      return errorResponse(res, 500, 'Failed to bulk import questions', err);
    }
  }

  /**
   * @route PUT /api/questions/:id (Protected: question:update)
   */
  async updateQuestion(req, res) {
    try {
      const question = await questionService.updateQuestion(req.params.id, req.body);
      return successResponse(res, 200, 'Question updated successfully ✏️', { question });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Update question error:', err);
      return errorResponse(res, 500, 'Failed to update question', err);
    }
  }

  /**
   * @route DELETE /api/questions/:id (Protected: question:delete)
   */
  async deleteQuestion(req, res) {
    try {
      const result = await questionService.deleteQuestion(req.params.id);
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Delete question error:', err);
      return errorResponse(res, 500, 'Failed to delete question', err);
    }
  }
}

module.exports = new QuestionController();
