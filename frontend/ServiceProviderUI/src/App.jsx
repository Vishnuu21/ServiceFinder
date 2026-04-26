// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { getNearbyProviders, searchProviders, getServices } from "./services/providerService";
import { useAuth } from "./context/AuthContext";

import Header from "./components/Header";
import SearchSection from "./components/SearchSection";
import CategoryGrid from "./components/CategoryGrid";
import ProviderList from "./components/ProviderList";
import Sidebar from "./components/Sidebar";
import LocationBar from "./components/LocationBar";
import BottomNav from "./components/BottomNav";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReviewModal from "./components/ReviewModal";
import BookingModal from "./components/BookingModal";
import MyBookingsPage from "./pages/MyBookingsPage";
import FavouritesPage from "./pages/FavouritesPage";
import ProviderProfilePage from "./pages/ProviderProfilePage";
import FloatingBackground from "./components/FloatingBackground";
import WelcomeSplash from "./components/WelcomeSplash";

function HomePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationGranted, setLocationGranted] = useState(false);
  const [showLocationBar, setShowLocationBar] = useState(false);
  const [activeTab, setActiveTab] = useState("find");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [reviewProvider, setReviewProvider] = useState(null);
  const [bookingProvider, setBookingProvider] = useState(null);
  const { user } = useAuth();

  const transformProviders = (data) =>
    data.map((p) => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      distance: p.distance.toFixed(1) + " km",
      rating: p.averageRating || 0,
      totalReviews: p.totalReviews || 0,
      skills: [p.serviceName],
      available: p.available,
      favouriteCount: p.favouriteCount || 0,
      image: p.profilePicture || null,
      lat: p.latitude,
      lon: p.longitude,
    }));

  const loadProviders = async ({ lat, lon }) => {
    try {
      const data = await getNearbyProviders(lat, lon);
      setProviders(transformProviders(data));
      setSelectedProvider(null);
      setError(null);
    } catch {
      setError("Failed to load providers. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const applyCoords = (c) => {
    setCoords(c);
    loadProviders(c);
  };

  const fallbackToIP = () => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        if (d.latitude && d.longitude) {
          applyCoords({ lat: d.latitude, lon: d.longitude });
        } else {
          setLoading(false);
        }
        setShowLocationBar(true); // always show bar on IP fallback so user can refine
      })
      .catch(() => { setShowLocationBar(true); setLoading(false); });
  };

  useEffect(() => {
    getServices().then(setCategories).catch(() => {});

    if (!navigator.geolocation) { fallbackToIP(); return; }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        if (pos.coords.accuracy <= 500) {
          setLocationGranted(true);
          setShowLocationBar(false);
          applyCoords(c);
        } else {
          applyCoords(c);
          setShowLocationBar(true);
        }
      },
      () => fallbackToIP(),
      { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
    );
  }, []);

  const handleLocationSelect = (c) => {
    setCoords(c);
    setShowLocationBar(false);
    setLoading(true);
    loadProviders(c);
  };

  const handleSearch = async () => {
    if (!coords) return;
    setLoading(true);
    try {
      const data = query.trim()
        ? await searchProviders(coords.lat, coords.lon, query)
        : await getNearbyProviders(coords.lat, coords.lon);
      setProviders(transformProviders(data));
      setSelectedProvider(null);
      setActiveCategory(null);
      setError(null);
    } catch {
      setError("Search failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (categoryName) => {
    if (!coords) return;
    setActiveCategory(categoryName);
    setLoading(true);
    try {
      const data = categoryName
        ? await searchProviders(coords.lat, coords.lon, categoryName)
        : await getNearbyProviders(coords.lat, coords.lon);
      setProviders(transformProviders(data));
      setSelectedProvider(null);
      setError(null);
    } catch {
      setError("Failed to filter by category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <FloatingBackground />
      <Header onProvidersUpdated={() => coords && loadProviders(coords)} />

      {/* Location bar — shown below header when location is inaccurate or IP-based */}
      {showLocationBar && (
        <div className="fixed top-16 left-0 right-0 z-40">
          <LocationBar onLocationSelect={handleLocationSelect} />
        </div>
      )}

      {reviewProvider && (
        <ReviewModal
          provider={reviewProvider}
          onClose={() => setReviewProvider(null)}
          onReviewChange={() => loadProviders(coords)}
        />
      )}

      {bookingProvider && (
        <BookingModal
          provider={bookingProvider}
          onClose={() => setBookingProvider(null)}
          onSuccess={() => {}}
        />
      )}

      <main className={`w-full px-6 pb-28 md:pb-6 ${showLocationBar ? "pt-32" : "pt-24"}`}>
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <SearchSection query={query} setQuery={setQuery} onSearch={handleSearch} />
            <CategoryGrid activeCategory={activeCategory} onSelect={handleCategorySelect} categories={categories} />
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <ProviderList
              providers={providers}
              loading={loading}
              selectedProvider={selectedProvider}
              onSelect={setSelectedProvider}
              onReview={setReviewProvider}
              onBook={user?.role === "CUSTOMER" ? setBookingProvider : null}
            />
          </div>
          <div className="hidden lg:block w-96 flex-shrink-0">
            <Sidebar providers={providers} locationGranted={locationGranted} coords={coords} selectedProvider={selectedProvider} />
          </div>
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  const { user, showSplash, setShowSplash } = useAuth();
  const navigate = useNavigate();

  const handleSplashDone = () => {
    setShowSplash(false);
    navigate("/");
  };

  return (
    <>
      {showSplash && user && (
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          <HomePage />
        </div>
      )}
      {showSplash && user && <WelcomeSplash user={user} onDone={handleSplashDone} />}

      {!showSplash && (
        <Routes>
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/favourites" element={<ProtectedRoute><FavouritesPage /></ProtectedRoute>} />
          <Route path="/provider/:id" element={<ProtectedRoute><ProviderProfilePage /></ProtectedRoute>} />
        </Routes>
      )}
    </>
  );
}
