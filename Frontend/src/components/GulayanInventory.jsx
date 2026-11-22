import React, { useState, useEffect } from 'react';
import api from '../services/api';

const GulayanInventory = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadGulayanStock = async () => {
      const res = await api.get('/inventory/Gulayan');
      setItems(res.data);
    };
    loadGulayanStock();
  }, []);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Vegetable</th>
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

export default GulayanInventory;
