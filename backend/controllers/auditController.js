const db = require('../config/db');

// Support the monthly physical audit for Gulayan on the schedule set by the client.
// Record counted versus system quantity, apply approved corrections, and save each difference in a stock-adjustment log.
exports.recordGulayanAudit = async (req, res) => {
  const { audit_date, item_name, system_quantity, counted_quantity, reason, approved } = req.body;

  const difference = Number(counted_quantity) - Number(system_quantity);

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Save counted vs system quantity and difference in stock-adjustment log
    await connection.query(
      `INSERT INTO gulayan_stock_adjustment_log 
       (department, audit_date, item_name, system_quantity, counted_quantity, difference, reason, approved)
       VALUES ('Gulayan', ?, ?, ?, ?, ?, ?, ?)`,
      [audit_date, item_name, system_quantity, counted_quantity, difference, reason, approved ? 1 : 0]
    );

    // Apply approved corrections to Gulayan inventory
    if (approved) {
      await connection.query(
        UPDATE inventory SET kilos = ? WHERE department = 'Gulayan' AND item_name = ?,
        [counted_quantity, item_name]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Gulayan physical audit recorded.', difference });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error recording Gulayan audit.', error: error.message });
  } finally {
    connection.release();
  }
};

exports.getGulayanAdjustmentLog = async (req, res) => {
  try {
    const [logs] = await db.query(
      `SELECT id, audit_date, item_name, system_quantity, counted_quantity, difference, reason, approved
       FROM gulayan_stock_adjustment_log
       WHERE department = 'Gulayan'
       ORDER BY audit_date DESC`
    );

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve stock-adjustment log.', error: error.message });
  }
};