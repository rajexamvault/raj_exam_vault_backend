const express = require('express');
const router = express.Router();
const mockTestController = require('../controllers/mockTestController');
const { protect, hasPermission } = require('../middleware/authMiddleware');

// Public / Aspirant endpoints
router.get('/', (req, res) => mockTestController.getAllTests(req, res));
router.get('/:id', (req, res) => mockTestController.getTestById(req, res));
router.get('/:id/leaderboard', (req, res) => mockTestController.getLeaderboard(req, res));

// Student Test Engine (Authentication required)
router.post('/:id/start', protect, (req, res) => mockTestController.startTest(req, res));
router.post('/attempts/:attemptId/submit', protect, (req, res) => mockTestController.submitTest(req, res));

// Admin / Question Manager Protected Endpoints
router.post('/', protect, hasPermission('test:create'), (req, res) => mockTestController.createTest(req, res));
router.put('/:id', protect, hasPermission('test:update'), (req, res) => mockTestController.updateTest(req, res));
router.delete('/:id', protect, hasPermission('test:delete'), (req, res) => mockTestController.deleteTest(req, res));
router.post('/:id/add-questions', protect, hasPermission('test:update'), (req, res) => mockTestController.addQuestions(req, res));
router.post('/:id/auto-populate', protect, hasPermission('test:update'), (req, res) => mockTestController.autoPopulateQuestions(req, res));
router.delete('/:id/questions/:questionId', protect, hasPermission('test:update'), (req, res) => mockTestController.removeQuestion(req, res));

module.exports = router;
