const db = require('../config/db');
const profitService = require('./profitService');

exports.getGulayanMonthlyReport = async (month) => {
  // month format: 'YYYY-MM'
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