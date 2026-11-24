import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BabuyanBatchReports from './BabuyanBatchReports';

const AdminReportsScreen = () => {
  const [selectedReport, setSelectedReport] = useState('Gulayan'); // 'Gulayan' | 'Prutasan' | 'Babuyan'
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportData, setReportData] = useState(null);

  const loadDepartmentReport = async () => {
    if (selectedReport === 'Babuyan') return;
    const res = await api.get('/reports/department', {
      params: { department: selectedReport, month },
    });
    setReportData(res.data);
  };

  useEffect(() => {
    loadDepartmentReport();
  }, [selectedReport, month]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const res = await api.post(
      '/reports/export/pdf',
      { department: selectedReport, month },
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', ${selectedReport}_Report_${month}.pdf);
    document.body.appendChild(link);
    link.click();
  };

  const handleExportExcel = async () => {
    const res = await api.post(
      '/reports/export/excel',
      { department: selectedReport, month },
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', ${selectedReport}_Report_${month}.xlsx);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <h2>Admin - Shared Reports &amp; Export Center</h2>

      {/* Report Selector Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setSelectedReport('Gulayan')}
          style={{ fontWeight: selectedReport === 'Gulayan' ? 'bold' : 'normal' }}
        >
          Gulayan Monthly &amp; Summary Report
        </button>
        <button
          type="button"
          onClick={() => setSelectedReport('Prutasan')}
          style={{ fontWeight: selectedReport === 'Prutasan' ? 'bold' : 'normal' }}
        >
          Prutasan Monthly &amp; Summary Report
        </button>
        <button
          type="button"
          onClick={() => setSelectedReport('Babuyan')}
          style={{ fontWeight: selectedReport === 'Babuyan' ? 'bold' : 'normal' }}
        >
          Babuyan Per-Batch Report
        </button>
      </div>

      {/* Render Babuyan Per-Batch Report (3.7) with its Print/PDF/Excel buttons */}
      {selectedReport === 'Babuyan' ? (
        <BabuyanBatchReports />
      ) : (
        <div>
          {/* Month Filter & Shared Print / PDF / Excel Export Actions */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label>Select Month: </label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>

            <button type="button" onClick={handlePrint}>
              Print Report
            </button>
            <button type="button" onClick={handleExportPDF}>
              Export PDF
            </button>
            <button type="button" onClick={handleExportExcel}>
              Export Excel
            </button>
          </div>

          {reportData && (
            <div style={{ border: '1px solid #ccc', padding: '16px' }}>
              <h3>{reportData.reportTitle} ({reportData.period})</h3>

              {/* Monthly Summary Table */}
              <h4>Financial &amp; Volume Summary</h4>
              <table>
                <thead>
                  <tr>
                    <th>Total Kilos Sold</th>
                    <th>Total Sales</th>
                    <th>Total Expenses</th>
                    <th>Spoilage Loss</th>
                    <th>Net Profit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{reportData.summaryMetrics.total_kilos_sold} kg</td>
                    <td>{reportData.summaryMetrics.total_sales.toFixed(2)}</td>
                    <td>{reportData.summaryMetrics.total_expenses.toFixed(2)}</td>
                    <td>{reportData.summaryMetrics.spoilage_loss.toFixed(2)}</td>
                    <td>
                      <strong
                        style={{
                          color: reportData.summaryMetrics.net_profit >= 0 ? 'green' : 'red',
                        }}
                      >
                        {reportData.summaryMetrics.net_profit.toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Department Sales Summary */}
              <h4>{selectedReport} Sales Summary</h4>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Item</th>
                    <th>Kilos</th>
                    <th>Price / kg</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.salesRecords.map((s) => (
                    <tr key={s.id}>
                      <td>{s.sale_date}</td>
                      <td>{s.item_name}</td>
                      <td>{s.kilos} kg</td>
                      <td>{s.price_per_kilo}</td>
                      <td>{Number(s.total_amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Department Expense Summary */}
              <h4>{selectedReport} Expense Summary</h4>
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
                  {reportData.expenseRecords.map((e) => (
                    <tr key={e.id}>
                      <td>{e.expense_date}</td>
                      <td>{e.category}</td>
                      <td>{e.description || '-'}</td>
                      <td>{Number(e.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReportsScreen;