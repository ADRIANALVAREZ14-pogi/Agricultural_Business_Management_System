import React, { useState, useEffect } from 'react';
import api from '../services/api';

const BabuyanStaffUsage = () => {
  const [inventory, setInventory] = useState([]);
  const [usageRecords, setUsageRecords] = useState([]);

  const [inventoryId, setInventoryId] = useState('');
  const [quantityReleased, setQuantityReleased] = useState('');
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    const res = await api.get('/babuyan/inventory-usage');
    setInventory(res.data.inventory);
    setUsageRecords(res.data.usageRecords);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await api.put(/babuyan/usage/${editId}, {
        quantity_released: quantityReleased,
        release_date: releaseDate,
      });
    } else {
      await api.post('/babuyan/usage', {
        inventory_id: inventoryId,
        quantity_released: quantityReleased,
        release_date: releaseDate,
      });
    }
    setEditId(null);
    setInventoryId('');
    setQuantityReleased('');
    loadData();
  };

  const handleEdit = (rec) => {
    setEditId(rec.id);
    setInventoryId(rec.inventory_id);
    setQuantityReleased(rec.quantity_released);
    setReleaseDate(rec.release_date);
  };

  return (
    <div>
      <h2>Babuyan Inventory & Usage Matching</h2>

      {/* Mismatch Warning Banner */}
      {inventory.some((item) => Boolean(item.has_mismatch)) && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', marginBottom: '12px' }}>
          <strong>Mismatch Warning:</strong> Released usage records and Babuyan inventory do not agree. Please review and edit usage records to match inventory.
        </div>
      )}

      {/* View Babuyan Inventory */}
      <h3>Babuyan Inventory</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Item</th>
            <th>Available Stock</th>
            <th>Total Released</th>
            <th>Matching Status</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.category}</td>
              <td>{item.item_name}</td>
              <td>{item.current_quantity} {item.unit}</td>
              <td>{item.total_released} {item.unit}</td>
              <td>
                {Boolean(item.has_mismatch) ? (
                  <span style={{ color: 'red', fontWeight: 'bold' }}>Mismatch Warning</span>
                ) : (
                  <span>Matched</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Record or Edit Released Feeds, Medicine, and Vitamins */}
      <h3>{editId ? 'Edit Released Usage Record' : 'Record Released Feeds, Medicine, or Vitamins'}</h3>
      <form onSubmit={handleSubmit}>
        {!editId && (
          <div>
            <label>Select Item:</label>
            <select value={inventoryId} onChange={(e) => setInventoryId(e.target.value)} required>
              <option value="">-- Choose Item --</option>
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.category}] {item.item_name} ({item.current_quantity} {item.unit} available)
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label>Quantity Released:</label>
          <input
            type="number"
            step="0.01"
            value={quantityReleased}
            onChange={(e) => setQuantityReleased(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Release Date:</label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            required
          />
        </div>

        <button type="submit">{editId ? 'Update Usage Record' : 'Record Release'}</button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setInventoryId('');
              setQuantityReleased('');
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Released Usage Records Table */}
      <h3>Released Usage Records</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Item</th>
            <th>Quantity Released</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {usageRecords.map((rec) => (
            <tr key={rec.id}>
              <td>{rec.release_date}</td>
              <td>{rec.category}</td>
              <td>{rec.item_name}</td>
              <td>{rec.quantity_released} {rec.unit}</td>
              <td>
                <button type="button" onClick={() => handleEdit(rec)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BabuyanStaffUsage;