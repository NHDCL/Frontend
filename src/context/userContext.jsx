
import React, { createContext, useState, useContext } from "react";
import img from "../assets/images/person_one.jpg"
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: "John Doe",
    profileImage:img,  // You can replace with a URL or base64 image
    role: "Manager",
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
