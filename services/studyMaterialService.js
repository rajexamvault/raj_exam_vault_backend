const { StudyMaterial, Exam, ExamStage, Subject, Topic, User } = require('../models');
const { Op } = require('sequelize');
const StorageService = require('../utils/storage');

class StudyMaterialService {
  /**
   * Get list of study materials with flexible filtering
   */
  static async getAllMaterials(query = {}) {
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

    if (query.materialType && query.materialType !== 'all') {
      where.materialType = query.materialType;
    }

    if (query.status && query.status !== 'all') {
      where.status = query.status;
    }

    if (query.year && query.year !== 'all') {
      where.year = Number(query.year);
    }

    if (query.isFree !== undefined && query.isFree !== 'all') {
      where.isFree = query.isFree === 'true' || query.isFree === true;
    }

    if (query.search && query.search.trim()) {
      const searchTerm = `%${query.search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: searchTerm } },
        { subject: { [Op.like]: searchTerm } },
        { paperType: { [Op.like]: searchTerm } },
        { description: { [Op.like]: searchTerm } }
      ];
    }

    const { count, rows: materials } = await StudyMaterial.findAndCountAll({
      where,
      limit,
      offset,
      order: [['year', 'DESC'], ['createdAt', 'DESC']],
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'shortName', 'slug', 'category', 'icon', 'department']
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
        }
      ]
    });

    return {
      materials,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    };
  }

  /**
   * Get single material details
   */
  static async getMaterialById(id) {
    const material = await StudyMaterial.findByPk(id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'shortName', 'slug', 'category', 'icon', 'department']
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

    if (!material) {
      const err = new Error('Study material not found');
      err.statusCode = 404;
      throw err;
    }

    return material;
  }

  /**
   * Track & Increment download count
   */
  static async incrementDownload(id) {
    const material = await StudyMaterial.findByPk(id);
    if (!material) {
      const err = new Error('Study material not found');
      err.statusCode = 404;
      throw err;
    }

    await material.increment('totalDownloads', { by: 1 });
    return {
      success: true,
      fileUrl: material.fileUrl,
      title: material.title,
      totalDownloads: material.totalDownloads + 1
    };
  }

  /**
   * Track & Increment view count
   */
  static async incrementView(id) {
    const material = await StudyMaterial.findByPk(id);
    if (!material) {
      const err = new Error('Study material not found');
      err.statusCode = 404;
      throw err;
    }

    await material.increment('viewCount', { by: 1 });
    return {
      success: true,
      viewCount: material.viewCount + 1
    };
  }

  /**
   * Upload file to storage provider
   */
  static async uploadFile(file, folder = 'materials') {
    if (!file) {
      const err = new Error('No file attached for upload');
      err.statusCode = 400;
      throw err;
    }
    return await StorageService.uploadFile(file, folder);
  }

  /**
   * Create study material linked to an exam and optional stage/subject/topic
   */
  static async createMaterial(materialData, userId) {
    const {
      examId,
      stageId,
      subjectId,
      topicId,
      title,
      materialType,
      year,
      subject,
      paperType,
      fileUrl,
      thumbnailUrl,
      fileSize,
      fileType,
      storageProvider,
      isFree,
      price,
      hasSolutions,
      description,
      status
    } = materialData;

    if (!examId) {
      const err = new Error('Please select an Exam for this material');
      err.statusCode = 400;
      throw err;
    }

    // Verify exam exists
    const exam = await Exam.findByPk(examId);
    if (!exam) {
      const err = new Error('The selected Exam does not exist');
      err.statusCode = 404;
      throw err;
    }

    if (!title || !title.trim()) {
      const err = new Error('Material title is required');
      err.statusCode = 400;
      throw err;
    }

    if (!fileUrl || !fileUrl.trim()) {
      const err = new Error('File URL / PDF Link is required');
      err.statusCode = 400;
      throw err;
    }

    const newMaterial = await StudyMaterial.create({
      examId: Number(examId),
      stageId: stageId ? Number(stageId) : null,
      subjectId: subjectId ? Number(subjectId) : null,
      topicId: topicId ? Number(topicId) : null,
      title: title.trim(),
      materialType: materialType || 'pyq',
      year: year ? Number(year) : new Date().getFullYear(),
      subject: subject ? subject.trim() : 'General Paper',
      paperType: paperType ? paperType.trim() : 'Full Paper',
      fileUrl: fileUrl.trim(),
      thumbnailUrl: thumbnailUrl || null,
      fileSize: fileSize || '3.5 MB',
      fileType: fileType || 'pdf',
      storageProvider: storageProvider || StorageService.getProviderName(),
      isFree: isFree !== undefined ? isFree : true,
      price: price ? Number(price) : 0.00,
      hasSolutions: hasSolutions !== undefined ? hasSolutions : true,
      description: description || '',
      status: status || 'published',
      uploadedBy: userId || null
    });

    return newMaterial;
  }

  /**
   * Update study material
   */
  static async updateMaterial(id, updateData) {
    const material = await StudyMaterial.findByPk(id);
    if (!material) {
      const err = new Error('Study material not found');
      err.statusCode = 404;
      throw err;
    }

    if (updateData.examId) {
      const exam = await Exam.findByPk(updateData.examId);
      if (!exam) {
        const err = new Error('The selected target Exam does not exist');
        err.statusCode = 404;
        throw err;
      }
      updateData.examId = Number(updateData.examId);
    }

    await material.update(updateData);
    return material;
  }

  /**
   * Delete study material with physical file cleanup
   */
  static async deleteMaterial(id) {
    const material = await StudyMaterial.findByPk(id);
    if (!material) {
      const err = new Error('Study material not found');
      err.statusCode = 404;
      throw err;
    }

    // Try deleting physical file if hosted locally
    if (material.fileUrl && material.fileUrl.includes('/uploads/')) {
      const relativePath = material.fileUrl.substring(material.fileUrl.indexOf('/uploads/'));
      await StorageService.deleteFile(relativePath);
    }

    await material.destroy();
    return { message: 'Study material deleted successfully' };
  }
}

module.exports = StudyMaterialService;
