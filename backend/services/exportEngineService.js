const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const db = require('../config/db');
const babuyanReportService = require('./babuyanReportService');

// ==========================================
// 4.5 SHARED REPORTING DATA AGGREGATOR
// ==========================================
exports.getDepartmentMonthlyAndSummaries = async ({ department, month }) => {
  if (department === 'Gulayan' || department === 'Prutasan') {
    const salesTable = department === 'Gulayan' ? 'gulayan_sales' : 'prutasan_sales';
    const itemCol = department === 'Gulayan' ? 'item_name' : 'fruit';
    const moveTable =
      department === 'Gulayan' ? 'gulayan_stock_movements' : 'prutasan_stock_movements';

    const dateFilter = month ? AND DATE_FORMAT(sale_date, '%Y-%m') = ? : '';
    const moveDateFilter = month ? AND DATE_FORMAT(movement_date, '%Y-%m') = ? : '';
    const expDateFilter = month ? AND DATE_FORMAT(expense_date, '%Y-%m') = ? : '';
    const params = month ? [month] : [];

    // Sales Summary
    const [salesRows] = await db.query(
      `SELECT id, ${itemCol} AS item_name, kilos, price_per_kilo, total_amount, sale_date
       FROM ${salesTable}
       WHERE department = ? ${dateFilter}
       ORDER BY sale_date DESC, id DESC`,
      [department, ...params]
    );

    const totalSales = salesRows.reduce((sum, r) => sum + Number(r.total_amount), 0);
    const totalKilosSold = salesRows.reduce((sum, r) => sum + Number(r.kilos), 0);

    // Spoilage / Stock Movement Summary
    const [spoilageRows] = await db.query(
      `SELECT COALESCE(SUM(spoilage_loss), 0) AS total_spoilage_loss
       FROM ${moveTable}
       WHERE department = ? AND movement_type = 'OUT_SPOILAGE' ${moveDateFilter}`,
      [department, ...params]
    );
    const totalSpoilageLoss = Number(spoilageRows[0].total_spoilage_loss);

    // Expense Summary by Category
    const [expenseRows] = await db.query(
      `SELECT id, category, amount, description, expense_date
       FROM expenses
       WHERE department = ? ${expDateFilter}
       ORDER BY expense_date DESC, id DESC`,
      [department, ...params]
    );

    const totalExpenses = expenseRows.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalSales - totalExpenses - totalSpoilageLoss;

    return {
      reportTitle: ${department} Monthly Report & Sales/Expense Summary,
      period: month || 'All Periods',
      summaryMetrics: {
        total_kilos_sold: totalKilosSold,
        total_sales: totalSales,
        total_expenses: totalExpenses,
        spoilage_loss: totalSpoilageLoss,
        net_profit: netProfit,
      },
      salesRecords: salesRows,
      expenseRecords: expenseRows,
    };
  }

  // Babuyan Per-Batch Report + Sales & Expense Summaries
  const batchReports = await babuyanReportService.getBabuyanPerBatchReports();
  const totalSales = batchReports.reduce((sum, b) => sum + b.financial_summary.income, 0);
  const totalExpenses = batchReports.reduce((sum, b) => sum + b.financial_summary.total_expenses, 0);
  const totalNetProfit = batchReports.reduce((sum, b) => sum + b.financial_summary.net_profit, 0);

  return {
    reportTitle: 'Babuyan Per-Batch Report & Sales/Expense Summary',
    period: month || 'All Batches',
    summaryMetrics: {
      total_sales: totalSales,
      total_expenses: totalExpenses,
      net_profit: totalNetProfit,
    },
    batchReports,
  };
};

