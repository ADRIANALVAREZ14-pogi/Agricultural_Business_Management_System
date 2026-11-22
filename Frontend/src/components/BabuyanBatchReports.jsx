import React, { useState, useEffect } from 'react';
import api from '../services/api';

const BabuyanBatchReports = () => {
  const [reports, setReports] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('ALL');

  useEffect(() => {
    const loadReports = async () => {
      const res = await api.get('/reports/babuyan-batches');
      setReports(res.data);
    };
    loadReports();
  }, []);

  const displayedReports =
    selectedBatchId === 'ALL'
      ? reports
      : reports.filter((r) => r.batch_id === selectedBatchId);

  // Shared print and export (PDF & Excel) engine (4.5)
  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const res = await api.post(
      '/reports/export/pdf',
      {
        reportType: 'babuyan-batches',
        batchId: selectedBatchId,
        reports: displayedReports,
      },
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', Babuyan_Batch_Report_${selectedBatchId}.pdf);
    document.body.appendChild(link);
    link.click();
  };

  const handleExportExcel = async () => {
    const res = await api.post(
      '/reports/export/excel',
      {
        reportType: 'babuyan-batches',
        batchId: selectedBatchId,
        reports: displayedReports,
      },
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', Babuyan_Batch_Report_${selectedBatchId}.xlsx);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <h2>Babuyan Per-Batch Reports</h2>

      <div>
        <label>Select Pig Batch: </label>
        <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
          <option value="ALL">All Pig Batches</option>
          {reports.map((r) => (
            <option key={r.batch_id} value={r.batch_id}>
              {r.batch_name !== '-' ? ${r.batch_id} - ${r.batch_name} : r.batch_id}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '10px', marginBottom: '16px' }}>
        <button type="button" onClick={handlePrint}>Print</button>
        <button type="button" onClick={handleExportPDF}>Export PDF</button>
        <button type="button" onClick={handleExportExcel}>Export Excel</button>
      </div>

      {displayedReports.map((rep) => (
        <div
          key={rep.batch_id}
          style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '20px' }}
        >
          <h3>
            Batch: {rep.batch_id} {rep.batch_name !== '-' ? (${rep.batch_name}) : ''}
          </h3>
          <p>
            Purchase Date: {rep.purchase_date} | Expected Selling Date: {rep.expected_selling_date} | Active Heads: {rep.active_heads}
          </p>

          {/* 1. Batch Financial Summary */}
          <h4>Financial Summary</h4>
          <table>
            <thead>
              <tr>
                <th>Capital</th>
                <th>Feed</th>
                <th>Medicine</th>
                <th>Other Expenses</th>
                <th>Total Expenses</th>
                <th>Live Weight Sold</th>
                <th>Income</th>
                <th>Net Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{rep.financial_summary.capital.toFixed(2)}</td>
                <td>{rep.financial_summary.feed.toFixed(2)}</td>
                <td>{rep.financial_summary.medicine.toFixed(2)}</td>
                <td>{rep.financial_summary.other_expenses.toFixed(2)}</td>
                <td>{rep.financial_summary.total_expenses.toFixed(2)}</td>
                <td>{rep.financial_summary.live_weight_sold_kg} kg</td>
                <td>{rep.financial_summary.income.toFixed(2)}</td>
                <td>
                  <strong style={{ color: rep.financial_summary.net_profit >= 0 ? 'green' : 'red' }}>
                    {rep.financial_summary.net_profit.toFixed(2)}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 2. Per-Batch Sales & Expense Summaries */}
          <h4>Expense Summary by Category</h4>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {rep.expense_summary.by_category.map((exp, idx) => (
                <tr key={idx}>
                  <td>{exp.category}</td>
                  <td>{Number(exp.category_total).toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Total Batch Expenses</strong></td>
                <td><strong>{rep.expense_summary.total_expenses.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>

          <h4>Hog Sales Summary</h4>
          <table>
            <thead>
              <tr>
                <th>Sale Date</th>
                <th>Live Weight Sold (kg)</th>
                <th>Price per Kilo</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {rep.sales_summary.records.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.sale_date}</td>
                  <td>{sale.live_weight_kg} kg</td>
                  <td>{sale.price_per_kilo}</td>
                  <td>{Number(sale.total_revenue).toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>{rep.sales_summary.total_live_weight_kg} kg</strong></td>
                <td>-</td>
                <td><strong>{rep.sales_summary.total_income.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>

          {/* 3. Health and Mortality Data */}
          <h4>Health & Mortality Summary (Total Mortality: {rep.health_and_mortality.total_mortality_heads} heads)</h4>
          <table>
            <thead>
              <tr>
                <th>Vaccination Date</th>
                <th>Vaccine</th>
                <th>Dosage</th>
                <th>Administered By</th>
              </tr>
            </thead>
            <tbody>
              {rep.health_and_mortality.vaccinations.map((v) => (
                <tr key={v.id}>
                  <td>{v.vaccination_date}</td>
                  <td>{v.vaccine_name}</td>
                  <td>{v.dosage}</td>
                  <td>{v.administered_by || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table style={{ marginTop: '8px' }}>
            <thead>
              <tr>
                <th>Mortality Date</th>
                <th>Heads Lost</th>
                <th>Cause of Death</th>
              </tr>
            </thead>
            <tbody>
              {rep.health_and_mortality.mortalities.map((m) => (
                <tr key={m.id}>
                  <td>{m.mortality_date}</td>
                  <td>{m.heads_lost}</td>
                  <td>{m.cause_of_death}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default BabuyanBatchReports