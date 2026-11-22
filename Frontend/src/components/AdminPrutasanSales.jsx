import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminPrutasanSales = () => {
  const [records, setRecords] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [searchProduct, setSearchProduct] = useState('');

  useEffect(() => {
    const loadPrutasanRecords = async () => {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (searchProduct) params.product = searchProduct;

      const res = await api.get('/prutasan/sales', { params });
      setRecords(res.data);
    };
    loadPrutasanRecords();
  }, [filterDate, searchProduct]);

  return (
    <div>
      <h2>Admin - Prutasan Department Sales Records</h2>

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

export default AdminPrutasanSales;