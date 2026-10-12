const { Op } = require('sequelize');
const { BugReport, User } = require('../models');
const StorageService = require('../utils/storage');
const EmailService = require('./emailService');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

class BugReportService {
  /**
   * Submit a new bug / issue report
   */
  static async createReport(reportData, file = null, currentUser = null) {
    const {
      title,
      description,
      category = 'other',
      priority = 'medium',
      pageUrl = null,
      deviceInfo = null,
      contactEmail = null,
      contactName = null,
      contactPhone = null
    } = reportData;

    if (!title || !title.trim()) {
      throw new Error('Title / problem summary is required');
    }
    if (!description || !description.trim()) {
      throw new Error('Problem description is required');
    }

    // Determine final contact email and name
    let finalEmail = contactEmail ? contactEmail.trim().toLowerCase() : null;
    let finalName = contactName ? contactName.trim() : null;
    let finalPhone = contactPhone ? contactPhone.trim() : null;

    if (currentUser) {
      finalEmail = finalEmail || currentUser.email;
      finalName = finalName || currentUser.name;
    } else {
      if (!finalEmail) {
        throw new Error('Please provide your contact email so our team can notify you when the issue is fixed.');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(finalEmail)) {
        throw new Error('Please provide a valid email address.');
      }
    }

    let screenshotUrl = null;
    let screenshotPublicId = null;

    if (file) {
      try {
        const uploadRes = await StorageService.uploadFile(file, 'bug-reports');
        screenshotUrl = uploadRes.fileUrl || uploadRes.url || null;
        screenshotPublicId = uploadRes.publicId || uploadRes.key || null;
      } catch (uploadErr) {
        console.error('⚠️ [BugReport] Screenshot upload failed:', uploadErr.message);
        // Continue creating report even if file upload fails, or propagate error
      }
    }

    const report = await BugReport.create({
      userId: currentUser ? currentUser.id : null,
      contactEmail: finalEmail,
      contactName: finalName || (currentUser ? currentUser.name : 'Student'),
      contactPhone: finalPhone,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'open',
      screenshotUrl,
      screenshotPublicId,
      pageUrl: pageUrl ? pageUrl.trim() : null,
      deviceInfo: deviceInfo ? deviceInfo.trim() : null
    });


    return await BugReport.findByPk(report.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'profileImage']
        }
      ]
    });
  }

  /**
   * Get reports submitted by the logged-in user
   */
  static async getUserReports(userId, { page = 1, limit = 20, status = 'all' } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const where = { userId };
    if (status && status !== 'all') {
      where.status = status;
    }

    const { count, rows } = await BugReport.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'resolver',
          attributes: ['id', 'name', 'role']
        }
      ]
    });

    return {
      reports: rows,
      pagination: {
        total: count,
        page: pageNum,
        totalPages: Math.ceil(count / limitNum),
        limit: limitNum
      }
    };
  }

  /**
   * Get all reports for Superadmin with rich filtering & search
   */
  static async getAllReports({
    page = 1,
    limit = 15,
    search = '',
    status = 'all',
    priority = 'all',
    category = 'all'
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }
    if (priority && priority !== 'all') {
      where.priority = priority;
    }
    if (category && category !== 'all') {
      where.category = category;
    }

    // Search condition across title, description, and user
    const include = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role', 'profileImage']
      },
      {
        model: User,
        as: 'resolver',
        attributes: ['id', 'name', 'email', 'role']
      }
    ];

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: q } },
        { description: { [Op.like]: q } },
        { contactEmail: { [Op.like]: q } },
        { contactName: { [Op.like]: q } },
        { '$user.name$': { [Op.like]: q } },
        { '$user.email$': { [Op.like]: q } }
      ];
    }


    const { count, rows } = await BugReport.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']],
      include,
      subQuery: false
    });

    // Overview KPIs
    const [total, open, investigating, resolved, closed] = await Promise.all([
      BugReport.count(),
      BugReport.count({ where: { status: 'open' } }),
      BugReport.count({ where: { status: 'investigating' } }),
      BugReport.count({ where: { status: 'resolved' } }),
      BugReport.count({ where: { status: 'closed' } })
    ]);

    return {
      reports: rows,
      stats: {
        total,
        open,
        investigating,
        resolved,
        closed,
        pending: open + investigating
      },
      pagination: {
        total: count,
        page: pageNum,
        totalPages: Math.ceil(count / limitNum),
        limit: limitNum
      }
    };
  }

  /**
   * Get single report by ID
   */
  static async getReportById(id) {
    const report = await BugReport.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'profileImage']
        },
        {
          model: User,
          as: 'resolver',
          attributes: ['id', 'name', 'role']
        }
      ]
    });
    if (!report) {
      throw new Error('Bug report not found');
    }
    return report;
  }

  /**
   * Update bug report status, admin resolution notes, and optionally notify user
   */
  static async updateReportStatus(id, { status, adminNotes, sendEmail = true, resolverUser = null }) {
    const report = await BugReport.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!report) {
      throw new Error('Bug report not found');
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const isMarkingResolved = status === 'resolved';

    if (isMarkingResolved) {
      updateData.resolvedAt = new Date();
      if (resolverUser) {
        updateData.resolvedBy = resolverUser.id;
      }
    }

    // Check if email should be sent
    let emailSentResult = false;
    const targetEmail = (report.user && report.user.email) || report.contactEmail;
    const targetName = (report.user && report.user.name) || report.contactName || 'Student';

    if (isMarkingResolved && sendEmail && targetEmail) {
      try {
        let checkLink;
        if (report.pageUrl) {
          checkLink = report.pageUrl.startsWith('http') ? report.pageUrl : `${FRONTEND_URL}${report.pageUrl}`;
        } else if (report.userId) {
          checkLink = `${FRONTEND_URL}/profile?tab=reports`;
        } else {
          checkLink = `${FRONTEND_URL}/login`;
        }

        await EmailService.sendBugResolved(
          targetEmail,
          targetName,
          report.title,
          adminNotes || 'Your reported bug has been thoroughly resolved. Please verify now on the platform.',
          checkLink
        );
        updateData.resolutionEmailSent = true;
        emailSentResult = true;
      } catch (mailErr) {
        console.error('❌ [BugReportService]: Failed to send bug resolution email:', mailErr.message);
        // Do not crash the status update if SMTP fails
      }
    }


    await report.update(updateData);

    const refreshed = await this.getReportById(id);
    return {
      report: refreshed,
      emailSent: emailSentResult
    };
  }

  /**
   * Delete report
   */
  static async deleteReport(id) {
    const report = await BugReport.findByPk(id);
    if (!report) {
      throw new Error('Bug report not found');
    }

    if (report.screenshotPublicId) {
      try {
        await StorageService.deleteFile(report.screenshotPublicId);
      } catch (_) {}
    }

    await report.destroy();
    return { message: 'Bug report deleted successfully' };
  }

  /**
   * Quick summary stats
   */
  static async getStats() {
    const [total, open, investigating, resolved, closed] = await Promise.all([
      BugReport.count(),
      BugReport.count({ where: { status: 'open' } }),
      BugReport.count({ where: { status: 'investigating' } }),
      BugReport.count({ where: { status: 'resolved' } }),
      BugReport.count({ where: { status: 'closed' } })
    ]);

    return {
      total,
      open,
      investigating,
      resolved,
      closed,
      pending: open + investigating
    };
  }
}

module.exports = BugReportService;
