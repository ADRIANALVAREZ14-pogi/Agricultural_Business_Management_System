import React, { useState, useEffect } from 'react';
import api from '../services/api';

const GulayanAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const res = await api.get('/analytics/gulayan');
      setAnalytics(res.data);
    };
    loadAnalytics();
  }, []);

  if (!analytics) return <div>Loading Gulayan Analytics...</div>;

  return (
    <div>
      <h2>Gulayan Analytics</h2>

      <h3>Best-Selling Products</h3>
      <table>
        <thead>
          <tr>
            <th>Vegetable</th>
            <th>Total Kilos Sold</th>
            <th>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {analytics.bestSelling.map((item, idx) => (
            <tr key={idx}>
              <td>{item.item_name}</td>
              <td>{item.total_kilos} kg</td>
              <td>{item.total_sales}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Peak Sales Days</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Daily Sales</th>
          </tr>
        </thead>
        <tbody>
          {analytics.peakSalesDays.map((day, idx) => (
            <tr key={idx}>
              <td>{day.sale_day}</td>
              <td>{day.daily_sales}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Underperforming Items</h3>
      <table>
        <thead>
          <tr>
            <th>Vegetable</th>
            <th>Total Kilos Sold</th>
          </tr>
        </thead>
        <tbody>
          {analytics.underperforming.map((item, idx) => (
            <tr key={idx}>
              <td>{item.item_name}</td>
              <td>{item.total_kilos} kg</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Spoilage Trends</h3>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Spoiled Kilos</th>
            <th>Spoilage Loss</th>
          </tr>
        </thead>
        <tbody>
          {analytics.spoilageTrends.map((trend, idx) => (
            <tr key={idx}>
              <td>{trend.month}</td>
              <td>{trend.spoiled_kilos} kg</td>
              <td>{trend.spoilage_loss}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Expense Share</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Share (%)</th>
          </tr>
        </thead>
        <tbody>
          {analytics.expenseShare.map((exp, idx) => (
            <tr key={idx}>
              <td>{exp.category}</td>
              <td>{exp.total_amount}</td>
              <td>{exp.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GulayanAnalytics;