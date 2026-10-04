const { Question, Exam, ExamStage, Subject, Topic, TestQuestion } = require('../models');
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
          attributes: ['id', 'name', 'code', 'icon', 'color']
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
          attributes: ['id', 'name', 'code', 'icon', 'color']
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
   * Create a single question - Exam and Subject are mandatory
   */
  async createQuestion(data, userId) {
    const { examId, subjectId, questionHindi, questionEnglish, options, correctAnswer } = data;

    if (!examId) {
      const err = new Error('Please select an Exam for this question');
      err.statusCode = 400;
      throw err;
    }

    if (!subjectId) {
      const err = new Error('Subject is mandatory. Please select a Subject for this question');
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

    // Auto-resolve stageId from subject if not provided
    let stageId = data.stageId ? Number(data.stageId) : null;
    if (!stageId && subjectId) {
      const subject = await Subject.findByPk(Number(subjectId));
      if (subject?.stageId) {
        stageId = subject.stageId;
      }
    }

    const question = await Question.create({
      ...data,
      examId: Number(examId),
      subjectId: Number(subjectId),
      stageId,
      topicId: data.topicId ? Number(data.topicId) : null,
      createdBy: userId || null
    });

    return question;
  }

  /**
   * Bulk import questions
   */
  async bulkImport(questionsArray, defaultExamId, userId, defaultSubjectId = null) {
    if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
      const err = new Error('Import data must be a non-empty array of questions');
      err.statusCode = 400;
      throw err;
    }

    let defaultStageId = null;
    if (defaultSubjectId) {
      const sub = await Subject.findByPk(Number(defaultSubjectId));
      if (sub?.stageId) defaultStageId = sub.stageId;
    }

    const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const sanitizedQuestions = [];

    for (const q of questionsArray) {
      const examId = q.examId || defaultExamId;
      if (!examId) {
        throw new Error('Exam ID is missing on one or more question records. Please select a Target Exam.');
      }

      let subjectId = q.subjectId ? Number(q.subjectId) : (defaultSubjectId ? Number(defaultSubjectId) : null);
      let stageId = q.stageId ? Number(q.stageId) : defaultStageId;

      if (!stageId && subjectId) {
        const subject = await Subject.findByPk(subjectId);
        if (subject?.stageId) stageId = subject.stageId;
      }

      // 1. Text normalization: questionHindi / questionEnglish / question / questionText
      let questionHindi = q.questionHindi || '';
      let questionEnglish = q.questionEnglish || '';
      const rawQuestion = q.question || q.questionText || '';

      if (!questionHindi && !questionEnglish && rawQuestion) {
        const isHindi = /[\u0900-\u097F]/.test(rawQuestion);
        if (isHindi) {
          questionHindi = rawQuestion;
        } else {
          questionEnglish = rawQuestion;
        }
      }

      // 2. Answer normalization
      const rawAns = q.correctAnswer !== undefined ? q.correctAnswer : (q.answer !== undefined ? q.answer : 'A');
      let normalizedAnswer = 'A';
      if (typeof rawAns === 'number') {
        if (rawAns >= 0 && rawAns <= 5) {
          normalizedAnswer = optionLetters[rawAns] || 'A';
        }
      } else {
        const strAns = String(rawAns).trim().toUpperCase();
        if (/^[1-6]$/.test(strAns)) {
          normalizedAnswer = optionLetters[parseInt(strAns, 10) - 1] || 'A';
        } else if (/^[A-F]$/.test(strAns)) {
          normalizedAnswer = strAns;
        } else {
          normalizedAnswer = strAns || 'A';
        }
      }

      // 3. Options normalization (handles string array ["opt1", "opt2"] or object array)
      let options = [];
      if (Array.isArray(q.options) && q.options.length > 0) {
        if (typeof q.options[0] === 'string') {
          options = q.options.map((optStr, idx) => {
            const letter = optionLetters[idx] || String(idx + 1);
            const isOptHindi = /[\u0900-\u097F]/.test(optStr);
            return {
              id: letter,
              textHindi: isOptHindi ? optStr : '',
              textEnglish: isOptHindi ? '' : optStr,
              isCorrect: normalizedAnswer === letter
            };
          });
        } else {
          options = q.options.map((opt, idx) => {
            const letter = opt.id || optionLetters[idx] || String(idx + 1);
            return {
              id: letter,
              textHindi: opt.textHindi || (opt.text && /[\u0900-\u097F]/.test(opt.text) ? opt.text : ''),
              textEnglish: opt.textEnglish || (opt.text && !/[\u0900-\u097F]/.test(opt.text) ? opt.text : ''),
              isCorrect: opt.isCorrect !== undefined ? Boolean(opt.isCorrect) : (normalizedAnswer === letter)
            };
          });
        }
      } else {
        options = [
          { id: 'A', textHindi: '', textEnglish: '', isCorrect: normalizedAnswer === 'A' },
          { id: 'B', textHindi: '', textEnglish: '', isCorrect: normalizedAnswer === 'B' }
        ];
      }

      // 4. Explanations
      let explanationHindi = q.explanationHindi || '';
      let explanationEnglish = q.explanationEnglish || '';
      if (q.explanation && !explanationHindi && !explanationEnglish) {
        if (/[\u0900-\u097F]/.test(q.explanation)) {
          explanationHindi = q.explanation;
        } else {
          explanationEnglish = q.explanation;
        }
      }

      // 5. PYQ metadata
      const isPreviousYear = Boolean(q.isPreviousYear || q.type === 'pyq' || q.year || q.pyqYear);
      const pyqYear = q.pyqYear ? Number(q.pyqYear) : (q.year ? Number(q.year) : null);
      const pyqExamName = q.pyqExamName || (typeof q.exam === 'string' ? q.exam : null);

      sanitizedQuestions.push({
        examId: Number(examId),
        subjectId,
        stageId,
        topicId: q.topicId ? Number(q.topicId) : null,
        questionType: q.questionType || 'single_choice',
        questionHindi,
        questionEnglish,
        options,
        correctAnswer: normalizedAnswer,
        explanationHindi,
        explanationEnglish,
        difficultyLevel: q.difficultyLevel || 'medium',
        marks: q.marks ? Number(q.marks) : 1.0,
        negativeMarks: q.negativeMarks !== undefined ? Number(q.negativeMarks) : 0.33,
        isPreviousYear,
        pyqYear,
        pyqExamName,
        tags: Array.isArray(q.tags) ? q.tags : (q.topic ? [String(q.topic)] : []),
        status: q.status || 'active',
        createdBy: userId || null
      });
    }

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
    if (data.subjectId) {
      data.subjectId = Number(data.subjectId);
      if (!data.stageId) {
        const subject = await Subject.findByPk(data.subjectId);
        if (subject?.stageId) data.stageId = subject.stageId;
      }
    }
    if (data.stageId) data.stageId = Number(data.stageId);
    if (data.topicId) data.topicId = Number(data.topicId);

    await question.update(data);
    return question;
  }

  /**
   * Delete single question
   */
  async deleteQuestion(id) {
    const question = await Question.findByPk(id);
    if (!question) {
      const err = new Error('Question not found');
      err.statusCode = 404;
      throw err;
    }

    // Clean up dependent mock test questions to prevent FK constraint failures
    await TestQuestion.destroy({ where: { questionId: id } });
    await question.destroy();
    return { success: true, message: 'Question deleted successfully from Question Bank 🗑️' };
  }

  /**
   * Bulk delete questions
   */
  async bulkDeleteQuestions(questionIds = []) {
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      const err = new Error('Please select at least one question to delete');
      err.statusCode = 400;
      throw err;
    }

    const sanitizedIds = questionIds.map((id) => Number(id)).filter(Boolean);
    if (sanitizedIds.length === 0) {
      const err = new Error('Invalid question IDs provided');
      err.statusCode = 400;
      throw err;
    }

    // Clean up dependent mock test questions
    await TestQuestion.destroy({ where: { questionId: { [Op.in]: sanitizedIds } } });
    const deletedCount = await Question.destroy({ where: { id: { [Op.in]: sanitizedIds } } });

    return {
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} questions from Question Bank 🗑️`
    };
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

    // Exam division breakdown
    let examBreakdown = [];
    try {
      const examCounts = await Question.findAll({
        attributes: ['examId', [fn('COUNT', col('Question.id')), 'count']],
        group: ['examId', 'exam.id'],
        include: [{
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'shortName', 'category', 'icon']
        }],
        raw: false
      });

      examBreakdown = examCounts.map(item => ({
        examId: item.examId,
        count: parseInt(item.get('count'), 10) || 0,
        exam: item.exam
      }));
    } catch (e) {
      console.warn('Could not compute exam breakdown stats:', e.message);
    }

    return {
      totalQuestions,
      easyCount,
      mediumCount,
      hardCount,
      pyqCount,
      examBreakdown
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
