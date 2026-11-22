import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminExpenses = () => {
  const [department, setDepartment] = useState('Gulayan');
  const [category, setCategory] = useState('sourcing');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const [filterDate, setFilterDate] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState({
    sourcing: 0,
    storage: 0,
    logistics: 0,
    labor: 0,
  });
  const [grandTotal, setGrandTotal] = useState(0);

  const loadExpenses = async () => {
    const endpoint = department === 'Gulayan' ? '/gulayan/expenses' : '/prutasan/expenses';
    const params = {};
    if (filterDate) params.date = filterDate;

    const res = await api.get(endpoint, { params });
    setExpenses(res.data.expenses);
    setCategoryTotals(res.data.categoryTotals);
    setGrandTotal(res.data.grandTotal);
  };

  useEffect(() => {
    loadExpenses();
  }, [department, filterDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = department === 'Gulayan' ? '/gulayan/expenses' : '/prutasan/expenses';

    await api.post(endpoint, {
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
      <h2>Admin - Department Expenses</h2>

      {/* Department Selector (1.7 Gulayan & 2.7 Prutasan) */}
      <div>
        <label>Department: </label>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="Gulayan">Gulayan</option>
          <option value="Prutasan">Prutasan</option>
        </select>
      </div>

      {/* Admin Expense Form */}
      <h3>Add {department} Expense</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="sourcing">Sourcing</option>
            <option value="storage">Storage</option>
            <option value="logistics">Logistics</option>
            <option value="labor">Labor</option>
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

      {/* Date Filtering & Categorized Totals */}
      <h3>{department} Categorized Expense Summary</h3>
      <div>
        <label>Filter by Date: </label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        {filterDate && (
          <button type="button" onClick={() => setFilterDate('')}>
            Clear Filter
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Sourcing</th>
            <th>Storage</th>
            <th>Logistics</th>
            <th>Labor</th>
            <th>Total Expenses</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{categoryTotals.sourcing}</td>
            <td>{categoryTotals.storage}</td>
            <td>{categoryTotals.logistics}</td>
            <td>{categoryTotals.labor}</td>
            <td><strong>{grandTotal}</strong></td>
          </tr>
        </tbody>
      </table>

      {/* Expense Records Table */}
      <h3>{department} Expense Records</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.expense_date}</td>
              <td>{exp.category}</td>
              <td>{exp.description || '-'}</td>
              <td>{exp.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminExpenses;