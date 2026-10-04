const { Exam, ExamStage, Subject, Topic, SyllabusItem } = require('../models');

class SyllabusHierarchyService {
  /**
   * Get full hierarchical syllabus tree for an exam
   */
  async getExamHierarchy(examId) {
    const exam = await Exam.findByPk(examId, {
      attributes: ['id', 'title', 'shortName', 'slug', 'category', 'status']
    });

    if (!exam) {
      throw new Error('Exam not found');
    }

    const subjects = await Subject.findAll({
      where: { examId },
      order: [['displayOrder', 'ASC']],
      include: [
        {
          model: Topic,
          as: 'topics',
          include: [
            {
              model: SyllabusItem,
              as: 'syllabusItems'
            }
          ]
        },
        {
          model: SyllabusItem,
          as: 'syllabusItems'
        }
      ]
    });

    const stages = await ExamStage.findAll({
      where: { examId },
      order: [['stageOrder', 'ASC']]
    });

    const examData = exam.toJSON();
    examData.subjects = subjects.map(s => s.toJSON());
    examData.stages = stages.map(s => s.toJSON());
    return examData;
  }

  // ================= STAGES =================
  async createStage(examId, data) {
    const exam = await Exam.findByPk(examId);
    if (!exam) throw new Error('Exam not found');

    let stageOrder = data.stageOrder;
    if (!stageOrder) {
      const maxOrder = await ExamStage.max('stageOrder', { where: { examId } });
      stageOrder = (maxOrder || 0) + 1;
    }

    return await ExamStage.create({
      ...data,
      examId,
      stageOrder
    });
  }

  async getStagesByExam(examId) {
    return await ExamStage.findAll({
      where: { examId },
      order: [['stageOrder', 'ASC']],
      include: [
        {
          model: Subject,
          as: 'subjects',
          attributes: ['id', 'name', 'code', 'totalMarks', 'displayOrder', 'status']
        }
      ]
    });
  }

  async updateStage(stageId, data) {
    const stage = await ExamStage.findByPk(stageId);
    if (!stage) throw new Error('Stage not found');
    return await stage.update(data);
  }

  async deleteStage(stageId) {
    const stage = await ExamStage.findByPk(stageId);
    if (!stage) throw new Error('Stage not found');
    await stage.destroy();
    return { success: true, message: 'Stage removed successfully' };
  }

  // ================= SUBJECTS =================
  async createSubject(data) {
    const { examId, name } = data;
    if (!examId || !name) {
      throw new Error('examId and subject name are required');
    }

    const exam = await Exam.findByPk(examId);
    if (!exam) throw new Error('Target Exam not found');

    let displayOrder = data.displayOrder;
    if (displayOrder === undefined || displayOrder === null) {
      const maxOrder = await Subject.max('displayOrder', { where: { examId } });
      displayOrder = (maxOrder || 0) + 1;
    }

    const slug = data.slug || name.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, '-').replace(/(^-|-$)+/g, '');

