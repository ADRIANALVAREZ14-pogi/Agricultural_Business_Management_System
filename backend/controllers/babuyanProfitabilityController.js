const babuyanProfitabilityService = require('../services/babuyanProfitabilityService');

// ==========================================
// 3.6 LIVESTOCK PRODUCTION COST AND PROFITABILITY (ADMIN ONLY)
// ==========================================
exports.getBabuyanProfitability = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only. Access restricted.' });
  }

  try {
    const profitabilityData = await babuyanProfitabilityService.computeAllBatchesProfitability();
    res.status(200).json(profitabilityData);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to compute livestock production cost and profitability.',
      error: error.message,
    });
  }
};