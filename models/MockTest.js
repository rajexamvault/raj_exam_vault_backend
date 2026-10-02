const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const MockTest = sequelize.define('MockTest', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Test title is required' }
    }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'unique_mocktest_slug',
      msg: 'Mock test slug must be unique'
    }
  },
  testType: {
    type: DataTypes.ENUM('full_length', 'sectional', 'topic_wise', 'pyq_mock', 'scholarship'),
    defaultValue: 'full_length'
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 180
  },
  totalMarks: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 200.0
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    defaultValue: 150
  },
  negativeMarking: {
    type: DataTypes.FLOAT,
    defaultValue: 0.33
  },
  passingMarks: {
    type: DataTypes.FLOAT,
    defaultValue: 70.0
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('published', 'draft', 'archived'),
    defaultValue: 'published'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'mock_tests',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['examId', 'testType', 'status']
    }
  ]
});

module.exports = MockTest;
