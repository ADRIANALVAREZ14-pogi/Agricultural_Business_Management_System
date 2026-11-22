const db = require('../config/db');
const profitService = require('../services/profitService');

// ==========================================
// 3.1 BABUYAN INVENTORY AND USAGE MATCHING
// ==========================================

// Admin adds stock (feeds in sacks, medicine in bottles, vitamins in bottles)
exports.addBabuyanStock = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { category, item_name, unit, quantity } = req.body;

  if (!['feeds', 'medicine', 'vitamins'].includes(category)) {
    return res.status(400).json({ message: 'Invalid Babuyan category.' });
  }

  try {
    const [existing] = await db.query(
      SELECT id, quantity FROM babuyan_inventory WHERE category = ? AND item_name = ?,
      [category, item_name]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE babuyan_inventory 
         SET quantity = quantity + ?, initial_stock = initial_stock + ?
         WHERE id = ?`,
        [quantity, quantity, existing[0].id]
      );
      return res.status(200).json({ message: 'Babuyan stock updated.' });
    }

    const [result] = await db.query(
      `INSERT INTO babuyan_inventory (category, item_name, unit, initial_stock, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [category, item_name, unit, quantity, quantity]
    );

    res.status(201).json({
      id: result.insertId,
      category,
      item_name,
      unit,
      quantity,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add Babuyan stock.', error: error.message });
  }
};

// Retrieve Babuyan inventory with usage matching & mismatch status
exports.getBabuyanInventoryAndUsage = async (req, res) => {
  try {
    const [inventory] = await db.query(
      `SELECT 
         i.id,
         i.category,
         i.item_name,
         i.unit,
         i.initial_stock,
         i.quantity AS current_quantity,
         COALESCE(SUM(u.quantity_released), 0) AS total_released,
         (i.initial_stock - i.quantity) AS inventory_deducted,
         (COALESCE(SUM(u.quantity_released), 0) != (i.initial_stock - i.quantity)) AS has_mismatch
       FROM babuyan_inventory i
       LEFT JOIN babuyan_usage_records u ON i.id = u.inventory_id
       GROUP BY i.id`
    );

    const [usageRecords] = await db.query(
      `SELECT u.id, u.inventory_id, i.category, i.item_name, i.unit, u.quantity_released, u.release_date
       FROM babuyan_usage_records u
       JOIN babuyan_inventory i ON u.inventory_id = i.id
       ORDER BY u.release_date DESC, u.id DESC`
    );

    res.status(200).json({ inventory, usageRecords });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Babuyan inventory and usage.', error: error.message });
  }
};

// Babuyan staff record released feeds, medicine, and vitamins (deducts from Babuyan inventory)
exports.recordBabuyanUsage = async (req, res) => {
  if (req.user?.role !== 'Babuyan Staff' && req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Access restricted to Babuyan Staff.' });
  }

  const { inventory_id, quantity_released, release_date } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO babuyan_usage_records (inventory_id, quantity_released, release_date)
       VALUES (?, ?, ?)`,
      [inventory_id, quantity_released, release_date]
    );

    await connection.query(
      `UPDATE babuyan_inventory 
       SET quantity = quantity - ? 
       WHERE id = ?`,
      [quantity_released, inventory_id]
    );

    await connection.commit();
    res.status(201).json({
      id: result.insertId,
      inventory_id,
      quantity_released,
      release_date,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to record Babuyan usage.', error: error.message });
  } finally {
    connection.release();
  }
};

// Babuyan staff edit usage records so they match the inventory
exports.editBabuyanUsage = async (req, res) => {
  if (req.user?.role !== 'Babuyan Staff' && req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Access restricted to Babuyan Staff.' });
  }

  const { id } = req.params;
  const { quantity_released, release_date } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      SELECT inventory_id, quantity_released FROM babuyan_usage_records WHERE id = ?,
      [id]
    );

    if (existingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Usage record not found.' });
    }

    const oldQty = Number(existingRows[0].quantity_released);
    const newQty = Number(quantity_released);
    const difference = newQty - oldQty;

    await connection.query(
      `UPDATE babuyan_usage_records 
       SET quantity_released = ?, release_date = ? 
       WHERE id = ?`,
      [newQty, release_date, id]
    );

    await connection.query(
      `UPDATE babuyan_inventory 
       SET quantity = quantity - ? 
       WHERE id = ?`,
      [difference, existingRows[0].inventory_id]
    );

    await connection.commit();
    res.status(200).json({ message: 'Babuyan usage record updated and matched with inventory.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to edit Babuyan usage record.', error: error.message });
  } finally {
    connection.release();
  }
};

// ==========================================
// 3.3 BABUYAN HOG SALES RECORDING (ADMIN)
// ==========================================
exports.recordBabuyanHogSale = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { batch_id, live_weight_kg, price_per_kilo, sale_date } = req.body;

  if (!batch_id || live_weight_kg === undefined || price_per_kilo === undefined || !sale_date) {
    return res.status(400).json({ message: 'Batch, live weight, price per kilo, and sale date are required.' });
  }

  try {
    const totalRevenue = Number(live_weight_kg) * Number(price_per_kilo);

    const [result] = await db.query(
      `INSERT INTO babuyan_hog_sales 
       (department, batch_id, live_weight_kg, price_per_kilo, total_revenue, sale_date)
       VALUES ('Babuyan', ?, ?, ?, ?, ?)`,
      [batch_id, live_weight_kg, price_per_kilo, totalRevenue, sale_date]
    );

    const updatedBatchProfit = await profitService.computeBabuyanBatchProfit(batch_id);

    res.status(201).json({
      id: result.insertId,
      department: 'Babuyan',
      batch_id,
      live_weight_kg: Number(live_weight_kg),
      price_per_kilo: Number(price_per_kilo),
      total_revenue: totalRevenue,
      sale_date,
      batchProfit: updatedBatchProfit,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record Babuyan hog sale.', error: error.message });
  }
};

exports.getBabuyanHogSales = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  try {
    const [batches] = await db.query(
      SELECT batch_id, batch_name FROM pig_batches ORDER BY id DESC
    );

    const [sales] = await db.query(
      `SELECT s.id, s.batch_id, b.batch_name, s.live_weight_kg, s.price_per_kilo, s.total_revenue, s.sale_date
       FROM babuyan_hog_sales s
       LEFT JOIN pig_batches b ON s.batch_id = b.batch_id
       WHERE s.department = 'Babuyan'
       ORDER BY s.sale_date DESC, s.id DESC`
    );

    res.status(200).json({ batches, sales });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Babuyan hog sales records.', error: error.message });
  }
};

// ==========================================
// 3.4 LIVESTOCK AND BATCH RECORDS MANAGEMENT (ADMIN)
// ==========================================

// Helper to compute expected selling date (+4 months from purchase date) and remaining days in cycle
const computeBatchCycleDetails = (purchaseDateStr) => {
  const purchaseDate = new Date(purchaseDateStr);
  const expectedSellingDate = new Date(purchaseDate);
  expectedSellingDate.setMonth(expectedSellingDate.getMonth() + 4);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(expectedSellingDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target - today;
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    expected_selling_date: expectedSellingDate.toISOString().split('T')[0],
    remaining_days: remainingDays,
  };
};

// Admin adds a new pig batch (Add Livestock with purchase date, number of heads, capital cost)
exports.addPigBatch = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { batch_id, batch_name, purchase_date, number_of_heads, capital_cost } = req.body;

  if (!batch_id || !purchase_date || number_of_heads === undefined || capital_cost === undefined) {
    return res.status(400).json({ message: 'Batch ID, purchase date, number of heads, and capital cost are required.' });
  }

  try {
    const { expected_selling_date, remaining_days } = computeBatchCycleDetails(purchase_date);

    const [result] = await db.query(
      `INSERT INTO pig_batches 
       (batch_id, batch_name, purchase_date, number_of_heads, capital_cost, expected_selling_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [batch_id, batch_name || null, purchase_date, number_of_heads, capital_cost, expected_selling_date]
    );

    res.status(201).json({
      id: result.insertId,
      batch_id,
      batch_name: batch_name || null,
      purchase_date,
      number_of_heads: Number(number_of_heads),
      capital_cost: Number(capital_cost),
      expected_selling_date,
      remaining_days,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add pig batch.', error: error.message });
  }
};

// Admin views all pig batches with computed expected selling date and remaining cycle days
exports.getPigBatches = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, batch_id, batch_name, purchase_date, number_of_heads, capital_cost, expected_selling_date
       FROM pig_batches
       ORDER BY purchase_date DESC, id DESC`
    );

    const batches = rows.map((b) => {
      const { expected_selling_date, remaining_days } = computeBatchCycleDetails(b.purchase_date);
      return {
        ...b,
        expected_selling_date: b.expected_selling_date || expected_selling_date,
        remaining_days,
      };
    });

    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve pig batches.', error: error.message });
  }
};

// Admin edits an existing pig batch and recalculates expected selling date & cycle countdown
exports.updatePigBatch = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { id } = req.params;
  const { batch_id, batch_name, purchase_date, number_of_heads, capital_cost } = req.body;

  try {
    const { expected_selling_date, remaining_days } = computeBatchCycleDetails(purchase_date);

    await db.query(
      `UPDATE pig_batches
       SET batch_id = ?, batch_name = ?, purchase_date = ?, number_of_heads = ?, capital_cost = ?, expected_selling_date = ?
       WHERE id = ?`,
      [batch_id, batch_name || null, purchase_date, number_of_heads, capital_cost, expected_selling_date, id]
    );

    res.status(200).json({
      message: 'Pig batch updated.',
      expected_selling_date,
      remaining_days,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update pig batch.', error: error.message });
  }
};