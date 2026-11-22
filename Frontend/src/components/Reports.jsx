import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
  const [department, setDepartment] = useState('Gulayan');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // Gulayan state (1.8 & 1.9)
  const [gulayanSummary, setGulayanSummary] = useState(null);
  const [gulayanMonthlyReport, setGulayanMonthlyReport] = useState(null);

  // Prutasan state (2.8)
  const [prutasanSummary, setPrutasanSummary] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      if (department === 'Gulayan') {
        const [summaryRes, monthlyRes] = await Promise.all([
          api.get(`/reports/gulayan-summary?month=${month}`),
          api.get(`/reports/gulayan-monthly?month=${month}`),
        ]);
        setGulayanSummary(summaryRes.data);
        setGulayanMonthlyReport(monthlyRes.data);
      } else if (department === 'Prutasan') {
        const summaryRes = await api.get(`/reports/prutasan-summary?month=${month}`);
        setPrutasanSummary(summaryRes.data);
      }
    };
    loadReports();
  }, [department, month]);

  // Shared print and export (PDF & Excel) engine (4.5)
  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const payload =
      department === 'Gulayan'
        ? { reportType: 'gulayan', month, summary: gulayanSummary, monthlyReport: gulayanMonthlyReport }
        : { reportType: 'prutasan', month, summary: prutasanSummary };

    const res = await api.post('/reports/export/pdf', payload, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${department}_Report_${month}.pdf`);
    document.body.appendChild(link);
    link.click();
  };

  const handleExportExcel = async () => {
    const payload =
      department === 'Gulayan'
        ? { reportType: 'gulayan', month, summary: gulayanSummary, monthlyReport: gulayanMonthlyReport }
        : { reportType: 'prutasan', month, summary: prutasanSummary };

    const res = await api.post('/reports/export/excel', payload, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${department}_Report_${month}.xlsx`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <h2>Department Reports</h2>

      <div>
        <label>Select Department: </label>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="Gulayan">Gulayan</option>
          <option value="Prutasan">Prutasan</option>
        </select>

        <label style={{ marginLeft: '12px' }}>Select Month: </label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      <div style={{ marginTop: '10px' }}>
        <button type="button" onClick={handlePrint}>Print</button>
        <button type="button" onClick={handleExportPDF}>Export PDF</button>
        <button type="button" onClick={handleExportExcel}>Export Excel</button>
      </div>

      {/* ========================================== */}
      {/* GULAYAN REPORTS (1.8 & 1.9)                */}
      {/* ========================================== */}
      {department === 'Gulayan' && gulayanSummary && (
        <div>
          <h3>Gulayan Sales and Expense Summary ({gulayanSummary.month})</h3>
          <table>
            <thead>
              <tr>
                <th>Total Kilos Sold</th>
                <th>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{gulayanSummary.salesSummary?.total_kilos_sold} kg</td>
                <td>{gulayanSummary.salesSummary?.total_sales}</td>
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
              {gulayanSummary.expenseByCategory.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.category}</td>
                  <td>{item.category_total}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Total Expenses</strong></td>
                <td><strong>{gulayanSummary.totalExpenses}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {department === 'Gulayan' && gulayanMonthlyReport && (
        <div>
          <h3>Gulayan Monthly Report ({gulayanMonthlyReport.month})</h3>
          <table>
            <tbody>
              <tr>
                <td>Sales</td>
                <td>{gulayanMonthlyReport.sales}</td>
              </tr>
              <tr>
                <td>Cost of Goods Sold</td>
                <td>{gulayanMonthlyReport.costOfGoodsSold}</td>
              </tr>
              <tr>
                <td>Expenses</td>
                <td>{gulayanMonthlyReport.expenses}</td>
              </tr>
              <tr>
                <td>Spoilage Loss ({gulayanMonthlyReport.spoilage.total_kilos} kg)</td>
                <td>{gulayanMonthlyReport.spoilage.total_loss}</td>
              </tr>
              <tr>
                <td><strong>Net Profit</strong></td>
                <td><strong>{gulayanMonthlyReport.netProfit}</strong></td>
              </tr>
            </tbody>
          </table>

          <h4>Stock Movement ({gulayanMonthlyReport.month})</h4>
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
              {gulayanMonthlyReport.stockMovements.map((m, idx) => (
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

      {/* ========================================== */}
      {/* PRUTASAN REPORTS (2.8)                     */}
      {/* ========================================== */}
      {department === 'Prutasan' && prutasanSummary && (
        <div>
          <h3>Prutasan Sales and Expense Summary ({prutasanSummary.month})</h3>
          <table>
            <thead>
              <tr>
                <th>Total Kilos Sold</th>
                <th>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{prutasanSummary.salesSummary?.total_kilos_sold} kg</td>
                <td>{prutasanSummary.salesSummary?.total_sales}</td>
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
              {prutasanSummary.expenseByCategory.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.category}</td>
                  <td>{item.category_total}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Total Expenses</strong></td>
                <td><strong>{prutasanSummary.totalExpenses}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;