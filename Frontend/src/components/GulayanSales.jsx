import React, { useState } from 'react';
import api from '../services/api';

const GulayanSales = () => {
  const [vegetable, setVegetable] = useState('');
  const [kilos, setKilos] = useState('');
  const [pricePerKilo, setPricePerKilo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const handleReview = (e) => {
    e.preventDefault();
    setIsReviewing(true);
  };

  const handleSubmit = async () => {
    const date = new Date().toISOString().split('T')[0];
    const totalAmount = Number(kilos) * Number(pricePerKilo);

    await api.post('/gulayan/sales', {
      vegetable,
      kilos,
      price_per_kilo: pricePerKilo,
      payment_method: paymentMethod,
      date,
      total_amount: totalAmount,
    });

    setVegetable('');
    setKilos('');
    setPricePerKilo('');
    setPaymentMethod('');
    setIsReviewing(false);
  };

  return (
    <div>
      {!isReviewing ? (
        <form onSubmit={handleReview}>
          <div>
            <label>Vegetable</label>
            <select value={vegetable} onChange={(e) => setVegetable(e.target.value)} required>
              <option value="">Select vegetable</option>
              <option value="Kamatis">Kamatis</option>
              <option value="Sibuyas">Sibuyas</option>
              <option value="Talong">Talong</option>
              <option value="Repolyo">Repolyo</option>
            </select>
          </div>

          <div>
            <label>Kilos</label>
            <input
              type="number"
              step="0.01"
              value={kilos}
              onChange={(e) => setKilos(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Price per Kilo</label>
            <input
              type="number"
              step="0.01"
              value={pricePerKilo}
              onChange={(e) => setPricePerKilo(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
              <option value="">Select payment method</option>
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <button type="submit">Review</button>
        </form>
      ) : (
        <div>
          <p>Vegetable: {vegetable}</p>
          <p>Kilos: {kilos}</p>
          <p>Price per Kilo: {pricePerKilo}</p>
          <p>Payment Method: {paymentMethod}</p>

          <button type="button" onClick={() => setIsReviewing(false)}>Back</button>
          <button type="button" onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default GulayanSales;