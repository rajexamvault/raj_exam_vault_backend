const searchService = require('../services/searchService');

/**
 * SearchController - Modern ES6+ Arrow Functions for Universal Platform Search
 */

/**
 * Handle Universal Aggregated Search
 */
const universalSearch = async (req, res) => {
  try {
    const results = await searchService.universalSearch(req.query ?? {});
    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error('Universal search error:', err);
    return res.status(500).json({
      success: false,
      message: 'Search query execution failed',
      error: err?.message ?? 'Internal server error'
    });
  }
};

/**
 * Handle Live Search Auto-Suggestions
 */
const getSuggestions = async (req, res) => {
  try {
    const { q = '', limit = 8 } = req.query ?? {};
    const suggestions = await searchService.getSuggestions(q, limit);
    return res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (err) {
    console.error('Suggestions error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve suggestions',
      error: err?.message ?? 'Internal server error'
    });
  }
};

const SearchController = {
  universalSearch,
  getSuggestions
};

module.exports = SearchController;
module.exports.universalSearch = universalSearch;
module.exports.getSuggestions = getSuggestions;
