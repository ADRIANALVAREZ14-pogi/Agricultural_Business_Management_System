const exportEngineService = require('../services/exportEngineService');

// ==========================================
// 4.5 SHARED REPORTING ENGINE ENDPOINTS
// ==========================================

// Retrieve report data for Gulayan monthly, Prutasan monthly, Babuyan per-batch, or Sales/Expense summaries
exports.getDepartmentReport = async (req, res) => {
  const { department, month } = req.query;

  try {
    const reportData = await exportEngineService.getDepartmentMonthlyAndSummaries({
      department: department || 'Gulayan',
      month: month || null,
    });
    res.status(200).json(reportData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate department report.', error: error.message });
  }
};

// Shared PDF export endpoint used by all report views
exports.exportReportPDF = async (req, res) => {
  try {
    const { department, month, customPayload } = req.body;
    const payload =
      customPayload ||
      (await exportEngineService.getDepartmentMonthlyAndSummaries({
        department: department || 'Gulayan',
        month: month || null,
      }));

    exportEngineService.generateSharedPDF(res, payload);
  } catch (error) {
    res.status(500).json({ message: 'Failed to export PDF report.', error: error.message });
  }
};

// Shared Excel export endpoint used by all report views
exports.exportReportExcel = async (req, res) => {
  try {
    const { department, month, customPayload } = req.body;
    const payload =
      customPayload ||
      (await exportEngineService.getDepartmentMonthlyAndSummaries({
        department: department || 'Gulayan',
        month: month || null,
      }));

    await exportEngineService.generateSharedExcel(res, payload);
  } catch (error) {
    res.status(500).json({ message: 'Failed to export Excel report.', error: error.message });
  }
};