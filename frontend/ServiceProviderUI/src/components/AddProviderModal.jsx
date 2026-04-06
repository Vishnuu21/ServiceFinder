// src/components/AddProviderModal.jsx
import { useState, useEffect } from "react";
import { getServices, getOrCreateService, registerProvider, getMyProviderServices } from "../services/providerService";
import { useAuth } from "../context/AuthContext";
import { USER_LOCATION } from "../config/location";
import { useScrollLock } from "../hooks/useScrollLock";

const inputCls = "w-full mt-1.5 px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)] transition-all text-sm";

export default function AddProviderModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  useScrollLock();
  const [services, setServices] = useState([]);
  const [useCustomService, setUseCustomService] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myServices, setMyServices] = useState([]);
  const [dupWarning, setDupWarning] = useState(null); // {serviceName} if duplicate nearby

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [customService, setCustomService] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(String(USER_LOCATION.lat));
  const [longitude, setLongitude] = useState(String(USER_LOCATION.lon));
  const [gender, setGender] = useState("");

  useEffect(() => {
    getServices().then(setServices).catch(() => {});
    getMyProviderServices().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setPhone(data[0].phone || "");
        setMyServices(data);
      }
    }).catch(() => {});
  }, []);

  // distance in km between two coords
  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const doSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let finalServiceId;
      if (useCustomService) {
        const svc = await getOrCreateService(customService.trim());
        finalServiceId = svc.id;
      } else {
        finalServiceId = parseInt(serviceId);
      }
      await registerProvider({ name, phone, latitude: parseFloat(latitude), longitude: parseFloat(longitude), service: { id: finalServiceId }, description, gender }, token);
      setSuccess(true);
      onSuccess();
      setTimeout(() => { setSuccess(false); onClose(); }, 2000);
    } catch (err) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name"); return; }
    if (phone.length !== 10) { setError("Phone number must be exactly 10 digits"); return; }
    if (!useCustomService && !serviceId) { setError("service"); return; }
    if (useCustomService && !customService.trim()) { setError("service"); return; }

    // check for duplicate service name at nearby coordinate (<= 1km)
    const selectedName = useCustomService
      ? customService.trim().toLowerCase()
      : services.find(s => String(s.id) === String(serviceId))?.name?.toLowerCase();

    const nearby = myServices.find(s =>
      s.serviceName?.toLowerCase() === selectedName &&
      haversine(parseFloat(latitude), parseFloat(longitude), s.latitude, s.longitude) <= 1
    );

    if (nearby) {
      setDupWarning(nearby.serviceName);
      return;
    }

    await doSubmit();
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", padding: "16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Duplicate warning confirmation */}
      {dupWarning && (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "24px" }}>
          <div style={{ background: "#eff6ff", borderRadius: "20px", padding: "32px", maxWidth: "360px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <h3 style={{ fontWeight: 800, fontSize: "16px", color: "#191c1e", marginBottom: "8px" }}>Same Service Nearby</h3>
            <p style={{ fontSize: "14px", color: "#424754", marginBottom: "24px", lineHeight: 1.5 }}>
              You already have a <strong>{dupWarning}</strong> service at or near this location. Do you want to add another one?
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setDupWarning(null)}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "2px solid #d1d5db", background: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer", color: "#424754" }}>
                No, Discard
              </button>
              <button onClick={() => { setDupWarning(null); doSubmit(); }}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#0058be", color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
                Yes, Add Anyway
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ background: "#eff6ff", borderRadius: "24px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}>

        {/* Sticky header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-blue-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
              Register Your Service
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Fill in your details to appear in search results</p>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-100 text-[var(--color-text-secondary)] transition-all text-lg font-bold">✕</button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          <form id="add-provider-form" onSubmit={handleSubmit} className="px-8 pt-5 pb-6 space-y-5">

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                <span className="text-green-600 text-lg">✅</span>
                <p className="text-green-700 text-sm font-semibold">Service registered successfully!</p>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" className={inputCls} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Enter your 10-digit phone number" maxLength={10} className={inputCls} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Service Type</label>
                <button type="button" onClick={() => { setUseCustomService(!useCustomService); setServiceId(""); setCustomService(""); }} className="text-xs font-semibold text-[var(--color-brand)] hover:underline">
                  {useCustomService ? "← Pick from list" : "Not in list? Add new →"}
                </button>
              </div>
              {useCustomService ? (
                <input type="text" value={customService} onChange={(e) => setCustomService(e.target.value.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "))} placeholder="Enter service name"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)] transition-all text-sm" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {services.map((s) => (
                    <button key={s.id} type="button" onClick={() => setServiceId(String(s.id))}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border-2 transition-all active:scale-95 ${serviceId === String(s.id) ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]" : "bg-white text-[var(--color-text-secondary)] border-gray-300 hover:border-[var(--color-brand)]/40"}`}>
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
              {error === "service" && <p className="text-red-500 text-xs mt-1.5">Please select a service type</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Description <span className="normal-case font-normal">(optional)</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your service, experience, specialties..." rows={3}
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)] transition-all text-sm resize-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Your Location</label>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 mb-2">Pre-filled with your location. Change if needed.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--color-text-secondary)]">Latitude</label>
                  <input type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} required
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)] transition-all text-sm" />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-secondary)]">Longitude</label>
                  <input type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} required
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)] transition-all text-sm" />
                </div>
              </div>
            </div>

            {error && error !== "service" && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Sticky footer */}
        <div className="px-8 py-5 border-t border-blue-100 flex-shrink-0 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-2xl border-2 border-gray-300 text-[var(--color-text-secondary)] font-bold text-sm hover:bg-blue-100 transition-all">Cancel</button>
          <button type="submit" form="add-provider-form" disabled={loading || success} className="flex-1 py-3.5 rounded-2xl bg-[var(--color-brand)] text-white font-bold text-sm hover:bg-[var(--color-brand-dark)] active:scale-[0.97] transition-all disabled:opacity-60">
            {loading ? "Saving..." : success ? "Saved! ✓" : "Register Service"}
          </button>
        </div>
      </div>
    </div>
  );
}
