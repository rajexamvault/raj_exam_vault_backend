const mockTestService = require('../services/mockTestService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

class MockTestController {
  /**
   * @route GET /api/tests
   */
  async getAllTests(req, res) {
    try {
      const data = await mockTestService.getAllMockTests(req.query);
      return successResponse(res, 200, 'Mock tests retrieved successfully', data);
    } catch (err) {
      console.error('Get mock tests error:', err);
      return errorResponse(res, 500, 'Failed to fetch mock tests', err);
    }
  }

  /**
   * @route GET /api/tests/:id
   */
  async getTestById(req, res) {
    try {
      const isStaff = req.user && ['superadmin', 'admin', 'question_manager'].includes(req.user.role);
      const mockTest = await mockTestService.getMockTestById(req.params.id, isStaff);
      return successResponse(res, 200, 'Mock test details loaded', { mockTest });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      return errorResponse(res, 500, 'Failed to retrieve mock test details', err);
    }
  }

  /**
   * @route POST /api/tests (Protected: test:create)
   */
  async createTest(req, res) {
    try {
      const mockTest = await mockTestService.createMockTest(req.body, req.user?.id);
      return successResponse(res, 201, 'Mock test created successfully 🎯', { mockTest });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Create test error:', err);
      return errorResponse(res, 500, 'Failed to create mock test', err);
    }
  }

  /**
   * @route PUT /api/tests/:id (Protected: test:update)
   */
  async updateTest(req, res) {
    try {
      const mockTest = await mockTestService.updateMockTest(req.params.id, req.body);
      return successResponse(res, 200, 'Mock test updated successfully ✏️', { mockTest });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Update test error:', err);
      return errorResponse(res, 500, 'Failed to update mock test', err);
    }
  }

  /**
   * @route DELETE /api/tests/:id (Protected: test:delete)
   */
  async deleteTest(req, res) {
    try {
      const result = await mockTestService.deleteMockTest(req.params.id);
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Delete test error:', err);
      return errorResponse(res, 500, 'Failed to delete mock test', err);
    }
  }

  /**
   * @route POST /api/tests/:id/add-questions (Protected: test:update)
   */
  async addQuestions(req, res) {
    try {
      const { questionIds, sectionName } = req.body;
      const result = await mockTestService.addQuestionsToTest(req.params.id, questionIds, sectionName);
      return successResponse(res, 200, result.message, result);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Add questions error:', err);
      return errorResponse(res, 500, 'Failed to map questions to test', err);
    }
  }

  /**
   * @route POST /api/tests/:id/auto-populate (Protected: test:update)
   */
  async autoPopulateQuestions(req, res) {
    try {
      const result = await mockTestService.autoPopulateRandomQuestions(req.params.id, req.body);
      return successResponse(res, 200, result.message, result);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Auto populate error:', err);
      return errorResponse(res, 500, 'Failed to auto populate test questions', err);
    }
  }

  /**
   * @route DELETE /api/tests/:id/questions/:questionId (Protected: test:update)
   */
  async removeQuestion(req, res) {
    try {
      const result = await mockTestService.removeQuestionFromTest(req.params.id, req.params.questionId);
      return successResponse(res, 200, result.message, result);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      return errorResponse(res, 500, 'Failed to remove question from test', err);
    }
  }

  /**
   * @route POST /api/tests/:id/start (Student test session start)
   */
  async startTest(req, res) {
    try {
      const session = await mockTestService.startTestAttempt(req.params.id, req.user.id);
      return successResponse(res, 200, 'Test attempt started', session);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Start test error:', err);
      return errorResponse(res, 500, 'Failed to start test attempt', err);
    }
  }

  /**
   * @route POST /api/tests/attempts/:attemptId/submit (Student test submission & instant grading)
   */
  async submitTest(req, res) {
    try {
      const { userAnswers, timeSpentSeconds } = req.body;
      const evaluation = await mockTestService.submitTestAttempt(
        req.params.attemptId,
        userAnswers,
        timeSpentSeconds,
        req.user.id
      );
      return successResponse(res, 200, 'Test submitted and graded successfully 🎉', evaluation);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Submit test error:', err);
      return errorResponse(res, 500, 'Failed to grade test attempt', err);
    }
  }

  /**
   * @route GET /api/tests/:id/leaderboard
   */
  async getLeaderboard(req, res) {
    try {
      const leaderboard = await mockTestService.getLeaderboard(req.params.id);
      return successResponse(res, 200, 'Leaderboard retrieved', { leaderboard });
    } catch (err) {
      console.error('Leaderboard error:', err);
      return errorResponse(res, 500, 'Failed to fetch leaderboard', err);
    }
  }
}

module.exports = new MockTestController();
