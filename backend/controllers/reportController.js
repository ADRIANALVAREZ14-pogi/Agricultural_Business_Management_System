const reportService = require('../services/reportService');

// 1.8 Gulayan Sales and Expense Summaries
exports.getGulayanSummaryReport = async (req, res) => {
  const { month } = req.query;

  try {
    const summary = await reportService.getGulayanSalesAndExpenseSummary(month);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Gulayan summary.', error: error.message });
  }
};

// 1.9 Gulayan Monthly Report
exports.getGulayanMonthlyReport = async (req, res) => {
  const { month } = req.query;

  try {
    const report = await reportService.getGulayanMonthlyReport(month);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Failed to prepare Gulayan monthly report.', error: error.message });
  }
};

// 2.8 Prutasan Sales and Expense Summaries
exports.getPrutasanSummaryReport = async (req, res) => {
  const { month } = req.query;

  try {
    const summary = await reportService.getPrutasanSalesAndExpenseSummary(month);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Prutasan summary.', error: error.message });
  }
};

// 2.9 Prutasan Monthly Report
exports.getPrutasanMonthlyReport = async (req, res) => {
  const { month } = req.query;

  try {
    const report = await reportService.getPrutasanMonthlyReport(month);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Failed to prepare Prutasan monthly report.', error: error.message });
  }
};