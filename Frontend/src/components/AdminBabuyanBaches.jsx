import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminBabuyanBatches = () => {
  const [batches, setBatches] = useState([]);
  const [editId, setEditId] = useState(null);

  const [batchId, setBatchId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [numberOfHeads, setNumberOfHeads] = useState('');
  const [capitalCost, setCapitalCost] = useState('');

  const loadBatches = async () => {
    const res = await api.get('/babuyan/batches');
    setBatches(res.data);
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      batch_id: batchId,
      batch_name: batchName,
      purchase_date: purchaseDate,
      number_of_heads: numberOfHeads,
      capital_cost: capitalCost,
    };

    if (editId) {
      await api.put(/babuyan/batches/${editId}, payload);
    } else {
      await api.post('/babuyan/batches', payload);
    }

    setEditId(null);
    setBatchId('');
    setBatchName('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setNumberOfHeads('');
    setCapitalCost('');
    loadBatches();
  };

  const handleEdit = (batch) => {
    setEditId(batch.id);
    setBatchId(batch.batch_id);
    setBatchName(batch.batch_name || '');
    setPurchaseDate(batch.purchase_date);
    setNumberOfHeads(batch.number_of_heads);
    setCapitalCost(batch.capital_cost);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setBatchId('');
    setBatchName('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setNumberOfHeads('');
    setCapitalCost('');
  };

  return (
    <div>
      <h2>Admin - Livestock & Pig Batch Records Management</h2>

      {/* Add / Edit Livestock Batch Form */}
      <h3>{editId ? 'Edit Pig Batch' : 'Add Livestock (New Pig Batch)'}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Batch ID:</label>
          <input
            type="text"
            placeholder="e.g., BATCH-2026-01"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Batch Label / Notes (Optional):</label>
          <input
            type="text"
            placeholder="e.g., Pen A Growers"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
          />
        </div>

        <div>
          <label>Purchase Date:</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Number of Heads:</label>
          <input
            type="number"
            min="1"
            value={numberOfHeads}
            onChange={(e) => setNumberOfHeads(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Capital Cost:</label>
          <input
            type="number"
            step="0.01"
            value={capitalCost}
            onChange={(e) => setCapitalCost(e.target.value)}
            required
          />
        </div>

        <button type="submit">{editId ? 'Update Batch' : 'Add Livestock'}</button>
        {editId && (
          <button type="button" onClick={handleCancelEdit} style={{ marginLeft: '8px' }}>
            Cancel
          </button>
        )}
      </form>

      {/* Pig Batches List with Expected Selling Date & Cycle Countdown */}
      <h3>Pig Batch Records</h3>
      <table>
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Batch Label</th>
            <th>Purchase Date</th>
            <th>Number of Heads</th>
            <th>Capital Cost</th>
            <th>Expected Selling Date (~4 mos)</th>
            <th>Cycle Countdown</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => (
            <tr key={b.id}>
              <td>{b.batch_id}</td>
              <td>{b.batch_name || '-'}</td>
              <td>{b.purchase_date}</td>
              <td>{b.number_of_heads} heads</td>
              <td>{b.capital_cost}</td>
              <td>{b.expected_selling_date}</td>
              <td>
                {b.remaining_days > 0 ? (
                  <span><strong>{b.remaining_days} days</strong> remaining</span>
                ) : b.remaining_days === 0 ? (
                  <strong>Ready to Sell Today</strong>
                ) : (
                  <span><strong>{Math.abs(b.remaining_days)} days</strong> past expected selling date</span>
                )}
              </td>
              <td>
                <button type="button" onClick={() => handleEdit(b)}>
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

export default AdminBabuyanBatches;