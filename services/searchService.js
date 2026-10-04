const { Op } = require('sequelize');
const {
  Exam,
  StudyMaterial,
  Question,
  MockTest,
  CurrentAffair,
  Announcement,
  Subject,
  ExamStage
} = require('../models');

class SearchService {
  /**
   * Universal Aggregated Cross-Entity Search
   */
  async universalSearch(params = {}) {
    const {
      q = '',
      type = 'all', // 'all' | 'exams' | 'materials' | 'questions' | 'tests' | 'current_affairs' | 'announcements'
      examId,
      subjectId,
      isFree,
      difficulty,
      language,
      limit = 20,
      page = 1
    } = params;

    const query = q.trim();
    const searchCondition = query ? `%${query}%` : '%';
    const parsedLimit = parseInt(limit) || 20;
    const parsedPage = parseInt(page) || 1;
    const offset = (parsedPage - 1) * parsedLimit;

    const results = {
      query,
      counts: {
        all: 0,
        exams: 0,
        materials: 0,
        questions: 0,
        tests: 0,
        currentAffairs: 0,
        announcements: 0
      },
      data: {
        exams: [],
        materials: [],
        questions: [],
        tests: [],
        currentAffairs: [],
        announcements: []
      }
    };

    // 1. Search Exams
    if (type === 'all' || type === 'exams') {
      const examWhere = {
        status: { [Op.in]: ['active', 'published'] }
      };
      if (query) {
        examWhere[Op.or] = [
          { title: { [Op.like]: searchCondition } },
          { shortName: { [Op.like]: searchCondition } },
          { category: { [Op.like]: searchCondition } },
          { description: { [Op.like]: searchCondition } }
        ];
      }

      const { count, rows } = await Exam.findAndCountAll({
        where: examWhere,
        limit: type === 'exams' ? parsedLimit : 5,
        offset: type === 'exams' ? offset : 0,
        order: [['displayOrder', 'ASC'], ['title', 'ASC']]
      });

      results.counts.exams = count;
      results.data.exams = rows.map(e => ({
        id: e.id,
        entityType: 'exam',
        title: e.title,
        code: e.shortName,
        category: e.category,
        slug: e.slug,
        description: e.description,
        icon: e.icon,
        url: `/exams/${e.slug}`
      }));
    }

    // 2. Search Study Materials
    if (type === 'all' || type === 'materials') {
      const matWhere = { status: { [Op.in]: ['published', 'active'] } };
      if (examId) matWhere.examId = Number(examId);
      if (subjectId) matWhere.subjectId = Number(subjectId);
      if (isFree !== undefined && isFree !== '') matWhere.isFree = isFree === 'true';

      if (query) {
        matWhere[Op.or] = [
          { title: { [Op.like]: searchCondition } },
          { description: { [Op.like]: searchCondition } },
          { materialType: { [Op.like]: searchCondition } },
          { subject: { [Op.like]: searchCondition } }
        ];
      }

      const { count, rows } = await StudyMaterial.findAndCountAll({
        where: matWhere,
        limit: type === 'materials' ? parsedLimit : 5,
        offset: type === 'materials' ? offset : 0,
        include: [
          { model: Exam, as: 'exam', attributes: ['id', 'title', 'shortName', 'slug'] },
          { model: Subject, as: 'subjectRef', attributes: ['id', 'name'] }
        ],
        order: [['totalDownloads', 'DESC'], ['createdAt', 'DESC']]
      });

      results.counts.materials = count;
      results.data.materials = rows.map(m => ({
        id: m.id,
        entityType: 'material',
        title: m.title,
        description: m.description,
        contentType: m.materialType,
        fileFormat: m.fileType,
        fileUrl: m.fileUrl,
        fileSize: m.fileSize,
        isFree: m.isFree,
        price: m.price,
        downloadCount: m.totalDownloads,
        viewCount: m.viewCount,
        exam: m.exam,
        subject: m.subjectRef,
        url: `/materials`
      }));
    }

    // 3. Search Questions Bank / PYQs
    if (type === 'all' || type === 'questions') {
      const qWhere = { status: 'active' };
      if (examId) qWhere.examId = Number(examId);
      if (subjectId) qWhere.subjectId = Number(subjectId);
      if (difficulty) qWhere.difficultyLevel = difficulty;

      if (query) {
        qWhere[Op.or] = [
          { questionHindi: { [Op.like]: searchCondition } },
          { questionEnglish: { [Op.like]: searchCondition } },
          { explanationHindi: { [Op.like]: searchCondition } },
          { explanationEnglish: { [Op.like]: searchCondition } },
          { pyqYear: { [Op.like]: searchCondition } }
        ];
      }

      const { count, rows } = await Question.findAndCountAll({
        where: qWhere,
        limit: type === 'questions' ? parsedLimit : 5,
        offset: type === 'questions' ? offset : 0,
        include: [
          { model: Exam, as: 'exam', attributes: ['id', 'title', 'shortName'] },
          { model: Subject, as: 'subjectRef', attributes: ['id', 'name'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      results.counts.questions = count;
      results.data.questions = rows.map(q => ({
        id: q.id,
        entityType: 'question',
        questionTextHi: q.questionHindi,
        questionTextEn: q.questionEnglish,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanationHi: q.explanationHindi,
        explanationEn: q.explanationEnglish,
        isPYQ: q.isPreviousYear,
        pyqYear: q.pyqYear,
        difficultyLevel: q.difficultyLevel,
        exam: q.exam,
        subject: q.subjectRef
      }));
    }

    // 4. Search Mock Tests
    if (type === 'all' || type === 'tests') {
      const testWhere = { status: 'published' };
      if (examId) testWhere.examId = Number(examId);
      if (isFree !== undefined && isFree !== '') testWhere.isFree = isFree === 'true';

      if (query) {
        testWhere[Op.or] = [
          { title: { [Op.like]: searchCondition } },
          { instructions: { [Op.like]: searchCondition } },
          { testType: { [Op.like]: searchCondition } }
        ];
      }

      const { count, rows } = await MockTest.findAndCountAll({
        where: testWhere,
        limit: type === 'tests' ? parsedLimit : 5,
        offset: type === 'tests' ? offset : 0,
        include: [
          { model: Exam, as: 'exam', attributes: ['id', 'title', 'shortName', 'slug'] }
        ],
        order: [['totalAttempts', 'DESC'], ['createdAt', 'DESC']]
      });

      results.counts.tests = count;
      results.data.tests = rows.map(t => ({
        id: t.id,
        entityType: 'test',
        title: t.title,
        description: t.instructions,
        testType: t.testType,
        totalQuestions: t.totalQuestions,
        durationMinutes: t.durationMinutes,
        totalMarks: t.totalMarks,
        negativeMarking: t.negativeMarking,
        isFree: t.isFree,
        price: t.price,
        totalAttempts: t.totalAttempts,
        exam: t.exam,
        url: `/tests/${t.id}`
      }));
    }

    // 5. Search Current Affairs
    if (type === 'all' || type === 'current_affairs') {
      const caWhere = { status: 'published' };
      if (query) {
        caWhere[Op.or] = [
          { titleHindi: { [Op.like]: searchCondition } },
          { titleEnglish: { [Op.like]: searchCondition } },
          { summaryHindi: { [Op.like]: searchCondition } },
          { summaryEnglish: { [Op.like]: searchCondition } },
          { category: { [Op.like]: searchCondition } }
        ];
      }

      const { count, rows } = await CurrentAffair.findAndCountAll({
        where: caWhere,
        limit: type === 'current_affairs' ? parsedLimit : 5,
        offset: type === 'current_affairs' ? offset : 0,
        order: [['date', 'DESC']]
      });

      results.counts.currentAffairs = count;
      results.data.currentAffairs = rows.map(ca => ({
        id: ca.id,
        entityType: 'current_affair',
        titleHi: ca.titleHindi,
        titleEn: ca.titleEnglish,
        summaryHi: ca.summaryHindi,
        summaryEn: ca.summaryEnglish,
        category: ca.category,
        publishDate: ca.date,
        viewCount: ca.viewCount,
        likeCount: ca.likesCount,
        url: `/current-affairs`
      }));
    }

    // 6. Search Announcements / Flash Tickers
    if (type === 'all' || type === 'announcements') {
      const annWhere = { status: 'active' };
      if (examId) annWhere.examId = Number(examId);

      if (query) {
        annWhere[Op.or] = [
          { title: { [Op.like]: searchCondition } },
          { content: { [Op.like]: searchCondition } },
          { summary: { [Op.like]: searchCondition } },
          { announcementType: { [Op.like]: searchCondition } }
        ];
      }

      const { count, rows } = await Announcement.findAndCountAll({
        where: annWhere,
        limit: type === 'announcements' ? parsedLimit : 5,
        offset: type === 'announcements' ? offset : 0,
        include: [
          { model: Exam, as: 'exam', attributes: ['id', 'title', 'shortName'] }
        ],
        order: [['priority', 'DESC'], ['createdAt', 'DESC']]
      });

      results.counts.announcements = count;
      results.data.announcements = rows.map(a => ({
        id: a.id,
        entityType: 'announcement',
        title: a.title,
        content: a.content,
        type: a.announcementType,
        actionUrl: a.officialUrl,
        isUrgent: a.priority === 'urgent_flash' || a.priority === 'high',
        exam: a.exam,
        createdAt: a.createdAt
      }));
    }

    // Calculate total aggregated results
    results.counts.all =
      results.counts.exams +
      results.counts.materials +
      results.counts.questions +
      results.counts.tests +
      results.counts.currentAffairs +
      results.counts.announcements;

    return results;
  }

  /**
   * Fast Light Auto-Suggestions Dropdown
   */
  async getSuggestions(query = '', limit = 8) {
    const q = query.trim();
    if (!q || q.length < 2) return [];

    const searchCondition = `%${q}%`;
    const suggestions = [];

    // 1. Exam suggestions
    const exams = await Exam.findAll({
      where: {
        status: { [Op.in]: ['active', 'published'] },
        [Op.or]: [
          { title: { [Op.like]: searchCondition } },
          { shortName: { [Op.like]: searchCondition } }
        ]
      },
      limit: 3,
      attributes: ['id', 'title', 'shortName', 'slug']
    });

    exams.forEach(e => {
      suggestions.push({
        title: `${e.title} (${e.shortName})`,
        type: 'Exam Portal',
        category: 'exam',
        icon: '🏛️',
        url: `/exams/${e.slug}`
      });
    });

    // 2. Study Material suggestions
    const materials = await StudyMaterial.findAll({
      where: {
        status: { [Op.in]: ['active', 'published'] },
        title: { [Op.like]: searchCondition }
      },
      limit: 3,
      attributes: ['id', 'title', 'materialType', 'isFree']
    });

    materials.forEach(m => {
      suggestions.push({
        title: m.title,
        type: m.materialType?.replace('_', ' ').toUpperCase() || 'NOTES',
        category: 'material',
        icon: '📚',
        url: `/materials`
      });
    });

    // 3. Mock Test suggestions
    const tests = await MockTest.findAll({
      where: {
        status: 'published',
        title: { [Op.like]: searchCondition }
      },
      limit: 3,
      attributes: ['id', 'title', 'totalQuestions', 'durationMinutes']
    });

    tests.forEach(t => {
      suggestions.push({
        title: t.title,
        type: `${t.totalQuestions} Qs • ${t.durationMinutes}m`,
        category: 'test',
        icon: '⏱️',
        url: `/tests/${t.id}`
      });
    });

    // 4. Current Affairs suggestions
    const affairs = await CurrentAffair.findAll({
      where: {
        status: 'published',
        [Op.or]: [
          { titleHindi: { [Op.like]: searchCondition } },
          { titleEnglish: { [Op.like]: searchCondition } }
        ]
      },
      limit: 2,
      attributes: ['id', 'titleHindi', 'titleEnglish', 'category']
    });

    affairs.forEach(a => {
      suggestions.push({
        title: a.titleHindi || a.titleEnglish,
        type: a.category?.replace('_', ' ').toUpperCase() || 'CURRENT AFFAIRS',
        category: 'current_affair',
        icon: '📰',
        url: `/current-affairs`
      });
    });

    return suggestions.slice(0, limit);
  }
}

module.exports = new SearchService();
