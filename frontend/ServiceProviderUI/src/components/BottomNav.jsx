// src/components/BottomNav.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    id: "find",
    label: "Find Services",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "bookings",
    label: "My Bookings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function BottomNav({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // derive active tab from URL so back button and direct navigation work
  const currentTab = location.pathname === "/bookings" ? "bookings"
    : location.pathname === "/favourites" ? "favorites"
    : "find";

  const visibleItems = navItems.filter(item => item.id !== "profile").map(item =>
    item.id === "favorites" && user?.role === "PROVIDER"
      ? { ...item, label: "My Services" }
      : item
  );

  const handleTab = (id) => {
    if (id === "bookings") navigate("/bookings");
    else if (id === "favorites") navigate("/favourites");
    else navigate("/");
    onTabChange(id);
  };
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-50">
      <div
        className="
          mx-6 mb-6 bg-white/90 backdrop-blur-xl rounded-full
          shadow-2xl shadow-blue-900/20
          flex items-center justify-around h-16 px-4
          border border-[var(--color-border)]/50
        "
      >
        {visibleItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTab(item.id)}
              className={`
                flex flex-col items-center justify-center gap-0.5
                transition-all duration-200
                ${isActive
                  ? "text-[var(--color-brand)] scale-105"
                  : "text-slate-400 hover:-translate-y-0.5"
                }
              `}
            >
              {item.icon}
              <span className="text-[10px] font-semibold font-label">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-0.5 text-red-400 hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px] font-semibold font-label">Logout</span>
        </button>
      </div>
    </nav>
  );
}
