import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminBabuyanSales = () => {
  const [batches, setBatches] = useState([]);
  const [sales, setSales] = useState([]);

  const [batchId, setBatchId] = useState('');
  const [liveWeightKg, setLiveWeightKg] = useState('');
  const [pricePerKilo, setPricePerKilo] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [isReviewing, setIsReviewing] = useState(false);

  // Live review of computed income = live weight (kg) x price per kilo
  const computedIncome = (Number(liveWeightKg) || 0) * (Number(pricePerKilo) || 0);

  const loadBabuyanSales = async () => {
    const res = await api.get('/babuyan/hog-sales');
    setBatches(res.data.batches);
    setSales(res.data.sales);
  };

  useEffect(() => {
    loadBabuyanSales();
  }, []);

  const handleReview = (e) => {
    e.preventDefault();
    setIsReviewing(true);
  };

  const handleConfirmSave = async () => {
    await api.post('/babuyan/hog-sales', {
      batch_id: batchId,
      live_weight_kg: liveWeightKg,
      price_per_kilo: pricePerKilo,
      sale_date: saleDate,
    });

    setBatchId('');
    setLiveWeightKg('');
    setPricePerKilo('');
    setIsReviewing(false);
    loadBabuyanSales();
  };

  return (
    <div>
      <h2>Admin - Babuyan Hog Sales Recording</h2>

      {/* Admin-only Hog Sales Form */}
      <form onSubmit={handleReview}>
        <div>
          <label>Select Pig Batch:</label>
          <select
            value={batchId}
            onChange={(e) => {
              setBatchId(e.target.value);
              setIsReviewing(false);
            }}
            required
          >
            <option value="">-- Select Batch --</option>
            {batches.map((b) => (
              <option key={b.batch_id} value={b.batch_id}>
                {b.batch_name ? ${b.batch_id} - ${b.batch_name} : b.batch_id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Live Weight Sold (kg):</label>
          <input
            type="number"
            step="0.01"
            value={liveWeightKg}
            onChange={(e) => {
              setLiveWeightKg(e.target.value);
              setIsReviewing(false);
            }}
            required
          />
        </div>

        <div>
          <label>Price per Kilo:</label>
          <input
            type="number"
            step="0.01"
            value={pricePerKilo}
            onChange={(e) => {
              setPricePerKilo(e.target.value);
              setIsReviewing(false);
            }}
            required
          />
        </div>

        <div>
          <label>Sale Date:</label>
          <input
            type="date"
            value={saleDate}
            onChange={(e) => {
              setSaleDate(e.target.value);
              setIsReviewing(false);
            }}
            required
          />
        </div>

        <div>
          <strong>Computed Income: {computedIncome.toFixed(2)}</strong>
        </div>

        {!isReviewing ? (
          <button type="submit">Review Income Before Saving</button>
        ) : (
          <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
            <p>
              <strong>Review Hog Sale Details:</strong><br />
              Batch: {batchId}<br />
              Live Weight: {liveWeightKg} kg<br />
              Price per Kilo: {pricePerKilo}<br />
              Computed Income: <strong>{computedIncome.toFixed(2)}</strong><br />
              Sale Date: {saleDate}
            </p>
            <button type="button" onClick={handleConfirmSave}>Confirm & Save Sale</button>
            <button type="button" onClick={() => setIsReviewing(false)} style={{ marginLeft: '8px' }}>
              Edit Details
            </button>
          </div>
        )}
      </form>

      {/* Separate Babuyan Sales Records Table */}
      <h3>Babuyan Hog Sales Records</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Batch</th>
            <th>Live Weight (kg)</th>
            <th>Price / kg</th>
            <th>Computed Income</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.sale_date}</td>
              <td>{sale.batch_name ? ${sale.batch_id} (${sale.batch_name}) : sale.batch_id}</td>
              <td>{sale.live_weight_kg} kg</td>
              <td>{sale.price_per_kilo}</td>
              <td>{sale.total_revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBabuyanSales;