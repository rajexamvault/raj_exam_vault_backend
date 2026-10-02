const { Announcement, Exam, User } = require('../models');
const { Op } = require('sequelize');

class AnnouncementService {
  /**
   * Get filtered and paginated list of announcements
   */
  async getAllAnnouncements(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 12;
    const offset = (page - 1) * limit;

    const where = {};

    if (query.examId && query.examId !== 'all') {
      where.examId = Number(query.examId);
    }

    if (query.announcementType && query.announcementType !== 'all') {
      where.announcementType = query.announcementType;
    }

    if (query.priority && query.priority !== 'all') {
      where.priority = query.priority;
    }

    if (query.status && query.status !== 'all') {
      where.status = query.status;
    }

    if (query.isFlashTicker !== undefined && query.isFlashTicker !== 'all') {
      where.isFlashTicker = query.isFlashTicker === 'true' || query.isFlashTicker === true;
    }

    if (query.search && query.search.trim()) {
      const searchTerm = `%${query.search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: searchTerm } },
        { summary: { [Op.like]: searchTerm } },
        { content: { [Op.like]: searchTerm } }
      ];
    }

    const { count, rows: announcements } = await Announcement.findAndCountAll({
      where,
      limit,
      offset,
      order: [['publishDate', 'DESC'], ['createdAt', 'DESC']],
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'shortName', 'category', 'icon']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return {
      announcements,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    };
  }

  /**
   * Get live flash ticker breaking announcements
   */
  async getFlashTickerAlerts() {
    return await Announcement.findAll({
      where: {
        isFlashTicker: true,
        status: 'active'
      },
      order: [['publishDate', 'DESC']],
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'shortName', 'icon']
        }
      ],
      limit: 10
    });
  }

  /**
   * Get single announcement by ID or slug
   */
  async getAnnouncementBySlugOrId(idOrSlug) {
    const isNumeric = !isNaN(idOrSlug);
    const where = isNumeric ? { id: Number(idOrSlug) } : { slug: idOrSlug };

    const alert = await Announcement.findOne({
      where,
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'shortName', 'category', 'icon', 'department']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!alert) {
      const err = new Error('Announcement not found');
      err.statusCode = 404;
      throw err;
    }

    return alert;
  }

  /**
   * Create Announcement
   */
  async createAnnouncement(data, userId) {
    const { title } = data;
    if (!title) {
      const err = new Error('Announcement title is required');
      err.statusCode = 400;
      throw err;
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug || 'alert'}-${Date.now().toString().slice(-5)}`;

    const announcement = await Announcement.create({
      ...data,
      examId: data.examId ? Number(data.examId) : null,
      slug: data.slug || uniqueSlug,
      publishDate: data.publishDate || new Date().toISOString().split('T')[0],
      publishedBy: userId || null
    });

    return announcement;
  }

  /**
   * Update Announcement
   */
  async updateAnnouncement(id, data) {
    const alert = await Announcement.findByPk(id);
    if (!alert) {
      const err = new Error('Announcement not found');
      err.statusCode = 404;
      throw err;
    }

    if (data.examId) data.examId = Number(data.examId);

    await alert.update(data);
    return alert;
  }

  /**
   * Delete Announcement
   */
  async deleteAnnouncement(id) {
    const alert = await Announcement.findByPk(id);
    if (!alert) {
      const err = new Error('Announcement not found');
      err.statusCode = 404;
      throw err;
    }

    await alert.destroy();
    return { success: true, message: 'Announcement deleted successfully' };
  }

  /**
   * Get Announcement metrics
   */
  async getStats() {
    const totalAnnouncements = await Announcement.count();
    const flashCount = await Announcement.count({ where: { isFlashTicker: true, status: 'active' } });
    const examDateCount = await Announcement.count({ where: { announcementType: 'exam_date' } });
    const resultCount = await Announcement.count({ where: { announcementType: 'result' } });

    return {
      totalAnnouncements,
      flashCount,
      examDateCount,
      resultCount
    };
  }
}

module.exports = new AnnouncementService();
