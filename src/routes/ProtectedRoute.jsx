import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element, requiredRole }) => {
  
  const token = localStorage.getItem("userToken");
  const isAuthenticated = !!token;

  let hasRequiredRole = false;

  const userRole = localStorage.getItem("userRole");

  // Debugging the user role (only in development)
  if (process.env.NODE_ENV === "development") {
  }

  if (userRole) {
    // Check if the required role matches the user's role
    if (requiredRole) {
      hasRequiredRole = userRole.toLowerCase() === requiredRole.toLowerCase();
      hasRequiredRole = true;
    } else {
      hasRequiredRole = false; // No role required? Let them in
    }
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the user does not have the required role, redirect to unauthorized
  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If everything is okay, render the requested element
  return element;
};

export default ProtectedRoute;
