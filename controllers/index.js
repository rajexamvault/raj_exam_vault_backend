const authController = require('./authController');
const userController = require('./userController');
const examController = require('./examController');
const studyMaterialController = require('./studyMaterialController');
const mockTestController = require('./mockTestController');
const questionController = require('./questionController');
const announcementController = require('./announcementController');
const currentAffairController = require('./currentAffairController');
const searchController = require('./searchController');
const vaultController = require('./vaultController');
const superAdminController = require('./superAdminController');
const syllabusHierarchyController = require('./syllabusHierarchyController');

module.exports = {
  authController,
  userController,
  examController,
  studyMaterialController,
  mockTestController,
  questionController,
  announcementController,
  currentAffairController,
  searchController,
  vaultController,
  superAdminController,
  syllabusHierarchyController,
  ...authController,
  ...userController,
  ...examController,
  ...studyMaterialController,
  ...mockTestController,
  ...questionController,
  ...announcementController,
  ...currentAffairController,
  ...searchController,
  ...vaultController,
  ...superAdminController,
  ...syllabusHierarchyController
};
