const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const StudyMaterial = sequelize.define('StudyMaterial', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  examId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'exams',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  stageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'ExamStages',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Subjects',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  topicId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Topics',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Study material title is required' }
    }
  },
  materialType: {
    type: DataTypes.ENUM(
      'pyq',
      'notes',
      'syllabus_pdf',
      'model_paper',
      'formula_sheet',
      'test_series',
      'free_pdf',
      'book_pdf'
    ),
    allowNull: false,
    defaultValue: 'pyq'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: new Date().getFullYear()
  },
  subject: {
    type: DataTypes.STRING(150),
    allowNull: true,
    defaultValue: 'General Paper'
  },
  paperType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Full Paper'
  },
  fileUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'File URL or PDF link is required' }
    }
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  fileSize: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '3.5 MB'
  },
  fileType: {
    type: DataTypes.STRING(50),
    defaultValue: 'pdf'
  },
  storageProvider: {
    type: DataTypes.STRING(50),
    defaultValue: 'local'
  },
  totalDownloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  hasSolutions: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('published', 'draft', 'archived'),
    defaultValue: 'published'
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'study_materials',
  timestamps: true,
  indexes: [
    {
      fields: ['examId', 'materialType', 'status']
    },
    {
      fields: ['stageId', 'subjectId']
    }
  ]
});

module.exports = StudyMaterial;
