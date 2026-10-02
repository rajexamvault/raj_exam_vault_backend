const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const appConfig = require('../config/appConfig');
const StorageService = require('../utils/storage');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const superAdminRoutes = require('./superAdminRoutes');
const examRoutes = require('./examRoutes');
const studyMaterialRoutes = require('./studyMaterialRoutes');
const syllabusRoutes = require('./syllabusRoutes');
const questionRoutes = require('./questionRoutes');
const mockTestRoutes = require('./mockTestRoutes');
const currentAffairRoutes = require('./currentAffairRoutes');
const announcementRoutes = require('./announcementRoutes');
const searchRoutes = require('./searchRoutes');

// Comprehensive System Health & Diagnostic endpoint
router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbLatencyMs = null;

  try {
    const start = Date.now();
    await sequelize.authenticate();
    dbLatencyMs = Date.now() - start;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error: ' + err.message;
  }

  res.json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    message: 'Raj Exam Vault API Enterprise Engine 🚀',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      name: appConfig.db.name,
      host: appConfig.db.host,
      latencyMs: dbLatencyMs
    },
    storage: {
      provider: StorageService.getProviderName()
    },
    environment: appConfig.env
  });
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/superadmin', superAdminRoutes);
router.use('/exams', examRoutes);
router.use('/syllabus', syllabusRoutes);
router.use('/materials', studyMaterialRoutes);
router.use('/questions', questionRoutes);
router.use('/tests', mockTestRoutes);
router.use('/current-affairs', currentAffairRoutes);
router.use('/announcements', announcementRoutes);
router.use('/search', searchRoutes);

module.exports = router;
