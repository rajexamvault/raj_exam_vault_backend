const ExamService = require('../services/examService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

/**
 * ExamController - Modern ES6+ Arrow Functions for Rajasthan Exams Management
 */

/**
 * @route GET /api/exams
 */
const getAllExams = async (req, res) => {
  try {
    const data = await ExamService.getAllExams(req.query ?? {});
    return successResponse(res, 200, 'Exams retrieved successfully', data);
  } catch (err) {
    console.error('Get all exams error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch exams', err);
  }
};

/**
 * @route GET /api/exams/:idOrSlug
 */
const getExamByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params ?? {};
    const exam = await ExamService.getExamByIdOrSlug(idOrSlug);
    return successResponse(res, 200, 'Exam details retrieved successfully', { exam });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Get exam details error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to retrieve exam details', err);
  }
};

/**
 * @route POST /api/exams (SuperAdmin/Admin only)
 */
const createExam = async (req, res) => {
  try {
    const exam = await ExamService.createExam(req.body ?? {}, req.user?.id);
    return successResponse(res, 201, 'Exam created successfully 🎯', { exam });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Create exam error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to create exam', err);
  }
};

/**
 * @route PUT /api/exams/:id (SuperAdmin/Admin only)
 */
const updateExam = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const exam = await ExamService.updateExam(id, req.body ?? {});
    return successResponse(res, 200, 'Exam updated successfully ✏️', { exam });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Update exam error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to update exam', err);
  }
};

/**
 * @route DELETE /api/exams/:id (SuperAdmin only)
 */
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await ExamService.deleteExam(id);
    return successResponse(res, 200, result?.message ?? 'Exam deleted successfully');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Delete exam error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to delete exam', err);
  }
};

const ExamController = {
  getAllExams,
  getExamByIdOrSlug,
  createExam,
  updateExam,
  deleteExam
};

module.exports = ExamController;
module.exports.getAllExams = getAllExams;
module.exports.getExamByIdOrSlug = getExamByIdOrSlug;
module.exports.createExam = createExam;
module.exports.updateExam = updateExam;
module.exports.deleteExam = deleteExam;
