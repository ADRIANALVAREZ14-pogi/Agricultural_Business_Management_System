import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminBabuyanStockIn = () => {
  const [inventory, setInventory] = useState([]);
  const [category, setCategory] = useState('feeds');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');

  const unit = category === 'feeds' ? 'sacks' : 'bottles';

  const loadInventory = async () => {
    const res = await api.get('/babuyan/inventory-usage');
    setInventory(res.data.inventory);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/babuyan/stock-in', {
      category,
      item_name: itemName,
      unit,
      quantity,
    });
    setItemName('');
    setQuantity('');
    loadInventory();
  };

  return (
    <div>
      <h2>Admin - Babuyan Stock-In</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="feeds">Feeds (sacks)</option>
            <option value="medicine">Medicine (bottles)</option>
            <option value="vitamins">Vitamins (bottles)</option>
          </select>
        </div>

        <div>
          <label>Item Name:</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Quantity ({unit}):</label>
          <input
            type="number"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <button type="submit">Add Stock</button>
      </form>

      <h3>Current Babuyan Stock</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Item</th>
            <th>Current Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.category}</td>
              <td>{item.item_name}</td>
              <td>{item.current_quantity} {item.unit}</td>
              <td>
                {Boolean(item.has_mismatch) ? (
                  <strong style={{ color: 'red' }}>Mismatch Warning: Records and inventory do not agree</strong>
                ) : (
                  <span>Matched</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBabuyanStockIn;