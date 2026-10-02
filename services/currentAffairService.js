const { CurrentAffair, User } = require('../models');
const { Op } = require('sequelize');

class CurrentAffairService {
  /**
   * Get filtered and paginated list of current affairs
   */
  async getAllCurrentAffairs(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 12;
    const offset = (page - 1) * limit;

    const where = {};

    if (query.category && query.category !== 'all') {
      where.category = query.category;
    }

    if (query.status && query.status !== 'all') {
      where.status = query.status;
    }

    if (query.isFeatured !== undefined && query.isFeatured !== 'all') {
      where.isFeatured = query.isFeatured === 'true' || query.isFeatured === true;
    }

    if (query.date) {
      where.date = query.date;
    }

    if (query.month) {
      // month e.g. "2026-09"
      where.date = {
        [Op.startsWith]: query.month
      };
    }

    if (query.search && query.search.trim()) {
      const searchTerm = `%${query.search.trim()}%`;
      where[Op.or] = [
        { titleEnglish: { [Op.like]: searchTerm } },
        { titleHindi: { [Op.like]: searchTerm } },
        { summaryEnglish: { [Op.like]: searchTerm } },
        { summaryHindi: { [Op.like]: searchTerm } }
      ];
    }

    const { count, rows: currentAffairs } = await CurrentAffair.findAndCountAll({
      where,
      limit,
      offset,
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return {
      currentAffairs,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    };
  }

  /**
   * Get single article by ID or slug
   */
  async getCurrentAffairBySlugOrId(idOrSlug) {
    const isNumeric = !isNaN(idOrSlug);
    const where = isNumeric ? { id: Number(idOrSlug) } : { slug: idOrSlug };

    const article = await CurrentAffair.findOne({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!article) {
      const err = new Error('Current affairs article not found');
      err.statusCode = 404;
      throw err;
    }

    return article;
  }

  /**
   * Create Current Affair article
   */
  async createCurrentAffair(data, userId) {
    const { titleEnglish, titleHindi } = data;
    if (!titleEnglish && !titleHindi) {
      const err = new Error('Current affairs title is required');
      err.statusCode = 400;
      throw err;
    }

    const titleForSlug = titleEnglish || titleHindi;
    const baseSlug = titleForSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug || 'ca'}-${Date.now().toString().slice(-5)}`;

    const article = await CurrentAffair.create({
      ...data,
      titleEnglish: titleEnglish || titleHindi,
      slug: data.slug || uniqueSlug,
      date: data.date || new Date().toISOString().split('T')[0],
      publishedBy: userId || null
    });

    return article;
  }

  /**
   * Update Current Affair
   */
  async updateCurrentAffair(id, data) {
    const article = await CurrentAffair.findByPk(id);
    if (!article) {
      const err = new Error('Current affairs article not found');
      err.statusCode = 404;
      throw err;
    }

    await article.update(data);
    return article;
  }

  /**
   * Delete Current Affair
   */
  async deleteCurrentAffair(id) {
    const article = await CurrentAffair.findByPk(id);
    if (!article) {
      const err = new Error('Current affairs article not found');
      err.statusCode = 404;
      throw err;
    }

    await article.destroy();
    return { success: true, message: 'Current affairs article deleted successfully' };
  }

  /**
   * Track & increment view count
   */
  async incrementView(id) {
    const article = await CurrentAffair.findByPk(id);
    if (!article) return null;
    await article.increment('viewCount', { by: 1 });
    return { success: true, viewCount: article.viewCount + 1 };
  }

  /**
   * Track & increment like count
   */
  async incrementLike(id) {
    const article = await CurrentAffair.findByPk(id);
    if (!article) return null;
    await article.increment('likesCount', { by: 1 });
    return { success: true, likesCount: article.likesCount + 1 };
  }

  /**
   * Get daily revision digest
   */
  async getDailyDigest(date) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const articles = await CurrentAffair.findAll({
      where: {
        date: targetDate,
        status: 'published'
      },
      order: [['isFeatured', 'DESC'], ['id', 'ASC']]
    });

    return {
      date: targetDate,
      totalArticles: articles.length,
      articles
    };
  }

  /**
   * Statistics and categories distribution
   */
  async getStats() {
    const totalArticles = await CurrentAffair.count();
    const rajasthanCount = await CurrentAffair.count({ where: { category: 'rajasthan_special' } });
    const nationalCount = await CurrentAffair.count({ where: { category: 'national' } });
    const schemesCount = await CurrentAffair.count({ where: { category: 'schemes_policies' } });
    const economyCount = await CurrentAffair.count({ where: { category: 'economy_budget' } });

    return {
      totalArticles,
      rajasthanCount,
      nationalCount,
      schemesCount,
      economyCount
    };
  }
}

module.exports = new CurrentAffairService();
