const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const ExamStage = sequelize.define('ExamStage', {
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
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  stageOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Order of stage execution (e.g. 1 for Prelims, 2 for Mains, 3 for Interview)'
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total time allowed in minutes'
  },
  totalMarks: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  negativeMarking: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Penalty score per incorrect answer (e.g., 0.33 or 0.25)'
  },
  qualifyingMarks: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'draft'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  tableName: 'ExamStages',
  indexes: [
    {
      fields: ['examId', 'stageOrder']
    }
  ]
});

module.exports = ExamStage;
