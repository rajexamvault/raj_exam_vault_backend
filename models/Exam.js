const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Exam name/title is required' }
    }
  },
  shortName: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'EXAM'
  },
  slug: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: {
      name: 'unique_exam_slug',
      msg: 'Exam slug must be unique'
    }
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'State Civil Services'
  },
  department: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: 'Rajasthan Staff Selection Board (RSMSSB)'
  },
  examType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Direct Recruitment'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  eligibility: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  applicationInfo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  officialWebsite: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  syllabusUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '🏛️'
  },
  logoUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bannerUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  badge: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'Popular'
  },
  totalVacancies: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  examDate: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'published', 'upcoming', 'draft', 'archived'),
    defaultValue: 'published'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'exams',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['status', 'category', 'isFeatured', 'displayOrder']
    }
  ]
});

module.exports = Exam;
