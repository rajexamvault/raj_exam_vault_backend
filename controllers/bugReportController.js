const BugReportService = require('../services/bugReportService');

class BugReportController {
  /**
   * Submit a new bug / issue report
   */
  static async createReport(req, res, next) {
    try {
      const file = req.file || null;
      const report = await BugReportService.createReport(req.body, file, req.user || null);

      return res.status(201).json({
        success: true,
        message: 'Your bug / issue report has been submitted successfully. Our team will review and resolve it promptly!',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get reports submitted by the logged-in user
   */
  static async getMyReports(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await BugReportService.getUserReports(req.user.id, { page, limit, status });

      return res.status(200).json({
        success: true,
        data: result.reports,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all reports for Admin/Superadmin
   */
  static async getAllReports(req, res, next) {
    try {
      const { page, limit, search, status, priority, category } = req.query;
      const result = await BugReportService.getAllReports({
        page,
        limit,
        search,
        status,
        priority,
        category
      });

      return res.status(200).json({
        success: true,
        data: result.reports,
        stats: result.stats,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single report by ID
   */
  static async getReportById(req, res, next) {
    try {
      const report = await BugReportService.getReportById(req.params.id);
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update report status and resolve with optional email
   */
  static async updateReportStatus(req, res, next) {
    try {
      const { status, adminNotes, sendEmail } = req.body;
      const result = await BugReportService.updateReportStatus(req.params.id, {
        status,
        adminNotes,
        sendEmail: sendEmail !== undefined ? (sendEmail === true || sendEmail === 'true') : true,
        resolverUser: req.user
      });

      return res.status(200).json({
        success: true,
        message: result.emailSent 
          ? 'Bug report status updated and resolution email successfully sent to the user!' 
          : 'Bug report status updated successfully.',
        data: result.report,
        emailSent: result.emailSent
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete report
   */
  static async deleteReport(req, res, next) {
    try {
      const result = await BugReportService.deleteReport(req.params.id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get quick stats for dashboards
   */
  static async getStats(req, res, next) {
    try {
      const stats = await BugReportService.getStats();
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BugReportController;
