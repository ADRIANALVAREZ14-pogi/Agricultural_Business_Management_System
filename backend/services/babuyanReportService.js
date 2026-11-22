const db = require('../config/db');

// ==========================================
// 3.7 BABUYAN PER-BATCH REPORTS
// ==========================================
exports.getBabuyanPerBatchReports = async (batchId = null) => {
  let batchQuery = `
    SELECT id, batch_id, batch_name, purchase_date, number_of_heads, capital_cost, expected_selling_date
    FROM pig_batches
  `;
  const params = [];

  if (batchId) {
    batchQuery +=  WHERE batch_id = ?;
    params.push(batchId);
  }

  batchQuery +=  ORDER BY purchase_date DESC, id DESC;

  const [batches] = await db.query(batchQuery, params);
  const reports = [];

  for (const batch of batches) {
    const bId = batch.batch_id;
    const capitalCost = Number(batch.capital_cost || 0);

    // 1. Per-batch expense summary by category (feed, veterinary care/medicine, labor, utilities)
    const [expenseCategories] = await db.query(
      `SELECT category, COALESCE(SUM(amount), 0) AS category_total
       FROM expenses
       WHERE department = 'Babuyan' AND batch_id = ?
       GROUP BY category`,
      [bId]
    );

    const feedCost = Number(
      expenseCategories.find((e) => e.category === 'feed')?.category_total || 0
    );
    const medicineCost = Number(
      expenseCategories.find((e) => e.category === 'veterinary care')?.category_total || 0
    );
    const otherExpenses = expenseCategories
      .filter((e) => !['feed', 'veterinary care'].includes(e.category))
      .reduce((sum, e) => sum + Number(e.category_total), 0);

    const totalExpenses = feedCost + medicineCost + otherExpenses;
    const totalBatchCost = capitalCost + totalExpenses;

    // 2. Per-batch hog sales summary (live weight sold & income)
    const [salesRecords] = await db.query(
      `SELECT id, live_weight_kg, price_per_kilo, total_revenue, sale_date
       FROM babuyan_hog_sales
       WHERE department = 'Babuyan' AND batch_id = ?
       ORDER BY sale_date DESC, id DESC`,
      [bId]
    );

    const totalLiveWeightSold = salesRecords.reduce(
      (sum, s) => sum + Number(s.live_weight_kg),
      0
    );
    const totalIncome = salesRecords.reduce(
      (sum, s) => sum + Number(s.total_revenue),
      0
    );

    // Net profit = income - (capital + feed + medicine + other expenses)
    const netProfit = totalIncome - totalBatchCost;

    // 3. Health (weight & vaccination) and mortality data per batch
    const [vaccinations] = await db.query(
      `SELECT id, vaccine_name, dosage, vaccination_date, administered_by
       FROM babuyan_vaccination_records
       WHERE batch_id = ?
       ORDER BY vaccination_date DESC`,
      [bId]
    );

    const [weights] = await db.query(
      `SELECT id, average_weight_kg, record_date, notes
       FROM babuyan_weight_records
       WHERE batch_id = ?
       ORDER BY record_date DESC`,
      [bId]
    );

    const [mortalities] = await db.query(
      `SELECT id, heads_lost, cause_of_death, mortality_date
       FROM babuyan_mortality_records
       WHERE batch_id = ?
       ORDER BY mortality_date DESC`,
      [bId]
    );

    const totalMortalityHeads = mortalities.reduce(
      (sum, m) => sum + Number(m.heads_lost),
      0
    );

    reports.push({
      batch_id: bId,
      batch_name: batch.batch_name || '-',
      purchase_date: batch.purchase_date,
      expected_selling_date: batch.expected_selling_date,
      active_heads: Number(batch.number_of_heads),
      financial_summary: {
        capital: capitalCost,
        feed: feedCost,
        medicine: medicineCost,
        other_expenses: otherExpenses,
        total_expenses: totalExpenses,
        total_cost: totalBatchCost,
        live_weight_sold_kg: totalLiveWeightSold,
        income: totalIncome,
        net_profit: netProfit,
      },
      sales_summary: {
        records: salesRecords,
        total_live_weight_kg: totalLiveWeightSold,
        total_income: totalIncome,
      },
      expense_summary: {
        by_category: expenseCategories,
        total_expenses: totalExpenses,
      },
      health_and_mortality: {
        vaccinations,
        weights,
        mortalities,
        total_mortality_heads: totalMortalityHeads,
      },
    });
  }

  return reports;
};