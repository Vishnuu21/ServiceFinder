// src/components/Header.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AddProviderModal from "./AddProviderModal";
import WorkingHoursModal from "./WorkingHoursModal";
import { getNearbyProviders, getMyProviderServices } from "../services/providerService";
import { uploadProfilePicture } from "../services/authService";
import { USER_LOCATION } from "../config/location";
import ImageCropModal from "./ImageCropModal";

export default function Header({ onProvidersUpdated }) {
  const { user, logout, updateProfilePicture } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [myProviders, setMyProviders] = useState([]);
  const [myProviderId, setMyProviderId] = useState(null);
  const [myServiceName, setMyServiceName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (event) => setCropSrc(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (croppedBase64) => {
    setCropSrc(null);
    setUploading(true);
    try {
      const data = await uploadProfilePicture(croppedBase64);
      updateProfilePicture(data.profilePicture);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "PROVIDER") {
      getMyProviderServices().then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMyProviders(data);
          setMyProviderId(data[0].id);
        }
      }).catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-blue-50/80 backdrop-blur-xl border-b border-blue-100/60 shadow-sm">
        <div className="w-full px-6 h-16 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-brand)] flex items-center justify-center text-lg shadow-md shadow-blue-200">🔧</div>
            <h1 className="text-xl font-extrabold tracking-tight text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}>
              Service Finder
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[var(--color-text-secondary)]">
            <Link to="/" className="hover:text-[var(--color-brand)] transition-colors">Find Services</Link>
            <Link to="/bookings" className="hover:text-[var(--color-brand)] transition-colors">My Bookings</Link>
            {user?.role === "PROVIDER" ? (
              <Link to="/favourites" className="hover:text-[var(--color-brand)] transition-colors">My Services</Link>
            ) : (
              <Link to="/favourites" className="hover:text-[var(--color-brand)] transition-colors">Favourites</Link>
            )}
          </nav>

          {user && (
            <div className="flex items-center gap-3">
              {user.role === "PROVIDER" && (
                <>
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-xs font-bold text-white bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] px-4 py-2 rounded-full transition-all"
                  >
                    + Add Service
                  </button>
                  {myProviders.length > 0 && (
                    <button
                      onClick={() => {
                        if (myProviders.length === 1) {
                          setMyProviderId(myProviders[0].id);
                          setMyServiceName(myProviders[0].serviceName);
                          setShowHoursModal(true);
                        } else {
                          setShowServicePicker(true);
                        }
                      }}
                      className="text-xs font-bold text-[var(--color-brand)] border-2 border-[var(--color-brand)] hover:bg-blue-50 px-4 py-2 rounded-full transition-all"
                    >
                      🕐 Set Hours
                    </button>
                  )}
                </>
              )}
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[var(--color-text)]">{user.name}</p>
                <p className="text-[10px] text-[var(--color-text-secondary)]">{user.role}</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button data-avatar onClick={handleAvatarClick} title="Change profile picture"
                className="relative w-9 h-9 rounded-full overflow-hidden bg-[var(--color-brand-light)] flex items-center justify-center text-[var(--color-brand)] font-bold text-sm hover:ring-2 hover:ring-[var(--color-brand)] transition-all flex-shrink-0">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition-all"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* Service picker for Set Hours */}
      {showServicePicker && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div style={{ background: "#eff6ff" }} className="rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-blue-100">
            <h3 className="text-lg font-extrabold text-[var(--color-text)] mb-1">Set Hours For</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">Choose which service to set working hours for</p>
            <div className="space-y-2">
              {myProviders.map(p => (
                <button key={p.id} onClick={() => { setMyProviderId(p.id); setMyServiceName(p.serviceName); setShowServicePicker(false); setShowHoursModal(true); }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 hover:border-[var(--color-brand)] hover:bg-blue-100 transition-all text-left bg-blue-50">
                  <span className="font-bold text-sm text-[var(--color-text)]">{p.serviceName}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowServicePicker(false)}
              className="w-full mt-4 py-2.5 rounded-xl border-2 border-gray-300 text-sm font-bold text-[var(--color-text-secondary)] hover:bg-blue-100 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal rendered outside header so it's not clipped */}
      {showModal && (
        <AddProviderModal
          onClose={() => setShowModal(false)}
          onSuccess={() => onProvidersUpdated?.()}
        />
      )}

      {showHoursModal && myProviderId && (
        <WorkingHoursModal
          providerId={myProviderId}
          serviceName={myServiceName}
          onClose={() => setShowHoursModal(false)}
          onSaved={() => onProvidersUpdated?.()}
        />
      )}
    </>
  );
}
