import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element, requiredRole }) => {
  const token = localStorage.getItem("userToken");
  const userRole = localStorage.getItem("userRole");

  const isAuthenticated = !!token;

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a required role is specified, check if the user's role matches
  if (requiredRole) {
    const hasRequiredRole =
      userRole?.toLowerCase() === requiredRole.toLowerCase();
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If everything is okay, render the requested element
  return element;
};

export default ProtectedRoute;
