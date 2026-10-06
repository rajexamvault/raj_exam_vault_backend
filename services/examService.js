const { Exam, StudyMaterial, ExamStage, MockTest, Question, User, Subject, sequelize } = require('../models');
const { Op } = require('sequelize');

class ExamService {
  /**
   * Get all exams with search, category/type filtering, subjects, and attached materials summary
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
          model: Subject,
          as: 'subjects',
          attributes: ['id', 'name', 'code', 'icon', 'color', 'displayOrder'],
          required: false
        },
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
      const subjects = plain.subjects || [];

      const pyqCount = materials.filter((m) => m.materialType === 'pyq' && (m.status === 'published' || m.status === 'active')).length;
      const notesCount = materials.filter((m) => m.materialType === 'notes' && (m.status === 'published' || m.status === 'active')).length;
      const syllabusCount = materials.filter((m) => (m.materialType === 'syllabus' || m.materialType === 'syllabus_pdf') && (m.status === 'published' || m.status === 'active')).length;
      const freeCount = materials.filter((m) => m.isFree && (m.status === 'published' || m.status === 'active')).length;

      return {
        ...plain,
        subjects,
        stats: {
          totalMaterials: materials.length,
          pyqCount,
          notesCount,
          syllabusCount,
          freeCount,
          stageCount: stages.length,
          subjectCount: subjects.length,
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
   * Get single exam by ID or slug with all attached study materials and subjects
   */
  static async getExamByIdOrSlug(idOrSlug) {
    const isNum = !isNaN(idOrSlug) && !isNaN(parseFloat(idOrSlug));
    const where = isNum ? { id: Number(idOrSlug) } : { slug: idOrSlug };

    const exam = await Exam.findOne({
      where,
      include: [
        {
          model: Subject,
          as: 'subjects',
          attributes: ['id', 'name', 'code', 'icon', 'color', 'displayOrder']
        },
        {
          model: StudyMaterial,
          as: 'materials'
        },
        {
          model: ExamStage,
          as: 'stages',
          attributes: ['id', 'name', 'stageOrder']
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
   * Get all subjects for a given exam
   */
  static async getExamSubjects(examId) {
    const isNum = !isNaN(examId) && !isNaN(parseFloat(examId));
    let id = isNum ? Number(examId) : examId;
    if (!isNum) {
      const exam = await Exam.findOne({ where: { slug: examId } });
      if (!exam) return [];
      id = exam.id;
    }

    let subjects = await Subject.findAll({
      where: { examId: id },
      order: [['displayOrder', 'ASC'], ['id', 'ASC']]
    });

    // If existing legacy exam has no subjects yet, auto-initialize standard Rajasthan subjects
    if (subjects.length === 0) {
      const defaultSubjects = [
        'Rajasthan History, Art & Culture',
        'Rajasthan Geography',
        'Rajasthan Polity & Admin',
        'General Science & Technology',
        'Reasoning & Mental Ability'
      ];

      for (let i = 0; i < defaultSubjects.length; i++) {
        const sName = defaultSubjects[i];
        await Subject.create({
          examId: id,
          stageId: null,
          name: sName,
          slug: sName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          displayOrder: i + 1,
          icon: 'BookOpen',
          color: 'blue'
        });
      }

      subjects = await Subject.findAll({
        where: { examId: id },
        order: [['displayOrder', 'ASC'], ['id', 'ASC']]
      });
    }

    return subjects;
  }

  /**
   * Dynamically add subject to an existing exam
   */
  static async addExamSubject(examId, subjectData) {
    const isNum = !isNaN(examId) && !isNaN(parseFloat(examId));
    let id = examId;
    let targetExam = null;
    if (!isNum) {
      targetExam = await Exam.findOne({ where: { slug: examId } });
      if (!targetExam) {
        const err = new Error('Exam not found');
        err.statusCode = 404;
        throw err;
      }
      id = targetExam.id;
    } else {
      targetExam = await Exam.findByPk(id);
      if (!targetExam) {
        const err = new Error('Exam not found');
        err.statusCode = 404;
        throw err;
      }
    }

    const { name, code, icon, color, description } = subjectData;
    if (!name || !name.trim()) {
      const err = new Error('Subject name is required');
      err.statusCode = 400;
      throw err;
    }

    const count = await Subject.count({ where: { examId: id } });

    const newSubject = await Subject.create({
      examId: id,
      stageId: null,
      name: name.trim(),
      code: code ? code.trim() : null,
      icon: icon || 'BookOpen',
      color: color || 'blue',
      description: description || null,
      displayOrder: count + 1
    });

    return newSubject;
  }

  /**
   * Create new Dynamic Exam with mandatory subjects
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
      status,
      subjects
    } = examData;

    if (!title || !title.trim()) {
      const err = new Error('Exam name/title is required');
      err.statusCode = 400;
      throw err;
    }

    // Dynamic subjects are mandatory when creating an exam
    const rawSubjects = subjects || [];
    const subjectList = (Array.isArray(rawSubjects) ? rawSubjects : String(rawSubjects).split(','))
      .map((s) => (typeof s === 'string' ? s.trim() : (s?.name || '').trim()))
      .filter(Boolean);

    if (subjectList.length === 0) {
      const err = new Error('Subject is mandatory. Please add at least one subject for this exam.');
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

    const cleanTotalVacancies = (totalVacancies === '' || totalVacancies === null || totalVacancies === undefined || isNaN(Number(totalVacancies))) ? 0 : Number(totalVacancies);
    const cleanDisplayOrder = (displayOrder === '' || displayOrder === null || displayOrder === undefined || isNaN(Number(displayOrder))) ? 0 : Number(displayOrder);
    const validStatus = ['active', 'published', 'upcoming', 'draft', 'archived', 'inactive'].includes(status) ? status : 'published';

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
      totalVacancies: cleanTotalVacancies,
      examDate: examDate || null,
      isFeatured: isFeatured === true || isFeatured === 'true',
      displayOrder: cleanDisplayOrder,
      status: validStatus,
      createdBy: userId || null
    });

    // Create mandatory dynamic subjects
    const createdSubjects = [];
    for (let i = 0; i < subjectList.length; i++) {
      const sName = subjectList[i];
      const created = await Subject.create({
        examId: newExam.id,
        stageId: null,
        name: sName,
        displayOrder: i + 1,
        icon: 'BookOpen',
        color: 'blue'
      });
      createdSubjects.push(created);
    }

    const plainExam = newExam.get({ plain: true });
    plainExam.subjects = createdSubjects;
    return plainExam;
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

    let cleanSlug = exam.slug;
    if (updateData.slug && updateData.slug.trim() !== '' && updateData.slug !== exam.slug) {
      cleanSlug = updateData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existing = await Exam.findOne({ where: { slug: cleanSlug, id: { [Op.ne]: id } } });
      if (existing) {
        const err = new Error(`Slug '${cleanSlug}' is already taken by another exam.`);
        err.statusCode = 400;
        throw err;
      }
    }

    // Dynamic subjects update/sync if provided
    if (updateData.subjects !== undefined) {
      const rawSubjects = updateData.subjects;
      const subjectList = (Array.isArray(rawSubjects) ? rawSubjects : String(rawSubjects).split(','))
        .map((s) => (typeof s === 'string' ? s.trim() : (s?.name || '').trim()))
        .filter(Boolean);

      if (subjectList.length > 0) {
        const existing = await Subject.findAll({ where: { examId: id } });
        const existingMap = new Map(existing.map((s) => [s.name.trim().toLowerCase(), s]));

        for (let i = 0; i < subjectList.length; i++) {
          const sName = subjectList[i];
          const lowerName = sName.toLowerCase();
          if (existingMap.has(lowerName)) {
            const existingSubject = existingMap.get(lowerName);
            await existingSubject.update({ displayOrder: i + 1, name: sName });
            existingMap.delete(lowerName);
          } else {
            await Subject.create({
              examId: id,
              stageId: null,
              name: sName,
              displayOrder: i + 1,
              icon: 'BookOpen',
              color: 'blue'
            });
          }
        }

        // Clean up subjects that were removed from the form if safe
        for (const [, removedSubject] of existingMap) {
          try {
            await removedSubject.destroy();
          } catch (delErr) {
            console.warn(`Could not delete removed subject ${removedSubject.name}:`, delErr.message);
          }
        }
      }
    }

    const {
      title,
      shortName,
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
    } = updateData;

    const fieldsToUpdate = {};
    if (title !== undefined) fieldsToUpdate.title = title.trim();
    if (shortName !== undefined) fieldsToUpdate.shortName = shortName ? shortName.trim() : 'EXAM';
    if (updateData.slug !== undefined) fieldsToUpdate.slug = cleanSlug;
    if (category !== undefined) fieldsToUpdate.category = category;
    if (department !== undefined) fieldsToUpdate.department = department;
    if (examType !== undefined) fieldsToUpdate.examType = examType;
    if (description !== undefined) fieldsToUpdate.description = description || '';
    if (eligibility !== undefined) fieldsToUpdate.eligibility = eligibility || '';
    if (applicationInfo !== undefined) fieldsToUpdate.applicationInfo = applicationInfo || '';
    if (officialWebsite !== undefined) fieldsToUpdate.officialWebsite = officialWebsite || '';
    if (syllabusUrl !== undefined) fieldsToUpdate.syllabusUrl = syllabusUrl || '';
    if (icon !== undefined) fieldsToUpdate.icon = icon || '🏛️';
    if (logoUrl !== undefined) fieldsToUpdate.logoUrl = logoUrl || '';
    if (bannerUrl !== undefined) fieldsToUpdate.bannerUrl = bannerUrl || '';
    if (badge !== undefined) fieldsToUpdate.badge = badge || 'Popular';
    if (totalVacancies !== undefined) {
      fieldsToUpdate.totalVacancies = (totalVacancies === '' || totalVacancies === null || isNaN(Number(totalVacancies))) ? 0 : Number(totalVacancies);
    }
    if (examDate !== undefined) fieldsToUpdate.examDate = examDate || null;
    if (isFeatured !== undefined) fieldsToUpdate.isFeatured = isFeatured === true || isFeatured === 'true';
    if (displayOrder !== undefined) {
      fieldsToUpdate.displayOrder = (displayOrder === '' || displayOrder === null || isNaN(Number(displayOrder))) ? 0 : Number(displayOrder);
    }
    if (status !== undefined) {
      fieldsToUpdate.status = ['active', 'published', 'upcoming', 'draft', 'archived', 'inactive'].includes(status) ? status : 'published';
    }

    await exam.update(fieldsToUpdate);

    const updatedExam = await Exam.findByPk(id, {
      include: [
        {
          model: Subject,
          as: 'subjects',
          attributes: ['id', 'name', 'code', 'icon', 'color', 'displayOrder']
        }
      ]
    });
    return updatedExam || exam;
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
