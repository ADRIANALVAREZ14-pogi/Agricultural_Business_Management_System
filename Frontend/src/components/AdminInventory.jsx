import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [itemName, setItemName] = useState('');
  const [kilos, setKilos] = useState('');
  const [purchaseCostPerKilo, setPurchaseCostPerKilo] = useState('');

  const loadGulayanStock = async () => {
    const res = await api.get('/inventory/Gulayan');
    setItems(res.data);
  };

  useEffect(() => {
    loadGulayanStock();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await api.put(/inventory/${editId}, {
        item_name: itemName,
        kilos,
        purchase_cost_per_kilo: purchaseCostPerKilo,
      });
    } else {
      await api.post('/inventory', {
        department: 'Gulayan',
        item_name: itemName,
        kilos,
        purchase_cost_per_kilo: purchaseCostPerKilo,
      });
    }
    setEditId(null);
    setItemName('');
    setKilos('');
    setPurchaseCostPerKilo('');
    loadGulayanStock();
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setItemName(item.item_name);
    setKilos(item.kilos);
    setPurchaseCostPerKilo(item.purchase_cost_per_kilo);
  };

  const handleDelete = async (id) => {
    await api.delete(/inventory/${id});
    loadGulayanStock();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
          placeholder="Kilos"
          value={kilos}
          onChange={(e) => setKilos(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Purchase Cost per Kilo"
          value={purchaseCostPerKilo}
          onChange={(e) => setPurchaseCostPerKilo(e.target.value)}
          required
        />
        <button type="submit">{editId ? 'Update' : 'Add'}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Vegetable</th>
            <th>Kilos</th>
            <th>Purchase Cost per Kilo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.item_name}</td>
              <td>{item.kilos} kg</td>
              <td>{item.purchase_cost_per_kilo}</td>
              <td>
                <button type="button" onClick={() => handleEdit(item)}>Edit</button>
                <button type="button" onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminInventory;