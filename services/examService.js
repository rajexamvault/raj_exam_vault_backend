const { Exam, StudyMaterial, ExamStage, MockTest, Question, User, sequelize } = require('../models');
const { Op } = require('sequelize');

class ExamService {
  /**
   * Get all exams with search, category/type filtering, and attached materials summary
   */
  static async getAllExams(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const offset = (page - 1) * limit;

    const where = {};

    if (query.status && query.status !== 'all') {
      if (query.status === 'active') {
        where.status = { [Op.in]: ['active', 'published'] };
      } else {
        where.status = query.status;
      }
    }

    if (query.category && query.category !== 'all') {
      where.category = query.category;
    }

    if (query.examType && query.examType !== 'all') {
      where.examType = query.examType;
    }

    if (query.isFeatured !== undefined && query.isFeatured !== 'all') {
      where.isFeatured = query.isFeatured === 'true' || query.isFeatured === true;
    }

    if (query.search && query.search.trim()) {
      const searchTerm = `%${query.search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: searchTerm } },
        { shortName: { [Op.like]: searchTerm } },
        { department: { [Op.like]: searchTerm } },
        { category: { [Op.like]: searchTerm } },
        { examType: { [Op.like]: searchTerm } },
        { slug: { [Op.like]: searchTerm } }
      ];
    }

    const { count, rows: exams } = await Exam.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ['displayOrder', 'ASC'],
        ['createdAt', 'DESC']
      ],
      include: [
        {
          model: StudyMaterial,
          as: 'materials',
          attributes: ['id', 'materialType', 'isFree', 'year', 'status'],
          required: false
        },
        {
          model: ExamStage,
          as: 'stages',
          attributes: ['id', 'name', 'stageOrder'],
          required: false
        },
        {
          model: MockTest,
          as: 'mockTests',
          attributes: ['id', 'testType', 'isFree', 'status'],
          required: false
        },
        {
          model: Question,
          as: 'questions',
          attributes: ['id'],
          required: false
        }
      ],
      distinct: true
    });

    // Format exams with counts of pyqs, notes, etc.
    const formattedExams = exams.map((exam) => {
      const plain = exam.get({ plain: true });
      const materials = plain.materials || [];
      const stages = plain.stages || [];
      const mockTests = plain.mockTests || [];
      const questions = plain.questions || [];

      const pyqCount = materials.filter((m) => m.materialType === 'pyq' && (m.status === 'published' || m.status === 'active')).length;
      const notesCount = materials.filter((m) => m.materialType === 'notes' && (m.status === 'published' || m.status === 'active')).length;
      const syllabusCount = materials.filter((m) => (m.materialType === 'syllabus' || m.materialType === 'syllabus_pdf') && (m.status === 'published' || m.status === 'active')).length;
      const freeCount = materials.filter((m) => m.isFree && (m.status === 'published' || m.status === 'active')).length;

      return {
        ...plain,
        stats: {
          totalMaterials: materials.length,
          pyqCount,
          notesCount,
          syllabusCount,
          freeCount,
          stageCount: stages.length,
          testCount: mockTests.length,
          questionCount: questions.length
        }
      };
    });

    return {
      exams: formattedExams,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    };
  }

  /**
   * Get single exam by ID or slug with all attached study materials
   */
  static async getExamByIdOrSlug(idOrSlug) {
    const isNum = !isNaN(idOrSlug) && !isNaN(parseFloat(idOrSlug));
    const where = isNum ? { id: Number(idOrSlug) } : { slug: idOrSlug };

    const exam = await Exam.findOne({
      where,
      include: [
        {
          model: StudyMaterial,
          as: 'materials'
        }
      ]
    });

    if (!exam) {
      const err = new Error('Exam not found');
      err.statusCode = 404;
      throw err;
    }

    const plain = exam.get({ plain: true });
    const materials = (plain.materials || []).sort((a, b) => {
      const yearDiff = (b.year || 0) - (a.year || 0);
      if (yearDiff !== 0) return yearDiff;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return {
      ...plain,
      materialsByType: {
        pyqs: materials.filter((m) => m.materialType === 'pyq'),
        notes: materials.filter((m) => m.materialType === 'notes'),
        syllabus: materials.filter((m) => m.materialType === 'syllabus' || m.materialType === 'syllabus_pdf'),
        testSeries: materials.filter((m) => m.materialType === 'test_series'),
        freePdfs: materials.filter((m) => m.isFree)
      }
    };
  }

  /**
   * Create new Dynamic Exam
   */
  static async createExam(examData, userId) {
    const {
      title,
      shortName,
      slug,
      category,
      department,
      examType,
      description,
      eligibility,
      applicationInfo,
      officialWebsite,
      syllabusUrl,
      icon,
      logoUrl,
      bannerUrl,
      badge,
      totalVacancies,
      examDate,
      isFeatured,
      displayOrder,
      status
    } = examData;

    if (!title || !title.trim()) {
      const err = new Error('Exam name/title is required');
      err.statusCode = 400;
      throw err;
    }

    // Generate slug if not provided
    const cleanSlug = (slug && slug.trim())
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check slug uniqueness
    const existingSlug = await Exam.findOne({ where: { slug: cleanSlug } });
    if (existingSlug) {
      const err = new Error(`An exam with slug '${cleanSlug}' already exists. Please pick a distinct title or slug.`);
      err.statusCode = 400;
      throw err;
    }

    const newExam = await Exam.create({
      title: title.trim(),
      shortName: shortName ? shortName.trim() : 'EXAM',
      slug: cleanSlug,
      category: category || 'State Civil Services',
      department: department || 'Rajasthan Staff Selection Board (RSMSSB)',
      examType: examType || 'Direct Recruitment',
      description: description || '',
      eligibility: eligibility || '',
      applicationInfo: applicationInfo || '',
      officialWebsite: officialWebsite || '',
      syllabusUrl: syllabusUrl || '',
      icon: icon || '🏛️',
      logoUrl: logoUrl || '',
      bannerUrl: bannerUrl || '',
      badge: badge || 'Popular',
      totalVacancies: totalVacancies ? Number(totalVacancies) : 0,
      examDate: examDate || null,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      displayOrder: displayOrder ? Number(displayOrder) : 0,
      status: status || 'published',
      createdBy: userId || null
    });

    return newExam;
  }

  /**
   * Update Dynamic Exam
   */
  static async updateExam(id, updateData) {
    const exam = await Exam.findByPk(id);
    if (!exam) {
      const err = new Error('Exam not found');
      err.statusCode = 404;
      throw err;
    }

    if (updateData.slug && updateData.slug !== exam.slug) {
      const cleanSlug = updateData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existing = await Exam.findOne({ where: { slug: cleanSlug, id: { [Op.ne]: id } } });
      if (existing) {
        const err = new Error(`Slug '${cleanSlug}' is already taken by another exam.`);
        err.statusCode = 400;
        throw err;
      }
      updateData.slug = cleanSlug;
    }

    if (updateData.totalVacancies) {
      updateData.totalVacancies = Number(updateData.totalVacancies);
    }
    if (updateData.displayOrder !== undefined) {
      updateData.displayOrder = Number(updateData.displayOrder);
    }

    await exam.update(updateData);
    return exam;
  }

  /**
   * Delete / Archive Exam
   */
  static async deleteExam(id) {
    const exam = await Exam.findByPk(id);
    if (!exam) {
      const err = new Error('Exam not found');
      err.statusCode = 404;
      throw err;
    }

    await exam.destroy();
    return { message: 'Exam and all associated study materials deleted successfully.' };
  }
}

module.exports = ExamService;
