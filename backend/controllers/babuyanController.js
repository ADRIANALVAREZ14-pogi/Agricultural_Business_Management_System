const db = require('../config/db');

// ==========================================
// 3.1 BABUYAN INVENTORY AND USAGE MATCHING
// ==========================================

// Admin adds stock (feeds in sacks, medicine in bottles, vitamins in bottles)
exports.addBabuyanStock = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { category, item_name, unit, quantity } = req.body;
  // category: 'feeds' | 'medicine' | 'vitamins'
  // unit: 'sacks' | 'bottles'

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

    // Match deduction from Babuyan inventory
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

    // Adjust inventory deduction so usage record matches inventory
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