    return await Subject.create({
      ...data,
      examId: Number(examId),
      stageId: data.stageId ? Number(data.stageId) : null,
      slug: slug || `subject-${Date.now().toString(36)}`,
      displayOrder
    });
  }

  async getSubjectsByExam(examId) {
    return await Subject.findAll({
      where: { examId },
      order: [['displayOrder', 'ASC']],
      include: [
        {
          model: Topic,
          as: 'topics',
          attributes: ['id', 'name', 'difficultyLevel', 'estimatedHours', 'displayOrder', 'status']
        }
      ]
    });
  }

  async getSubjectsByStage(stageId) {
    return await Subject.findAll({
      where: { stageId },
      order: [['displayOrder', 'ASC']],
      include: [
        {
          model: Topic,
          as: 'topics',
          attributes: ['id', 'name', 'difficultyLevel', 'estimatedHours', 'displayOrder', 'status']
        }
      ]
    });
  }

  async updateSubject(subjectId, data) {
    const subject = await Subject.findByPk(subjectId);
    if (!subject) throw new Error('Subject not found');

    if (data.name && !data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    return await subject.update(data);
  }

  async deleteSubject(subjectId) {
    const subject = await Subject.findByPk(subjectId);
    if (!subject) throw new Error('Subject not found');
    await subject.destroy();
    return { success: true, message: 'Subject removed successfully' };
  }

  // ================= TOPICS =================
  async createTopic(data) {
    const { subjectId, name } = data;
    if (!subjectId || !name) throw new Error('subjectId and topic name are required');

    const subject = await Subject.findByPk(subjectId);
    if (!subject) throw new Error('Subject not found');

    let displayOrder = data.displayOrder;
    if (displayOrder === undefined || displayOrder === null) {
      const maxOrder = await Topic.max('displayOrder', { where: { subjectId } });
      displayOrder = (maxOrder || 0) + 1;
    }

    let slug = data.slug || name.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, '-').replace(/(^-|-$)+/g, '');
    if (!slug) slug = `topic-${Date.now().toString(36)}`;

    return await Topic.create({
      ...data,
      slug,
      displayOrder
    });
  }

  async getTopicsBySubject(subjectId) {
    return await Topic.findAll({
      where: { subjectId },
      order: [['displayOrder', 'ASC']],
      include: [
        {
          model: SyllabusItem,
          as: 'syllabusItems'
        }
      ]
    });
  }

  async updateTopic(topicId, data) {
    const topic = await Topic.findByPk(topicId);
    if (!topic) throw new Error('Topic not found');

    if (data.name && !data.slug) {
      let slug = data.name.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, '-').replace(/(^-|-$)+/g, '');
      if (!slug) slug = `topic-${Date.now().toString(36)}`;
      data.slug = slug;
    }

    return await topic.update(data);
  }

  async deleteTopic(topicId) {
    const topic = await Topic.findByPk(topicId);
    if (!topic) throw new Error('Topic not found');
    await topic.destroy();
    return { success: true, message: 'Topic removed successfully' };
  }

  // ================= SYLLABUS ITEMS =================
  async createSyllabusItem(data) {
    const { examId, subjectId, title } = data;
    if (!examId || !subjectId || !title) {
      throw new Error('examId, subjectId, and title are required');
    }

    return await SyllabusItem.create({
      ...data,
      stageId: data.stageId ? Number(data.stageId) : null
    });
  }

  async getSyllabusItems(query = {}) {
    const where = {};
    if (query.examId) where.examId = query.examId;
    if (query.stageId) where.stageId = query.stageId;
    if (query.subjectId) where.subjectId = query.subjectId;
    if (query.topicId) where.topicId = query.topicId;

    return await SyllabusItem.findAll({
      where,
      order: [['displayOrder', 'ASC'], ['id', 'ASC']]
    });
  }

  async updateSyllabusItem(id, data) {
    const item = await SyllabusItem.findByPk(id);
    if (!item) throw new Error('Syllabus item not found');
    return await item.update(data);
  }

  async deleteSyllabusItem(id) {
    const item = await SyllabusItem.findByPk(id);
    if (!item) throw new Error('Syllabus item not found');
    await item.destroy();
    return { success: true, message: 'Syllabus item removed successfully' };
  }

  // ================= BULK REORDERING =================
  async reorderEntities(type, orderedIds) {
    if (!Array.isArray(orderedIds)) throw new Error('orderedIds must be an array');

    const updatePromises = orderedIds.map((id, index) => {
      if (type === 'stage') {
        return ExamStage.update({ stageOrder: index + 1 }, { where: { id } });
      } else if (type === 'subject') {
        return Subject.update({ displayOrder: index + 1 }, { where: { id } });
      } else if (type === 'topic') {
        return Topic.update({ displayOrder: index + 1 }, { where: { id } });
      } else if (type === 'syllabus') {
        return SyllabusItem.update({ displayOrder: index + 1 }, { where: { id } });
      }
    });

    await Promise.all(updatePromises);
    return { success: true, message: 'Reordered successfully' };
  }
}

module.exports = new SyllabusHierarchyService();
