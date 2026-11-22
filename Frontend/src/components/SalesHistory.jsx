import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SalesHistory = ({ userRole }) => {
  const [sales, setSales] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    const fetchGulayanSales = async () => {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (productSearch) params.product = productSearch;

      const res = await api.get('/gulayan/sales', { params });
      setSales(res.data);
    };

    if (userRole === 'Admin' || userRole === 'Gulayan Staff') {
      fetchGulayanSales();
    }
  }, [dateFilter, productSearch, userRole]);

  if (userRole !== 'Admin' && userRole !== 'Gulayan Staff') {
    return null;
  }

  return (
    <div>
      <h2>
        {userRole === 'Admin'
          ? 'Gulayan Sales Records (Gulayan Department)'
          : 'Gulayan Sales Records'}
      </h2>

      <div>
        <input
          type="text"
          placeholder="Search product"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
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
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.product}</td>
              <td>{sale.kilos}</td>
              <td>{sale.price_per_kilo}</td>
              <td>{sale.payment_method}</td>
              <td>{sale.total_amount}</td>
              <td>{sale.sale_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesHistory;
