const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { protect, hasPermission } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', questionController.getQuestions);
router.get('/stats', questionController.getStats);
router.get('/random-sample', questionController.getRandomSample);
router.get('/:id', questionController.getQuestionById);

// Protected Granular RBAC Endpoints
router.post('/', protect, hasPermission('question:create'), (req, res) => questionController.createQuestion(req, res));
router.post('/bulk-import', protect, hasPermission('question:create'), (req, res) => questionController.bulkImport(req, res));
router.post('/bulk-delete', protect, hasPermission('question:delete'), (req, res) => questionController.bulkDeleteQuestions(req, res));
router.put('/:id', protect, hasPermission('question:update'), (req, res) => questionController.updateQuestion(req, res));
router.delete('/:id', protect, hasPermission('question:delete'), (req, res) => questionController.deleteQuestion(req, res));

module.exports = router;
