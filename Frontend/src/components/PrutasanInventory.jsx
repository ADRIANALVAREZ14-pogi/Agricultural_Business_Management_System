import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PrutasanInventory = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadPrutasanStock = async () => {
      const res = await api.get('/inventory/Prutasan');
      setItems(res.data);
    };
    loadPrutasanStock();
  }, []);

  return (
    <div>
      <h2>Prutasan Inventory</h2>
      <table>
        <thead>
          <tr>
            <th>Fruit</th>
            <th>Kilos</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.item_name}</td>
              <td>{item.kilos} kg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrutasanInventory;