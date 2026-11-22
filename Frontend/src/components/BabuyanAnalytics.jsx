import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import api from '../services/api';

const BabuyanAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const res = await api.get('/analytics/babuyan');
      setAnalytics(res.data);
    };
    loadAnalytics();
  }, []);

  if (!analytics) return <div>Loading Babuyan Analytics...</div>;

  const { batchMetrics, profitTrend } = analytics;

  const costComparisonChartData = batchMetrics.map((b) => ({
    batch: b.batch_id,
    Capital: b.cost_comparison.capital_cost,
    Feed: b.cost_comparison.feed_cost,
    Medicine: b.cost_comparison.medicine_cost,
    Other: b.cost_comparison.other_expenses,
    TotalCost: b.cost_comparison.total_cost,
  }));

  return (
    <div>
      <h2>Babuyan Analytics</h2>

      {/* 1. Batch Efficiency & Cost Metrics Table */}
      <h3>Feed-to-Weight Ratio & Cost per Kilo of Live Weight (Per Batch)</h3>
      <table>
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Batch Name</th>
            <th>Total Feed Used</th>
            <th>Live Weight (kg)</th>
            <th>Feed-to-Weight Ratio</th>
            <th>Total Cost</th>
            <th>Cost / kg Live Weight</th>
            <th>Revenue</th>
            <th>Net Profit</th>
          </tr>
        </thead>
        <tbody>
          {batchMetrics.map((b) => (
            <tr key={b.batch_id}>
              <td>{b.batch_id}</td>
              <td>{b.batch_name}</td>
              <td>{b.total_feed_units}</td>
              <td>{b.total_live_weight_kg} kg</td>
              <td><strong>{b.feed_to_weight_ratio}</strong></td>
              <td>{b.cost_comparison.total_cost.toFixed(2)}</td>
              <td><strong>{b.cost_per_kilo_live_weight.toFixed(2)} / kg</strong></td>
              <td>{b.total_revenue.toFixed(2)}</td>
              <td>
                <strong style={{ color: b.net_profit >= 0 ? 'green' : 'red' }}>
                  {b.net_profit.toFixed(2)}
                </strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 2. Batch Cost Comparison Chart */}
      <h3>Cost Comparison Between Batches</h3>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={costComparisonChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="batch" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Capital" stackId="a" fill="#4f46e5" />
            <Bar dataKey="Feed" stackId="a" fill="#16a34a" />
            <Bar dataKey="Medicine" stackId="a" fill="#d97706" />
            <Bar dataKey="Other" stackId="a" fill="#64748b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Profit Trend Chart */}
      <h3>Profit Trend (Selling & Herd Expansion Insights)</h3>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={profitTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#16a34a" strokeWidth={2} />
            <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#dc2626" strokeWidth={2} />
            <Line type="monotone" dataKey="net_profit" name="Net Profit" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BabuyanAnalytics;