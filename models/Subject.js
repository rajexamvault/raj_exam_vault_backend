const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  stageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ExamStages',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  name: {
    type: DataTypes.STRING(180),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  slug: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING(100),
    defaultValue: 'BookOpen'
  },
  color: {
    type: DataTypes.STRING(50),
    defaultValue: 'blue'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  totalMarks: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  tableName: 'Subjects',
  indexes: [
    {
      fields: ['stageId', 'displayOrder']
    },
    {
      fields: ['examId']
    }
  ]
});

module.exports = Subject;
