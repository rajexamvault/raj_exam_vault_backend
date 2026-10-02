const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const TestAttempt = sequelize.define('TestAttempt', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  score: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  totalMarks: {
    type: DataTypes.FLOAT,
    defaultValue: 200.0
  },
  correctCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  incorrectCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  unattemptedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  accuracy: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  timeSpentSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  userAnswers: {
    type: DataTypes.JSON,
    defaultValue: {}
    // Format: { [questionId]: { selectedAnswer: 'A', isCorrect: true, timeSpent: 20 } }
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  percentile: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed', 'timed_out', 'abandoned'),
    defaultValue: 'in_progress'
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'test_attempts',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'mockTestId']
    },
    {
      fields: ['mockTestId', 'score']
    }
  ]
});

module.exports = TestAttempt;
