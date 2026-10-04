const express = require('express');
const router = express.Router();
const ExamController = require('../controllers/examController');
const { protect, hasPermission } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', ExamController.getAllExams);
router.get('/:examId/subjects', ExamController.getExamSubjects);
router.get('/:idOrSlug', ExamController.getExamByIdOrSlug);

// Protected Granular RBAC endpoints
router.post('/', protect, hasPermission('exam:create'), ExamController.createExam);
router.post('/:examId/subjects', protect, hasPermission('exam:update'), ExamController.addExamSubject);
router.put('/:id', protect, hasPermission('exam:update'), ExamController.updateExam);
router.delete('/:id', protect, hasPermission('exam:delete'), ExamController.deleteExam);

module.exports = router;
