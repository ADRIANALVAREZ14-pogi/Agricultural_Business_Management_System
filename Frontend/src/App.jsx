import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import GulayanStaffInterface from './components/GulayanStaffInterface';
import PrutasanStaffInterface from './components/PrutasanStaffInterface';
import BabuyanStaffInterface from './components/BabuyanStaffInterface';

// Helper for default role redirect
const getDefaultRoute = (role) => {
  switch (role) {
    case 'Admin':
      return '/admin';
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

// 4.1 Admin Route Guard (Full Menu)
const AdminRoute = ({ user, onLogout }) => {
  if (!user || user.status !== 'active') return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return <Navigate to={getDefaultRoute(user.role)} replace />;
  return <AdminDashboard user={user} onLogout={onLogout} />;
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
        // Clear session if expired or account was deactivated
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