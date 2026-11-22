import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PrutasanSales = () => {
  const [fruits, setFruits] = useState([]);
  const [fruit, setFruit] = useState('');
  const [kilos, setKilos] = useState('');
  const [pricePerKilo, setPricePerKilo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [isReviewing, setIsReviewing] = useState(false);

  // 2.2 Records & Filter state
  const [records, setRecords] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [searchProduct, setSearchProduct] = useState('');

  const loadPrutasanItems = async () => {
    const res = await api.get('/inventory/Prutasan');
    setFruits(res.data);
  };

  const loadSalesRecords = async () => {
    const params = {};
    if (filterDate) params.date = filterDate;
    if (searchProduct) params.product = searchProduct;

    const res = await api.get('/prutasan/sales', { params });
    setRecords(res.data);
  };

  useEffect(() => {
    loadPrutasanItems();
  }, []);

  useEffect(() => {
    loadSalesRecords();
  }, [filterDate, searchProduct]);

  const totalAmount = Number(kilos || 0) * Number(pricePerKilo || 0);

  const handleReview = (e) => {
    e.preventDefault();
    setIsReviewing(true);
  };

  const handleSubmit = async () => {
    await api.post('/prutasan/sales', {
      fruit,
      kilos,
      price_per_kilo: pricePerKilo,
      payment_method: paymentMethod,
      sale_date: saleDate,
    });

    setFruit('');
    setKilos('');
    setPricePerKilo('');
    setPaymentMethod('Cash');
    setIsReviewing(false);
    loadSalesRecords();
  };

  return (
    <div>
      <h2>Prutasan Sales Recording</h2>

      {!isReviewing ? (
        <form onSubmit={handleReview}>
          <div>
            <label>Select Fruit:</label>
            <select value={fruit} onChange={(e) => setFruit(e.target.value)} required>
              <option value="">-- Choose Fruit --</option>
              {fruits.map((item) => (
                <option key={item.id} value={item.item_name}>
                  {item.item_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Kilos:</label>
            <input
              type="number"
              step="0.01"
              value={kilos}
              onChange={(e) => setKilos(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Price per Kilo:</label>
            <input
              type="number"
              step="0.01"
              value={pricePerKilo}
              onChange={(e) => setPricePerKilo(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Payment Method:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
            </select>
          </div>

          <div>
            <label>Date:</label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              required
            />
          </div>

          <button type="submit">Review Sale</button>
        </form>
      ) : (
        <div>
          <h3>Review Prutasan Sale</h3>
          <p><strong>Fruit:</strong> {fruit}</p>
          <p><strong>Kilos:</strong> {kilos} kg</p>
          <p><strong>Price per Kilo:</strong> {pricePerKilo}</p>
          <p><strong>Payment Method:</strong> {paymentMethod}</p>
          <p><strong>Date:</strong> {saleDate}</p>
          <p><strong>Total Amount:</strong> {totalAmount}</p>

          <button type="button" onClick={() => setIsReviewing(false)}>Edit</button>
          <button type="button" onClick={handleSubmit}>Submit Sale</button>
        </div>
      )}

      {/* 2.2 Prutasan Sales Records View */}
      <h3>Prutasan Sales Records</h3>
      <div>
        <label>Filter by Date: </label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <label> Search Product: </label>
        <input
          type="text"
          placeholder="Search fruit..."
          value={searchProduct}
          onChange={(e) => setSearchProduct(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Kilos</th>
            <th>Price per Kilo</th>
            <th>Payment Method</th>
            <th>Total Amount</th>
            <th>Transaction Date</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec.id}>
              <td>{rec.product}</td>
              <td>{rec.kilos} kg</td>
              <td>{rec.price_per_kilo}</td>
              <td>{rec.payment_method}</td>
              <td>{rec.total_amount}</td>
              <td>{rec.sale_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrutasanSales;