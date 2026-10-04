const questionService = require('../services/questionService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

/**
 * QuestionController - Modern ES6+ Arrow Functions for Rajasthan Question Bank
 */

/**
 * @route GET /api/questions
 */
const getQuestions = async (req, res) => {
  try {
    const data = await questionService.getQuestions(req.query ?? {});
    return successResponse(res, 200, 'Questions retrieved successfully', data);
  } catch (err) {
    console.error('Get questions error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch questions', err);
  }
};

/**
 * @route GET /api/questions/stats
 */
const getStats = async (req, res) => {
  try {
    const examId = req.query?.examId;
    const stats = await questionService.getQuestionStats(examId);
    return successResponse(res, 200, 'Question statistics loaded', { stats });
  } catch (err) {
    console.error('Get question stats error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch question stats', err);
  }
};

/**
 * @route GET /api/questions/random-sample
 */
const getRandomSample = async (req, res) => {
  try {
    const questions = await questionService.getRandomSample(req.query ?? {});
    return successResponse(res, 200, 'Practice sample questions loaded', { questions });
  } catch (err) {
    console.error('Get random sample error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to generate practice sample', err);
  }
};

/**
 * @route GET /api/questions/:id
 */
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const question = await questionService.getQuestionById(id);
    return successResponse(res, 200, 'Question details loaded', { question });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch question details', err);
  }
};

/**
 * @route POST /api/questions (Protected: question:create)
 */
const createQuestion = async (req, res) => {
  try {
    const question = await questionService.createQuestion(req.body ?? {}, req.user?.id);
    return successResponse(res, 201, 'Question added to Question Bank 🎯', { question });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Create question error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to create question', err);
  }
};

/**
 * @route POST /api/questions/bulk-import (Protected: question:create)
 */
const bulkImport = async (req, res) => {
  try {
    const { questions, defaultExamId, defaultSubjectId, defaultTopicId, examId, subjectId, topicId } = req.body ?? {};
    const finalExamId = examId || defaultExamId;
    const finalSubjectId = subjectId || defaultSubjectId;
    const finalTopicId = topicId || defaultTopicId;
    const result = await questionService.bulkImport(questions, finalExamId, req.user?.id, finalSubjectId, finalTopicId);
    return successResponse(res, 201, result?.message ?? 'Questions imported successfully', result);
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Bulk import error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to bulk import questions', err);
  }
};

/**
 * @route PUT /api/questions/:id (Protected: question:update)
 */
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const question = await questionService.updateQuestion(id, req.body ?? {});
    return successResponse(res, 200, 'Question updated successfully ✏️', { question });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Update question error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to update question', err);
  }
};

/**
 * @route DELETE /api/questions/:id (Protected: question:delete)
 */
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await questionService.deleteQuestion(id);
    return successResponse(res, 200, result?.message ?? 'Question deleted successfully');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Delete question error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to delete question', err);
  }
};

/**
 * @route POST /api/questions/bulk-delete (Protected: question:delete)
 */
const bulkDeleteQuestions = async (req, res) => {
  try {
    const { questionIds } = req.body ?? {};
    const result = await questionService.bulkDeleteQuestions(questionIds);
    return successResponse(res, 200, result?.message ?? 'Questions deleted successfully', result);
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Bulk delete questions error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to delete questions', err);
  }
};

const QuestionController = {
  getQuestions,
  getStats,
  getRandomSample,
  getQuestionById,
  createQuestion,
  bulkImport,
  updateQuestion,
  deleteQuestion,
  bulkDeleteQuestions
};

module.exports = QuestionController;
module.exports.getQuestions = getQuestions;
module.exports.getStats = getStats;
module.exports.getRandomSample = getRandomSample;
module.exports.getQuestionById = getQuestionById;
module.exports.createQuestion = createQuestion;
module.exports.bulkImport = bulkImport;
module.exports.updateQuestion = updateQuestion;
module.exports.deleteQuestion = deleteQuestion;
module.exports.bulkDeleteQuestions = bulkDeleteQuestions;
