import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [summary, setSummary] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);

  useEffect(() => {
    const loadGulayanReports = async () => {
      const [summaryRes, monthlyRes] = await Promise.all([
        api.get(/reports/gulayan-summary?month=${month}),
        api.get(/reports/gulayan-monthly?month=${month}),
      ]);
      setSummary(summaryRes.data);
      setMonthlyReport(monthlyRes.data);
    };
    loadGulayanReports();
  }, [month]);

  // Shared print and export (PDF & Excel) engine (4.5)
  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const res = await api.post(
      '/reports/export/pdf',
      { reportType: 'gulayan', month, summary, monthlyReport },
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', Gulayan_Report_${month}.pdf);
    document.body.appendChild(link);
    link.click();
  };

  const handleExportExcel = async () => {
    const res = await api.post(
      '/reports/export/excel',
      { reportType: 'gulayan', month, summary, monthlyReport },
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', Gulayan_Report_${month}.xlsx);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <h2>Gulayan Reports</h2>

      <div>
        <label>Select Month: </label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      <div>
        <button type="button" onClick={handlePrint}>Print</button>
        <button type="button" onClick={handleExportPDF}>Export PDF</button>
        <button type="button" onClick={handleExportExcel}>Export Excel</button>
      </div>

      {/* 1.8 Sales and Expense Summaries */}
      {summary && (
        <div>
          <h3>Gulayan Sales and Expense Summary ({summary.month})</h3>
          <table>
            <thead>
              <tr>
                <th>Total Kilos Sold</th>
                <th>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{summary.salesSummary?.total_kilos_sold} kg</td>
                <td>{summary.salesSummary?.total_sales}</td>
              </tr>
            </tbody>
          </table>

          <table>
            <thead>
              <tr>
                <th>Expense Category</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {summary.expenseByCategory.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.category}</td>
                  <td>{item.category_total}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Total Expenses</strong></td>
                <td><strong>{summary.totalExpenses}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 1.9 Gulayan Monthly Report */}
      {monthlyReport && (
        <div>
          <h3>Gulayan Monthly Report ({monthlyReport.month})</h3>
          <table>
            <tbody>
              <tr>
                <td>Sales</td>
                <td>{monthlyReport.sales}</td>
              </tr>
              <tr>
                <td>Cost of Goods Sold</td>
                <td>{monthlyReport.costOfGoodsSold}</td>
              </tr>
              <tr>
                <td>Expenses</td>
                <td>{monthlyReport.expenses}</td>
              </tr>
              <tr>
                <td>Spoilage Loss ({monthlyReport.spoilage.total_kilos} kg)</td>
                <td>{monthlyReport.spoilage.total_loss}</td>
              </tr>
              <tr>
                <td><strong>Net Profit</strong></td>
                <td><strong>{monthlyReport.netProfit}</strong></td>
              </tr>
            </tbody>
          </table>

          <h4>Stock Movement ({monthlyReport.month})</h4>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>Movement Type</th>
                <th>Kilos</th>
                <th>Spoilage Loss</th>
              </tr>
            </thead>
            <tbody>
              {monthlyReport.stockMovements.map((m, idx) => (
                <tr key={idx}>
                  <td>{m.movement_date}</td>
                  <td>{m.item_name}</td>
                  <td>{m.movement_type}</td>
                  <td>{m.kilos} kg</td>
                  <td>{m.spoilage_loss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;