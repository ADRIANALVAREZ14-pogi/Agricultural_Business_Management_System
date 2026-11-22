import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminExpenses = () => {
  const [department, setDepartment] = useState('Gulayan');
  const [category, setCategory] = useState('sourcing');
  const [batchId, setBatchId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const [filterDate, setFilterDate] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [grandTotal, setGrandTotal] = useState(0);

  const categories =
    department === 'Babuyan'
      ? ['feed', 'veterinary care', 'labor', 'utilities']
      : ['sourcing', 'storage', 'logistics', 'labor'];

  const handleDepartmentChange = (newDept) => {
    setDepartment(newDept);
    setCategory(newDept === 'Babuyan' ? 'feed' : 'sourcing');
    setBatchId('');
  };

  const loadExpenses = async () => {
    const endpointMap = {
      Gulayan: '/gulayan/expenses',
      Prutasan: '/prutasan/expenses',
      Babuyan: '/babuyan/expenses',
    };

    const params = {};
    if (filterDate) params.date = filterDate;

    const res = await api.get(endpointMap[department], { params });
    setExpenses(res.data.expenses);
    setCategoryTotals(res.data.categoryTotals);
    setGrandTotal(res.data.grandTotal);
  };

  useEffect(() => {
    loadExpenses();
  }, [department, filterDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpointMap = {
      Gulayan: '/gulayan/expenses',
      Prutasan: '/prutasan/expenses',
      Babuyan: '/babuyan/expenses',
    };

    const payload = {
      category,
      amount,
      description,
      expense_date: expenseDate,
    };

    if (department === 'Babuyan' && batchId) {
      payload.batch_id = batchId;
    }

    await api.post(endpointMap[department], payload);

    setAmount('');
    setDescription('');
    setBatchId('');
    loadExpenses();
  };

  return (
    <div>
      <h2>Admin - Department Expenses</h2>

      {/* Department Selector (1.7 Gulayan, 2.7 Prutasan, 3.2 Babuyan) */}
      <div>
        <label>Department: </label>
        <select value={department} onChange={(e) => handleDepartmentChange(e.target.value)}>
          <option value="Gulayan">Gulayan</option>
          <option value="Prutasan">Prutasan</option>
          <option value="Babuyan">Babuyan</option>
        </select>
      </div>

      {/* Admin Expense Form */}
      <h3>Add {department} Expense</h3>
      <form onSubmit={handleSubmit}>
        {department === 'Babuyan' && (
          <div>
            <label>Batch ID (Optional / For Batch Cost):</label>
            <input
              type="text"
              placeholder="e.g., BATCH-01"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            />
          </div>
        )}

        <div>
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
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

      {/* Date Filtering & Categorized View */}
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
            {categories.map((cat) => (
              <th key={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</th>
            ))}
            <th>Total Expenses</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {categories.map((cat) => (
              <td key={cat}>{categoryTotals[cat] || 0}</td>
            ))}
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
            {department === 'Babuyan' && <th>Batch ID</th>}
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.expense_date}</td>
              {department === 'Babuyan' && <td>{exp.batch_id || '-'}</td>}
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