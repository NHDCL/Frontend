import React, { createContext, useState, useContext } from "react";
import img from "../assets/images/person_one.jpg";

// Create the context
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initial user state with name, profileImage, and role
  const [user, setUser] = useState({
    name: "John Doe",
    profileImage: img, // Assuming img is a static image, or use a URL
    role: "manager" // Default role, this can be updated dynamically
  });

  // Function to dynamically set the user's role
  const setRole = (role) => {
    setUser((prevUser) => ({
      ...prevUser,
      role, // Update the role dynamically
    }));
  };

  return (
    <UserContext.Provider value={{ user, setUser, setRole }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access the user context
export const useUser = () => useContext(UserContext);
