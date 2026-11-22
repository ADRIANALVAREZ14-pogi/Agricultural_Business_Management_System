import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Audit = () => {
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemName, setItemName] = useState('');
  const [systemQuantity, setSystemQuantity] = useState('');
  const [countedQuantity, setCountedQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [approved, setApproved] = useState(true);
  const [adjustmentLogs, setAdjustmentLogs] = useState([]);

  const loadAdjustmentLogs = async () => {
    const res = await api.get('/gulayan/audit-log');
    setAdjustmentLogs(res.data);
  };

  useEffect(() => {
    loadAdjustmentLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/gulayan/audit', {
      audit_date: auditDate,
      item_name: itemName,
      system_quantity: systemQuantity,
      counted_quantity: countedQuantity,
      reason,
      approved,
    });

    setItemName('');
    setSystemQuantity('');
    setCountedQuantity('');
    setReason('');
    loadAdjustmentLogs();
  };

  return (
    <div>
      <h2>Admin - Gulayan Monthly Physical Audit</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Audit Date:</label>
          <input
            type="date"
            value={auditDate}
            onChange={(e) => setAuditDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Item:</label>
          <input
            type="text"
            placeholder="Vegetable"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>System Quantity (kg):</label>
          <input
            type="number"
            step="0.01"
            value={systemQuantity}
            onChange={(e) => setSystemQuantity(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Counted Quantity (kg):</label>
          <input
            type="number"
            step="0.01"
            value={countedQuantity}
            onChange={(e) => setCountedQuantity(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Reason:</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={approved}
              onChange={(e) => setApproved(e.target.checked)}
            />
            Approve Correction
          </label>
        </div>

        <button type="submit">Submit Audit</button>
      </form>

      <h3>Stock-Adjustment Log</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Item</th>
            <th>Difference</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {adjustmentLogs.map((log) => (
            <tr key={log.id}>
              <td>{log.audit_date}</td>
              <td>{log.item_name}</td>
              <td>{log.difference} kg</td>
              <td>{log.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Audit;