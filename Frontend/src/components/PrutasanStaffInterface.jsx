import React, { useState } from 'react';
import PrutasanSales from './PrutasanSales';
import PrutasanInventory from './PrutasanInventory';

const PrutasanStaffInterface = () => {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffbeb', color: '#78350f' }}>
      <header style={{ backgroundColor: '#d97706', color: '#ffffff', padding: '16px' }}>
        <h1>Prutasan Department - Staff Portal</h1>
        <nav style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            style={{
              backgroundColor: activeTab === 'sales' ? '#b45309' : '#f59e0b',
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
              backgroundColor: activeTab === 'inventory' ? '#b45309' : '#f59e0b',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
            }}
          >
            Prutasan Inventory (Read-Only)
          </button>
        </nav>
      </header>

      <main style={{ padding: '20px' }}>
        {activeTab === 'sales' && <PrutasanSales />}
        {activeTab === 'inventory' && <PrutasanInventory />}
      </main>
    </div>
  );
};

export default PrutasanStaffInterface;