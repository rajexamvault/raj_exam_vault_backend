const { MockTest, Question, TestQuestion, TestAttempt, Exam, ExamStage, Subject, Topic, User } = require('../models');
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

    if (query.topicId && query.topicId !== 'all') {
      where.topicId = Number(query.topicId);
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
        },
        {
          model: Topic,
          as: 'topic',
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
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name']
        },
        {
          model: Question,
          as: 'questions',
          attributes: questionAttributes,
          include: [
            {
              model: Topic,
              as: 'topic',
              attributes: ['id', 'name']
            },
            {
              model: Subject,
              as: 'subjectRef',
              attributes: ['id', 'name']
            }
          ],
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
    if (!examId || !title || !String(title).trim()) {
      const err = new Error('Target exam and mock test title are required');
      err.statusCode = 400;
      throw err;
    }

    const cleanExamId = Number(examId);
    let cleanSubjectId = (data.subjectId && String(data.subjectId).trim() !== "" && !isNaN(data.subjectId)) ? Number(data.subjectId) : null;
    let cleanStageId = (data.stageId && String(data.stageId).trim() !== "" && !isNaN(data.stageId)) ? Number(data.stageId) : null;
    let topicId = (data.topicId && data.topicId !== 'custom' && String(data.topicId).trim() !== "" && !isNaN(data.topicId)) ? Number(data.topicId) : null;

    // If custom topic name provided
    const customTopicName = data.customTopicName || data.customTopic || data.topicName;
    if (!topicId && customTopicName) {
      const tName = String(customTopicName).trim();
      if (tName) {
        // If subject is not provided, look up the first subject of this exam
        if (!cleanSubjectId) {
          const firstSub = await Subject.findOne({ where: { examId: cleanExamId } });
          if (firstSub) {
            cleanSubjectId = firstSub.id;
            if (!cleanStageId && firstSub.stageId) cleanStageId = firstSub.stageId;
          }
        }

        if (cleanSubjectId) {
          let tSlug = tName.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, '-').replace(/(^-|-$)+/g, '');
          if (!tSlug) tSlug = `topic-${Date.now().toString(36)}`;
          const [tObj] = await Topic.findOrCreate({
            where: { subjectId: cleanSubjectId, name: tName },
            defaults: { subjectId: cleanSubjectId, name: tName, slug: tSlug, difficultyLevel: 'medium', status: 'active' }
          });
          topicId = tObj.id;
        }
      }
    }

    // Auto-resolve stageId if missing and subject is known
    if (!cleanStageId && cleanSubjectId) {
      const sub = await Subject.findByPk(cleanSubjectId);
      if (sub?.stageId) cleanStageId = sub.stageId;
    }

    let baseSlug = (data.slug || title || 'mock-test')
      .toLowerCase()
      .replace(/[^a-z0-9\u0900-\u097F]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!baseSlug) baseSlug = 'test';
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const mockTest = await MockTest.create({
      examId: cleanExamId,
      stageId: cleanStageId,
      subjectId: cleanSubjectId,
      topicId: topicId || null,
      title: String(title).trim(),
      slug: data.slug || uniqueSlug,
      testType: data.testType || (topicId ? 'topic_wise' : (cleanSubjectId ? 'sectional' : 'full_length')),
      durationMinutes: parseInt(data.durationMinutes, 10) || 180,
      totalMarks: parseFloat(data.totalMarks) || 200.0,
      totalQuestions: parseInt(data.totalQuestions, 10) || 150,
      negativeMarking: data.negativeMarking !== undefined && data.negativeMarking !== '' ? parseFloat(data.negativeMarking) : 0.33,
      passingMarks: data.passingMarks !== undefined && data.passingMarks !== '' ? parseFloat(data.passingMarks) : 70.0,
      instructions: data.instructions || '',
      isFree: data.isFree !== false && data.isFree !== 'false',
      price: data.price ? parseFloat(data.price) : 0.0,
      status: data.status || 'published',
      startDate: data.startDate && String(data.startDate).trim() ? new Date(data.startDate) : null,
      endDate: data.endDate && String(data.endDate).trim() ? new Date(data.endDate) : null,
      createdBy: userId || null
    });

    // If autoGenerate is requested during creation
    if (data.autoGenerate && (data.autoPopulateCount || data.totalQuestions)) {
      const count = Number(data.autoPopulateCount || data.totalQuestions || 20);
      try {
        await this.autoPopulateRandomQuestions(mockTest.id, {
          count,
          examId: mockTest.examId,
          subjectId: mockTest.subjectId,
          topicId: mockTest.topicId,
          difficultyLevel: data.difficultyLevel || 'all',
          sectionName: data.sectionName || 'General Section'
        });
      } catch (autoErr) {
        console.warn('Auto-populate on create warning:', autoErr.message);
      }
    }

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

    const updates = {};
    if (data.title) updates.title = String(data.title).trim();
    if (data.examId) updates.examId = Number(data.examId);
    if (data.testType) updates.testType = data.testType;
    if (data.durationMinutes !== undefined) updates.durationMinutes = parseInt(data.durationMinutes, 10) || 180;
    if (data.totalMarks !== undefined) updates.totalMarks = parseFloat(data.totalMarks) || 200.0;
    if (data.totalQuestions !== undefined) updates.totalQuestions = parseInt(data.totalQuestions, 10) || 0;
    if (data.negativeMarking !== undefined) updates.negativeMarking = parseFloat(data.negativeMarking) || 0.33;
    if (data.passingMarks !== undefined) updates.passingMarks = parseFloat(data.passingMarks) || 70.0;
    if (data.instructions !== undefined) updates.instructions = data.instructions;
    if (data.isFree !== undefined) updates.isFree = data.isFree !== false && data.isFree !== 'false';
    if (data.price !== undefined) updates.price = parseFloat(data.price) || 0.0;
    if (data.status) updates.status = data.status;
    if (data.startDate !== undefined) updates.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updates.endDate = data.endDate ? new Date(data.endDate) : null;

    if (data.stageId !== undefined) {
      updates.stageId = (data.stageId && String(data.stageId).trim() !== "" && !isNaN(data.stageId)) ? Number(data.stageId) : null;
    }
    if (data.subjectId !== undefined) {
      updates.subjectId = (data.subjectId && String(data.subjectId).trim() !== "" && !isNaN(data.subjectId)) ? Number(data.subjectId) : null;
    }

    if (data.topicId && data.topicId !== 'custom' && !isNaN(data.topicId)) {
      updates.topicId = Number(data.topicId);
    } else {
      const customTopicName = data.customTopicName || data.customTopic || data.topicName;
      const targetSubjectId = updates.subjectId || mockTest.subjectId;
      if (customTopicName && targetSubjectId) {
        const tName = String(customTopicName).trim();
        if (tName) {
          let tSlug = tName.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, '-').replace(/(^-|-$)+/g, '');
          if (!tSlug) tSlug = `topic-${Date.now().toString(36)}`;
          const [tObj] = await Topic.findOrCreate({
            where: { subjectId: Number(targetSubjectId), name: tName },
            defaults: { subjectId: Number(targetSubjectId), name: tName, slug: tSlug, difficultyLevel: 'medium', status: 'active' }
          });
          updates.topicId = tObj.id;
        }
      } else if (data.topicId === 'custom' || data.topicId === '' || data.topicId === null) {
        updates.topicId = null;
      }
    }

    await mockTest.update(updates);
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
   * Auto populate random questions from question bank according to topic, subject, and exam
   */
  async autoPopulateRandomQuestions(mockTestId, options = {}) {
    const mockTest = await MockTest.findByPk(mockTestId);
    if (!mockTest) {
      const err = new Error('Mock test not found');
      err.statusCode = 404;
      throw err;
    }

    const count = parseInt(options.count) || 20;
    const examId = options.examId ? Number(options.examId) : mockTest.examId;
    const subjectId = options.subjectId && options.subjectId !== 'all' ? Number(options.subjectId) : (mockTest.subjectId || null);
    const topicId = options.topicId && options.topicId !== 'all' ? Number(options.topicId) : (mockTest.topicId || null);

    const where = {
      status: 'active'
    };

    if (examId) where.examId = examId;
    if (subjectId) where.subjectId = subjectId;
    if (topicId) where.topicId = topicId;
    if (options.difficultyLevel && options.difficultyLevel !== 'all') {
      where.difficultyLevel = options.difficultyLevel;
    }

    const availableQuestions = await Question.findAll({
      where,
      limit: count,
      order: [fn('RAND')],
      attributes: ['id']
    });

    if (availableQuestions.length === 0) {
      const criteriaList = [];
      if (examId) criteriaList.push('Exam');
      if (subjectId) criteriaList.push('Subject');
      if (topicId) criteriaList.push('Topic');
      const err = new Error(`No matching questions found in question bank for criteria: ${criteriaList.join(' + ') || 'all'}`);
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
