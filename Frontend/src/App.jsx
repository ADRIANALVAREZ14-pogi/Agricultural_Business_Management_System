import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GulayanStaffInterface from './components/GulayanStaffInterface';
import PrutasanStaffInterface from './components/PrutasanStaffInterface';

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

// Sa loob ng <Routes>:
// <Route path="/gulayan-staff/*" element={<GulayanStaffRoute user={currentUser} />} />
// <Route path="/prutasan-staff/*" element={<PrutasanStaffRoute user={currentUser} />} />