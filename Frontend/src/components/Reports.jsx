import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadGulayanSummary = async () => {
      const res = await api.get(/reports/gulayan-summary?month=${month});
      setSummary(res.data);
    };
    loadGulayanSummary();
  }, [month]);

  // Using shared print and export (PDF & Excel) engine (4.5)
  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const res = await api.post(
      '/reports/export/pdf',
      { reportType: 'gulayan-summary', month, data: summary },
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', Gulayan_Summary_${month}.pdf);
    document.body.appendChild(link);
    link.click();
  };

  const handleExportExcel = async () => {
    const res = await api.post(
      '/reports/export/excel',
      { reportType: 'gulayan-summary', month, data: summary },
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', Gulayan_Summary_${month}.xlsx);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <h2>Gulayan Sales and Expense Summary</h2>

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

      {summary && (
        <div>
          <h3>Gulayan Monthly Sales Summary ({summary.month})</h3>
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

          <h3>Gulayan Expenses by Category ({summary.month})</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
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
    </div>
  );
};

export default Reports;