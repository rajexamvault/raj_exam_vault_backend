const { Question, Exam, ExamStage, Subject, Topic } = require('../models');
const { Op, fn, col } = require('sequelize');

class QuestionService {
  /**
   * Get filtered and paginated list of questions
   */
  async getQuestions(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
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

    if (query.difficultyLevel && query.difficultyLevel !== 'all') {
      where.difficultyLevel = query.difficultyLevel;
    }

    if (query.questionType && query.questionType !== 'all') {
      where.questionType = query.questionType;
    }

    if (query.status && query.status !== 'all') {
      where.status = query.status;
    }

    if (query.isPreviousYear !== undefined && query.isPreviousYear !== 'all') {
      where.isPreviousYear = query.isPreviousYear === 'true' || query.isPreviousYear === true;
    }

    if (query.pyqYear && query.pyqYear !== 'all') {
      where.pyqYear = Number(query.pyqYear);
    }

    if (query.search && query.search.trim()) {
      const searchTerm = `%${query.search.trim()}%`;
      where[Op.or] = [
        { questionEnglish: { [Op.like]: searchTerm } },
        { questionHindi: { [Op.like]: searchTerm } },
        { explanationEnglish: { [Op.like]: searchTerm } },
        { explanationHindi: { [Op.like]: searchTerm } },
        { pyqExamName: { [Op.like]: searchTerm } }
      ];
    }

    const { count, rows: questions } = await Question.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'shortName', 'category', 'icon']
        },
        {
          model: ExamStage,
          as: 'stage',
          attributes: ['id', 'name', 'stageOrder']
        },
        {
          model: Subject,
          as: 'subjectRef',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name']
        }
      ]
    });

    return {
      questions,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    };
  }

  /**
   * Get single question by ID
   */
  async getQuestionById(id) {
    const question = await Question.findByPk(id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'shortName', 'category', 'icon']
        },
        {
          model: ExamStage,
          as: 'stage',
          attributes: ['id', 'name', 'stageOrder']
        },
        {
          model: Subject,
          as: 'subjectRef',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!question) {
      const err = new Error('Question not found');
      err.statusCode = 404;
      throw err;
    }

    return question;
  }

  /**
   * Create a single question
   */
  async createQuestion(data, userId) {
    const { examId, questionHindi, questionEnglish, options, correctAnswer } = data;

    if (!examId) {
      const err = new Error('Please select an Exam for this question');
      err.statusCode = 400;
      throw err;
    }

    if (!questionHindi && !questionEnglish) {
      const err = new Error('Please provide question text in either Hindi or English');
      err.statusCode = 400;
      throw err;
    }

    if (!Array.isArray(options) || options.length < 2) {
      const err = new Error('A question must have at least 2 options (A, B, ...)');
      err.statusCode = 400;
      throw err;
    }

    if (!correctAnswer) {
      const err = new Error('Correct answer is required');
      err.statusCode = 400;
      throw err;
    }

    const question = await Question.create({
      ...data,
      examId: Number(examId),
      stageId: data.stageId ? Number(data.stageId) : null,
      subjectId: data.subjectId ? Number(data.subjectId) : null,
      topicId: data.topicId ? Number(data.topicId) : null,
      createdBy: userId || null
    });

    return question;
  }

  /**
   * Bulk import questions
   */
  async bulkImport(questionsArray, defaultExamId, userId) {
    if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
      const err = new Error('Import data must be a non-empty array of questions');
      err.statusCode = 400;
      throw err;
    }

    const sanitizedQuestions = questionsArray.map((q) => {
      const examId = q.examId || defaultExamId;
      if (!examId) {
        throw new Error('Exam ID is missing on one or more question records');
      }

      return {
        ...q,
        examId: Number(examId),
        stageId: q.stageId ? Number(q.stageId) : null,
        subjectId: q.subjectId ? Number(q.subjectId) : null,
        topicId: q.topicId ? Number(q.topicId) : null,
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: String(q.correctAnswer || 'A'),
        difficultyLevel: q.difficultyLevel || 'medium',
        marks: q.marks ? Number(q.marks) : 1.0,
        negativeMarks: q.negativeMarks !== undefined ? Number(q.negativeMarks) : 0.33,
        isPreviousYear: !!q.isPreviousYear,
        status: q.status || 'active',
        createdBy: userId || null
      };
    });

    const created = await Question.bulkCreate(sanitizedQuestions);
    return {
      success: true,
      importedCount: created.length,
      message: `Successfully imported ${created.length} questions into Question Bank 🎯`
    };
  }

  /**
   * Update question
   */
  async updateQuestion(id, data) {
    const question = await Question.findByPk(id);
    if (!question) {
      const err = new Error('Question not found');
      err.statusCode = 404;
      throw err;
    }

    if (data.examId) data.examId = Number(data.examId);
    if (data.stageId) data.stageId = Number(data.stageId);
    if (data.subjectId) data.subjectId = Number(data.subjectId);
    if (data.topicId) data.topicId = Number(data.topicId);

    await question.update(data);
    return question;
  }

  /**
   * Delete question
   */
  async deleteQuestion(id) {
    const question = await Question.findByPk(id);
    if (!question) {
      const err = new Error('Question not found');
      err.statusCode = 404;
      throw err;
    }

    await question.destroy();
    return { success: true, message: 'Question removed from question bank' };
  }

  /**
   * Question Bank Metrics & Analytics
   */
  async getQuestionStats(examId) {
    const where = {};
    if (examId && examId !== 'all') {
      where.examId = Number(examId);
    }

    const totalQuestions = await Question.count({ where });
    const easyCount = await Question.count({ where: { ...where, difficultyLevel: 'easy' } });
    const mediumCount = await Question.count({ where: { ...where, difficultyLevel: 'medium' } });
    const hardCount = await Question.count({ where: { ...where, difficultyLevel: 'hard' } });
    const pyqCount = await Question.count({ where: { ...where, isPreviousYear: true } });

    return {
      totalQuestions,
      easyCount,
      mediumCount,
      hardCount,
      pyqCount
    };
  }

  /**
   * Get random question sample for practice
   */
  async getRandomSample(params = {}) {
    const limit = parseInt(params.limit) || 10;
    const where = { status: 'active' };

    if (params.examId) where.examId = Number(params.examId);
    if (params.stageId) where.stageId = Number(params.stageId);
    if (params.subjectId) where.subjectId = Number(params.subjectId);
    if (params.topicId) where.topicId = Number(params.topicId);
    if (params.difficultyLevel) where.difficultyLevel = params.difficultyLevel;

    const questions = await Question.findAll({
      where,
      limit,
      order: [fn('RAND')],
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    return questions;
  }
}

module.exports = new QuestionService();
