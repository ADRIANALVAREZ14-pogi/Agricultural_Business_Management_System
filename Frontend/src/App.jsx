
Conversation with Miguel Javier
Messages
Loading...

Miguel
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Helper: Determine target route per role (4.1 & 4.3)
const getRedirectRouteByRole = (role) => {
  switch (role) {
    case 'Admin':
      return '/admin/gulayan/inventory'; // Route Admin directly to full menu (no dashboard)
    case 'Gulayan Staff':
      return '/gulayan-staff';
    case 'Prutasan Staff':
      return '/prutasan-staff';
    case 'Babuyan Staff':
      return '/babuyan-staff';
    default:
      return '/login';
  }
};

// ==========================================
// 4.1 & 4.3 LOGIN AND ROLE-BASED ROUTING
// ==========================================
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const [users] = await db.query(
      `SELECT id, username, password_hash, full_name, department, role, status
       FROM users
       WHERE username = ?
       LIMIT 1`,
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact the Admin.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
      },
      process.env.JWT_SECRET || 'farm_management_secret_key',
      { expiresIn: '8h' }
    );

    const redirectTo = getRedirectRouteByRole(user.role);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        department: user.department,
        role: user.role,
        status: user.status,
      },
      redirectTo,
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

exports.getSession = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, full_name, department, role, status
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (users.length === 0 || users[0].status !== 'active') {
      return res.status(403).json({ message: 'Session invalid or account deactivated.' });
    }

    res.status(200).json({
      user: users[0],
      redirectTo: getRedirectRouteByRole(users[0].role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify session.', error: error.message });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully.' });
};
Miguel
import React, { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import api from '../services/api';

// Department & Module Components
import GulayanInventory from './GulayanInventory';
import GulayanSales from './GulayanSales';
import PrutasanInventory from './PrutasanInventory';
import PrutasanSales from './PrutasanSales';
import AdminBabuyanStockIn from './AdminBabuyanStockIn';
import AdminBabuyanSales from './AdminBabuyanSales';
import AdminBabuyanBatches from './AdminBabuyanBatches';
import AdminBabuyanProfitability from './AdminBabuyanProfitability';
import BabuyanGrowthHealth from './BabuyanGrowthHealth';
import AdminExpenses from './AdminExpenses';
import BabuyanBatchReports from './BabuyanBatchReports';
import BabuyanAnalytics from './BabuyanAnalytics';
import AdminUserManagement from './AdminUserManagement';

const AdminInterface = ({ user, onLogout }) => {
  const [activeModal, setActiveModal] = useState(null); // 'stock' | 'expense' | 'livestock' | null

  // Quick Action 1: Add Stock State
  const [stockDept, setStockDept] = useState('Gulayan');
  const [stockCategory, setStockCategory] = useState('feeds');
  const [stockItemName, setStockItemName] = useState('');
  const [stockQty, setStockQty] = useState('');

  // Quick Action 2: Add Expense State
  const [expDept, setExpDept] = useState('Gulayan');
  const [expCategory, setExpCategory] = useState('sourcing');
  const [expBatchId, setExpBatchId] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  // Quick Action 3: Add Livestock (with purchase date) State
  const [batchId, setBatchId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [numberOfHeads, setNumberOfHeads] = useState('');
  const [capitalCost, setCapitalCost] = useState('');

  const handleQuickAddStock = async (e) => {
    e.preventDefault();
    if (stockDept === 'Babuyan') {
      const unit = stockCategory === 'feeds' ? 'sacks' : 'bottles';
      await api.post('/babuyan/stock-in', {
        category: stockCategory,
        item_name: stockItemName,
        unit,
        quantity: stockQty,
      });
    } else if (stockDept === 'Gulayan') {
      await api.post('/gulayan/inventory', {
        item_name: stockItemName,
        kilos: stockQty,
      });
    } else if (stockDept === 'Prutasan') {
      await api.post('/prutasan/inventory', {
        item_name: stockItemName,
        kilos: stockQty,
      });
    }
    setStockItemName('');
    setStockQty('');
    setActiveModal(null);
  };

  const handleQuickAddExpense = async (e) => {
    e.preventDefault();
    const endpointMap = {
      Gulayan: '/gulayan/expenses',
      Prutasan: '/prutasan/expenses',
      Babuyan: '/babuyan/expenses',
    };
    const payload = {
      category: expCategory,
      amount: expAmount,
      description: expDesc,
      expense_date: expDate,
    };
    if (expDept === 'Babuyan' && expBatchId) {
      payload.batch_id = expBatchId;
    }
    await api.post(endpointMap[expDept], payload);
    setExpAmount('');
    setExpDesc('');
    setExpBatchId('');
    setActiveModal(null);
  };

  const handleQuickAddLivestock = async (e) => {
    e.preventDefault();
    await api.post('/babuyan/batches', {
      batch_id: batchId,
      batch_name: batchName,
      purchase_date: purchaseDate,
      number_of_heads: numberOfHeads,
      capital_cost: capitalCost,
    });
    setBatchId('');
    setBatchName('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setNumberOfHeads('');
    setCapitalCost('');
    setActiveModal(null);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR FULL MENU (NO DASHBOARD) */}
      <aside style={{ width: '260px', backgroundColor: '#1e293b', color: '#f8fafc', padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Farm Admin Menu</h2>
          <small>{user?.full_name} ({user?.role})</small>
        </div>

        {/* GULAYAN MENU */}
        <div style={{ marginBottom: '14px' }}>
          <strong>Gulayan</strong>
          <ul style={{ listStyle: 'none', paddingLeft: '12px', marginTop: '6px' }}>
            <li><Link to="/admin/gulayan/inventory" style={{ color: '#cbd5e1' }}>Inventory</Link></li>
            <li><Link to="/admin/gulayan/sales" style={{ color: '#cbd5e1' }}>Sales</Link></li>
            <li><Link to="/admin/gulayan/expenses" style={{ color: '#cbd5e1' }}>Expenses</Link></li>
          </ul>
        </div>

        {/* PRUTASAN MENU */}
        <div style={{ marginBottom: '14px' }}>
          <strong>Prutasan</strong>
          <ul style={{ listStyle: 'none', paddingLeft: '12px', marginTop: '6px' }}>
            <li><Link to="/admin/prutasan/inventory" style={{ color: '#cbd5e1' }}>Inventory</Link></li>
            <li><Link to="/admin/prutasan/sales" style={{ color: '#cbd5e1' }}>Sales</Link></li>
            <li><Link to="/admin/prutasan/expenses" style={{ color: '#cbd5e1' }}>Expenses</Link></li>
          </ul>
        </div>

        {/* BABUYAN MENU */}
        <div style={{ marginBottom: '14px' }}>
          <strong>Babuyan</strong>
          <ul style={{ listStyle: 'none', paddingLeft: '12px', marginTop: '6px' }}>
            <li><Link to="/admin/babuyan/inventory" style={{ color: '#cbd5e1' }}>Inventory</Link></li>
            <li><Link to="/admin/babuyan/sales" style={{ color: '#cbd5e1' }}>Sales</Link></li>
            <li><Link to="/admin/babuyan/expenses" style={{ color: '#cbd5e1' }}>Expenses</Link></li>
            <li><Link to="/admin/babuyan/livestock" style={{ color: '#cbd5e1' }}>Livestock</Link></li>
            <li><Link to="/admin/babuyan/growth-health" style={{ color: '#cbd5e1' }}>Growth &amp; Health</Link></li>
            <li><Link to="/admin/babuyan/profitability" style={{ color: '#cbd5e1' }}>Profitability</Link></li>
          </ul>
        </div>

        {/* SYSTEM-WIDE ADMIN MENUS */}
        <div style={{ marginBottom: '14px' }}>
          <strong>Management</strong>
          <ul style={{ listStyle: 'none', paddingLeft: '12px', marginTop: '6px' }}>
            <li><Link to="/admin/reports" style={{ color: '#cbd5e1' }}>Reports</Link></li>
            <li><Link to="/admin/analytics" style={{ color: '#cbd5e1' }}>Analytics</Link></li>
            <li><Link to="/admin/users" style={{ color: '#cbd5e1' }}>User Access Management</Link></li>
          </ul>
        </div>

        <button type="button" onClick={onLogout} style={{ marginTop: '16px', width: '100%', padding: '8px' }}>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* TOP ACTION BAR: Add Stock, Add Expense, and Add Livestock (with purchase date) buttons */}
        <header style={{ backgroundColor: '#f1f5f9', padding: '12px 20px', borderBottom: '1px solid #cbd5e1', display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => setActiveModal('stock')}>
            + Add Stock
          </button>
          <button type="button" onClick={() => setActiveModal('expense')}>
            + Add Expense
          </button>
          <button type="button" onClick={() => setActiveModal('livestock')}>
            + Add Livestock
          </button>
        </header>

        {/* QUICK ACTION FORMS (MODAL / INLINE PANEL) */}
        {activeModal === 'stock' && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #94a3b8', padding: '16px', margin: '16px 20px 0' }}>
            <h3>Quick Action: Add Stock</h3>
            <form onSubmit={handleQuickAddStock}>
              <select value={stockDept} onChange={(e) => setStockDept(e.target.value)}>
                <option value="Gulayan">Gulayan</option>
                <option value="Prutasan">Prutasan</option>
                <option value="Babuyan">Babuyan</option>
              </select>
              {stockDept === 'Babuyan' && (
                <select value={stockCategory} onChange={(e) => setStockCategory(e.target.value)}>
                  <option value="feeds">Feeds (sacks)</option>
                  <option value="medicine">Medicine (bottles)</option>
                  <option value="vitamins">Vitamins (bottles)</option>
                </select>
              )}
              <input
                type="text"
                placeholder="Item Name"
                value={stockItemName}
                onChange={(e) => setStockItemName(e.target.value)}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder={stockDept === 'Babuyan' ? 'Quantity (sacks/bottles)' : 'Kilos'}
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                required
              />
              <button type="submit">Save Stock</button>
              <button type="button" onClick={() => setActiveModal(null)}>Close</button>
            </form>
          </div>
        )}

        {activeModal === 'expense' && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #94a3b8', padding: '16px', margin: '16px 20px 0' }}>
            <h3>Quick Action: Add Expense</h3>
            <form onSubmit={handleQuickAddExpense}>
              <select
                value={expDept}
                onChange={(e) => {
                  const dept = e.target.value;
                  setExpDept(dept);
                  setExpCategory(dept === 'Babuyan' ? 'feed' : 'sourcing');
                }}
              >
                <option value="Gulayan">Gulayan</option>
                <option value="Prutasan">Prutasan</option>
                <option value="Babuyan">Babuyan</option>
              </select>
              <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
                {(expDept === 'Babuyan'
                  ? ['feed', 'veterinary care', 'labor', 'utilities']
                  : ['sourcing', 'storage', 'logistics', 'labor']
                ).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {expDept === 'Babuyan' && (
                <input
                  type="text"
                  placeholder="Batch ID (Optional)"
                  value={expBatchId}
                  onChange={(e) => setExpBatchId(e.target.value)}
                />
              )}
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
              />
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                required
              />
              <button type="submit">Save Expense</button>
              <button type="button" onClick={() => setActiveModal(null)}>Close</button>
            </form>
          </div>
        )}

        {activeModal === 'livestock' && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #94a3b8', padding: '16px', margin: '16px 20px 0' }}>
            <h3>Quick Action: Add Livestock (with Purchase Date)</h3>
            <form onSubmit={handleQuickAddLivestock}>
              <input
                type="text"
                placeholder="Batch ID (e.g., BATCH-01)"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Batch Label (Optional)"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
              <label>Purchase Date: </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Number of Heads"
                value={numberOfHeads}
                onChange={(e) => setNumberOfHeads(e.target.value)}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Capital Cost"
                value={capitalCost}
                onChange={(e) => setCapitalCost(e.target.value)}
                required
              />
              <button type="submit">Add Livestock</button>
              <button type="button" onClick={() => setActiveModal(null)}>Close</button>
            </form>
          </div>
        )}

        {/* DIRECT MODULE ROUTES (NO DASHBOARD VIEW) */}
        <main style={{ padding: '20px', flex: 1 }}>
          <Routes>
            {/* Default Admin entry points directly to Gulayan Inventory (No Dashboard) */}
            <Route index element={<Navigate to="/admin/gulayan/inventory" replace />} />

            {/* Gulayan */}
            <Route path="gulayan/inventory" element={<GulayanInventory />} />
            <Route path="gulayan/sales" element={<GulayanSales />} />
            <Route path="gulayan/expenses" element={<AdminExpenses />} />

            {/* Prutasan */}
            <Route path="prutasan/inventory" element={<PrutasanInventory />} />
            <Route path="prutasan/sales" element={<PrutasanSales />} />
            <Route path="prutasan/expenses" element={<AdminExpenses />} />

            {/* Babuyan */}
            <Route path="babuyan/inventory" element={<AdminBabuyanStockIn />} />
            <Route path="babuyan/sales" element={<AdminBabuyanSales />} />
            <Route path="babuyan/expenses" element={<AdminExpenses />} />
            <Route path="babuyan/livestock" element={<AdminBabuyanBatches />} />
            <Route path="babuyan/growth-health" element={<BabuyanGrowthHealth />} />
            <Route path="babuyan/profitability" element={<AdminBabuyanProfitability />} />

            {/* Reports, Analytics, User Access Management */}
            <Route path="reports" element={<BabuyanBatchReports />} />
            <Route path="analytics" element={<BabuyanAnalytics />} />
            <Route path="users" element={<AdminUserManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminInterface;
Miguel
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';
import Login from './components/Login';
import AdminInterface from './components/AdminInterface';
import GulayanStaffInterface from './components/GulayanStaffInterface';
import PrutasanStaffInterface from './components/PrutasanStaffInterface';
import BabuyanStaffInterface from './components/BabuyanStaffInterface';

const getDefaultRoute = (role) => {
  switch (role) {
    case 'Admin':
      return '/admin/gulayan/inventory';
    case 'Gulayan Staff':
      return '/gulayan-staff';
    case 'Prutasan Staff':
      return '/prutasan-staff';
    case 'Babuyan Staff':
      return '/babuyan-staff';
    default:
      return '/login';
  }
};

// 4.3 Admin Route Guard (Routes directly to Full Menu, No Dashboard)
const AdminRoute = ({ user, onLogout }) => {
  if (!user || user.status !== 'active') return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return <Navigate to={getDefaultRoute(user.role)} replace />;
  return <AdminInterface user={user} onLogout={onLogout} />;
};

// 1.11 Gulayan Staff Route Guard
const GulayanStaffRoute = ({ user }) => {
  if (!user || user.status !== 'active') return <Navigate to="/login" replace />;
  if (user.role !== 'Gulayan Staff') return <Navigate to={getDefaultRoute(user.role)} replace />;
  return <GulayanStaffInterface />;
};

// 2.11 Prutasan Staff Route Guard
const PrutasanStaffRoute = ({ user }) => {
  if (!user || user.status !== 'active') return <Navigate to="/login" replace />;
  if (user.role !== 'Prutasan Staff') return <Navigate to={getDefaultRoute(user.role)} replace />;
  return <PrutasanStaffInterface />;
};

// 3.9 Babuyan Staff Route Guard
const BabuyanStaffRoute = ({ user }) => {
  if (!user || user.status !== 'active') return <Navigate to="/login" replace />;
  if (user.role !== 'Babuyan Staff') return <Navigate to={getDefaultRoute(user.role)} replace />;
  return <BabuyanStaffInterface />;
};

const App = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await api.get('/auth/session');
        setCurrentUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
      }
    };

    verifySession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to={getDefaultRoute(currentUser.role)} replace />
          ) : (
            <Login onLoginSuccess={(user) => setCurrentUser(user)} />
          )
        }
      />
      <Route
        path="/admin/*"
        element={<AdminRoute user={currentUser} onLogout={handleLogout} />}
      />
      <Route
        path="/gulayan-staff/*"
        element={<GulayanStaffRoute user={currentUser} />}
      />
      <Route
        path="/prutasan-staff/*"
        element={<PrutasanStaffRoute user={currentUser} />}
      />
      <Route
        path="/babuyan-staff/*"
        element={<BabuyanStaffRoute user={currentUser} />}
      />
      <Route
        path="*"
        element={<Navigate to={currentUser ? getDefaultRoute(currentUser.role) : '/login'} replace />}
      />
    </Routes>
  );
};

export default App;