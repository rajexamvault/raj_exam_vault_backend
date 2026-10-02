const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Universal Aggregated Search endpoint
router.get('/', (req, res) => searchController.universalSearch(req, res));

// Auto-suggestions endpoint
router.get('/suggest', (req, res) => searchController.getSuggestions(req, res));

module.exports = router;
