const ExamService = require('../services/examService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

class ExamController {
  /**
   * @route GET /api/exams
   */
  static async getAllExams(req, res) {
    try {
      const data = await ExamService.getAllExams(req.query);
      return successResponse(res, 200, 'Exams retrieved successfully', data);
    } catch (err) {
      console.error('Get all exams error:', err);
      return errorResponse(res, 500, 'Failed to fetch exams', err);
    }
  }

  /**
   * @route GET /api/exams/:idOrSlug
   */
  static async getExamByIdOrSlug(req, res) {
    try {
      const exam = await ExamService.getExamByIdOrSlug(req.params.idOrSlug);
      return successResponse(res, 200, 'Exam details retrieved successfully', { exam });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Get exam details error:', err);
      return errorResponse(res, 500, 'Failed to retrieve exam details', err);
    }
  }

  /**
   * @route POST /api/exams (SuperAdmin/Admin only)
   */
  static async createExam(req, res) {
    try {
      const exam = await ExamService.createExam(req.body, req.user?.id);
      return successResponse(res, 201, 'Exam created successfully 🎯', { exam });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Create exam error:', err);
      return errorResponse(res, 500, 'Failed to create exam', err);
    }
  }

  /**
   * @route PUT /api/exams/:id (SuperAdmin/Admin only)
   */
  static async updateExam(req, res) {
    try {
      const exam = await ExamService.updateExam(req.params.id, req.body);
      return successResponse(res, 200, 'Exam updated successfully ✏️', { exam });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Update exam error:', err);
      return errorResponse(res, 500, 'Failed to update exam', err);
    }
  }

  /**
   * @route DELETE /api/exams/:id (SuperAdmin only)
   */
  static async deleteExam(req, res) {
    try {
      const result = await ExamService.deleteExam(req.params.id);
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Delete exam error:', err);
      return errorResponse(res, 500, 'Failed to delete exam', err);
    }
  }
}

module.exports = ExamController;
