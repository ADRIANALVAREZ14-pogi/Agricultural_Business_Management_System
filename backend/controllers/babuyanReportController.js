const babuyanReportService = require('../services/babuyanReportService');

// ==========================================
// 3.7 BABUYAN PER-BATCH REPORTS
// ==========================================
exports.getBabuyanBatchReports = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { batch_id } = req.query;

  try {
    const reports = await babuyanReportService.getBabuyanPerBatchReports(batch_id || null);
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to generate Babuyan per-batch reports.',
      error: error.message,
    });
  }
};