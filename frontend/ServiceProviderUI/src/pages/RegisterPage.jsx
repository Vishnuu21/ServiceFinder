// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { SHOW_WELCOME_SPLASH } from "../config/location";
import FloatingBackground from "../components/FloatingBackground";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CUSTOMER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password, form.role);
      saveUser(data, true);
      if (!SHOW_WELCOME_SPLASH) navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <FloatingBackground />
      <div className="relative z-10 bg-blue-50/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md border border-blue-100/80">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand)] flex items-center justify-center text-3xl mx-auto shadow-lg shadow-blue-200">🔧</div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text)] mt-3" style={{ fontFamily: "var(--font-display)" }}>Create Account</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Join Service Finder today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Full Name</label>
            <input name="name" type="text" value={form.name} onChange={(e) => {
                const val = e.target.value.replace(/\b\w/g, c => c.toUpperCase());
                setForm({ ...form, name: val });
              }} required placeholder="Enter your full name"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/60 border border-blue-100 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:bg-white transition-all text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Enter your email"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/60 border border-blue-100 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:bg-white transition-all text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Create a password"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/60 border border-blue-100 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:bg-white transition-all text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">I am a</label>
            <div className="flex gap-3 mt-2">
              {["CUSTOMER", "PROVIDER"].map((r) => (
                <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all
                    ${form.role === r ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]" : "bg-white/60 text-[var(--color-text-secondary)] border-blue-100"}`}>
                  {r === "CUSTOMER" ? "👤 Customer" : "🔧 Provider"}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[var(--color-brand)] text-white font-bold text-sm hover:bg-[var(--color-brand-dark)] active:scale-[0.97] transition-all disabled:opacity-60">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--color-brand)] font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
