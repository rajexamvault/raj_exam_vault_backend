const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const appConfig = require('./config/appConfig');

const { sequelize } = require('./models');
const apiRoutes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = appConfig.port; // Raj Exam Vault API Engine 🚀

// Allowed Origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://192.168.1.4:3000',
  'http://192.168.1.4:3001',
  'https://raj-exam-vault-frontend.vercel.app',
  appConfig.frontendUrl
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');
    
    // Allow any localhost, loopback, or private LAN IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x) on any port
    const isLocalOrLan = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(normalizedOrigin);

    const isAllowed = isLocalOrLan
      || allowedOrigins.some(item => item && item.replace(/\/+$/, '') === normalizedOrigin)
      || normalizedOrigin.endsWith('.vercel.app')
      || normalizedOrigin.includes('raj-exam-vault');

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Global Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Serve Local Uploads statically
app.use('/uploads', express.static(path.join(process.cwd(), appConfig.storage.localUploadDir)));

// Root Status Route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Raj Exam Vault API Enterprise Engine is running smoothly 🚀',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: appConfig.env
  });
});

// Master API Routes (Mounts at /api as standard, and / for flexible direct routes like /auth/signup)
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// 404 Route Handler
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(globalErrorHandler);

// Auto-create database if not exists before Sequelize connects
const ensureDatabaseExists = async () => {
  try {
    const connConfig = {
      host: appConfig.db.host,
      port: appConfig.db.port,
      user: appConfig.db.user,
      password: appConfig.db.password
    };
    if (appConfig.db.ssl) {
      connConfig.ssl = { rejectUnauthorized: false };
    }
    const connection = await mysql.createConnection(connConfig);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${appConfig.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
    console.log(`✅ MySQL Database '${appConfig.db.name}' verified / created with utf8mb4 support.`);
  } catch (err) {
    console.warn(`⚠️ Warning connecting to MySQL root / checking database: ${err.message}`);
  }
};

// Start Server and Sync Database
const startServer = async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    console.log('✅ Database connected successfully via Sequelize.');

    // Auto-sync database schema with models
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    try {
      await sequelize.query('ALTER TABLE `ExamStages` DROP FOREIGN KEY `ExamStages_ibfk_1`;');
    } catch (_) {}
    try {
      await sequelize.query('ALTER TABLE `ExamStages` ADD CONSTRAINT `ExamStages_ibfk_1` FOREIGN KEY (`examId`) REFERENCES `exams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;');
    } catch (_) {}
    try {
      await sequelize.query('ALTER TABLE `Subjects` DROP FOREIGN KEY `Subjects_ibfk_2`;');
    } catch (_) {}
    try {
      await sequelize.query('ALTER TABLE `Subjects` ADD CONSTRAINT `Subjects_ibfk_2` FOREIGN KEY (`examId`) REFERENCES `exams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;');
    } catch (_) {}
    try {
      await sequelize.query('ALTER TABLE `SyllabusItems` DROP FOREIGN KEY `SyllabusItems_ibfk_1`;');
    } catch (_) {}
    try {
      await sequelize.query('ALTER TABLE `SyllabusItems` ADD CONSTRAINT `SyllabusItems_ibfk_1` FOREIGN KEY (`examId`) REFERENCES `exams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;');
    } catch (_) {}
    await sequelize.sync();
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ Database models synchronized successfully.');

    // Seed/sync default RBAC roles and permissions
    const { seedRbac } = require('./utils/rbac/rbacSeeder');
    await seedRbac();

    // Auto-seed syllabus hierarchy for flagship exams
    const { seedSyllabusHierarchy } = require('./utils/seeders/syllabusHierarchySeeder');
    await seedSyllabusHierarchy();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is listening on http://localhost:${PORT} (0.0.0.0:${PORT})`);
      console.log(`📦 Storage Mode: ${appConfig.storage.provider.toUpperCase()}`);
    });
  } catch (error) {
    console.error('❌ Database connection/sync failed:', error.message);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is listening on http://localhost:${PORT} (Database offline)`);
    });
  }
};

startServer();
