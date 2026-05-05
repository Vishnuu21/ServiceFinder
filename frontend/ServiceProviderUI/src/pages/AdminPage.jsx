// src/pages/AdminPage.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import FloatingBackground from "../components/FloatingBackground";
import ImageCropModal from "../components/ImageCropModal";
import { uploadProfilePicture } from "../services/authService";
import {
  adminGetStats, adminGetUsers, adminDeleteUser,
  adminGetProviders, adminDeleteProvider,
  adminGetServices, adminRenameService, adminMergeServices, adminDeleteService,
  adminPromoteUser, adminDemoteAdmin, adminTransferSuperAdmin, verifyPassword,
  adminGetBookings, adminGetReviews
} from "../services/adminService";

const TABS = ["Overview", "Accounts", "Services", "Categories", "Bookings", "Reviews"];

const DialogIcon = ({ type }) => {
  if (type === "password") return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-3 text-[var(--color-brand)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
  if (type === "info") return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-3 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  );
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-3 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
};

function ConfirmDialog({ message, onConfirm, onCancel, requirePassword }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const type = requirePassword ? "password" : onCancel === null ? "info" : "warn";

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== "Enter") return;
      if (requirePassword) {
        if (!pwd.trim()) { setErr("Password is required"); return; }
        onConfirm(pwd, setErr);
      } else {
        onConfirm("", setErr);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pwd, requirePassword, onConfirm]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <DialogIcon type={type} />
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-4">{message}</p>
        {requirePassword && (
          <div className="mb-2">
            <input type="password" value={pwd} onChange={e => { setPwd(e.target.value); setErr(""); }}
              onKeyDown={e => { if (e.key === "Enter") { if (!pwd.trim()) { setErr("Password is required"); return; } onConfirm(pwd, setErr); } }}
              placeholder="Enter your password to confirm"
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 text-sm" />
            {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
          </div>
        )}
        <div className="flex gap-3 mt-4">
          {onCancel !== null && <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-sm hover:bg-[var(--color-muted)] transition-all">Cancel</button>}
          <button onClick={() => {
            if (requirePassword && !pwd.trim()) { setErr("Password is required"); return; }
            onConfirm(pwd, setErr);
          }} className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${onCancel === null ? "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)]" : "bg-red-500 text-white hover:bg-red-600"}`}>{onCancel === null ? "OK" : "Confirm"}</button>
        </div>
      </div>
    </div>
  );
}

function MergeSelect({ name, options, value, onChange, onMerge, onCancel }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(x => String(x.id) === String(value));
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-[var(--color-text)]">Merge <span className="text-[var(--color-brand)]">"{name}"</span> into:</p>
      <div className="relative">
        <button onClick={() => setOpen(o => !o)} type="button"
          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-sm font-semibold text-left flex items-center justify-between transition-all hover:border-[var(--color-brand)] focus:outline-none">
          <span className={selected ? "text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"}>
            {selected ? selected.name : "Select target category..."}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {options.map(x => (
              <button key={x.id} type="button"
                onClick={() => { onChange(String(x.id)); setOpen(false); }}
                className={`w-full px-4 py-2.5 text-sm font-semibold text-left transition-all hover:bg-blue-50 hover:text-[var(--color-brand)] ${
                  String(x.id) === String(value) ? "bg-blue-50 text-[var(--color-brand)]" : "text-[var(--color-text)]"
                }`}>
                {x.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={onMerge} disabled={!value}
          className="flex-1 py-2 rounded-xl bg-[var(--color-brand)] text-white text-xs font-bold hover:bg-[var(--color-brand-dark)] transition-all disabled:opacity-40">Merge</button>
        <button onClick={onCancel}
          className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-xs font-bold text-[var(--color-text-secondary)] hover:bg-blue-100 transition-all">Cancel</button>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-blue-50/70 backdrop-blur-sm rounded-2xl p-5 border border-blue-100/80 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-light)] flex items-center justify-center text-[var(--color-brand)] flex-shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-extrabold text-[var(--color-text)]">{value}</p>
        <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, logout, updateProfilePicture } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [mergeTarget, setMergeTarget] = useState(null);
  const [mergeInto, setMergeInto] = useState("");
  const [search, setSearch] = useState("");
  const [cropSrc, setCropSrc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (croppedBase64) => {
    setCropSrc(null);
    setUploading(true);
    try {
      const data = await uploadProfilePicture(croppedBase64);
      updateProfilePicture(data.profilePicture, data.token);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const load = async (t) => {
    setLoading(true);
    setSearch("");
    try {
      if (t === "Overview") setStats(await adminGetStats());
      if (t === "Accounts") setUsers(await adminGetUsers());
      if (t === "Services") setProviders(await adminGetProviders());
      if (t === "Categories") setServices(await adminGetServices());
      if (t === "Bookings") setBookings(await adminGetBookings());
      if (t === "Reviews") setReviews(await adminGetReviews());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleLogout = () => { logout(); navigate("/login"); };

  const Spinner = () => (
    <div className="flex justify-center pt-20">
      <div className="w-8 h-8 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen relative">
      <FloatingBackground />

      {cropSrc && <ImageCropModal imageSrc={cropSrc} onConfirm={handleCropConfirm} onCancel={() => setCropSrc(null)} />}

      {confirm && <ConfirmDialog message={confirm.message} requirePassword={confirm.requirePassword} onConfirm={confirm.onConfirm} onCancel={confirm.onCancel !== null ? () => setConfirm(null) : null} />}

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-blue-50/80 backdrop-blur-xl border-b border-blue-100/60 shadow-sm">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-brand)] flex items-center justify-center text-lg shadow-md shadow-blue-200">🔧</div>
            <h1 className="text-xl font-extrabold tracking-tight text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
              Admin Panel
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[var(--color-text)]">{user?.name}</p>
              <p className="text-[10px] text-[var(--color-text-secondary)]">{user?.role?.replace(/_/g, " ")}</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button onClick={() => fileInputRef.current?.click()} title="Change profile picture"
              className="relative w-9 h-9 rounded-full overflow-hidden bg-[var(--color-brand-light)] flex items-center justify-center text-[var(--color-brand)] font-bold text-sm hover:ring-2 hover:ring-[var(--color-brand)] transition-all flex-shrink-0">
              {user?.profilePicture
                ? <img src={user.profilePicture} alt="avatar" className="w-full h-full object-cover" />
                : user?.name?.charAt(0).toUpperCase()
              }
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
            <button onClick={() => navigate("/")} title="Go to App"
              className="text-xs font-bold text-[var(--color-brand)] hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all hidden sm:block">Go to App</button>
            <button onClick={() => navigate("/")} title="Go to App"
              className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-[var(--color-brand)] hover:bg-blue-100 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
              </svg>
            </button>
            <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition-all">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${tab === t ? "bg-[var(--color-brand)] text-white shadow-md" : "bg-blue-50/70 text-[var(--color-text-secondary)] border border-blue-100/80 hover:bg-blue-100"}`}>
              {t}
            </button>
          ))}
        </div>

        {loading && <Spinner />}

        {/* Overview */}
        {!loading && tab === "Overview" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Total Users" value={stats.totalUsers} icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>} />
            <StatCard label="Total Providers" value={stats.totalProviders} icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655m5.8-5.8 1.875-1.875a2.25 2.25 0 0 1 3.182 3.182l-1.875 1.875M11.42 15.17l-5.8-5.8" /></svg>} />
            <StatCard label="Categories" value={stats.totalServices} icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>} />
            <StatCard label="Bookings" value={stats.totalBookings} icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>} />
            <StatCard label="Reviews" value={stats.totalReviews} icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>} />
          </div>
        )}

        {/* Accounts */}
        {!loading && tab === "Accounts" && (
          <div className="space-y-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 text-sm mb-4" />
            {users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())).map(u => (
              <div key={u.id} className="bg-blue-50/70 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/80 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--color-brand-light)] flex items-center justify-center text-[var(--color-brand)] font-bold flex-shrink-0">
                    {u.profilePicture
                      ? <img src={u.profilePicture} alt="avatar" className="w-full h-full object-cover" />
                      : u.name?.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[var(--color-text)]">{u.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">{u.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${u.role === "SUPER_ADMIN" ? "bg-yellow-50 text-yellow-600" : u.role === "ADMIN" ? "bg-purple-50 text-purple-600" : u.role === "PROVIDER" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                    {u.role?.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex gap-1.5 flex-wrap mt-3">
                  {/* SUPER_ADMIN actions */}
                  {user?.role === "SUPER_ADMIN" && u.role === "CUSTOMER" && (
                    <button onClick={() => setConfirm({
                      message: `Promote "${u.name}" to Admin?`,
                      requirePassword: true,
                      onConfirm: async (pwd, setDialogErr) => {
                        try {
                          const res = await verifyPassword(pwd);
                          if (!res.valid) { setDialogErr("Incorrect password"); return; }
                          setConfirm(null);
                          await adminPromoteUser(u.id);
                          setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: "ADMIN" } : x));
                        } catch { setDialogErr("Something went wrong. Try again."); }
                      }
                    })}
                      className="text-xs font-bold text-purple-600 border-2 border-purple-200 hover:bg-purple-50 px-2.5 py-1.5 rounded-xl transition-all">
                      Promote
                    </button>
                  )}
                  {user?.role === "SUPER_ADMIN" && u.role === "ADMIN" && (
                    <>
                      <button onClick={() => setConfirm({
                        message: `Demote "${u.name}" back to Customer?`,
                        requirePassword: true,
                        onConfirm: async (pwd, setDialogErr) => {
                          try {
                            const res = await verifyPassword(pwd);
                            if (!res.valid) { setDialogErr("Incorrect password"); return; }
                            setConfirm(null);
                            await adminDemoteAdmin(u.id);
                            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: "CUSTOMER" } : x));
                          } catch { setDialogErr("Something went wrong. Try again."); }
                        }
                      })}
                        className="text-xs font-bold text-amber-600 border-2 border-amber-200 hover:bg-amber-50 px-2.5 py-1.5 rounded-xl transition-all">
                        Demote
                      </button>
                      <button onClick={() => setConfirm({
                          message: `Transfer Super Admin to "${u.name}"? You will become a regular Admin and be logged out.`,
                          requirePassword: true,
                          onConfirm: async (pwd, setDialogErr) => {
                            try {
                              const res = await verifyPassword(pwd);
                              if (!res.valid) { setDialogErr("Incorrect password"); return; }
                              setConfirm(null);
                              await adminTransferSuperAdmin(u.id);
                              setUsers(prev => prev.map(x =>
                                x.id === u.id ? { ...x, role: "SUPER_ADMIN" } :
                                x.id === user.id ? { ...x, role: "ADMIN" } : x
                              ));
                              logout();
                              navigate("/login");
                            } catch { setDialogErr("Something went wrong. Try again."); }
                          }
                        })}
                        className="text-xs font-bold text-yellow-600 border-2 border-yellow-200 hover:bg-yellow-50 px-2.5 py-1.5 rounded-xl transition-all">
                        Make SA
                      </button>
                    </>
                  )}
                  {/* Delete — not allowed on SUPER_ADMIN, ADMIN can only delete CUSTOMER/PROVIDER */}
                  {u.role !== "SUPER_ADMIN" && (user?.role === "SUPER_ADMIN" || (user?.role === "ADMIN" && u.role !== "ADMIN")) && (
                    <button onClick={() => setConfirm({ message: `Delete ${u.role === "PROVIDER" ? `provider` : `user`} "${u.name}"? This removes their bookings, reviews, favourites${u.role === "PROVIDER" ? " and services" : ""}.`, onConfirm: async () => { setConfirm(null); await adminDeleteUser(u.id); setUsers(prev => prev.filter(x => x.id !== u.id)); } })}
                      className="text-xs font-bold text-red-500 border-2 border-red-200 hover:bg-red-50 px-2.5 py-1.5 rounded-xl transition-all">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Services */}
        {!loading && tab === "Services" && (
          <div className="space-y-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or service..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 text-sm mb-4" />
            {providers.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.service?.name?.toLowerCase().includes(search.toLowerCase())).map(p => (
              <div key={p.id} className="bg-blue-50/70 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/80 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-light)] flex items-center justify-center text-[var(--color-brand)] font-bold flex-shrink-0">
                  🔧
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[var(--color-text)]">{p.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{p.service?.name} · {p.phone}</p>
                  {p.description && <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">{p.description}</p>}
                </div>
                <button onClick={() => setConfirm({ message: `Delete provider "${p.name}" (${p.service?.name})? This removes all their bookings, reviews and working hours.`, onConfirm: async () => { setConfirm(null); await adminDeleteProvider(p.id); setProviders(prev => prev.filter(x => x.id !== p.id)); } })}
                  className="text-xs font-bold text-red-500 border-2 border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all flex-shrink-0">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bookings */}
        {!loading && tab === "Bookings" && (
          <div className="space-y-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer or provider..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 text-sm mb-4" />
            {bookings.length === 0 && <p className="text-sm text-center text-[var(--color-text-secondary)] pt-10">No bookings yet.</p>}
            {bookings.filter(b =>
              b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
              b.providerName?.toLowerCase().includes(search.toLowerCase()) ||
              b.serviceName?.toLowerCase().includes(search.toLowerCase())
            ).map(b => (
              <div key={b.id} className="bg-blue-50/70 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/80 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-light)] flex items-center justify-center text-lg flex-shrink-0">📅</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-[var(--color-text)]">{b.customerName}</p>
                      <span className="text-xs text-[var(--color-text-secondary)]">to</span>
                      <p className="font-bold text-sm text-[var(--color-brand)]">{b.providerName}</p>
                      <span className="text-[10px] bg-blue-100 text-[var(--color-text-secondary)] px-2 py-0.5 rounded-full">{b.serviceName}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">🕐 {new Date(b.bookingTime).toLocaleString()}</p>
                    {b.note && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">📝 {b.note}</p>}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    b.status === "CONFIRMED" ? "bg-green-50 text-green-600" :
                    b.status === "CANCELLED" ? "bg-red-50 text-red-500" :
                    b.status === "COMPLETED" ? "bg-blue-50 text-blue-600" :
                    "bg-amber-50 text-amber-600"
                  }`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviews */}
        {!loading && tab === "Reviews" && (
          <div className="space-y-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user or provider..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 text-sm mb-4" />
            {reviews.length === 0 && <p className="text-sm text-center text-[var(--color-text-secondary)] pt-10">No reviews yet.</p>}
            {reviews.filter(r =>
              r.userName?.toLowerCase().includes(search.toLowerCase()) ||
              r.providerName?.toLowerCase().includes(search.toLowerCase()) ||
              r.serviceName?.toLowerCase().includes(search.toLowerCase())
            ).map(r => (
              <div key={r.id} className="bg-blue-50/70 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/80 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-light)] flex items-center justify-center text-lg flex-shrink-0">⭐</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-[var(--color-text)]">{r.userName}</p>
                      <span className="text-xs text-[var(--color-text-secondary)]">on</span>
                      <p className="font-bold text-sm text-[var(--color-brand)]">{r.providerName}</p>
                      <span className="text-[10px] bg-blue-100 text-[var(--color-text-secondary)] px-2 py-0.5 rounded-full">{r.serviceName}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`text-sm ${s <= r.rating ? "text-amber-400" : "text-gray-300"}`}>★</span>
                      ))}
                    </div>
                    {r.comment && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">"{r.comment}"</p>}
                  </div>
                  <p className="text-[10px] text-[var(--color-text-secondary)] flex-shrink-0">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories */}
        {!loading && tab === "Categories" && (
          <div className="space-y-3">
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">Rename categories or merge duplicates (e.g. "electric" → "Electrician")</p>
            {services.map(s => (
              <div key={s.id} className="bg-blue-50/70 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/80 shadow-sm">
                {renameTarget === s.id ? (
                  <div className="flex gap-2 items-center">
                    <input value={renameValue} onChange={e => setRenameValue(e.target.value)} autoFocus
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 text-sm" />
                    <button onClick={async () => { await adminRenameService(s.id, renameValue); setServices(prev => prev.map(x => x.id === s.id ? { ...x, name: renameValue } : x)); setRenameTarget(null); }}
                      className="px-3 py-2 rounded-xl bg-[var(--color-brand)] text-white text-xs font-bold hover:bg-[var(--color-brand-dark)] transition-all">Save</button>
                    <button onClick={() => setRenameTarget(null)} className="px-3 py-2 rounded-xl border-2 border-gray-300 text-xs font-bold text-[var(--color-text-secondary)] hover:bg-blue-100 transition-all">Cancel</button>
                  </div>
                ) : mergeTarget === s.id ? (
                  <MergeSelect
                    name={s.name}
                    options={services.filter(x => x.id !== s.id)}
                    value={mergeInto}
                    onChange={setMergeInto}
                    onMerge={async () => { if (!mergeInto) return; await adminMergeServices(parseInt(mergeInto), s.id); setServices(prev => prev.filter(x => x.id !== s.id)); setMergeTarget(null); setMergeInto(""); }}
                    onCancel={() => { setMergeTarget(null); setMergeInto(""); }}
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="flex-1 font-bold text-sm text-[var(--color-text)]">{s.name}</p>
                    <button onClick={() => { setRenameTarget(s.id); setRenameValue(s.name); }}
                      className="text-xs font-bold text-[var(--color-brand)] border-2 border-[var(--color-brand-light)] hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all">Rename</button>
                    <button onClick={() => { setMergeTarget(s.id); setMergeInto(""); }}
                      className="text-xs font-bold text-amber-600 border-2 border-amber-200 hover:bg-amber-50 px-3 py-1.5 rounded-xl transition-all">Merge</button>
                    <button onClick={() => setConfirm({ message: `Delete category "${s.name}"?`, onConfirm: async () => { setConfirm(null); const res = await adminDeleteService(s.id); if (res.message && !res.message.includes("deleted")) { setConfirm({ message: res.message, onConfirm: () => setConfirm(null), onCancel: null }); } else { setServices(prev => prev.filter(x => x.id !== s.id)); } } })}
                      className="text-xs font-bold text-red-500 border-2 border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
