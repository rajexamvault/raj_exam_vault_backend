const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  examId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'exams',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Announcement title is required' }
    }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'unique_announcement_slug',
      msg: 'Announcement slug must be unique'
    }
  },
  announcementType: {
    type: DataTypes.ENUM(
      'exam_date',
      'admit_card',
      'result',
      'answer_key',
      'vacancy_update',
      'syllabus_revision',
      'urgent_alert',
      'general'
    ),
    defaultValue: 'general'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent_flash'),
    defaultValue: 'normal'
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  officialUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  officialPdfUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  publishDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expireDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  isFlashTicker: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Broadcast on top live breaking news ticker'
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'draft'),
    defaultValue: 'active'
  },
  publishedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'announcements',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      name: 'idx_announcements_filter',
      fields: ['examId', 'announcementType', 'priority', 'status', 'isFlashTicker']
    }
  ]
});

module.exports = Announcement;
