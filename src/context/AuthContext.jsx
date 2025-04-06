import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component that wraps your app and provides the auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user data (e.g., role, token)

  const login = (userData) => {
    setUser(userData); // Set user data upon login
  };

  const logout = () => {
    setUser(null); // Clear user data upon logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
