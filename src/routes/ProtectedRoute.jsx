import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element, requiredRole }) => {
  const token = sessionStorage.getItem("userToken");
  const userRole = sessionStorage.getItem("userRole");

  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const normalize = (role) => role?.toLowerCase().replace(/\s+/g, "");
    const hasRequiredRole = normalize(userRole) === normalize(requiredRole);
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return element;
};

export default ProtectedRoute;
