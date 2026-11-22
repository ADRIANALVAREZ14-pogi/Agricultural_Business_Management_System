import React from 'react';
import BabuyanStaffUsage from './BabuyanStaffUsage';

const BabuyanStaffInterface = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fdf2f8', color: '#831843' }}>
      <header style={{ backgroundColor: '#be185d', color: '#ffffff', padding: '16px' }}>
        <h1>Babuyan Department - Staff Portal</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
          Inventory Monitoring (Feeds, Medicine, Vitamins) &amp; Release Recording
        </p>
      </header>

      <main style={{ padding: '20px' }}>
        <BabuyanStaffUsage />
      </main>
    </div>
  );
};

export default BabuyanStaffInterface;