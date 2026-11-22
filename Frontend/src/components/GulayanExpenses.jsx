import React, { useState, useEffect } from 'react';
import api from '../services/api';

const GulayanExpenses = () => {
  const [category, setCategory] = useState('sourcing');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDate, setFilterDate] = useState('');

  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState({
    sourcing: 0,
    logistics: 0,
    labor: 0,
    utilities: 0,
    overall: 0,
  });

  const loadExpenses = async () => {
    const params = {};
    if (filterDate) params.date = filterDate;

    const res = await api.get('/gulayan/expenses', { params });
    setExpenses(res.data.expenses);
    setTotals(res.data.totals);
  };

  useEffect(() => {
    loadExpenses();
  }, [filterDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/gulayan/expenses', {
      category,
      amount,
      description,
      expense_date: expenseDate,
    });

    setAmount('');
    setDescription('');
    loadExpenses();
  };

  return (
    <div>
      <h2>Admin - Gulayan Expenses</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="sourcing">Sourcing</option>
            <option value="logistics">Logistics</option>
            <option value="labor">Labor</option>
            <option value="utilities">Utilities</option>
          </select>
        </div>

        <div>
          <label>Amount:</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Date:</label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
          />
        </div>

        <button type="submit">Save Expense</button>
      </form>

      <div>
        <label>Filter by Date: </label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      <h3>Category Totals</h3>
      <ul>
        <li>Sourcing: {totals.sourcing}</li>
        <li>Logistics: {totals.logistics}</li>
        <li>Labor: {totals.labor}</li>
        <li>Utilities: {totals.utilities}</li>
        <li><strong>Total Gulayan Expenses: {totals.overall}</strong></li>
      </ul>

      <h3>Categorized Expenses</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.category}</td>
              <td>{exp.description}</td>
              <td>{exp.amount}</td>
              <td>{exp.expense_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GulayanExpenses;