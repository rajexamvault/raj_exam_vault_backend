const express = require('express');
const router = express.Router();
const syllabusController = require('../controllers/syllabusHierarchyController');
const { protect, hasPermission } = require('../middleware/authMiddleware');

// Full Hierarchy
router.get('/tree/:examId', syllabusController.getExamHierarchy);

// Stages
router.get('/stages/:examId', syllabusController.getStages);
router.post('/stages/:examId', protect, hasPermission('syllabus:create'), syllabusController.createStage);
router.put('/stages/:id', protect, hasPermission('syllabus:update'), syllabusController.updateStage);
router.delete('/stages/:id', protect, hasPermission('syllabus:delete'), syllabusController.deleteStage);

// Subjects
router.get('/exam-subjects/:examId', syllabusController.getSubjectsByExam);
router.get('/subjects/:stageId', syllabusController.getSubjects);
router.post('/subjects', protect, hasPermission('syllabus:create'), syllabusController.createSubject);
router.put('/subjects/:id', protect, hasPermission('syllabus:update'), syllabusController.updateSubject);
router.delete('/subjects/:id', protect, hasPermission('syllabus:delete'), syllabusController.deleteSubject);

// Topics
router.get('/topics/:subjectId', syllabusController.getTopics);
router.post('/topics', protect, hasPermission('syllabus:create'), syllabusController.createTopic);
router.put('/topics/:id', protect, hasPermission('syllabus:update'), syllabusController.updateTopic);
router.delete('/topics/:id', protect, hasPermission('syllabus:delete'), syllabusController.deleteTopic);

// Syllabus Items
router.get('/items', syllabusController.getSyllabusItems);
router.post('/items', protect, hasPermission('syllabus:create'), syllabusController.createSyllabusItem);
router.put('/items/:id', protect, hasPermission('syllabus:update'), syllabusController.updateSyllabusItem);
router.delete('/items/:id', protect, hasPermission('syllabus:delete'), syllabusController.deleteSyllabusItem);

// Reordering
router.post('/reorder', protect, hasPermission('syllabus:update'), syllabusController.reorder);

module.exports = router;
