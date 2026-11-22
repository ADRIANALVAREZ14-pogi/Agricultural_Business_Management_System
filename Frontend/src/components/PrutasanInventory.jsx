import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PrutasanInventory = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadPrutasanStock = async () => {
      const res = await api.get('/prutasan/indicators');
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
            <th>Indicators</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.item_name}</td>
              <td>{item.kilos} kg</td>
              <td>
                {Boolean(item.is_low_stock) && <span>[Low Stock] </span>}
                {Boolean(item.has_spoilage) && <span>[Spoilage Recorded]</span>}
                {!item.is_low_stock && !item.has_spoilage && <span>Normal</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrutasanInventory;