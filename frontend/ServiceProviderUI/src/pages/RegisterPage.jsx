// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";
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

function getStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-red-400" };
  if (score === 2) return { score, label: "Fair", color: "bg-amber-400" };
  if (score === 3) return { score, label: "Good", color: "bg-blue-400" };
  return { score, label: "Strong", color: "bg-green-500" };
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CUSTOMER" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveUser } = useAuth();
  const navigate = useNavigate();

  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (strength.score < 3) { setError("Password is too weak. Use 8+ characters with uppercase, numbers and symbols."); return; }
    if (form.password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password, form.role);
      saveUser(data, true);
      if (!SHOW_WELCOME_SPLASH) navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full mt-1 px-4 py-3 rounded-xl bg-white/60 border border-blue-100 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:bg-white transition-all text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <FloatingBackground />
      <div className="relative z-10 bg-blue-50/70 backdrop-blur-xl rounded-3xl shadow-2xl p-7 w-full max-w-md border border-blue-100/80">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand)] flex items-center justify-center text-2xl mx-auto shadow-lg shadow-blue-200">🔧</div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text)] mt-3" style={{ fontFamily: "var(--font-display)" }}>Create Account</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Join Service Finder today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Full Name</label>
            <input name="name" type="text" value={form.name} onChange={(e) => {
              const val = e.target.value.replace(/\b\w/g, c => c.toUpperCase());
              setForm({ ...form, name: val });
            }} required placeholder="Enter your full name" className={inputCls} />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Email</label>
            <input name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="Enter your email" className={inputCls} />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Password</label>
            <div className="relative">
              <input name="password" type={showPassword ? "text" : "password"} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required placeholder="Create a password" className={`${inputCls} pr-10`} />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] transition-colors mt-0.5">
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {/* Strength bar */}
            {form.password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : "bg-gray-200"}`} />
                  ))}
                </div>
                <p className={`text-xs font-semibold ${strength.score <= 1 ? "text-red-500" : strength.score === 2 ? "text-amber-500" : strength.score === 3 ? "text-blue-500" : "text-green-600"}`}>
                  {strength.label} — {strength.score < 3 ? "Use 8+ chars, uppercase, numbers & symbols" : "Good to go!"}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required placeholder="Re-enter your password" className={`${inputCls} pr-10`} />
              <button type="button" onClick={() => setShowConfirm(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] transition-colors mt-0.5">
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {confirmPassword.length > 0 && form.password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1 font-semibold">Passwords do not match</p>
            )}
            {confirmPassword.length > 0 && form.password === confirmPassword && (
              <p className="text-xs text-green-600 mt-1 font-semibold">✓ Passwords match</p>
            )}
          </div>

          {/* Role */}
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
