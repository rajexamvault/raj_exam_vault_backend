const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const BugReport = sequelize.define('BugReport', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Problem summary/title is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Detailed problem description is required' }
    }
  },
  category: {
    type: DataTypes.ENUM(
      'ui_ux',
      'question_error',
      'test_issue',
      'materials_download',
      'auth_account',
      'payment_subscription',
      'performance',
      'other'
    ),
    defaultValue: 'other'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('open', 'investigating', 'resolved', 'closed'),
    defaultValue: 'open'
  },
  screenshotUrl: {
    type: DataTypes.STRING(1024),
    allowNull: true
  },
  screenshotPublicId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  pageUrl: {
    type: DataTypes.STRING(1024),
    allowNull: true
  },
  deviceInfo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  contactEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: { msg: 'Please provide a valid contact email' }
    }
  },
  contactName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  contactPhone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  resolvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolutionEmailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'bug_reports',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['category'] }
  ]
});

module.exports = BugReport;
