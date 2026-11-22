import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminBabuyanProfitability = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('ALL');

  useEffect(() => {
    const loadProfitability = async () => {
      const res = await api.get('/babuyan/profitability');
      setBatches(res.data);
    };
    loadProfitability();
  }, []);

  const displayedBatches =
    selectedBatchId === 'ALL'
      ? batches
      : batches.filter((b) => b.batch_id === selectedBatchId);

  return (
    <div>
      <h2>Admin - Livestock Production Cost & Profitability</h2>

      <div>
        <label>Filter by Pig Batch: </label>
        <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
          <option value="ALL">All Batches</option>
          {batches.map((b) => (
            <option key={b.batch_id} value={b.batch_id}>
              {b.batch_name !== '-' ? ${b.batch_id} - ${b.batch_name} : b.batch_id}
            </option>
          ))}
        </select>
      </div>

      <table style={{ marginTop: '12px' }}>
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Batch Label</th>
            <th>Capital Cost</th>
            <th>Feed Cost</th>
            <th>Medicine Cost</th>
            <th>Other Expenses</th>
            <th>Cumulative Raising Cost</th>
            <th>Live Weight Sold (kg)</th>
            <th>Cost / kg Live Weight</th>
            <th>Income</th>
            <th>Net Profit</th>
          </tr>
        </thead>
        <tbody>
          {displayedBatches.map((b) => (
            <tr key={b.batch_id}>
              <td>{b.batch_id}</td>
              <td>{b.batch_name}</td>
              <td>{b.cost_breakdown.capital.toFixed(2)}</td>
              <td>{b.cost_breakdown.feed.toFixed(2)}</td>
              <td>{b.cost_breakdown.medicine.toFixed(2)}</td>
              <td>{b.cost_breakdown.other_expenses.toFixed(2)}</td>
              <td><strong>{b.cost_breakdown.cumulative_raising_cost.toFixed(2)}</strong></td>
              <td>{b.total_live_weight_kg} kg</td>
              <td>{b.cost_per_kilo_live_weight.toFixed(2)} / kg</td>
              <td>{b.total_income.toFixed(2)}</td>
              <td>
                <strong style={{ color: b.net_profit >= 0 ? 'green' : 'red' }}>
                  {b.net_profit.toFixed(2)}
                </strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBabuyanProfitability;