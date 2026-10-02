const express = require('express');
const router = express.Router();
const StudyMaterialController = require('../controllers/studyMaterialController');
const { protect, hasPermission } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public endpoints
router.get('/', StudyMaterialController.getAllMaterials);
router.get('/:id', StudyMaterialController.getMaterialById);
router.post('/download/:id', StudyMaterialController.trackDownload);
router.post('/view/:id', StudyMaterialController.trackView);

// File Upload endpoint (Multer + Pluggable Storage)
router.post(
  '/upload',
  protect,
  hasPermission('material:create'),
  upload.single('file'),
  StudyMaterialController.uploadFile
);

// Protected Granular RBAC endpoints
router.post('/', protect, hasPermission('material:create'), StudyMaterialController.createMaterial);
router.put('/:id', protect, hasPermission('material:update'), StudyMaterialController.updateMaterial);
router.delete('/:id', protect, hasPermission('material:delete'), StudyMaterialController.deleteMaterial);

module.exports = router;
