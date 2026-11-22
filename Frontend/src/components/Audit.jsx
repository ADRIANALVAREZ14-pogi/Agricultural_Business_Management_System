import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Audit = () => {
  const [department, setDepartment] = useState('Gulayan');
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);

  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemName, setItemName] = useState('');
  const [countedQuantity, setCountedQuantity] = useState('');
  const [reason, setReason] = useState('');

  const selectedItem = items.find((i) => i.item_name === itemName);
  const systemQuantity = selectedItem ? Number(selectedItem.kilos) : 0;

  const loadAuditData = async () => {
    const invRes = await api.get(`/inventory/${department}`);
    setItems(invRes.data);

    const logEndpoint = department === 'Gulayan' ? '/gulayan/audit' : '/prutasan/audit';
    const logRes = await api.get(logEndpoint);
    setLogs(logRes.data);
  };

  useEffect(() => {
    setItemName('');
    setCountedQuantity('');
    setReason('');
    loadAuditData();
  }, [department]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const postEndpoint = department === 'Gulayan' ? '/gulayan/audit' : '/prutasan/audit';

    await api.post(postEndpoint, {
      audit_date: auditDate,
      item_name: itemName,
      counted_quantity: countedQuantity,
      reason,
    });

    setItemName('');
    setCountedQuantity('');
    setReason('');
    loadAuditData();
  };

  return (
    <div>
      <h2>Monthly Physical Audit and Stock Adjustment Log</h2>

      {/* Department Selector (1.6 Gulayan & 2.6 Prutasan) */}
      <div>
        <label>Department: </label>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="Gulayan">Gulayan</option>
          <option value="Prutasan">Prutasan</option>
        </select>
      </div>

      {/* Admin Audit Form for Entering Physical Counts */}
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
          <label>Item ({department}):</label>
          <select value={itemName} onChange={(e) => setItemName(e.target.value)} required>
            <option value="">-- Select Item --</option>
            {items.map((item) => (
              <option key={item.id} value={item.item_name}>
                {item.item_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>System Quantity (kg):</label>
          <input type="number" value={systemQuantity} readOnly />
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

        <button type="submit">Approve Correction</button>
      </form>

      {/* Stock-Adjustment Log View (Date, Item, Difference, Reason) */}
      <h3>{department} Stock-Adjustment Log</h3>
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
          {logs.map((log) => (
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