// ==========================================
// 4.5 SHARED PDF GENERATION ENGINE
// ==========================================
exports.generateSharedPDF = (res, reportPayload) => {
  const { reportTitle, period, summaryMetrics, salesRecords, expenseRecords, batchReports } =
    reportPayload;

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    attachment; filename="${reportTitle.replace(/\s+/g, '_')}.pdf"
  );
  doc.pipe(res);

  // Header & Print Layout
  doc.fontSize(16).font('Helvetica-Bold').text(reportTitle, { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(Period / Scope: ${period}, { align: 'center' });
  doc.text(Generated On: ${new Date().toLocaleString()}, { align: 'center' });
  doc.moveDown(1.5);

  // Summary Block
  doc.fontSize(12).font('Helvetica-Bold').text('Executive Summary');
  doc.fontSize(10).font('Helvetica');
  Object.entries(summaryMetrics || {}).forEach(([key, val]) => {
    const label = key.replace(/_/g, ' ').toUpperCase();
    doc.text(${label}: ${Number(val).toFixed(2)});
  });
  doc.moveDown(1);

  // Gulayan / Prutasan Tables
  if (salesRecords) {
    doc.fontSize(12).font('Helvetica-Bold').text('Sales Summary');
    doc.fontSize(9).font('Helvetica');
    salesRecords.forEach((s) => {
      doc.text(
        `${s.sale_date} | ${s.item_name} | ${s.kilos} kg @ ${s.price_per_kilo} = ${Number(
          s.total_amount
        ).toFixed(2)}`
      );
    });
    doc.moveDown(1);
  }

  if (expenseRecords) {
    doc.fontSize(12).font('Helvetica-Bold').text('Expense Summary');
    doc.fontSize(9).font('Helvetica');
    expenseRecords.forEach((e) => {
      doc.text(
        `${e.expense_date} | [${e.category}] ${e.description || '-'} : ${Number(e.amount).toFixed(
          2
        )}`
      );
    });
    doc.moveDown(1);
  }

  // Babuyan Per-Batch Tables
  if (batchReports) {
    doc.fontSize(12).font('Helvetica-Bold').text('Babuyan Per-Batch Breakdown');
    doc.fontSize(9).font('Helvetica');
    batchReports.forEach((b) => {
      doc.font('Helvetica-Bold').text(Batch: ${b.batch_id} (${b.batch_name}));
      doc.font('Helvetica').text(
        `Capital: ${b.financial_summary.capital.toFixed(2)} | Feed: ${b.financial_summary.feed.toFixed(
          2
        )} | Medicine: ${b.financial_summary.medicine.toFixed(
          2
        )} | Other Expenses: ${b.financial_summary.other_expenses.toFixed(2)}`
      );
      doc.text(
        `Live Weight Sold: ${b.financial_summary.live_weight_sold_kg} kg | Income: ${b.financial_summary.income.toFixed(
          2
        )} | Net Profit: ${b.financial_summary.net_profit.toFixed(2)}`
      );
      doc.moveDown(0.5);
    });
  }

  doc.end();
};

// ==========================================
// 4.5 SHARED EXCEL GENERATION ENGINE
// ==========================================
exports.generateSharedExcel = async (res, reportPayload) => {
  const { reportTitle, period, summaryMetrics, salesRecords, expenseRecords, batchReports } =
    reportPayload;

  const workbook = new ExcelJS.Workbook();
  const summarySheet = workbook.addWorksheet('Summary');

  summarySheet.addRow([reportTitle]);
  summarySheet.addRow(['Period / Scope', period]);
  summarySheet.addRow(['Generated On', new Date().toLocaleString()]);
  summarySheet.addRow([]);
  summarySheet.addRow(['Metric', 'Value']);

  Object.entries(summaryMetrics || {}).forEach(([key, val]) => {
    summarySheet.addRow([key.replace(/_/g, ' ').toUpperCase(), Number(val)]);
  });

  if (salesRecords) {
    const salesSheet = workbook.addWorksheet('Sales Summary');
    salesSheet.addRow(['Date', 'Item', 'Kilos', 'Price / kg', 'Total Amount']);
    salesRecords.forEach((s) => {
      salesSheet.addRow([
        s.sale_date,
        s.item_name,
        Number(s.kilos),
        Number(s.price_per_kilo),
        Number(s.total_amount),
      ]);
    });
  }

  if (expenseRecords) {
    const expSheet = workbook.addWorksheet('Expense Summary');
    expSheet.addRow(['Date', 'Category', 'Description', 'Amount']);
    expenseRecords.forEach((e) => {
      expSheet.addRow([e.expense_date, e.category, e.description || '-', Number(e.amount)]);
    });
  }

  if (batchReports) {
    const batchSheet = workbook.addWorksheet('Babuyan Per-Batch');
    batchSheet.addRow([
      'Batch ID',
      'Batch Name',
      'Capital',
      'Feed',
      'Medicine',
      'Other Expenses',
      'Total Expenses',
      'Live Weight Sold (kg)',
      'Income',
      'Net Profit',
    ]);
    batchReports.forEach((b) => {
      batchSheet.addRow([
        b.batch_id,
        b.batch_name,
        b.financial_summary.capital,
        b.financial_summary.feed,
        b.financial_summary.medicine,
        b.financial_summary.other_expenses,
        b.financial_summary.total_expenses,
        b.financial_summary.live_weight_sold_kg,
        b.financial_summary.income,
        b.financial_summary.net_profit,
      ]);
    });
  }

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    attachment; filename="${reportTitle.replace(/\s+/g, '_')}.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
};