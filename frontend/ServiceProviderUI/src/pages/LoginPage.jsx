// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { SHOW_WELCOME_SPLASH } from "../config/location";
import FloatingBackground from "../components/FloatingBackground";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      saveUser(data);
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
          <h1 className="text-2xl font-extrabold text-[var(--color-text)] mt-3" style={{ fontFamily: "var(--font-display)" }}>Service Finder</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/60 border border-blue-100 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:bg-white transition-all text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/60 border border-blue-100 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:bg-white transition-all text-sm" />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[var(--color-brand)] text-white font-bold text-sm hover:bg-[var(--color-brand-dark)] active:scale-[0.97] transition-all disabled:opacity-60">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-[var(--color-brand)] font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
