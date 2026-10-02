const multer = require('multer');

// Configure in-memory storage for stream/buffer upload to StorageProvider
const storage = multer.memoryStorage();

// File filter supporting PDFs, Documents, and Images
const documentAndMediaFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml'
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed formats: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, WEBP'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: documentAndMediaFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB maximum file size for PDFs & papers
  }
});

module.exports = upload;
