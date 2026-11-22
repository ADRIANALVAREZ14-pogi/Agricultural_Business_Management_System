const db = require('../config/db');

exports.saveGulayanSale = async (req, res) => {
  const { vegetable, kilos, price_per_kilo, payment_method, date, total_amount } = req.body;

  // Validate required fields
  if (!vegetable || !kilos || !price_per_kilo || !payment_method || !date || !total_amount) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Store the record under Gulayan only
    await connection.query(
      `INSERT INTO gulayan_sales (vegetable, kilos, price_per_kilo, payment_method, sale_date, total_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [vegetable, kilos, price_per_kilo, payment_method, date, total_amount]
    );

    // Automatically deduct the sold kilos from the Gulayan inventory
    await connection.query(
      UPDATE gulayan_inventory SET kilos = kilos - ? WHERE vegetable = ?,
      [kilos, vegetable]
    );

    await connection.commit();
    res.status(201).json({ message: 'Gulayan sale saved.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to save Gulayan sale.', error: error.message });
  } finally {
    connection.release();
  }
};