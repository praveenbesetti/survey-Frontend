import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const isAuth = sessionStorage.getItem("isAuthenticated") === "true";
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};