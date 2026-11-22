const db = require('../config/db');

// Calculate transaction total and cost of goods sold
exports.calculateGulayanSale = (kilos, pricePerKilo, purchaseCostPerKilo) => {
  const totalAmount = Number(kilos) * Number(pricePerKilo);
  const costOfGoodsSold = Number(kilos) * Number(purchaseCostPerKilo);

  return {
    total_amount: totalAmount,
    cost_of_goods_sold: costOfGoodsSold,
  };
};

// Retrieve stored Gulayan sales records with filtering and searching by date and product
exports.getGulayanSalesRecords = async (req, res) => {
  const { date, product } = req.query;

  try {
    let query = `
      SELECT 
        id,
        vegetable AS product,
        kilos,
        price_per_kilo,
        payment_method,
        (kilos * price_per_kilo) AS total_amount,
        (kilos * purchase_cost_per_kilo) AS cost_of_goods_sold,
        sale_date
      FROM gulayan_sales
      WHERE department = 'Gulayan'
    `;
    const params = [];

    if (date) {
      query +=  AND DATE(sale_date) = ?;
      params.push(date);
    }

    if (product) {
      query +=  AND vegetable LIKE ?;
      params.push(%${product}%);
    }

    query +=  ORDER BY sale_date DESC;

    const [records] = await db.query(query, params);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Gulayan sales records.', error: error.message });
  }
};