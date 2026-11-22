const db = require('../config/db');

// ==========================================
// 1.3 & 2.3 INVENTORY MANAGEMENT (GULAYAN & PRUTASAN)
// ==========================================
exports.addStock = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { department, item_name, kilos, purchase_cost_per_kilo } = req.body;

  if (department !== 'Gulayan' && department !== 'Prutasan') {
    return res.status(400).json({ message: 'Invalid department.' });
  }

  const [result] = await db.query(
    `INSERT INTO inventory (department, item_name, kilos, purchase_cost_per_kilo)
     VALUES (?, ?, ?, ?)`,
    [department, item_name, kilos, purchase_cost_per_kilo]
  );

  res.status(201).json({
    id: result.insertId,
    department,
    item_name,
    kilos,
    purchase_cost_per_kilo,
  });
};

exports.getStock = async (req, res) => {
  const { department } = req.params;

  const [records] = await db.query(
    `SELECT id, department, item_name, kilos, purchase_cost_per_kilo
     FROM inventory
     WHERE department = ?`,
    [department]
  );

  res.status(200).json(records);
};

exports.updateStock = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { id } = req.params;
  const { item_name, kilos, purchase_cost_per_kilo } = req.body;

  await db.query(
    `UPDATE inventory
     SET item_name = ?, kilos = ?, purchase_cost_per_kilo = ?
     WHERE id = ?`,
    [item_name, kilos, purchase_cost_per_kilo, id]
  );

  res.status(200).json({ message: 'Updated.' });
};

exports.deleteStock = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { id } = req.params;

  await db.query(`DELETE FROM inventory WHERE id = ?`, [id]);

  res.status(200).json({ message: 'Deleted.' });
};

