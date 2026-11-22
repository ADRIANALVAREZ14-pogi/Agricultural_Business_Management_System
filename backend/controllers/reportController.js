const reportService = require('../services/reportService');

exports.getGulayanSummaryReport = async (req, res) => {
  const { month } = req.query;

  try {
    const summary = await reportService.getGulayanSalesAndExpenseSummary(month);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Gulayan summary.', error: error.message });
  }
};