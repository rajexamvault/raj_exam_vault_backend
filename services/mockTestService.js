const { MockTest, Question, TestQuestion, TestAttempt, Exam, ExamStage, Subject, User } = require('../models');
const { Op, fn } = require('sequelize');

class MockTestService {
  /**
   * Get filtered and paginated list of Mock Tests
   */
  async getAllMockTests(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 12;
    const offset = (page - 1) * limit;

    const where = {};

    if (query.examId && query.examId !== 'all') {
      where.examId = Number(query.examId);
    }

    if (query.stageId && query.stageId !== 'all') {
      where.stageId = Number(query.stageId);
    }

    if (query.subjectId && query.subjectId !== 'all') {
      where.subjectId = Number(query.subjectId);
    }

    if (query.testType && query.testType !== 'all') {
      where.testType = query.testType;
    }

    if (query.status && query.status !== 'all') {
      where.status = query.status;
    }

    if (query.isFree !== undefined && query.isFree !== 'all') {
      where.isFree = query.isFree === 'true' || query.isFree === true;
    }

    if (query.search && query.search.trim()) {
      const searchTerm = `%${query.search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: searchTerm } },
        { instructions: { [Op.like]: searchTerm } }
      ];
    }

    const { count, rows: mockTests } = await MockTest.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'shortName', 'category', 'icon']
        },
        {
          model: ExamStage,
          as: 'stage',
          attributes: ['id', 'name']
        },
        {
          model: Subject,
          as: 'subjectRef',
          attributes: ['id', 'name']
        }
      ]
    });

    return {
      mockTests,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    };
  }

  /**
   * Get single Mock Test with associated questions
   */
  async getMockTestById(id, includeAnswers = true) {
    const questionAttributes = includeAnswers
      ? undefined
      : { exclude: ['correctAnswer', 'explanationHindi', 'explanationEnglish'] };

    const mockTest = await MockTest.findByPk(id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'shortName', 'category', 'icon']
        },
        {
          model: ExamStage,
          as: 'stage',
          attributes: ['id', 'name']
        },
        {
          model: Subject,
          as: 'subjectRef',
          attributes: ['id', 'name']
        },
        {
          model: Question,
          as: 'questions',
          attributes: questionAttributes,
          through: {
            attributes: ['sectionName', 'questionOrder', 'marks', 'negativeMarks']
          }
        }
      ],
      order: [
        [{ model: Question, as: 'questions' }, TestQuestion, 'questionOrder', 'ASC']
      ]
    });

    if (!mockTest) {
      const err = new Error('Mock test not found');
      err.statusCode = 404;
      throw err;
    }

    return mockTest;
  }

  /**
   * Create a new Mock Test
   */
  async createMockTest(data, userId) {
    const { examId, title } = data;
    if (!examId || !title) {
      const err = new Error('Target exam and mock test title are required');
      err.statusCode = 400;
      throw err;
    }

    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const mockTest = await MockTest.create({
      ...data,
      examId: Number(examId),
      stageId: data.stageId ? Number(data.stageId) : null,
      subjectId: data.subjectId ? Number(data.subjectId) : null,
      slug: data.slug || uniqueSlug,
      createdBy: userId || null
    });

    return mockTest;
  }

  /**
   * Update Mock Test
   */
  async updateMockTest(id, data) {
    const mockTest = await MockTest.findByPk(id);
    if (!mockTest) {
      const err = new Error('Mock test not found');
      err.statusCode = 404;
      throw err;
    }

    if (data.examId) data.examId = Number(data.examId);
    if (data.stageId) data.stageId = Number(data.stageId);
    if (data.subjectId) data.subjectId = Number(data.subjectId);

    await mockTest.update(data);
    return mockTest;
  }

  /**
   * Delete Mock Test
   */
  async deleteMockTest(id) {
    const mockTest = await MockTest.findByPk(id);
    if (!mockTest) {
      const err = new Error('Mock test not found');
      err.statusCode = 404;
      throw err;
    }

    await mockTest.destroy();
    return { success: true, message: 'Mock test deleted successfully' };
  }

  /**
   * Add / Map questions to Mock Test
   */
  async addQuestionsToTest(mockTestId, questionIds, sectionName = 'General Section') {
    const mockTest = await MockTest.findByPk(mockTestId);
    if (!mockTest) {
      const err = new Error('Mock test not found');
      err.statusCode = 404;
      throw err;
    }

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      const err = new Error('questionIds must be a non-empty array');
      err.statusCode = 400;
      throw err;
    }

    const currentMaxOrder = (await TestQuestion.max('questionOrder', { where: { mockTestId } })) || 0;

    let addedCount = 0;
    for (let i = 0; i < questionIds.length; i++) {
      const qId = Number(questionIds[i]);
      const [_, created] = await TestQuestion.findOrCreate({
        where: {
          mockTestId: Number(mockTestId),
          questionId: qId
        },
        defaults: {
          mockTestId: Number(mockTestId),
          questionId: qId,
          sectionName,
          questionOrder: currentMaxOrder + i + 1,
          marks: 1.0,
          negativeMarks: mockTest.negativeMarking || 0.33
        }
      });
      if (created) addedCount++;
    }

    // Update totalQuestions count
    const totalQ = await TestQuestion.count({ where: { mockTestId } });
    await mockTest.update({ totalQuestions: totalQ });

    return {
      success: true,
      addedCount,
      totalQuestions: totalQ,
      message: `Mapped ${addedCount} questions to ${mockTest.title}`
    };
  }

  /**
   * Auto populate random questions from question bank
   */
  async autoPopulateRandomQuestions(mockTestId, options = {}) {
    const mockTest = await MockTest.findByPk(mockTestId);
    if (!mockTest) {
      const err = new Error('Mock test not found');
      err.statusCode = 404;
      throw err;
    }

    const count = parseInt(options.count) || 20;
    const where = {
      examId: mockTest.examId,
      status: 'active'
    };

    if (options.subjectId) where.subjectId = Number(options.subjectId);
    if (options.difficultyLevel) where.difficultyLevel = options.difficultyLevel;

    const availableQuestions = await Question.findAll({
      where,
      limit: count,
      order: [fn('RAND')],
      attributes: ['id']
    });

    if (availableQuestions.length === 0) {
      const err = new Error('No matching questions found in question bank for this criteria');
      err.statusCode = 400;
      throw err;
    }

    const questionIds = availableQuestions.map(q => q.id);
    return await this.addQuestionsToTest(mockTestId, questionIds, options.sectionName || 'Auto Section');
  }

  /**
   * Remove a single question from Mock Test
   */
  async removeQuestionFromTest(mockTestId, questionId) {
    const deleted = await TestQuestion.destroy({
      where: {
        mockTestId: Number(mockTestId),
        questionId: Number(questionId)
      }
    });

    const totalQ = await TestQuestion.count({ where: { mockTestId } });
    await MockTest.update({ totalQuestions: totalQ }, { where: { id: mockTestId } });

    return { success: true, message: 'Question removed from test', totalQuestions: totalQ };
  }

  /**
   * Start Test Attempt (Student session)
   */
  async startTestAttempt(mockTestId, userId) {
    const mockTest = await this.getMockTestById(mockTestId, false);

    const attempt = await TestAttempt.create({
      userId,
      mockTestId: Number(mockTestId),
      totalMarks: mockTest.totalMarks,
      status: 'in_progress'
    });

    await MockTest.increment('totalAttempts', { by: 1, where: { id: mockTestId } });

    return {
      attemptId: attempt.id,
      mockTest,
      startedAt: attempt.createdAt
    };
  }

  /**
   * Submit Test Attempt & Instant Grading Evaluation
   */
  async submitTestAttempt(attemptId, userAnswers = {}, timeSpentSeconds = 0, userId) {
    const attempt = await TestAttempt.findOne({
      where: { id: attemptId, userId }
    });

    if (!attempt) {
      const err = new Error('Test attempt not found or unauthorized');
      err.statusCode = 404;
      throw err;
    }

    const mockTest = await this.getMockTestById(attempt.mockTestId, true);
    const questions = mockTest.questions || [];

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let totalScore = 0;
    const evaluatedAnswers = {};

    questions.forEach((q) => {
      const qId = String(q.id);
      const studentAnswer = userAnswers[qId]?.selectedAnswer || userAnswers[qId] || null;
      const qTime = userAnswers[qId]?.timeSpent || 0;

      const qMarks = q.TestQuestion?.marks || q.marks || 1.0;
      const qNegMarks = q.TestQuestion?.negativeMarks || q.negativeMarks || mockTest.negativeMarking || 0.33;

      if (!studentAnswer) {
        unattemptedCount++;
        evaluatedAnswers[qId] = {
          selectedAnswer: null,
          correctAnswer: q.correctAnswer,
          isCorrect: false,
          isAttempted: false,
          marksAwarded: 0,
          timeSpent: qTime
        };
      } else if (String(studentAnswer).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase()) {
        correctCount++;
        totalScore += qMarks;
        evaluatedAnswers[qId] = {
          selectedAnswer: studentAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: true,
          isAttempted: true,
          marksAwarded: qMarks,
          timeSpent: qTime
        };
      } else {
        incorrectCount++;
        totalScore -= qNegMarks;
        evaluatedAnswers[qId] = {
          selectedAnswer: studentAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: false,
          isAttempted: true,
          marksAwarded: -qNegMarks,
          timeSpent: qTime
        };
      }
    });

    const totalAttempted = correctCount + incorrectCount;
    const accuracy = totalAttempted > 0 ? (correctCount / totalAttempted) * 100 : 0;
    const finalScore = Math.max(0, parseFloat(totalScore.toFixed(2)));

    await attempt.update({
      score: finalScore,
      correctCount,
      incorrectCount,
      unattemptedCount,
      accuracy: parseFloat(accuracy.toFixed(1)),
      timeSpentSeconds,
      userAnswers: evaluatedAnswers,
      status: 'completed',
      submittedAt: new Date()
    });

    return {
      attemptId: attempt.id,
      score: finalScore,
      totalMarks: mockTest.totalMarks,
      totalQuestions: questions.length,
      correctCount,
      incorrectCount,
      unattemptedCount,
      accuracy: parseFloat(accuracy.toFixed(1)),
      timeSpentSeconds,
      evaluatedAnswers
    };
  }

  /**
   * Get Leaderboard for a Mock Test
   */
  async getLeaderboard(mockTestId) {
    const attempts = await TestAttempt.findAll({
      where: {
        mockTestId: Number(mockTestId),
        status: 'completed'
      },
      limit: 50,
      order: [
        ['score', 'DESC'],
        ['timeSpentSeconds', 'ASC']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return attempts.map((att, idx) => ({
      rank: idx + 1,
      userId: att.userId,
      userName: att.user?.name || 'Aspirant',
      score: att.score,
      totalMarks: att.totalMarks,
      accuracy: att.accuracy,
      timeSpentSeconds: att.timeSpentSeconds,
      submittedAt: att.submittedAt
    }));
  }
}

module.exports = new MockTestService();
