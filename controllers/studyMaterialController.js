const StudyMaterialService = require('../services/studyMaterialService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

class StudyMaterialController {
  /**
   * @route GET /api/materials
   */
  static async getAllMaterials(req, res) {
    try {
      const data = await StudyMaterialService.getAllMaterials(req.query);
      return successResponse(res, 200, 'Study materials retrieved successfully', data);
    } catch (err) {
      console.error('Get all materials error:', err);
      return errorResponse(res, 500, 'Failed to fetch study materials', err);
    }
  }

  /**
   * @route GET /api/materials/:id
   */
  static async getMaterialById(req, res) {
    try {
      const material = await StudyMaterialService.getMaterialById(req.params.id);
      return successResponse(res, 200, 'Material details retrieved successfully', { material });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Get material details error:', err);
      return errorResponse(res, 500, 'Failed to retrieve material details', err);
    }
  }

  /**
   * @route POST /api/materials/upload
   * Dedicated file upload endpoint for PDFs, notes, book summaries
   */
  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return failResponse(res, 400, 'No file uploaded');
      }

      const folder = req.body.folder || 'materials';
      const uploadResult = await StudyMaterialService.uploadFile(req.file, folder);

      return successResponse(res, 200, 'File uploaded successfully 📦', uploadResult);
    } catch (err) {
      console.error('Upload file error:', err);
      return errorResponse(res, 500, err.message || 'File upload failed', err);
    }
  }

  /**
   * @route POST /api/materials/download/:id
   */
  static async trackDownload(req, res) {
    try {
      const result = await StudyMaterialService.incrementDownload(req.params.id);
      return successResponse(res, 200, 'Download initiated', result);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Download material error:', err);
      return errorResponse(res, 500, 'Failed to download material', err);
    }
  }

  /**
   * @route POST /api/materials/view/:id
   */
  static async trackView(req, res) {
    try {
      const result = await StudyMaterialService.incrementView(req.params.id);
      return successResponse(res, 200, 'View recorded', result);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('View material error:', err);
      return errorResponse(res, 500, 'Failed to record view', err);
    }
  }

  /**
   * @route POST /api/materials (Protected: material:create)
   */
  static async createMaterial(req, res) {
    try {
      const material = await StudyMaterialService.createMaterial(req.body, req.user?.id);
      return successResponse(res, 201, 'Study material / PYQ added successfully 📄', { material });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Create material error:', err);
      return errorResponse(res, 500, 'Failed to add study material', err);
    }
  }

  /**
   * @route PUT /api/materials/:id (Protected: material:update)
   */
  static async updateMaterial(req, res) {
    try {
      const material = await StudyMaterialService.updateMaterial(req.params.id, req.body);
      return successResponse(res, 200, 'Study material updated successfully ✏️', { material });
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Update material error:', err);
      return errorResponse(res, 500, 'Failed to update study material', err);
    }
  }

  /**
   * @route DELETE /api/materials/:id (Protected: material:delete)
   */
  static async deleteMaterial(req, res) {
    try {
      const result = await StudyMaterialService.deleteMaterial(req.params.id);
      return successResponse(res, 200, result.message);
    } catch (err) {
      if (err.statusCode) {
        return failResponse(res, err.statusCode, err.message);
      }
      console.error('Delete material error:', err);
      return errorResponse(res, 500, 'Failed to delete study material', err);
    }
  }
}

module.exports = StudyMaterialController;
