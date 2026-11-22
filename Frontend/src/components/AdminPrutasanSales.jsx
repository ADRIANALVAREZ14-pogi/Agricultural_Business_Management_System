import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminInventory = () => {
  // Gulayan State (1.3 & 1.5)
  const [gulayanItems, setGulayanItems] = useState([]);
  const [gulayanEditId, setGulayanEditId] = useState(null);
  const [gulayanName, setGulayanName] = useState('');
  const [gulayanKilos, setGulayanKilos] = useState('');
  const [gulayanCost, setGulayanCost] = useState('');

  // Prutasan State (2.3)
  const [prutasanItems, setPrutasanItems] = useState([]);
  const [prutasanEditId, setPrutasanEditId] = useState(null);
  const [prutasanName, setPrutasanName] = useState('');
  const [prutasanKilos, setPrutasanKilos] = useState('');
  const [prutasanCost, setPrutasanCost] = useState('');

  const loadGulayanStock = async () => {
    const res = await api.get('/gulayan/indicators');
    setGulayanItems(res.data);
  };

  const loadPrutasanStock = async () => {
    const res = await api.get('/inventory/Prutasan');
    setPrutasanItems(res.data);
  };

  useEffect(() => {
    loadGulayanStock();
    loadPrutasanStock();
  }, []);

  // Gulayan Handlers
  const handleGulayanSubmit = async (e) => {
    e.preventDefault();
    if (gulayanEditId) {
      await api.put(`/inventory/${gulayanEditId}`, {
        item_name: gulayanName,
        kilos: gulayanKilos,
        purchase_cost_per_kilo: gulayanCost,
      });
    } else {
      await api.post('/inventory', {
        department: 'Gulayan',
        item_name: gulayanName,
        kilos: gulayanKilos,
        purchase_cost_per_kilo: gulayanCost,
      });
    }
    setGulayanEditId(null);
    setGulayanName('');
    setGulayanKilos('');
    setGulayanCost('');
    loadGulayanStock();
  };

  const handleGulayanEdit = (item) => {
    setGulayanEditId(item.id);
    setGulayanName(item.item_name);
    setGulayanKilos(item.kilos);
    setGulayanCost(item.purchase_cost_per_kilo);
  };

  const handleGulayanDelete = async (id) => {
    await api.delete(`/inventory/${id}`);
    loadGulayanStock();
  };

  // Prutasan Handlers (2.3)
  const handlePrutasanSubmit = async (e) => {
    e.preventDefault();
    if (prutasanEditId) {
      await api.put(`/inventory/${prutasanEditId}`, {
        item_name: prutasanName,
        kilos: prutasanKilos,
        purchase_cost_per_kilo: prutasanCost,
      });
    } else {
      await api.post('/inventory', {
        department: 'Prutasan',
        item_name: prutasanName,
        kilos: prutasanKilos,
        purchase_cost_per_kilo: prutasanCost,
      });
    }
    setPrutasanEditId(null);
    setPrutasanName('');
    setPrutasanKilos('');
    setPrutasanCost('');
    loadPrutasanStock();
  };

  const handlePrutasanEdit = (item) => {
    setPrutasanEditId(item.id);
    setPrutasanName(item.item_name);
    setPrutasanKilos(item.kilos);
    setPrutasanCost(item.purchase_cost_per_kilo);
  };

  const handlePrutasanDelete = async (id) => {
    await api.delete(`/inventory/${id}`);
    loadPrutasanStock();
  };

  return (
    <div>
      {/* 1.3 & 1.5 GULAYAN INVENTORY */}
      <h2>Admin - Gulayan Inventory Management</h2>
      <form onSubmit={handleGulayanSubmit}>
        <input
          type="text"
          placeholder="Vegetable"
          value={gulayanName}
          onChange={(e) => setGulayanName(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Kilos"
          value={gulayanKilos}
          onChange={(e) => setGulayanKilos(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Purchase Cost per Kilo"
          value={gulayanCost}
          onChange={(e) => setGulayanCost(e.target.value)}
          required
        />
        <button type="submit">{gulayanEditId ? 'Update' : 'Add'}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Vegetable</th>
            <th>Kilos</th>
            <th>Purchase Cost per Kilo</th>
            <th>Indicators</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {gulayanItems.map((item) => (
            <tr key={item.id}>
              <td>{item.item_name}</td>
              <td>{item.kilos} kg</td>
              <td>{item.purchase_cost_per_kilo}</td>
              <td>
                {Boolean(item.is_low_stock) && <span>[Low Stock] </span>}
                {Boolean(item.has_spoilage) && <span>[Spoilage Recorded]</span>}
                {!item.is_low_stock && !item.has_spoilage && <span>Normal</span>}
              </td>
              <td>
                <button type="button" onClick={() => handleGulayanEdit(item)}>Edit</button>
                <button type="button" onClick={() => handleGulayanDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      {/* 2.3 PRUTASAN INVENTORY */}
      <h2>Admin - Prutasan Inventory Management</h2>
      <form onSubmit={handlePrutasanSubmit}>
        <input
          type="text"
          placeholder="Fruit"
          value={prutasanName}
          onChange={(e) => setPrutasanName(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Kilos"
          value={prutasanKilos}
          onChange={(e) => setPrutasanKilos(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Purchase Cost per Kilo"
          value={prutasanCost}
          onChange={(e) => setPrutasanCost(e.target.value)}
          required
        />
        <button type="submit">{prutasanEditId ? 'Update' : 'Add'}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Fruit</th>
            <th>Kilos</th>
            <th>Purchase Cost per Kilo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {prutasanItems.map((item) => (
            <tr key={item.id}>
              <td>{item.item_name}</td>
              <td>{item.kilos} kg</td>
              <td>{item.purchase_cost_per_kilo}</td>
              <td>
                <button type="button" onClick={() => handlePrutasanEdit(item)}>Edit</button>
                <button type="button" onClick={() => handlePrutasanDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminInventory;