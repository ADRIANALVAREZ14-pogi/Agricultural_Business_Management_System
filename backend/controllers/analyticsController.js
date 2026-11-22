const analyticsService = require('../services/analyticsService');

// 1.10 Gulayan Analytics
exports.getGulayanAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getGulayanAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute Gulayan analytics.', error: error.message });
  }
};

// 2.10 Prutasan Analytics
exports.getPrutasanAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getPrutasanAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute Prutasan analytics.', error: error.message });
  }
};

// 3.8 Babuyan Analytics
exports.getBabuyanAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getBabuyanAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute Babuyan analytics.', error: error.message });
  }
};