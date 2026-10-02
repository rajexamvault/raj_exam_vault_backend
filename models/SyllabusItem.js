const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const SyllabusItem = sequelize.define('SyllabusItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  examId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Exams',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Subjects',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  weightage: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Expected marks weightage percentage or score'
  },
  importance: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'very_high'),
    defaultValue: 'medium'
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
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
  tableName: 'SyllabusItems',
  indexes: [
    {
      fields: ['examId', 'stageId', 'subjectId']
    }
  ]
});

module.exports = SyllabusItem;
