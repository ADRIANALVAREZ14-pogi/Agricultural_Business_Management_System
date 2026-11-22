const db = require('../config/db');

// Store Gulayan expenses encoded by the Admin only, by category: sourcing, logistics, labor, and utilities
exports.addGulayanExpense = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { category, amount, description, expense_date } = req.body;
  const allowedCategories = ['sourcing', 'logistics', 'labor', 'utilities'];

  if (!allowedCategories.includes(category)) {
    return res.status(400).json({ message: 'Invalid Gulayan expense category.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO expenses (department, category, amount, description, expense_date)
       VALUES ('Gulayan', ?, ?, ?, ?)`,
      [category, amount, description, expense_date]
    );

    res.status(201).json({
      id: result.insertId,
      department: 'Gulayan',
      category,
      amount,
      description,
      expense_date,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to store Gulayan expense.', error: error.message });
  }
};

// Retrieve Gulayan expenses with automatic totals by category and overall total
exports.getGulayanExpenses = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { date } = req.query;

  try {
    let query = `
      SELECT id, category, amount, description, expense_date
      FROM expenses
      WHERE department = 'Gulayan'
    `;
    const params = [];

    if (date) {
      query +=  AND DATE(expense_date) = ?;
      params.push(date);
    }

    query +=  ORDER BY expense_date DESC;

    const [expenses] = await db.query(query, params);

    // Automatic totals per category and overall
    const totals = {
      sourcing: 0,
      logistics: 0,
      labor: 0,
      utilities: 0,
      overall: 0,
    };

    for (const item of expenses) {
      const amt = Number(item.amount);
      if (totals[item.category] !== undefined) {
        totals[item.category] += amt;
      }
      totals.overall += amt;
    }

    res.status(200).json({ expenses, totals });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Gulayan expenses.', error: error.message });
  }
};