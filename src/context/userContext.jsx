import React, { createContext, useState, useContext, useEffect } from "react";
import { useSelector } from "react-redux"; // Import useSelector from Redux
import img from "../assets/images/person_one.jpg";

// Create the context
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Access userRole from Redux store
  const userRoleFromRedux = useSelector((state) => state.auth.userRole);

  // Initial user state with name, profileImage, and role
  const [user, setUser] = useState({
    name: "John Doe",
    profileImage: img, // Assuming img is a static image, or use a URL
    role: userRoleFromRedux || "manager", // Default to Redux role if available, else fallback to "manager"
  });

  // Function to dynamically set the user's role
  const setRole = (role) => {
    setUser((prevUser) => ({
      ...prevUser,
      role, // Update the role dynamically
    }));
  };

  // Sync the Redux userRole with the local user state whenever the role changes
  useEffect(() => {
    if (userRoleFromRedux) {
      setUser((prevUser) => ({
        ...prevUser,
        role: userRoleFromRedux,
      }));
    }
  }, [userRoleFromRedux]);

  return (
    <UserContext.Provider value={{ user, setUser, setRole }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access the user context
export const useUser = () => useContext(UserContext);
