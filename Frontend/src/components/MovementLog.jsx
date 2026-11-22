import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MovementLog = ({ isAdmin }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentStock, setCurrentStock] = useState([]);
  const [closingStock, setClosingStock] = useState([]);
  const [movements, setMovements] = useState([]);

  // Spoilage form states
  const [itemName, setItemName] = useState('');
  const [kilos, setKilos] = useState('');
  const [costPerKilo, setCostPerKilo] = useState('');

  const loadData = async () => {
    const stockRes = await api.get('/inventory/Gulayan');
    setCurrentStock(stockRes.data);

    const logRes = await api.get(/gulayan/movements?date=${date});
    setMovements(logRes.data.movements);
    setClosingStock(logRes.data.closing);
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const handleSpoilageSubmit = async (e) => {
    e.preventDefault();
    await api.post('/gulayan/movements', {
      item_name: itemName,
      movement_type: 'OUT_SPOILAGE',
      kilos,
      cost_per_kilo: costPerKilo,
      movement_date: date,
    });
    setItemName('');
    setKilos('');
    setCostPerKilo('');
    loadData();
  };

  return (
    <div>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <h3>Current Stock (kg)</h3>
      <table>
        <thead>
          <tr>
            <th>Vegetable</th>
            <th>Current Stock (kg)</th>
          </tr>
        </thead>
        <tbody>
          {currentStock.map((item) => (
            <tr key={item.id}>
              <td>{item.item_name}</td>
              <td>{item.kilos} kg</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>End-of-Day Stock (kg)</h3>
      <table>
        <thead>
          <tr>
            <th>Vegetable</th>
            <th>End-of-Day Stock (kg)</th>
          </tr>
        </thead>
        <tbody>
          {closingStock.map((item, index) => (
            <tr key={index}>
              <td>{item.item_name}</td>
              <td>{item.closing_kilos} kg</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Daily Stock Movement Log (In/Out)</h3>
      <table>
        <thead>
          <tr>
            <th>Vegetable</th>
            <th>Type (In/Out)</th>
            <th>Kilos</th>
            <th>Spoilage Loss</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <td>{m.item_name}</td>
              <td>{m.movement_type === 'IN' ? 'In' : 'Out'}</td>
              <td>{m.kilos} kg</td>
              <td>{m.spoilage_loss}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isAdmin && (
        <form onSubmit={handleSpoilageSubmit}>
          <h3>Admin Spoilage Entry</h3>
          <input
            type="text"
            placeholder="Vegetable"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Spoiled Kilos"
            value={kilos}
            onChange={(e) => setKilos(e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Cost per Kilo"
            value={costPerKilo}
            onChange={(e) => setCostPerKilo(e.target.value)}
            required
          />
          <button type="submit">Record Spoilage</button>
        </form>
      )}
    </div>
  );
};

export default MovementLog;