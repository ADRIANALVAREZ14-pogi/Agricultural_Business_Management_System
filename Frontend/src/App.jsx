import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GulayanStaffInterface from './components/GulayanStaffInterface';
import PrutasanStaffInterface from './components/PrutasanStaffInterface';
import BabuyanStaffInterface from './components/BabuyanStaffInterface';

// 1.11 Gulayan Staff Route Guard
const GulayanStaffRoute = ({ user }) => {
  if (user?.role !== 'Gulayan Staff') {
    return <Navigate to="/login" replace />;
  }
  return <GulayanStaffInterface />;
};

// 2.11 Prutasan Staff Route Guard
const PrutasanStaffRoute = ({ user }) => {
  if (user?.role !== 'Prutasan Staff') {
    return <Navigate to="/login" replace />;
  }
  return <PrutasanStaffInterface />;
};

// 3.9 Babuyan Staff Route Guard
const BabuyanStaffRoute = ({ user }) => {
  if (user?.role !== 'Babuyan Staff') {
    return <Navigate to="/login" replace />;
  }
  return <BabuyanStaffInterface />;
};

// Sa loob ng <Routes>:
// <Route path="/gulayan-staff/*" element={<GulayanStaffRoute user={currentUser} />} />
// <Route path="/prutasan-staff/*" element={<PrutasanStaffRoute user={currentUser} />} />
// <Route path="/babuyan-staff/*" element={<BabuyanStaffRoute user={currentUser} />} />