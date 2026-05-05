// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/useAuth";
import { SHOW_WELCOME_SPLASH } from "../config/location";
import FloatingBackground from "../components/FloatingBackground";

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577A11.217 11.217 0 0 1 12 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
      <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.243 4.243ZM6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A3.75 3.75 0 0 1 6.75 12Z" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      if (!SHOW_WELCOME_SPLASH) navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <FloatingBackground />
      <div className="relative z-10 bg-blue-50/70 backdrop-blur-xl rounded-3xl shadow-2xl p-7 w-full max-w-md border border-blue-100/80">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand)] flex items-center justify-center text-2xl mx-auto shadow-lg shadow-blue-200">🔧</div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text)] mt-3" style={{ fontFamily: "var(--font-display)" }}>Service Finder</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Email</label>
            <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/60 border border-blue-100 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:bg-white transition-all text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password"
                className="w-full mt-1 px-4 py-3 rounded-xl bg-white/60 border border-blue-100 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:bg-white transition-all text-sm pr-10" />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] transition-colors mt-0.5">
                <EyeIcon open={showPassword} />
              </button>
            </div>
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
