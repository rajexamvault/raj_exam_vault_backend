const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const CurrentAffair = sequelize.define('CurrentAffair', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  titleHindi: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  titleEnglish: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Current affairs title is required' }
    }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'unique_current_affair_slug',
      msg: 'Current affair slug must be unique'
    }
  },
  category: {
    type: DataTypes.ENUM(
      'rajasthan_special',
      'national',
      'international',
      'schemes_policies',
      'awards_sports',
      'economy_budget',
      'science_tech',
      'environment'
    ),
    defaultValue: 'rajasthan_special'
  },
  summaryHindi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  summaryEnglish: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contentHindi: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  contentEnglish: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  examRelevance: {
    type: DataTypes.JSON,
    defaultValue: ['RAS', 'REET', 'Police', 'Patwari', 'CET']
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  bannerUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  mcqQuestions: {
    type: DataTypes.JSON,
    defaultValue: []
    // Array of daily quiz questions: [{ questionHindi, questionEnglish, options, correctAnswer, explanation }]
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('published', 'draft', 'archived'),
    defaultValue: 'published'
  },
  publishedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'current_affairs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['category', 'date', 'status', 'isFeatured']
    }
  ]
});

module.exports = CurrentAffair;
