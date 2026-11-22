const db = require('../config/db');

// Shared data structure & functions followed by Prutasan (per-kilo inventory)
exports.addStock = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { department, item_name, kilos, purchase_cost_per_kilo } = req.body;

  const [result] = await db.query(
    `INSERT INTO inventory (department, item_name, kilos, purchase_cost_per_kilo)
     VALUES (?, ?, ?, ?)`,
    [department, item_name, kilos, purchase_cost_per_kilo]
  );

  res.status(201).json({ id: result.insertId, department, item_name, kilos, purchase_cost_per_kilo });
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
  if (req.user.role !== 'Admin') {
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
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { id } = req.params;

  await db.query(DELETE FROM inventory WHERE id = ?, [id]);

  res.status(200).json({ message: 'Deleted.' });
};