const db = require('../config/db');

// ==========================================
// 1.6 GULAYAN MONTHLY PHYSICAL AUDIT AND STOCK ADJUSTMENT LOG
// ==========================================
exports.recordGulayanAudit = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { item_name, counted_quantity, reason, audit_date } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [invRows] = await connection.query(
      `SELECT kilos FROM inventory WHERE department = 'Gulayan' AND item_name = ?`,
      [item_name]
    );
    const systemQuantity = invRows.length > 0 ? Number(invRows[0].kilos) : 0;
    const difference = Number(counted_quantity) - systemQuantity;

    await connection.query(
      `UPDATE inventory SET kilos = ? WHERE department = 'Gulayan' AND item_name = ?`,
      [counted_quantity, item_name]
    );

    const [result] = await connection.query(
      `INSERT INTO stock_adjustment_logs 
       (department, audit_date, item_name, system_quantity, counted_quantity, difference, reason)
       VALUES ('Gulayan', ?, ?, ?, ?, ?, ?)`,
      [audit_date, item_name, systemQuantity, counted_quantity, difference, reason]
    );

    await connection.commit();
    res.status(201).json({
      id: result.insertId,
      department: 'Gulayan',
      audit_date,
      item_name,
      system_quantity: systemQuantity,
      counted_quantity,
      difference,
      reason,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to record Gulayan audit.', error: error.message });
  } finally {
    connection.release();
  }
};

exports.getGulayanAuditLogs = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  try {
    const [logs] = await db.query(
      `SELECT id, audit_date, item_name, system_quantity, counted_quantity, difference, reason
       FROM stock_adjustment_logs
       WHERE department = 'Gulayan'
       ORDER BY audit_date DESC, id DESC`
    );
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Gulayan audit logs.', error: error.message });
  }
};

// ==========================================
// 2.6 PRUTASAN MONTHLY PHYSICAL AUDIT AND STOCK ADJUSTMENT LOG
// ==========================================
exports.recordPrutasanAudit = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { item_name, counted_quantity, reason, audit_date } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Retrieve current system quantity for Prutasan item
    const [invRows] = await connection.query(
      `SELECT kilos FROM inventory WHERE department = 'Prutasan' AND item_name = ?`,
      [item_name]
    );
    const systemQuantity = invRows.length > 0 ? Number(invRows[0].kilos) : 0;
    const difference = Number(counted_quantity) - systemQuantity;

    // Apply approved correction to Prutasan inventory
    await connection.query(
      `UPDATE inventory SET kilos = ? WHERE department = 'Prutasan' AND item_name = ?`,
      [counted_quantity, item_name]
    );

    // Save difference in stock-adjustment log
    const [result] = await connection.query(
      `INSERT INTO stock_adjustment_logs 
       (department, audit_date, item_name, system_quantity, counted_quantity, difference, reason)
       VALUES ('Prutasan', ?, ?, ?, ?, ?, ?)`,
      [audit_date, item_name, systemQuantity, counted_quantity, difference, reason]
    );

    await connection.commit();
    res.status(201).json({
      id: result.insertId,
      department: 'Prutasan',
      audit_date,
      item_name,
      system_quantity: systemQuantity,
      counted_quantity,
      difference,
      reason,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to record Prutasan audit.', error: error.message });
  } finally {
    connection.release();
  }
};

exports.getPrutasanAuditLogs = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  try {
    const [logs] = await db.query(
      `SELECT id, audit_date, item_name, system_quantity, counted_quantity, difference, reason
       FROM stock_adjustment_logs
       WHERE department = 'Prutasan'
       ORDER BY audit_date DESC, id DESC`
    );
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Prutasan audit logs.', error: error.message });
  }
};