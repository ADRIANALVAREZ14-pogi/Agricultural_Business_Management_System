import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GulayanStaffInterface from './components/GulayanStaffInterface';

const GulayanStaffRoute = ({ user }) => {
  if (user?.role !== 'Gulayan Staff') {
    return <Navigate to="/login" replace />;
  }
  return <GulayanStaffInterface />;
};

// Sa loob ng <Routes>:
// <Route path="/gulayan-staff/*" element={<GulayanStaffRoute user={currentUser} />} />