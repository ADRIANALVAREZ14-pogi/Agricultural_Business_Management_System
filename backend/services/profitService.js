const db = require('../config/db');

// ==========================================
// 1.9 GULAYAN NET PROFIT COMPUTATION
// ==========================================
exports.computeGulayanNetProfit = ({ sales, costOfGoodsSold, expenses, spoilageLoss }) => {
  return Number(sales) - Number(costOfGoodsSold) - Number(expenses) - Number(spoilageLoss);
};

// ==========================================
// 2.9 PRUTASAN NET PROFIT COMPUTATION
// ==========================================
exports.computePrutasanNetProfit = ({ sales, costOfGoodsSold, expenses, spoilageLoss }) => {
  return Number(sales) - Number(costOfGoodsSold) - Number(expenses) - Number(spoilageLoss);
};

// ==========================================
// 3.3 BABUYAN BATCH INCOME & PROFIT COMPUTATION
// ==========================================
exports.getBabuyanBatchIncome = async (batchId) => {
  const [rows] = await db.query(
    `SELECT COALESCE(SUM(total_revenue), 0) AS total_income
     FROM babuyan_hog_sales
     WHERE batch_id = ?`,
    [batchId]
  );
  return Number(rows[0].total_income);
};

exports.computeBabuyanBatchProfit = async (batchId) => {
  const totalIncome = await exports.getBabuyanBatchIncome(batchId);

  const [expenseRows] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_expenses
     FROM expenses
     WHERE department = 'Babuyan' AND batch_id = ?`,
    [batchId]
  );
  const totalExpenses = Number(expenseRows[0].total_expenses);

  return {
    batch_id: batchId,
    total_income: totalIncome,
    total_expenses: totalExpenses,
    net_profit: totalIncome - totalExpenses,
  };
};