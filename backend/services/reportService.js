const db = require('../config/db');

exports.getGulayanSalesAndExpenseSummary = async (month) => {
  // month format: 'YYYY-MM'
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