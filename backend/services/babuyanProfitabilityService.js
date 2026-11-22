const db = require('../config/db');

// ==========================================
// 3.6 LIVESTOCK PRODUCTION COST AND PROFITABILITY (ADMIN ONLY)
// ==========================================
exports.computeAllBatchesProfitability = async () => {
  const [batches] = await db.query(
    `SELECT batch_id, batch_name, purchase_date, number_of_heads, capital_cost
     FROM pig_batches
     ORDER BY purchase_date DESC, id DESC`
  );

  const results = [];

  for (const batch of batches) {
    const batchId = batch.batch_id;
    const capitalCost = Number(batch.capital_cost || 0);

    // 1. Categorized expenses per batch: feed, medicine (veterinary care), and other expenses (labor, utilities)
    const [expenseRows] = await db.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN category = 'feed' THEN amount ELSE 0 END), 0) AS feed_cost,
         COALESCE(SUM(CASE WHEN category = 'veterinary care' THEN amount ELSE 0 END), 0) AS medicine_cost,
         COALESCE(SUM(CASE WHEN category NOT IN ('feed', 'veterinary care') THEN amount ELSE 0 END), 0) AS other_expenses
       FROM expenses
       WHERE department = 'Babuyan' AND batch_id = ?`,
      [batchId]
    );

    const feedCost = Number(expenseRows[0].feed_cost);
    const medicineCost = Number(expenseRows[0].medicine_cost);
    const otherExpenses = Number(expenseRows[0].other_expenses);

    // Cumulative raising cost = capital + feed + medicine + other expenses
    const cumulativeRaisingCost = capitalCost + feedCost + medicineCost + otherExpenses;

    // 2. Income and total live weight sold (kg) per batch
    const [salesRows] = await db.query(
      `SELECT 
         COALESCE(SUM(live_weight_kg), 0) AS total_live_weight_kg,
         COALESCE(SUM(total_revenue), 0) AS total_income
       FROM babuyan_hog_sales
       WHERE department = 'Babuyan' AND batch_id = ?`,
      [batchId]
    );

    const totalLiveWeightKg = Number(salesRows[0].total_live_weight_kg);
    const totalIncome = Number(salesRows[0].total_income);

    // Fallback to latest recorded average weight * active heads if no hog sales yet
    let referenceWeightKg = totalLiveWeightKg;
    if (referenceWeightKg === 0) {
      const [latestWeight] = await db.query(
        `SELECT average_weight_kg
         FROM babuyan_weight_records
         WHERE batch_id = ?
         ORDER BY record_date DESC, id DESC
         LIMIT 1`,
        [batchId]
      );
      if (latestWeight.length > 0) {
        referenceWeightKg = Number(latestWeight[0].average_weight_kg) * Number(batch.number_of_heads || 0);
      }
    }

    // Cost per kilo of live weight
    const costPerKiloLiveWeight =
      referenceWeightKg > 0 ? Number((cumulativeRaisingCost / referenceWeightKg).toFixed(2)) : 0;

    // Net profit per batch = income - cumulative raising cost
    const netProfit = totalIncome - cumulativeRaisingCost;

    results.push({
      batch_id: batchId,
      batch_name: batch.batch_name || '-',
      purchase_date: batch.purchase_date,
      number_of_heads: Number(batch.number_of_heads),
      cost_breakdown: {
        capital: capitalCost,
        feed: feedCost,
        medicine: medicineCost,
        other_expenses: otherExpenses,
        cumulative_raising_cost: cumulativeRaisingCost,
      },
      total_live_weight_kg: totalLiveWeightKg,
      cost_per_kilo_live_weight: costPerKiloLiveWeight,
      total_income: totalIncome,
      net_profit: netProfit,
    });
  }

  return results;
};