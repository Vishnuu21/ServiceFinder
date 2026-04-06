// src/pages/ProviderProfilePage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getProviderById, addFavourite, removeFavourite, checkFavourite } from "../services/providerService";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import BookingModal from "../components/BookingModal";
import ReviewModal from "../components/ReviewModal";
import FloatingBackground from "../components/FloatingBackground";

import { USER_LOCATION } from "../config/location";

const providerIcon = L.divIcon({
  className: "",
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:22px;height:22px;background:#ef4444;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(239,68,68,0.5);"></div>
    </div>`,
  iconSize: [22, 28],
  iconAnchor: [11, 26],
});

const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="position:absolute;inset:0;background:rgba(0,88,190,0.2);border-radius:50%;animation:pulse 1.8s ease-out infinite;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:12px;height:12px;background:#0058be;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,88,190,0.6);"></div>
    </div>
    <style>@keyframes pulse{0%{transform:scale(0.8);opacity:0.8}100%{transform:scale(2.2);opacity:0}}</style>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function FitAndFly({ providerLat, providerLon, userLat, userLon }) {
  const map = useMap();
  useEffect(() => {
    if (userLat && userLon) {
      // first fit both markers in view
      map.fitBounds(
        [[providerLat, providerLon], [userLat, userLon]],
        { padding: [60, 60], maxZoom: 14 }
      );
    }
    // then fly to provider
    setTimeout(() => {
      map.flyTo([providerLat, providerLon], 16, { duration: 1.5 });
    }, 1200);
  }, []);
  return null;
}

export default function ProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [userCoords, setUserCoords] = useState(USER_LOCATION);

  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // derived — always computed from current userCoords, never stored in provider state
  const distance = provider && userCoords
    ? haversine(userCoords.lat, userCoords.lon, provider.lat, provider.lon).toFixed(1) + " km"
    : null;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setUserCoords(USER_LOCATION),
        { timeout: 8000, maximumAge: 60000 }
      );
    } else {
      setUserCoords(USER_LOCATION);
    }
  }, []);

  useEffect(() => {
    getProviderById(id)
      .then(p => {
        setProvider({
          id: p.id,
          name: p.name,
          phone: p.phone,
          rating: p.averageRating || 0,
          totalReviews: p.totalReviews || 0,
          skills: [p.serviceName],
          available: p.available,
          favouriteCount: p.favouriteCount || 0,
          profilePicture: p.profilePicture || null,
          description: p.description || "",
          lat: p.latitude,
          lon: p.longitude,
          image: null,
        });
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id]);

  // recalculate distance whenever provider or userCoords changes
  useEffect(() => {
    if (!provider || !userCoords) return;
    const dist = haversine(userCoords.lat, userCoords.lon, provider.lat, provider.lon);
    setProvider(prev => ({ ...prev, distance: dist.toFixed(1) + " km" }));
  }, [userCoords, provider?.lat, provider?.lon]);

  useEffect(() => {
    if (user?.role === "CUSTOMER" && id) {
      checkFavourite(id).then(setFav).catch(() => {});
    }
  }, [id, user]);

  const toggleFav = async () => {
    try {
      if (fav) { await removeFavourite(id); setFav(false); }
      else { await addFavourite(id); setFav(true); }
    } catch {}
  };

  if (loading) return (
    <div className="min-h-screen relative flex items-center justify-center">
      <FloatingBackground />
      <div className="w-8 h-8 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!provider) return null;

  return (
    <div className="min-h-screen relative">
      <FloatingBackground />
      <Header />

      {bookingOpen && (
        <BookingModal provider={provider} onClose={() => setBookingOpen(false)} onSuccess={() => {}} />
      )}
      {reviewOpen && (
        <ReviewModal provider={provider} onClose={() => setReviewOpen(false)} onReviewChange={() => getProviderById(id)} />
      )}

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] mb-6 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
          Back
        </button>

        {/* Profile card */}
        <div className="bg-blue-50/70 backdrop-blur-sm rounded-3xl p-8 border border-blue-100/80 shadow-sm mb-5">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
              {provider.profilePicture ? (
                <img src={provider.profilePicture} alt={provider.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[var(--color-brand-light)] flex items-center justify-center text-[var(--color-brand)] font-bold text-3xl">
                  {provider.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                    {provider.name}
                  </h1>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{provider.skills[0]}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${provider.available ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                  {provider.available ? "● Available" : "● Unavailable"}
                </span>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {provider.rating > 0 && (
                  <span className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                    ⭐ {provider.rating} <span className="text-xs text-amber-500">({provider.totalReviews} reviews)</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 1 0-16 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742Z" clipRule="evenodd" />
                  </svg>
                  {distance}
                </span>
                <span className="text-sm text-red-400">❤️ {provider.favouriteCount}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {provider.description && (
            <div className="mt-5 pt-5 border-t border-[var(--color-border)]/40">
              <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">About</p>
              <p className="text-sm text-[var(--color-text)] leading-relaxed">{provider.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <a href={`tel:${provider.phone}`}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-[var(--color-border)] text-[var(--color-brand)] font-bold text-sm hover:bg-[var(--color-muted)] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
              </svg>
              {provider.phone}
            </a>
            <button onClick={() => setReviewOpen(true)}
              className="px-5 py-3 rounded-2xl border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-sm hover:bg-[var(--color-muted)] transition-all">
              Reviews
            </button>
            {user?.role === "CUSTOMER" && (
              <>
                <button onClick={toggleFav}
                  className={`px-5 py-3 rounded-2xl border-2 font-bold text-sm transition-all flex items-center gap-2 ${fav ? "border-red-200 bg-red-50 text-red-500" : "border-[var(--color-border)] text-slate-400 hover:border-red-200 hover:text-red-400"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                  {fav ? "Saved" : "Save"}
                </button>
                <button onClick={() => setBookingOpen(true)}
                  className="flex-1 px-5 py-3 rounded-2xl bg-[var(--color-brand)] text-white font-bold text-sm hover:bg-[var(--color-brand-dark)] transition-all">
                  Book Now
                </button>
              </>
            )}
          </div>
        </div>

        {/* Map */}
        {provider.lat && provider.lon && (
          <div className="bg-blue-50/70 backdrop-blur-sm rounded-3xl overflow-hidden border border-blue-100/80 shadow-sm">
            <div className="px-6 py-4 border-b border-[var(--color-border)]/40">
              <p className="font-bold text-sm text-[var(--color-text)]">📍 Location</p>
            </div>
            <div style={{ height: "calc(100vh - 520px)", minHeight: "250px" }}>
              <MapContainer center={[provider.lat, provider.lon]} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FitAndFly providerLat={provider.lat} providerLon={provider.lon} userLat={userCoords?.lat} userLon={userCoords?.lon} />
                {/* Provider marker */}
                <Marker position={[provider.lat, provider.lon]} icon={providerIcon}>
                  <Popup>
                    <p style={{ fontWeight: "bold" }}>{provider.name}</p>
                    <p style={{ color: "#666", fontSize: "12px" }}>{provider.skills[0]}</p>
                  </Popup>
                </Marker>
                {/* User location marker */}
                {userCoords && (
                  <Marker position={[userCoords.lat, userCoords.lon]} icon={userIcon}>
                    <Popup>
                      <p style={{ fontWeight: "bold", fontSize: "12px" }}>📍 Your Location</p>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
