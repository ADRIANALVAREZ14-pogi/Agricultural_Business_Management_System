import React, { useState } from 'react';
import GulayanSales from './GulayanSales';
import GulayanInventory from './GulayanInventory';

const GulayanStaffInterface = () => {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4', color: '#14532d' }}>
      <header style={{ backgroundColor: '#15803d', color: '#ffffff', padding: '16px' }}>
        <h1>Gulayan Department - Staff Portal</h1>
        <nav style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            style={{
              backgroundColor: activeTab === 'sales' ? '#166534' : '#22c55e',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
            }}
          >
            Add Sales (per kilo)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            style={{
              backgroundColor: activeTab === 'inventory' ? '#166534' : '#22c55e',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
            }}
          >
            Gulayan Inventory (Read-Only)
          </button>
        </nav>
      </header>

      <main style={{ padding: '20px' }}>
        {activeTab === 'sales' && <GulayanSales />}
        {activeTab === 'inventory' && <GulayanInventory />}
      </main>
    </div>
  );
};

export default GulayanStaffInterface;