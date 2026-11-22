const db = require('../config/db');

// Create functions to save Prutasan sales transactions: fruit, kilos, price per kilo, payment method, date, and total amount.
// Validate required fields, store the record under Prutasan only, and automatically deduct the sold kilos from the Prutasan inventory.
exports.recordPrutasanSale = async (req, res) => {
  const { fruit, kilos, price_per_kilo, payment_method, sale_date, total_amount } = req.body;

  // Validate required fields
  if (
    !fruit ||
    kilos === undefined ||
    price_per_kilo === undefined ||
    !payment_method ||
    !sale_date ||
    total_amount === undefined
  ) {
    return res.status(400).json({ message: 'All required fields must be provided.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Store the record under Prutasan only
    const [result] = await connection.query(
      `INSERT INTO prutasan_sales 
       (department, fruit, kilos, price_per_kilo, payment_method, sale_date, total_amount)
       VALUES ('Prutasan', ?, ?, ?, ?, ?, ?)`,
      [fruit, kilos, price_per_kilo, payment_method, sale_date, total_amount]
    );

    // Automatically deduct the sold kilos from the Prutasan inventory
    await connection.query(
      `UPDATE inventory 
       SET kilos = kilos - ? 
       WHERE department = 'Prutasan' AND item_name = ?`,
      [kilos, fruit]
    );

    await connection.commit();
    res.status(201).json({
      id: result.insertId,
      department: 'Prutasan',
      fruit,
      kilos,
      price_per_kilo,
      payment_method,
      sale_date,
      total_amount,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to save Prutasan sale.', error: error.message });
  } finally {
    connection.release();
  }
};