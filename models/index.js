const sequelize = require('../config/dbConfig');
const User = require('./User');
const Otp = require('./Otp');
const Exam = require('./Exam');
const StudyMaterial = require('./StudyMaterial');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const ExamStage = require('./ExamStage');
const Subject = require('./Subject');
const Topic = require('./Topic');
const SyllabusItem = require('./SyllabusItem');

// Role <-> Permission Many-to-Many Association
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions'
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles'
});

// Exam <-> Stage Association
Exam.hasMany(ExamStage, {
  foreignKey: 'examId',
  as: 'stages',
  onDelete: 'CASCADE'
});
ExamStage.belongsTo(Exam, {
  foreignKey: 'examId',
  as: 'exam'
});

// Stage <-> Subject Association
ExamStage.hasMany(Subject, {
  foreignKey: 'stageId',
  as: 'subjects',
  onDelete: 'CASCADE'
});
Subject.belongsTo(ExamStage, {
  foreignKey: 'stageId',
  as: 'stage'
});

// Exam <-> Subject Direct Association
Exam.hasMany(Subject, {
  foreignKey: 'examId',
  as: 'subjects',
  onDelete: 'CASCADE'
});
Subject.belongsTo(Exam, {
  foreignKey: 'examId',
  as: 'exam'
});

// Subject <-> Topic Association
Subject.hasMany(Topic, {
  foreignKey: 'subjectId',
  as: 'topics',
  onDelete: 'CASCADE'
});
Topic.belongsTo(Subject, {
  foreignKey: 'subjectId',
  as: 'subject'
});

// SyllabusItem Associations
Exam.hasMany(SyllabusItem, {
  foreignKey: 'examId',
  as: 'syllabusItems',
  onDelete: 'CASCADE'
});
SyllabusItem.belongsTo(Exam, {
  foreignKey: 'examId',
  as: 'exam'
});

ExamStage.hasMany(SyllabusItem, {
  foreignKey: 'stageId',
  as: 'syllabusItems',
  onDelete: 'CASCADE'
});
SyllabusItem.belongsTo(ExamStage, {
  foreignKey: 'stageId',
  as: 'stage'
});

Subject.hasMany(SyllabusItem, {
  foreignKey: 'subjectId',
  as: 'syllabusItems',
  onDelete: 'CASCADE'
});
SyllabusItem.belongsTo(Subject, {
  foreignKey: 'subjectId',
  as: 'subject'
});

Topic.hasMany(SyllabusItem, {
  foreignKey: 'topicId',
  as: 'syllabusItems',
  onDelete: 'SET NULL'
});
SyllabusItem.belongsTo(Topic, {
  foreignKey: 'topicId',
  as: 'topic'
});

// Exam <-> StudyMaterial Association
Exam.hasMany(StudyMaterial, {
  foreignKey: 'examId',
  as: 'materials',
  onDelete: 'CASCADE'
});
StudyMaterial.belongsTo(Exam, {
  foreignKey: 'examId',
  as: 'exam'
});

ExamStage.hasMany(StudyMaterial, {
  foreignKey: 'stageId',
  as: 'materials',
  onDelete: 'SET NULL'
});
StudyMaterial.belongsTo(ExamStage, {
  foreignKey: 'stageId',
  as: 'stage'
});

Subject.hasMany(StudyMaterial, {
  foreignKey: 'subjectId',
  as: 'materials',
  onDelete: 'SET NULL'
});
StudyMaterial.belongsTo(Subject, {
  foreignKey: 'subjectId',
  as: 'subjectRef'
});

Topic.hasMany(StudyMaterial, {
  foreignKey: 'topicId',
  as: 'materials',
  onDelete: 'SET NULL'
});
StudyMaterial.belongsTo(Topic, {
  foreignKey: 'topicId',
  as: 'topic'
});

const Question = require('./Question');

// Question Associations
Exam.hasMany(Question, {
  foreignKey: 'examId',
  as: 'questions',
  onDelete: 'CASCADE'
});
Question.belongsTo(Exam, {
  foreignKey: 'examId',
  as: 'exam'
});

ExamStage.hasMany(Question, {
  foreignKey: 'stageId',
  as: 'questions',
  onDelete: 'SET NULL'
});
Question.belongsTo(ExamStage, {
  foreignKey: 'stageId',
  as: 'stage'
});

Subject.hasMany(Question, {
  foreignKey: 'subjectId',
  as: 'questions',
  onDelete: 'SET NULL'
});
Question.belongsTo(Subject, {
  foreignKey: 'subjectId',
  as: 'subjectRef'
});

