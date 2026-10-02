require('dotenv').config();

const appConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'raj_exam_vault',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? false : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '15', 10),
      min: parseInt(process.env.DB_POOL_MIN || '0', 10),
      acquire: 30000,
      idle: 10000
    }
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'raj_exam_vault_super_secret_jwt_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local', // 'local' | 'cloudinary' | 's3'
    localUploadDir: process.env.LOCAL_UPLOAD_DIR || 'uploads',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10)
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  },

  email: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    service: 'gmail'
  }
};

module.exports = appConfig;
