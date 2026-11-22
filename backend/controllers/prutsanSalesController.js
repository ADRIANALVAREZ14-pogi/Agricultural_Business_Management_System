const db = require('../config/db');

// ==========================================
// 2.1 PRUTASAN SALES RECORDING (with 2.2 COGS & 2.4 Stock Movement Deduction Log)
// ==========================================
exports.recordPrutasanSale = async (req, res) => {
  const { fruit, kilos, price_per_kilo, payment_method, sale_date } = req.body;

  if (!fruit || kilos === undefined || price_per_kilo === undefined || !payment_method || !sale_date) {
    return res.status(400).json({ message: 'All required fields must be provided.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [invRows] = await connection.query(
      `SELECT purchase_cost_per_kilo FROM inventory WHERE department = 'Prutasan' AND item_name = ?`,
      [fruit]
    );
    const purchaseCostPerKilo = invRows.length > 0 ? Number(invRows[0].purchase_cost_per_kilo) : 0;
    const totalAmount = Number(kilos) * Number(price_per_kilo);
    const costOfGoodsSold = Number(kilos) * purchaseCostPerKilo;

    const [result] = await connection.query(
      `INSERT INTO prutasan_sales 
       (department, fruit, kilos, price_per_kilo, purchase_cost_per_kilo, cost_of_goods_sold, payment_method, sale_date, total_amount)
       VALUES ('Prutasan', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fruit, kilos, price_per_kilo, purchaseCostPerKilo, costOfGoodsSold, payment_method, sale_date, totalAmount]
    );

    // Automatically deduct sold kilos from Prutasan inventory
    await connection.query(
      `UPDATE inventory 
       SET kilos = kilos - ? 
       WHERE department = 'Prutasan' AND item_name = ?`,
      [kilos, fruit]
    );

    // 2.4 Automatic deduction log in Prutasan stock movements
    await connection.query(
      `INSERT INTO prutasan_stock_movements 
       (department, item_name, movement_type, kilos, spoilage_loss, movement_date)
       VALUES ('Prutasan', ?, 'OUT_SALE', ?, 0, ?)`,
      [fruit, kilos, sale_date]
    );

    await connection.commit();
    res.status(201).json({
      id: result.insertId,
      department: 'Prutasan',
      fruit,
      kilos,
      price_per_kilo,
      cost_of_goods_sold: costOfGoodsSold,
      payment_method,
      sale_date,
      total_amount: totalAmount,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to save Prutasan sale.', error: error.message });
  } finally {
    connection.release();
  }
};

// ==========================================
// 2.2 SALES CALCULATION AND RECORDS
// ==========================================
exports.getPrutasanSalesRecords = async (req, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Prutasan Staff') {
    return res.status(403).json({ message: 'Access restricted to Admin and Prutasan Staff only.' });
  }

  const { date, product } = req.query;

  try {
    let query = `
      SELECT id, fruit AS product, kilos, price_per_kilo, cost_of_goods_sold, payment_method, total_amount, sale_date
      FROM prutasan_sales
      WHERE department = 'Prutasan'
    `;
    const params = [];

    if (date) {
      query += ` AND DATE(sale_date) = ?`;
      params.push(date);
    }

    if (product) {
      query += ` AND fruit LIKE ?`;
      params.push(`%${product}%`);
    }

    query += ` ORDER BY sale_date DESC`;

    const [records] = await db.query(query, params);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Prutasan sales records.', error: error.message });
  }
};