// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import { SHOW_WELCOME_SPLASH } from "../config/location";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [showSplash, setShowSplash] = useState(false);

  const saveUser = (userData, isNew = false) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    setUser({ ...userData, isNew });
    if (SHOW_WELCOME_SPLASH) setShowSplash(true);
  };

  const updateProfilePicture = (profilePicture, token) => {
    const updated = { ...user, profilePicture, ...(token && { token }) };
    localStorage.setItem("user", JSON.stringify(updated));
    if (token) localStorage.setItem("token", token);
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, saveUser, logout, updateProfilePicture, showSplash, setShowSplash }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