// ==========================================
// 1.4 GULAYAN STOCK MOVEMENT AND END-OF-DAY CLOSING
// ==========================================
exports.recordStockMovement = async (req, res) => {
  const { item_name, movement_type, kilos, movement_date, cost_per_kilo } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const spoilageLoss = movement_type === 'OUT_SPOILAGE' ? Number(kilos) * Number(cost_per_kilo || 0) : 0;

    await connection.query(
      `INSERT INTO gulayan_stock_movements (department, item_name, movement_type, kilos, spoilage_loss, movement_date)
       VALUES ('Gulayan', ?, ?, ?, ?, ?)`,
      [item_name, movement_type, kilos, spoilageLoss, movement_date]
    );

    if (movement_type === 'IN') {
      await connection.query(
        `UPDATE inventory SET kilos = kilos + ? WHERE department = 'Gulayan' AND item_name = ?`,
        [kilos, item_name]
      );
    } else if (movement_type === 'OUT_SALE' || movement_type === 'OUT_SPOILAGE') {
      await connection.query(
        `UPDATE inventory SET kilos = kilos - ? WHERE department = 'Gulayan' AND item_name = ?`,
        [kilos, item_name]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Gulayan stock movement recorded.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error recording stock movement.', error: error.message });
  } finally {
    connection.release();
  }
};

exports.computeDailyClosing = async (req, res) => {
  const { date } = req.body;

  try {
    const [items] = await db.query(
      `SELECT item_name, kilos AS closing_kilos FROM inventory WHERE department = 'Gulayan'`
    );

    for (const item of items) {
      await db.query(
        `INSERT INTO gulayan_daily_closing (department, item_name, closing_kilos, closing_date)
         VALUES ('Gulayan', ?, ?, ?)`,
        [item.item_name, item.closing_kilos, date]
      );
    }

    res.status(200).json({ message: 'Daily closing computed.', items });
  } catch (error) {
    res.status(500).json({ message: 'Error computing daily closing.', error: error.message });
  }
};

exports.getDailyMovementsAndClosing = async (req, res) => {
  const { date } = req.query;

  const [movements] = await db.query(
    `SELECT id, item_name, movement_type, kilos, spoilage_loss, movement_date
     FROM gulayan_stock_movements
     WHERE department = 'Gulayan' AND DATE(movement_date) = ?`,
    [date]
  );

  const [closing] = await db.query(
    `SELECT item_name, closing_kilos, closing_date
     FROM gulayan_daily_closing
     WHERE department = 'Gulayan' AND DATE(closing_date) = ?`,
    [date]
  );

  res.status(200).json({ movements, closing });
};

// ==========================================
// 1.5 GULAYAN LOW-STOCK AND SPOILAGE INDICATORS
// ==========================================
exports.getGulayanIndicators = async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT 
         i.id,
         i.item_name,
         i.kilos,
         i.purchase_cost_per_kilo,
         i.low_stock_threshold,
         (i.kilos <= i.low_stock_threshold) AS is_low_stock,
         EXISTS(
           SELECT 1 
           FROM gulayan_stock_movements m 
           WHERE m.department = 'Gulayan' 
             AND m.item_name = i.item_name 
             AND m.movement_type = 'OUT_SPOILAGE'
         ) AS has_spoilage
       FROM inventory i
       WHERE i.department = 'Gulayan'`
    );

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Gulayan indicators.', error: error.message });
  }
};

// ==========================================
// 2.4 PRUTASAN STOCK MOVEMENT AND END-OF-DAY CLOSING
// ==========================================
exports.recordPrutasanStockMovement = async (req, res) => {
  const { item_name, movement_type, kilos, movement_date, reason } = req.body;

  if (movement_type === 'OUT_SPOILAGE' && req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only for spoilage entry.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [invRows] = await connection.query(
      `SELECT purchase_cost_per_kilo FROM inventory WHERE department = 'Prutasan' AND item_name = ?`,
      [item_name]
    );
    const costPerKilo = invRows.length > 0 ? Number(invRows[0].purchase_cost_per_kilo) : 0;
    const spoilageLoss = movement_type === 'OUT_SPOILAGE' ? Number(kilos) * costPerKilo : 0;

    await connection.query(
      `INSERT INTO prutasan_stock_movements 
       (department, item_name, movement_type, kilos, spoilage_loss, reason, movement_date)
       VALUES ('Prutasan', ?, ?, ?, ?, ?, ?)`,
      [item_name, movement_type, kilos, spoilageLoss, reason || null, movement_date]
    );

    if (movement_type === 'IN') {
      await connection.query(
        `UPDATE inventory SET kilos = kilos + ? WHERE department = 'Prutasan' AND item_name = ?`,
        [kilos, item_name]
      );
    } else if (movement_type === 'OUT_SALE' || movement_type === 'OUT_SPOILAGE') {
      await connection.query(
        `UPDATE inventory SET kilos = kilos - ? WHERE department = 'Prutasan' AND item_name = ?`,
        [kilos, item_name]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Prutasan stock movement recorded.', spoilageLoss });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error recording Prutasan stock movement.', error: error.message });
  } finally {
    connection.release();
  }
};

exports.computePrutasanDailyClosing = async (req, res) => {
  const { date } = req.body;

  try {
    const [items] = await db.query(
      `SELECT item_name, kilos AS closing_kilos FROM inventory WHERE department = 'Prutasan'`
    );

    for (const item of items) {
      await db.query(
        `INSERT INTO prutasan_daily_closing (department, item_name, closing_kilos, closing_date)
         VALUES ('Prutasan', ?, ?, ?)`,
        [item.item_name, item.closing_kilos, date]
      );
    }

    res.status(200).json({ message: 'Prutasan daily closing computed.', items });
  } catch (error) {
    res.status(500).json({ message: 'Error computing Prutasan daily closing.', error: error.message });
  }
};

exports.getPrutasanDailyMovementsAndClosing = async (req, res) => {
  const { date } = req.query;

  try {
    const [currentStock] = await db.query(
      `SELECT id, item_name, kilos FROM inventory WHERE department = 'Prutasan'`
    );

    const [movements] = await db.query(
      `SELECT id, item_name, movement_type, kilos, spoilage_loss, reason, movement_date
       FROM prutasan_stock_movements
       WHERE department = 'Prutasan' AND DATE(movement_date) = ?
       ORDER BY movement_date DESC`,
      [date]
    );

    const [closing] = await db.query(
      `SELECT item_name, closing_kilos, closing_date
       FROM prutasan_daily_closing
       WHERE department = 'Prutasan' AND DATE(closing_date) = ?`,
      [date]
    );

    res.status(200).json({ currentStock, movements, closing });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving Prutasan movements and closing.', error: error.message });
  }
};

// ==========================================
// 2.5 PRUTASAN LOW-STOCK AND SPOILAGE INDICATORS
// ==========================================
exports.getPrutasanIndicators = async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT 
         i.id,
         i.item_name,
         i.kilos,
         i.purchase_cost_per_kilo,
         i.low_stock_threshold,
         (i.kilos <= i.low_stock_threshold) AS is_low_stock,
         EXISTS(
           SELECT 1 
           FROM prutasan_stock_movements m 
           WHERE m.department = 'Prutasan' 
             AND m.item_name = i.item_name 
             AND m.movement_type = 'OUT_SPOILAGE'
         ) AS has_spoilage
       FROM inventory i
       WHERE i.department = 'Prutasan'`
    );

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Prutasan indicators.', error: error.message });
  }
};