Topic.hasMany(Question, {
  foreignKey: 'topicId',
  as: 'questions',
  onDelete: 'SET NULL'
});
Question.belongsTo(Topic, {
  foreignKey: 'topicId',
  as: 'topic'
});

User.hasMany(Question, {
  foreignKey: 'createdBy',
  as: 'createdQuestions'
});
Question.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'author'
});

const MockTest = require('./MockTest');
const TestQuestion = require('./TestQuestion');
const TestAttempt = require('./TestAttempt');

// MockTest Associations
Exam.hasMany(MockTest, {
  foreignKey: 'examId',
  as: 'mockTests',
  onDelete: 'CASCADE'
});
MockTest.belongsTo(Exam, {
  foreignKey: 'examId',
  as: 'exam'
});

ExamStage.hasMany(MockTest, {
  foreignKey: 'stageId',
  as: 'mockTests',
  onDelete: 'SET NULL'
});
MockTest.belongsTo(ExamStage, {
  foreignKey: 'stageId',
  as: 'stage'
});

Subject.hasMany(MockTest, {
  foreignKey: 'subjectId',
  as: 'mockTests',
  onDelete: 'SET NULL'
});
MockTest.belongsTo(Subject, {
  foreignKey: 'subjectId',
  as: 'subjectRef'
});

Topic.hasMany(MockTest, {
  foreignKey: 'topicId',
  as: 'mockTests',
  onDelete: 'SET NULL'
});
MockTest.belongsTo(Topic, {
  foreignKey: 'topicId',
  as: 'topic'
});

// MockTest <-> Question Many-to-Many via TestQuestion
MockTest.belongsToMany(Question, {
  through: TestQuestion,
  foreignKey: 'mockTestId',
  otherKey: 'questionId',
  as: 'questions'
});
Question.belongsToMany(MockTest, {
  through: TestQuestion,
  foreignKey: 'questionId',
  otherKey: 'mockTestId',
  as: 'mockTests'
});

MockTest.hasMany(TestQuestion, {
  foreignKey: 'mockTestId',
  as: 'testQuestions',
  onDelete: 'CASCADE'
});
TestQuestion.belongsTo(MockTest, {
  foreignKey: 'mockTestId',
  as: 'mockTest'
});

Question.hasMany(TestQuestion, {
  foreignKey: 'questionId',
  as: 'testQuestions',
  onDelete: 'CASCADE'
});
TestQuestion.belongsTo(Question, {
  foreignKey: 'questionId',
  as: 'question'
});

// MockTest <-> TestAttempt
MockTest.hasMany(TestAttempt, {
  foreignKey: 'mockTestId',
  as: 'attempts',
  onDelete: 'CASCADE'
});
TestAttempt.belongsTo(MockTest, {
  foreignKey: 'mockTestId',
  as: 'mockTest'
});

User.hasMany(TestAttempt, {
  foreignKey: 'userId',
  as: 'testAttempts',
  onDelete: 'CASCADE'
});
TestAttempt.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

const CurrentAffair = require('./CurrentAffair');
const Announcement = require('./Announcement');

// CurrentAffair Associations
User.hasMany(CurrentAffair, {
  foreignKey: 'publishedBy',
  as: 'currentAffairs'
});
CurrentAffair.belongsTo(User, {
  foreignKey: 'publishedBy',
  as: 'author'
});

// Announcement Associations
Exam.hasMany(Announcement, {
  foreignKey: 'examId',
  as: 'announcements',
  onDelete: 'SET NULL'
});
Announcement.belongsTo(Exam, {
  foreignKey: 'examId',
  as: 'exam'
});

User.hasMany(Announcement, {
  foreignKey: 'publishedBy',
  as: 'announcements'
});
Announcement.belongsTo(User, {
  foreignKey: 'publishedBy',
  as: 'author'
});

// User associations
User.hasMany(Exam, {
  foreignKey: 'createdBy',
  as: 'createdExams'
});
Exam.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

User.hasMany(StudyMaterial, {
  foreignKey: 'uploadedBy',
  as: 'uploadedMaterials'
});
StudyMaterial.belongsTo(User, {
  foreignKey: 'uploadedBy',
  as: 'uploader'
});

const Bookmark = require('./Bookmark');

// Bookmark Associations
User.hasMany(Bookmark, {
  foreignKey: 'userId',
  as: 'bookmarks',
  onDelete: 'CASCADE'
});
Bookmark.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  sequelize,
  User,
  Otp,
  Exam,
  ExamStage,
  Subject,
  Topic,
  SyllabusItem,
  StudyMaterial,
  Question,
  MockTest,
  TestQuestion,
  TestAttempt,
  CurrentAffair,
  Announcement,
  Role,
  Permission,
  RolePermission,
  Bookmark
};
