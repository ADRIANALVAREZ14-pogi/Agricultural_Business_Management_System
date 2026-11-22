import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PrutasanStockMovement = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentStock, setCurrentStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [closing, setClosing] = useState([]);

  // Admin spoilage entry form state
  const [spoilageFruit, setSpoilageFruit] = useState('');
  const [spoilageKilos, setSpoilageKilos] = useState('');
  const [spoilageReason, setSpoilageReason] = useState('');

  // Stock addition (delivery/purchase) state
  const [inFruit, setInFruit] = useState('');
  const [inKilos, setInKilos] = useState('');

  const loadData = async () => {
    const res = await api.get(`/prutasan/movements-closing?date=${date}`);
    setCurrentStock(res.data.currentStock);
    setMovements(res.data.movements);
    setClosing(res.data.closing);
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const handleStockAddition = async (e) => {
    e.preventDefault();
    await api.post('/prutasan/movements', {
      item_name: inFruit,
      movement_type: 'IN',
      kilos: inKilos,
      movement_date: date,
    });
    setInFruit('');
    setInKilos('');
    loadData();
  };

  const handleSpoilageSubmit = async (e) => {
    e.preventDefault();
    await api.post('/prutasan/movements', {
      item_name: spoilageFruit,
      movement_type: 'OUT_SPOILAGE',
      kilos: spoilageKilos,
      reason: spoilageReason,
      movement_date: date,
    });
    setSpoilageFruit('');
    setSpoilageKilos('');
    setSpoilageReason('');
    loadData();
  };

  const handleComputeDailyClosing = async () => {
    await api.post('/prutasan/daily-closing', { date });
    loadData();
  };

  return (
    <div>
      <h2>Prutasan Stock Movement & End-of-Day Closing</h2>

      <div>
        <label>Select Date: </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Record Stock Additions (Deliveries / Purchases) */}
      <h3>Record Stock Addition (Delivery / Purchase)</h3>
      <form onSubmit={handleStockAddition}>
        <select value={inFruit} onChange={(e) => setInFruit(e.target.value)} required>
          <option value="">-- Select Fruit --</option>
          {currentStock.map((item) => (
            <option key={item.id} value={item.item_name}>
              {item.item_name}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Kilos Added"
          value={inKilos}
          onChange={(e) => setInKilos(e.target.value)}
          required
        />
        <button type="submit">Add Delivery</button>
      </form>

      {/* Admin Spoilage Entry Form */}
      <h3>Admin Spoilage Entry Form</h3>
      <form onSubmit={handleSpoilageSubmit}>
        <select value={spoilageFruit} onChange={(e) => setSpoilageFruit(e.target.value)} required>
          <option value="">-- Select Fruit --</option>
          {currentStock.map((item) => (
            <option key={item.id} value={item.item_name}>
              {item.item_name}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Spoiled Kilos"
          value={spoilageKilos}
          onChange={(e) => setSpoilageKilos(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Spoilage Note / Reason"
          value={spoilageReason}
          onChange={(e) => setSpoilageReason(e.target.value)}
        />
        <button type="submit">Record Spoilage</button>
      </form>

      {/* Current Stock in kg */}
      <h3>Current Prutasan Stock (kg)</h3>
      <table>
        <thead>
          <tr>
            <th>Fruit</th>
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

      {/* Daily Stock Movement Log (In/Out) */}
      <h3>Daily Stock Movement Log ({date})</h3>
      <table>
        <thead>
          <tr>
            <th>Fruit</th>
            <th>Movement Type</th>
            <th>Kilos</th>
            <th>Spoilage Loss</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <td>{m.item_name}</td>
              <td>{m.movement_type}</td>
              <td>{m.kilos} kg</td>
              <td>{m.spoilage_loss}</td>
              <td>{m.reason || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* End-of-Day Stock in kg */}
      <h3>End-of-Day Closing Stock ({date})</h3>
      <button type="button" onClick={handleComputeDailyClosing}>
        Compute End-of-Day Closing
      </button>
      <table>
        <thead>
          <tr>
            <th>Fruit</th>
            <th>End-of-Day Stock (kg)</th>
          </tr>
        </thead>
        <tbody>
          {closing.map((c, idx) => (
            <tr key={idx}>
              <td>{c.item_name}</td>
              <td>{c.closing_kilos} kg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrutasanStockMovement;