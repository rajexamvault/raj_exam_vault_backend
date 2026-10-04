const mockTestService = require('../services/mockTestService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

/**
 * MockTestController - Modern ES6+ Arrow Functions for Mock Tests Management & Exam Engine
 */

/**
 * @route GET /api/tests
 */
const getAllTests = async (req, res) => {
  try {
    const data = await mockTestService.getAllMockTests(req.query ?? {});
    return successResponse(res, 200, 'Mock tests retrieved successfully', data);
  } catch (err) {
    console.error('Get mock tests error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch mock tests', err);
  }
};

/**
 * @route GET /api/tests/:id
 */
const getTestById = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const isStaff = req.user && ['superadmin', 'admin', 'question_manager'].includes(req.user.role);
    const mockTest = await mockTestService.getMockTestById(id, isStaff);
    return successResponse(res, 200, 'Mock test details loaded', { mockTest });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    return errorResponse(res, 500, err?.message ?? 'Failed to retrieve mock test details', err);
  }
};

/**
 * @route POST /api/tests (Protected: test:create)
 */
const createTest = async (req, res) => {
  try {
    const mockTest = await mockTestService.createMockTest(req.body ?? {}, req.user?.id);
    return successResponse(res, 201, 'Mock test created successfully 🎯', { mockTest });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Create test error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to create mock test', err);
  }
};

/**
 * @route PUT /api/tests/:id (Protected: test:update)
 */
const updateTest = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const mockTest = await mockTestService.updateMockTest(id, req.body ?? {});
    return successResponse(res, 200, 'Mock test updated successfully ✏️', { mockTest });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Update test error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to update mock test', err);
  }
};

/**
 * @route DELETE /api/tests/:id (Protected: test:delete)
 */
const deleteTest = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await mockTestService.deleteMockTest(id);
    return successResponse(res, 200, result?.message ?? 'Mock test deleted successfully');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Delete test error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to delete mock test', err);
  }
};

/**
 * @route POST /api/tests/:id/add-questions (Protected: test:update)
 */
const addQuestions = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const { questionIds, sectionName } = req.body ?? {};
    const result = await mockTestService.addQuestionsToTest(id, questionIds, sectionName);
    return successResponse(res, 200, result?.message ?? 'Questions mapped successfully', result);
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Add questions error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to map questions to test', err);
  }
};

/**
 * @route POST /api/tests/:id/auto-populate (Protected: test:update)
 */
const autoPopulateQuestions = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await mockTestService.autoPopulateRandomQuestions(id, req.body ?? {});
    return successResponse(res, 200, result?.message ?? 'Questions auto-populated successfully', result);
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Auto populate error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to auto populate test questions', err);
  }
};

/**
 * @route DELETE /api/tests/:id/questions/:questionId (Protected: test:update)
 */
const removeQuestion = async (req, res) => {
  try {
    const { id, questionId } = req.params ?? {};
    const result = await mockTestService.removeQuestionFromTest(id, questionId);
    return successResponse(res, 200, result?.message ?? 'Question removed', result);
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    return errorResponse(res, 500, err?.message ?? 'Failed to remove question from test', err);
  }
};

/**
 * @route POST /api/tests/:id/start (Student test session start)
 */
const startTest = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const userId = req.user?.id;
    const session = await mockTestService.startTestAttempt(id, userId);
    return successResponse(res, 200, 'Test attempt started', session);
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Start test error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to start test attempt', err);
  }
};

/**
 * @route POST /api/tests/attempts/:attemptId/submit (Student test submission & instant grading)
 */
const submitTest = async (req, res) => {
  try {
    const { attemptId } = req.params ?? {};
    const { userAnswers, timeSpentSeconds } = req.body ?? {};
    const evaluation = await mockTestService.submitTestAttempt(
      attemptId,
      userAnswers,
      timeSpentSeconds,
      req.user?.id
    );
    return successResponse(res, 200, 'Test submitted and graded successfully 🎉', evaluation);
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Submit test error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to grade test attempt', err);
  }
};

/**
 * @route GET /api/tests/:id/leaderboard
 */
const getLeaderboard = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const leaderboard = await mockTestService.getLeaderboard(id);
    return successResponse(res, 200, 'Leaderboard retrieved', { leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch leaderboard', err);
  }
};

const MockTestController = {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  addQuestions,
  autoPopulateQuestions,
  removeQuestion,
  startTest,
  submitTest,
  getLeaderboard
};

module.exports = MockTestController;
module.exports.getAllTests = getAllTests;
module.exports.getTestById = getTestById;
module.exports.createTest = createTest;
module.exports.updateTest = updateTest;
module.exports.deleteTest = deleteTest;
module.exports.addQuestions = addQuestions;
module.exports.autoPopulateQuestions = autoPopulateQuestions;
module.exports.removeQuestion = removeQuestion;
module.exports.startTest = startTest;
module.exports.submitTest = submitTest;
module.exports.getLeaderboard = getLeaderboard;
