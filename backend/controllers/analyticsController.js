const analyticsService = require('../services/analyticsService');

exports.getGulayanAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getGulayanAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute Gulayan analytics.', error: error.message });
  }
};