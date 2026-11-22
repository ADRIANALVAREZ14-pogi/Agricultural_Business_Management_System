const db = require('../config/db');
const profitService = require('./profitService');

// ==========================================
// 1.8 GULAYAN SALES AND EXPENSE SUMMARIES
// ==========================================
exports.getGulayanSalesAndExpenseSummary = async (month) => {
  const [salesSummary] = await db.query(
    `SELECT 
       DATE_FORMAT(sale_date, '%Y-%m') AS month,
       COALESCE(SUM(kilos), 0) AS total_kilos_sold,
       COALESCE(SUM(total_amount), 0) AS total_sales
     FROM gulayan_sales
     WHERE department = 'Gulayan' AND DATE_FORMAT(sale_date, '%Y-%m') = ?`,
    [month]
  );

  const [expenseByCategory] = await db.query(
    `SELECT 
       category,
       COALESCE(SUM(amount), 0) AS category_total
     FROM expenses
     WHERE department = 'Gulayan' AND DATE_FORMAT(expense_date, '%Y-%m') = ?
     GROUP BY category`,
    [month]
  );

  const totalExpenses = expenseByCategory.reduce(
    (sum, row) => sum + Number(row.category_total),
    0
  );

  return {
    month,
    salesSummary: salesSummary[0],
    expenseByCategory,
    totalExpenses,
  };
};

// ==========================================
// 1.9 GULAYAN MONTHLY REPORT
// ==========================================
exports.getGulayanMonthlyReport = async (month) => {
  const [salesRows] = await db.query(
    `SELECT 
       COALESCE(SUM(total_amount), 0) AS total_sales,
       COALESCE(SUM(kilos * purchase_cost_per_kilo), 0) AS total_cogs
     FROM gulayan_sales
     WHERE department = 'Gulayan' AND DATE_FORMAT(sale_date, '%Y-%m') = ?`,
    [month]
  );

  const [expenseRows] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_expenses
     FROM expenses
     WHERE department = 'Gulayan' AND DATE_FORMAT(expense_date, '%Y-%m') = ?`,
    [month]
  );

  const [stockMovements] = await db.query(
    `SELECT item_name, movement_type, kilos, spoilage_loss, movement_date
     FROM gulayan_stock_movements
     WHERE department = 'Gulayan' AND DATE_FORMAT(movement_date, '%Y-%m') = ?
     ORDER BY movement_date ASC`,
    [month]
  );

  const [spoilageRows] = await db.query(
    `SELECT 
       COALESCE(SUM(kilos), 0) AS total_spoilage_kilos,
       COALESCE(SUM(spoilage_loss), 0) AS total_spoilage_loss
     FROM gulayan_stock_movements
     WHERE department = 'Gulayan' 
       AND movement_type = 'OUT_SPOILAGE'
       AND DATE_FORMAT(movement_date, '%Y-%m') = ?`,
    [month]
  );

  const sales = Number(salesRows[0].total_sales);
  const costOfGoodsSold = Number(salesRows[0].total_cogs);
  const expenses = Number(expenseRows[0].total_expenses);
  const spoilageKilos = Number(spoilageRows[0].total_spoilage_kilos);
  const spoilageLoss = Number(spoilageRows[0].total_spoilage_loss);

  const netProfit = profitService.computeGulayanNetProfit({
    sales,
    costOfGoodsSold,
    expenses,
    spoilageLoss,
  });

  return {
    month,
    sales,
    costOfGoodsSold,
    expenses,
    stockMovements,
    spoilage: {
      total_kilos: spoilageKilos,
      total_loss: spoilageLoss,
    },
    netProfit,
  };
};

// ==========================================
// 2.8 PRUTASAN SALES AND EXPENSE SUMMARIES
// ==========================================
exports.getPrutasanSalesAndExpenseSummary = async (month) => {
  const [salesSummary] = await db.query(
    `SELECT 
       DATE_FORMAT(sale_date, '%Y-%m') AS month,
       COALESCE(SUM(kilos), 0) AS total_kilos_sold,
       COALESCE(SUM(total_amount), 0) AS total_sales
     FROM prutasan_sales
     WHERE department = 'Prutasan' AND DATE_FORMAT(sale_date, '%Y-%m') = ?`,
    [month]
  );

  const [expenseByCategory] = await db.query(
    `SELECT 
       category,
       COALESCE(SUM(amount), 0) AS category_total
     FROM expenses
     WHERE department = 'Prutasan' AND DATE_FORMAT(expense_date, '%Y-%m') = ?
     GROUP BY category`,
    [month]
  );

  const totalExpenses = expenseByCategory.reduce(
    (sum, row) => sum + Number(row.category_total),
    0
  );

  return {
    month,
    salesSummary: salesSummary[0],
    expenseByCategory,
    totalExpenses,
  };
};

// ==========================================
// 2.9 PRUTASAN MONTHLY REPORT
// ==========================================
exports.getPrutasanMonthlyReport = async (month) => {
  const [salesRows] = await db.query(
    `SELECT 
       COALESCE(SUM(total_amount), 0) AS total_sales,
       COALESCE(SUM(kilos * purchase_cost_per_kilo), 0) AS total_cogs
     FROM prutasan_sales
     WHERE department = 'Prutasan' AND DATE_FORMAT(sale_date, '%Y-%m') = ?`,
    [month]
  );

  const [expenseRows] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_expenses
     FROM expenses
     WHERE department = 'Prutasan' AND DATE_FORMAT(expense_date, '%Y-%m') = ?`,
    [month]
  );

  const [stockMovements] = await db.query(
    `SELECT item_name, movement_type, kilos, spoilage_loss, movement_date
     FROM prutasan_stock_movements
     WHERE department = 'Prutasan' AND DATE_FORMAT(movement_date, '%Y-%m') = ?
     ORDER BY movement_date ASC`,
    [month]
  );

  const [spoilageRows] = await db.query(
    `SELECT 
       COALESCE(SUM(kilos), 0) AS total_spoilage_kilos,
       COALESCE(SUM(spoilage_loss), 0) AS total_spoilage_loss
     FROM prutasan_stock_movements
     WHERE department = 'Prutasan' 
       AND movement_type = 'OUT_SPOILAGE'
       AND DATE_FORMAT(movement_date, '%Y-%m') = ?`,
    [month]
  );

  const sales = Number(salesRows[0].total_sales);
  const costOfGoodsSold = Number(salesRows[0].total_cogs);
  const expenses = Number(expenseRows[0].total_expenses);
  const spoilageKilos = Number(spoilageRows[0].total_spoilage_kilos);
  const spoilageLoss = Number(spoilageRows[0].total_spoilage_loss);

  const netProfit = profitService.computePrutasanNetProfit({
    sales,
    costOfGoodsSold,
    expenses,
    spoilageLoss,
  });

  return {
    month,
    sales,
    costOfGoodsSold,
    expenses,
    stockMovements,
    spoilage: {
      total_kilos: spoilageKilos,
      total_loss: spoilageLoss,
    },
    netProfit,
  };
};