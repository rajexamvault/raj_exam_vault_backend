const StudyMaterialService = require('../services/studyMaterialService');
const { successResponse, failResponse, errorResponse } = require('../views/responseView');

/**
 * StudyMaterialController - Modern ES6+ Arrow Functions for Study Materials & PYQs
 */

/**
 * @route GET /api/materials
 */
const getAllMaterials = async (req, res) => {
  try {
    const data = await StudyMaterialService.getAllMaterials(req.query ?? {});
    return successResponse(res, 200, 'Study materials retrieved successfully', data);
  } catch (err) {
    console.error('Get all materials error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to fetch study materials', err);
  }
};

/**
 * @route GET /api/materials/:id
 */
const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const material = await StudyMaterialService.getMaterialById(id);
    return successResponse(res, 200, 'Material details retrieved successfully', { material });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Get material details error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to retrieve material details', err);
  }
};

/**
 * @route POST /api/materials/upload
 * Dedicated file upload endpoint for PDFs, notes, book summaries
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return failResponse(res, 400, 'No file uploaded');
    }

    const folder = req.body?.folder ?? 'materials';
    const uploadResult = await StudyMaterialService.uploadFile(req.file, folder);

    return successResponse(res, 200, 'File uploaded successfully 📦', uploadResult);
  } catch (err) {
    console.error('Upload file error:', err);
    return errorResponse(res, 500, err?.message ?? 'File upload failed', err);
  }
};

/**
 * @route POST /api/materials/download/:id
 */
const trackDownload = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await StudyMaterialService.incrementDownload(id);
    return successResponse(res, 200, 'Download initiated', result);
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Download material error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to download material', err);
  }
};

/**
 * @route POST /api/materials/view/:id
 */
const trackView = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await StudyMaterialService.incrementView(id);
    return successResponse(res, 200, 'View recorded', result);
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('View material error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to record view', err);
  }
};

/**
 * @route POST /api/materials (Protected: material:create)
 */
const createMaterial = async (req, res) => {
  try {
    const material = await StudyMaterialService.createMaterial(req.body ?? {}, req.user?.id);
    return successResponse(res, 201, 'Study material / PYQ added successfully 📄', { material });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Create material error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to add study material', err);
  }
};

/**
 * @route PUT /api/materials/:id (Protected: material:update)
 */
const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const material = await StudyMaterialService.updateMaterial(id, req.body ?? {});
    return successResponse(res, 200, 'Study material updated successfully ✏️', { material });
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Update material error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to update study material', err);
  }
};

/**
 * @route DELETE /api/materials/:id (Protected: material:delete)
 */
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params ?? {};
    const result = await StudyMaterialService.deleteMaterial(id);
    return successResponse(res, 200, result?.message ?? 'Study material deleted successfully');
  } catch (err) {
    if (err.statusCode) {
      return failResponse(res, err.statusCode, err.message);
    }
    console.error('Delete material error:', err);
    return errorResponse(res, 500, err?.message ?? 'Failed to delete study material', err);
  }
};

const StudyMaterialController = {
  getAllMaterials,
  getMaterialById,
  uploadFile,
  trackDownload,
  trackView,
  createMaterial,
  updateMaterial,
  deleteMaterial
};

module.exports = StudyMaterialController;
module.exports.getAllMaterials = getAllMaterials;
module.exports.getMaterialById = getMaterialById;
module.exports.uploadFile = uploadFile;
module.exports.trackDownload = trackDownload;
module.exports.trackView = trackView;
module.exports.createMaterial = createMaterial;
module.exports.updateMaterial = updateMaterial;
module.exports.deleteMaterial = deleteMaterial;
