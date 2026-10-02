const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Question = sequelize.define('Question', {
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
  topicId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Topics',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  questionType: {
    type: DataTypes.ENUM(
      'single_choice',
      'multiple_choice',
      'assertion_reason',
      'match_following',
      'true_false',
      'numerical'
    ),
    defaultValue: 'single_choice'
  },
  questionHindi: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  questionEnglish: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
    // Expected format: [ { id: 'A', textHindi: '...', textEnglish: '...', isCorrect: true } ]
  },
  correctAnswer: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Identifier of correct option(s) e.g., "A" or "A,C"'
  },
  explanationHindi: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  explanationEnglish: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  difficultyLevel: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium'
  },
  marks: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0
  },
  negativeMarks: {
    type: DataTypes.FLOAT,
    defaultValue: 0.33
  },
  isPreviousYear: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pyqYear: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pyqExamName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('active', 'review', 'draft', 'archived'),
    defaultValue: 'active'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'questions',
  timestamps: true,
  indexes: [
    {
      fields: ['examId', 'difficultyLevel', 'status']
    },
    {
      fields: ['stageId', 'subjectId', 'topicId']
    },
    {
      fields: ['isPreviousYear', 'pyqYear']
    }
  ]
});

module.exports = Question;
