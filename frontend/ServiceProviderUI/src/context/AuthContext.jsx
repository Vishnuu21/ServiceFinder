// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import { SHOW_WELCOME_SPLASH } from "../config/location";
import { fetchMe } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [showSplash, setShowSplash] = useState(false);
  const [promotionMsg, setPromotionMsg] = useState(null);

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

  const refreshUser = async () => {
    const fresh = await fetchMe();
    if (!fresh) return;
    const current = JSON.parse(localStorage.getItem("user") || "{}");
    if (current.role && fresh.role && current.role !== fresh.role) {
      setPromotionMsg(`You have been promoted to ${fresh.role.replace("_", " ")}!`);
    }
    const updated = { ...current, ...fresh };
    localStorage.setItem("user", JSON.stringify(updated));
    localStorage.setItem("token", fresh.token);
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, saveUser, logout, updateProfilePicture, refreshUser, showSplash, setShowSplash }}>
      {promotionMsg && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 99999,
          background: "#0058be", color: "white", padding: "14px 28px", borderRadius: "16px",
          fontWeight: 700, fontSize: "14px", boxShadow: "0 8px 30px rgba(0,88,190,0.4)",
          display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: "18px", height: "18px", flexShrink: 0 }}>
              <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
            {promotionMsg}
          </span>
          <button onClick={() => setPromotionMsg(null)}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px",
              color: "white", fontWeight: 700, padding: "4px 10px", cursor: "pointer", fontSize: "12px" }}>
            OK
          </button>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
