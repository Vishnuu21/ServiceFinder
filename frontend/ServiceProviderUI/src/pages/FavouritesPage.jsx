// src/pages/FavouritesPage.jsx
import { useState, useEffect } from "react";
import { getMyFavourites, removeFavourite, getMyFavouriteCount, getMyProviderServices, deleteProviderService, updateProviderService } from "../services/providerService";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../components/Header";
import BookingModal from "../components/BookingModal";
import ReviewModal from "../components/ReviewModal";
import FloatingBackground from "../components/FloatingBackground";
import { useAuth } from "../context/useAuth";
import { SHOW_MAP_ATTRIBUTION } from "../config/location";

export default function FavouritesPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative">
      <FloatingBackground />
      <Header />
      {user?.role === "PROVIDER" ? <ProviderFavStats /> : <CustomerFavList />}
    </div>
  );
}

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;flex-direction:column;align-items:center;"><div style="width:18px;height:18px;background:#0058be;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,88,190,0.5);"></div></div>`,
  iconSize: [18, 22],
  iconAnchor: [9, 20],
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng]); }, [lat, lng]);
  return null;
}

function EditServiceModal({ service, onClose, onSaved }) {
  const [phone, setPhone] = useState(service.phone || "");
  const [description, setDescription] = useState(service.description || "");
  const [latitude, setLatitude] = useState(String(service.latitude || ""));
  const [longitude, setLongitude] = useState(String(service.longitude || ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapFullscreen, setMapFullscreen] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) { setError("Phone must be 10 digits"); return; }
    setLoading(true);
    try {
      await updateProviderService(service.id, {
        phone,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div style={{ background: "#eff6ff", borderRadius: "24px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-blue-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>Edit Service</h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{service.serviceName}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-100 text-[var(--color-text-secondary)] transition-all">✕</button>
        </div>
        {/* Scrollable body */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          <form id="edit-service-form" onSubmit={handleSave} className="px-8 pt-5 pb-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10}
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Your Location</label>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 mb-2">Click on the map to update your pin location.</p>
              <div className="rounded-xl overflow-hidden border border-gray-300 mb-3 relative" style={{ height: "200px" }}>
                <MapContainer
                  center={[parseFloat(latitude) || 20.5937, parseFloat(longitude) || 78.9629]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                  attributionControl={SHOW_MAP_ATTRIBUTION}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickHandler onMapClick={(lat, lng) => { setLatitude(String(lat)); setLongitude(String(lng)); }} />
                  <MapRecenter lat={parseFloat(latitude) || 20.5937} lng={parseFloat(longitude) || 78.9629} />
                  {parseFloat(latitude) && parseFloat(longitude) && (
                    <Marker position={[parseFloat(latitude), parseFloat(longitude)]} icon={pinIcon} />
                  )}
                </MapContainer>
                <button type="button" onClick={() => setMapFullscreen(true)}
                  style={{ position: "absolute", top: 8, right: 8, zIndex: 1000, background: "#eff6ff", border: "none", borderRadius: "8px", padding: "5px 8px", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", fontSize: "14px" }}
                  title="Fullscreen">⛶</button>
              </div>
              {mapFullscreen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 10000 }}>
                  <MapContainer
                    center={[parseFloat(latitude) || 20.5937, parseFloat(longitude) || 78.9629]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                    attributionControl={SHOW_MAP_ATTRIBUTION}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickHandler onMapClick={(lat, lng) => { setLatitude(String(lat)); setLongitude(String(lng)); }} />
                    {parseFloat(latitude) && parseFloat(longitude) && (
                      <Marker position={[parseFloat(latitude), parseFloat(longitude)]} icon={pinIcon} />
                    )}
                  </MapContainer>
                  <button type="button" onClick={() => setMapFullscreen(false)}
                    style={{ position: "absolute", top: 16, right: 16, zIndex: 10001, background: "#eff6ff", border: "1px solid rgba(0,88,190,0.2)", borderRadius: "10px", padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: "13px", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                    ✕ Exit Fullscreen
                  </button>
                  <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 10001, background: "white", borderRadius: "10px", padding: "8px 16px", fontSize: "12px", fontWeight: 600, color: "#424754", boxShadow: "0 2px 10px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>
                    📍 {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--color-text-secondary)]">Latitude</label>
                  <input type="text" value={latitude} onChange={e => setLatitude(e.target.value)}
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-secondary)]">Longitude</label>
                  <input type="text" value={longitude} onChange={e => setLongitude(e.target.value)}
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 text-sm" />
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>
        {/* Footer */}
        <div className="px-8 py-5 border-t border-blue-100 flex-shrink-0 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-300 text-[var(--color-text-secondary)] font-bold text-sm hover:bg-blue-100 transition-all">Cancel</button>
          <button type="submit" form="edit-service-form" disabled={loading} className="flex-1 py-3 rounded-2xl bg-[var(--color-brand)] text-white font-bold text-sm hover:bg-[var(--color-brand-dark)] transition-all disabled:opacity-60">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Provider view: how many users favourited them ---
function ConfirmDialog({ serviceName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-4xl text-center mb-3">🗑️</div>
        <h3 className="text-lg font-extrabold text-[var(--color-text)] text-center">Delete Service?</h3>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mt-2">
          You're about to delete <span className="font-bold text-[var(--color-text)]">"{serviceName}"</span>.
          This will also remove all bookings, reviews and working hours for this service.
        </p>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-sm hover:bg-[var(--color-muted)] transition-all">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ProviderFavStats() {
  const [services, setServices] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const fetchAll = () => {
    Promise.all([getMyProviderServices(), getMyFavouriteCount()])
      .then(([svcs, count]) => {
        setServices(Array.isArray(svcs) ? svcs : []);
        setTotalCount(count || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async () => {
    const { id, serviceName } = confirmTarget;
    setConfirmTarget(null);
    setDeleting(id);
    try {
      await deleteProviderService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      setTotalCount(prev => prev - (services.find(s => s.id === id)?.favouriteCount || 0));
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center pt-40">
      <div className="w-8 h-8 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 pt-24 pb-28 md:pb-10">
      {confirmTarget && (
        <ConfirmDialog
          serviceName={confirmTarget.serviceName}
          onConfirm={handleDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
      {editTarget && (
        <EditServiceModal
          service={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={fetchAll}
        />
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
          My Services
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Your registered services and how many customers have favourited each
        </p>
      </div>

      {/* Total fav count banner */}
      <div className="bg-[var(--color-brand)] rounded-2xl p-6 flex items-center gap-5 mb-6 text-white">
        <div className="text-5xl">❤️</div>
        <div>
          <p className="text-4xl font-extrabold">{totalCount}</p>
          <p className="text-sm font-semibold opacity-90">
            total {totalCount === 1 ? "customer has" : "customers have"} favourited your services
          </p>
        </div>
      </div>

      {/* Per-service breakdown */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-3">🔧</div>
          <p className="font-bold text-[var(--color-text)]">No services registered yet</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Use "+ Add Service" in the header to register your first service</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Breakdown by service</p>
          {services.map(s => (
            <div key={s.id} className="bg-blue-50/70 backdrop-blur-sm rounded-2xl p-5 border border-blue-100/80 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-light)] flex items-center justify-center text-[var(--color-brand)] font-bold text-lg flex-shrink-0">
                  🔧
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--color-text)] truncate">{s.serviceName}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {s.averageRating > 0 && (
                      <span className="text-xs text-amber-600 font-semibold">⭐ {s.averageRating} ({s.totalReviews})</span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.available ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                      {s.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-xl flex-shrink-0">
                  <span className="text-base">❤️</span>
                  <span className="text-lg font-extrabold text-red-500">{s.favouriteCount}</span>
                </div>
              </div>
              {/* Actions row below on all screens */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditTarget(s)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-[var(--color-brand)] border-2 border-[var(--color-brand-light)] hover:bg-blue-100 transition-all">
                  Edit
                </button>
                <button
                  onClick={() => setConfirmTarget({ id: s.id, serviceName: s.serviceName })}
                  disabled={deleting === s.id}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-red-500 border-2 border-red-200 hover:bg-red-50 transition-all disabled:opacity-50">
                  {deleting === s.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Customer view: their saved providers ---
function CustomerFavList() {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingProvider, setBookingProvider] = useState(null);
  const [reviewProvider, setReviewProvider] = useState(null);

  const fetchFavourites = async () => {
    try {
      let latitude = 0, longitude = 0;
      const saved = localStorage.getItem("savedLocation");
      if (saved) {
        try {
          const { lat, lon } = JSON.parse(saved);
          latitude = lat;
          longitude = lon;
        } catch {}
      } else {
        try {
          const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        } catch {}
      }
      const data = await getMyFavourites(latitude, longitude);
      setFavourites(Array.isArray(data) ? data.map(p => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        distance: p.distance > 0 ? p.distance.toFixed(1) + " km" : null,
        rating: p.averageRating || 0,
        totalReviews: p.totalReviews || 0,
        skills: [p.serviceName],
        available: p.available,
        image: p.profilePicture || null,
        lat: p.latitude,
        lon: p.longitude,
      })) : []);
    } catch {
      setFavourites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavourites(); }, []);

  const handleRemove = async (providerId) => {
    try {
      await removeFavourite(providerId);
      setFavourites(prev => prev.filter(p => p.id !== providerId));
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center pt-40">
      <div className="w-8 h-8 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      {bookingProvider && (
        <BookingModal provider={bookingProvider} onClose={() => setBookingProvider(null)} onSuccess={() => {}} />
      )}
      {reviewProvider && (
        <ReviewModal provider={reviewProvider} onClose={() => setReviewProvider(null)} onReviewChange={fetchFavourites} />
      )}

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-28 md:pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
            My Favourites
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Providers you've saved for quick access
          </p>
        </div>

        {favourites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🤍</div>
            <p className="font-bold text-lg text-[var(--color-text)]">No favourites yet</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Tap the heart on any provider to save them here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favourites.map(p => (
              <div key={p.id} className="bg-blue-50/70 backdrop-blur-sm rounded-2xl p-5 border border-blue-100/80 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--color-brand-light)] flex items-center justify-center text-[var(--color-brand)] font-bold text-lg flex-shrink-0">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      : p.name?.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-[var(--color-text)]">{p.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${p.available ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                        {p.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{p.skills[0]}{p.distance ? ` · ${p.distance}` : ""}</p>
                    {p.rating > 0 && (
                      <p className="text-xs text-amber-600 font-semibold mt-0.5">⭐ {p.rating} ({p.totalReviews})</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => setReviewProvider(p)}
                    className="flex-1 py-1.5 rounded-xl text-xs font-bold border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)] transition-all">
                    Reviews
                  </button>
                  <button onClick={() => setBookingProvider(p)}
                    className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)] transition-all">
                    Book
                  </button>
                  <button onClick={() => handleRemove(p.id)} title="Remove from favourites"
                    className="hover:scale-110 transition-all flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
