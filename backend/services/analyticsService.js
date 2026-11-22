const db = require('../config/db');

exports.getGulayanAnalytics = async () => {
  // 1. Best-selling products
  const [bestSelling] = await db.query(
    `SELECT item_name, SUM(kilos) AS total_kilos, SUM(total_amount) AS total_sales
     FROM gulayan_sales
     WHERE department = 'Gulayan'
     GROUP BY item_name
     ORDER BY total_kilos DESC
     LIMIT 5`
  );

  // 2. Peak sales days
  const [peakSalesDays] = await db.query(
    `SELECT DATE(sale_date) AS sale_day, SUM(total_amount) AS daily_sales
     FROM gulayan_sales
     WHERE department = 'Gulayan'
     GROUP BY DATE(sale_date)
     ORDER BY daily_sales DESC
     LIMIT 5`
  );

  // 3. Underperforming items (lowest sold kilos, including items with 0 sales)
  const [underperforming] = await db.query(
    `SELECT i.item_name, COALESCE(SUM(s.kilos), 0) AS total_kilos
     FROM inventory i
     LEFT JOIN gulayan_sales s 
       ON i.item_name = s.item_name AND s.department = 'Gulayan'
     WHERE i.department = 'Gulayan'
     GROUP BY i.item_name
     ORDER BY total_kilos ASC
     LIMIT 5`
  );

  // 4. Spoilage trends
  const [spoilageTrends] = await db.query(
    `SELECT DATE_FORMAT(movement_date, '%Y-%m') AS month,
            SUM(kilos) AS spoiled_kilos,
            SUM(spoilage_loss) AS spoilage_loss
     FROM gulayan_stock_movements
     WHERE department = 'Gulayan' AND movement_type = 'OUT_SPOILAGE'
     GROUP BY DATE_FORMAT(movement_date, '%Y-%m')
     ORDER BY month ASC`
  );

  // 5. Expense share by category
  const [expenseCategories] = await db.query(
    `SELECT category, SUM(amount) AS total_amount
     FROM expenses
     WHERE department = 'Gulayan'
     GROUP BY category`
  );

  const totalExpense = expenseCategories.reduce(
    (sum, row) => sum + Number(row.total_amount),
    0
  );

  const expenseShare = expenseCategories.map((row) => ({
    category: row.category,
    total_amount: Number(row.total_amount),
    percentage: totalExpense > 0 ? Number(((Number(row.total_amount) / totalExpense) * 100).toFixed(2)) : 0,
  }));

  return {
    bestSelling,
    peakSalesDays,
    underperforming,
    spoilageTrends,
    expenseShare,
  };
};