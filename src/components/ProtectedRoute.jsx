import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if an authentication token exists in sessionStorage
  // This is a simple check. In a real application, you might also
  // want to validate the token (e.g., check expiry) or use a more
  // sophisticated state management for authentication.
  const isAuthenticated = sessionStorage.getItem('authToken');

  // If authenticated, render the child routes (Outlet)
  // Otherwise, redirect to the login page
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;