const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const TestQuestion = sequelize.define('TestQuestion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  mockTestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'mock_tests',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'questions',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  sectionName: {
    type: DataTypes.STRING(150),
    defaultValue: 'General Section'
  },
  questionOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  marks: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0
  },
  negativeMarks: {
    type: DataTypes.FLOAT,
    defaultValue: 0.33
  }
}, {
  tableName: 'test_questions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['mockTestId', 'questionId']
    },
    {
      fields: ['mockTestId', 'questionOrder']
    }
  ]
});

module.exports = TestQuestion;
