const searchService = require('../services/searchService');

class SearchController {
  /**
   * Handle Universal Aggregated Search
   */
  async universalSearch(req, res) {
    try {
      const results = await searchService.universalSearch(req.query);
      return res.status(200).json({
        success: true,
        data: results
      });
    } catch (err) {
      console.error('Universal search error:', err);
      return res.status(500).json({
        success: false,
        message: 'Search query execution failed',
        error: err.message
      });
    }
  }

  /**
   * Handle Live Search Auto-Suggestions
   */
  async getSuggestions(req, res) {
    try {
      const { q = '', limit = 8 } = req.query;
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
        error: err.message
      });
    }
  }
}

module.exports = new SearchController();
