const db = require('../config/db');

const VALID_CATEGORIES = ['sourcing', 'storage', 'logistics', 'labor'];

// ==========================================
// 1.7 GULAYAN EXPENSES (ADMIN)
// ==========================================
exports.addGulayanExpense = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { category, amount, description, expense_date } = req.body;

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: 'Invalid expense category.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO expenses (department, category, amount, description, expense_date)
       VALUES ('Gulayan', ?, ?, ?, ?)`,
      [category, amount, description || null, expense_date]
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
    res.status(500).json({ message: 'Failed to save Gulayan expense.', error: error.message });
  }
};

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
      query += ` AND DATE(expense_date) = ?`;
      params.push(date);
    }

    query += ` ORDER BY expense_date DESC, id DESC`;

    const [expenses] = await db.query(query, params);

    const categoryTotals = VALID_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = expenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      return acc;
    }, {});

    const grandTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    res.status(200).json({
      expenses,
      categoryTotals,
      grandTotal,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Gulayan expenses.', error: error.message });
  }
};

// ==========================================
// 2.7 PRUTASAN EXPENSES (ADMIN)
// ==========================================
exports.addPrutasanExpense = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { category, amount, description, expense_date } = req.body;

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: 'Invalid expense category.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO expenses (department, category, amount, description, expense_date)
       VALUES ('Prutasan', ?, ?, ?, ?)`,
      [category, amount, description || null, expense_date]
    );

    res.status(201).json({
      id: result.insertId,
      department: 'Prutasan',
      category,
      amount,
      description,
      expense_date,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save Prutasan expense.', error: error.message });
  }
};

exports.getPrutasanExpenses = async (req, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { date } = req.query;

  try {
    let query = `
      SELECT id, category, amount, description, expense_date
      FROM expenses
      WHERE department = 'Prutasan'
    `;
    const params = [];

    if (date) {
      query += ` AND DATE(expense_date) = ?`;
      params.push(date);
    }

    query += ` ORDER BY expense_date DESC, id DESC`;

    const [expenses] = await db.query(query, params);

    // Automatic totals by category and grand total
    const categoryTotals = VALID_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = expenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      return acc;
    }, {});

    const grandTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    res.status(200).json({
      expenses,
      categoryTotals,
      grandTotal,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve Prutasan expenses.', error: error.message });
  }
};