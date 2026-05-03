// src/pages/LandingPage.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import FloatingBackground from "../components/FloatingBackground";
import { MapPin, Star, CalendarCheck, Briefcase, Heart, Clock, Search, Smartphone } from "lucide-react";

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function AnimatedSection({ children, className = "", delay = 0 }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={className}
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

const features = [
  { icon: MapPin, title: "Location-Based Search", desc: "Find skilled professionals near you sorted by real GPS distance.", color: "#0058be" },
  { icon: Star, title: "Ratings & Reviews", desc: "Read honest reviews from real customers before you book.", color: "#f59e0b" },
  { icon: CalendarCheck, title: "Easy Booking", desc: "Book a service in seconds — pick a time, add a note, done.", color: "#22c55e" },
  { icon: Briefcase, title: "Register Your Service", desc: "Providers can list services and reach customers nearby.", color: "#8b5cf6" },
  { icon: Heart, title: "Save Favourites", desc: "Save your go-to providers for quick access anytime.", color: "#ef4444" },
  { icon: Clock, title: "Live Availability", desc: "See who's available right now based on working hours.", color: "#06b6d4" },
];

const steps = [
  { step: "01", icon: MapPin, title: "Share your location", desc: "Allow GPS or search your area manually. We find what's near you.", color: "#0058be" },
  { step: "02", icon: Search, title: "Browse providers", desc: "See nearby professionals sorted by distance, rating and availability.", color: "#0058be" },
  { step: "03", icon: Smartphone, title: "Book instantly", desc: "Pick a time, add a note and confirm. Provider gets notified immediately.", color: "#0058be" },
];

const stats = [
  { value: "100%", label: "Free to use" },
  { value: "GPS", label: "Accurate distance" },
  { value: "Real-time", label: "Availability" },
  { value: "Secure", label: "JWT Auth" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [words, setWords] = useState(["Plumber", "Electrician", "Cleaner", "Carpenter", "Painter", "Mechanic"]);
  const [typedText, setTypedText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/services`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setWords(data.map(s => s.name)); })
      .catch(() => {}); // silently fall back to defaults
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const word = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setTypedText(word.slice(0, charIdx + 1));
        if (charIdx + 1 === word.length) setTimeout(() => setDeleting(true), 1200);
        else setCharIdx(c => c + 1);
      } else {
        setTypedText(word.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) { setDeleting(false); setWordIdx(i => (i + 1) % words.length); setCharIdx(0); }
        else setCharIdx(c => c - 1);
      }
    }, deleting ? 60 : 100);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx]);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <FloatingBackground />

      {/* Nav background matches FloatingBackground gradient */}

      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse2 { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:0.8} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .hero-title { animation: fadeInUp 0.9s ease both; }
        .hero-sub { animation: fadeInUp 0.9s ease 0.2s both; }
        .hero-btns { animation: fadeInUp 0.9s ease 0.4s both; }
        .hero-badge { animation: fadeInUp 0.9s ease 0.1s both; }
        .gradient-text {
          background: linear-gradient(135deg, #0058be 0%, #6366f1 50%, #0058be 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,88,190,0.15); }
        .cursor { display:inline-block; width:2px; height:1em; background:#0058be; margin-left:2px; animation:pulse2 0.8s ease infinite; vertical-align:text-bottom; }
        .features-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap:16px; }
        .steps-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:24px; }
        .stat-cards { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:48px; }
        .hero-btns-wrap { display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap; margin-bottom:16px; }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr; }
          .steps-grid { grid-template-columns: 1fr; }
          .stat-cards { gap:8px; }
          .cta-card { padding: 36px 20px !important; }
          .section-pad { padding: 60px 16px !important; }
          .hero-btn { padding: 14px 24px !important; font-size: 14px !important; width: 100%; }
          .hero-btns-wrap { flex-direction: column; align-items: stretch; padding: 0 16px; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, transition: "all 0.3s", background: "linear-gradient(135deg, #e0f0ff 0%, #f0e8ff 50%, #e8f5ff 100%)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,88,190,0.1)", boxShadow: scrolled ? "0 2px 20px rgba(0,88,190,0.08)" : "none" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#0058be", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 4px 12px rgba(0,88,190,0.3)" }}>🔧</div>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#191c1e", fontFamily: "var(--font-display)" }}>Service Finder</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => navigate("/login")}
              style={{ fontSize: "14px", fontWeight: 700, color: "#0058be", background: "none", border: "none", cursor: "pointer", padding: "8px 16px", borderRadius: "20px", transition: "background 0.2s" }}
              onMouseEnter={e => e.target.style.background = "rgba(0,88,190,0.08)"}
              onMouseLeave={e => e.target.style.background = "none"}>
              Sign In
            </button>
            <button onClick={() => navigate("/register")}
              style={{ fontSize: "14px", fontWeight: 700, color: "white", background: "#0058be", border: "none", cursor: "pointer", padding: "10px 16px", borderRadius: "24px", boxShadow: "0 4px 14px rgba(0,88,190,0.35)", transition: "all 0.2s", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.target.style.background = "#004395"; e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.background = "#0058be"; e.target.style.transform = "translateY(0)"; }}>
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(0,88,190,0.1)", color: "#0058be", fontSize: "12px", fontWeight: 700, padding: "6px 16px", borderRadius: "20px", marginBottom: "28px", border: "1px solid rgba(0,88,190,0.2)" }}>
            🌍 Built for local communities worldwide
          </div>

          <h1 className="hero-title" style={{ fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 800, lineHeight: 1.1, marginBottom: "16px", fontFamily: "var(--font-display)", color: "#191c1e" }}>
            Find Your Local<br />
            <span className="gradient-text">{typedText}<span className="cursor" /></span>
          </h1>

          <p className="hero-sub" style={{ fontSize: "18px", color: "#424754", marginBottom: "40px", maxWidth: "560px", margin: "0 auto 40px", lineHeight: 1.7 }}>
            Connect with trusted local professionals near you — sorted by distance, verified by reviews, available right now.
          </p>

          <div className="hero-btns hero-btns-wrap">
            <button onClick={() => navigate("/register")} className="hero-btn"
              style={{ padding: "16px 36px", borderRadius: "16px", background: "#0058be", color: "white", fontWeight: 700, fontSize: "16px", border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,88,190,0.35)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 32px rgba(0,88,190,0.45)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 24px rgba(0,88,190,0.35)"; }}>
              Get Started — It's Free
            </button>
            <button onClick={() => navigate("/login")} className="hero-btn"
              style={{ padding: "16px 36px", borderRadius: "16px", background: "white", color: "#191c1e", fontWeight: 700, fontSize: "16px", border: "2px solid #e1e2e4", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.borderColor = "#0058be"; e.target.style.color = "#0058be"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e1e2e4"; e.target.style.color = "#191c1e"; }}>
              Sign In
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#727785" }}>No credit card required · Free forever</p>
        </div>

        {/* Floating stat cards */}
        <div className="stat-cards">
          {stats.map((s, i) => (
            <div key={s.label} style={{ background: "white", borderRadius: "16px", padding: "16px 24px", boxShadow: "0 4px 20px rgba(0,88,190,0.1)", border: "1px solid rgba(0,88,190,0.08)", textAlign: "center", animation: `float ${3 + i * 0.5}s ease-in-out infinite ${i * 0.3}s` }}>
              <p style={{ fontSize: "20px", fontWeight: 800, color: "#0058be", margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: "11px", color: "#727785", margin: 0, fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Scroll hint — hides once user scrolls */}
        {!scrolled && (
          <div style={{ position: "absolute", bottom: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", animation: "float 2s ease-in-out infinite" }}>
            <p style={{ fontSize: "11px", color: "#727785", margin: 0 }}>Scroll to explore</p>
            <div style={{ width: "24px", height: "40px", border: "2px solid rgba(0,88,190,0.3)", borderRadius: "12px", display: "flex", justifyContent: "center", paddingTop: "6px" }}>
              <div style={{ width: "4px", height: "8px", background: "#0058be", borderRadius: "2px", animation: "float 1.5s ease-in-out infinite" }} />
            </div>
          </div>
        )}
      </section>

      {/* Features */}
      <section style={{ padding: "100px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <AnimatedSection className="text-center" style={{ marginBottom: "60px" }}>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#0058be", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>FEATURES</p>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#191c1e", fontFamily: "var(--font-display)", marginBottom: "12px" }}>Everything you need</h2>
              <p style={{ color: "#424754", fontSize: "16px" }}>Built for both customers and service providers</p>
            </div>
          </AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 80}>
                <div className="card-hover" style={{ background: "white", borderRadius: "20px", padding: "28px", border: "1px solid rgba(0,88,190,0.08)", boxShadow: "0 2px 12px rgba(0,88,190,0.06)", cursor: "default" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: `${f.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <f.icon size={24} color={f.color} strokeWidth={1.8} />
                  </div>
                  <h3 style={{ fontWeight: 700, color: "#191c1e", marginBottom: "8px", fontSize: "16px" }}>{f.title}</h3>
                  <p style={{ fontSize: "14px", color: "#424754", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "100px 24px", background: "linear-gradient(135deg, #0058be 0%, #1a3a8f 100%)", position: "relative", overflow: "hidden", zIndex: 1 }}>
        <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "600px", height: "600px", background: "rgba(255,255,255,0.03)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-30%", left: "-5%", width: "400px", height: "400px", background: "rgba(255,255,255,0.03)", borderRadius: "50%" }} />
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <AnimatedSection>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>HOW IT WORKS</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "white", fontFamily: "var(--font-display)", marginBottom: "60px" }}>Three steps to your expert</h2>
          </AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "32px" }}>
            {steps.map((s, i) => (
              <AnimatedSection key={s.step} delay={i * 150}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", backdropFilter: "blur(10px)" }}>
                    <s.icon size={30} color="white" strokeWidth={1.6} />
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "2px", marginBottom: "8px" }}>STEP {s.step}</div>
                  <h3 style={{ fontWeight: 700, color: "white", fontSize: "18px", marginBottom: "10px" }}>{s.title}</h3>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "80px 24px 100px", position: "relative", zIndex: 1 }}>
        <AnimatedSection>
          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center", background: "linear-gradient(135deg, #0058be 0%, #1a3a8f 100%)", borderRadius: "32px", padding: "60px 40px", boxShadow: "0 20px 60px rgba(0,88,190,0.3)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: "-60px", left: "-30px", width: "250px", height: "250px", background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔧</div>
              <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "white", fontFamily: "var(--font-display)", marginBottom: "12px" }}>Ready to find your expert?</h2>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "16px", marginBottom: "32px", lineHeight: 1.6 }}>
                Join as a customer to find services, or register as a provider to grow your business locally.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => navigate("/register")}
                  style={{ padding: "14px 32px", borderRadius: "14px", background: "white", color: "#0058be", fontWeight: 700, fontSize: "15px", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.15)", transition: "all 0.2s" }}
                  onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
                  Create Free Account
                </button>
                <button onClick={() => navigate("/login")}
                  style={{ padding: "14px 32px", borderRadius: "14px", background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 700, fontSize: "15px", border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", backdropFilter: "blur(10px)", transition: "all 0.2s" }}
                  onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.25)"}
                  onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.15)"}>
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(0,88,190,0.1)", padding: "32px 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
          {/* TODO: Add your social links here */}
          <a href="https://www.instagram.com/vishnuu__.__" target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "#727785", textDecoration: "none", padding: "6px 12px", borderRadius: "20px", border: "1px solid #e1e2e4", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#e1306c"; e.currentTarget.style.borderColor = "#e1306c"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#727785"; e.currentTarget.style.borderColor = "#e1e2e4"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            Instagram
          </a>
          <a href="https://youtube.com/@sasukex21yt" target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "#727785", textDecoration: "none", padding: "6px 12px", borderRadius: "20px", border: "1px solid #e1e2e4", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ff0000"; e.currentTarget.style.borderColor = "#ff0000"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#727785"; e.currentTarget.style.borderColor = "#e1e2e4"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            YouTube
          </a>
          <a href="https://github.com/Vishnuu21" target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "#727785", textDecoration: "none", padding: "6px 12px", borderRadius: "20px", border: "1px solid #e1e2e4", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#191c1e"; e.currentTarget.style.borderColor = "#191c1e"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#727785"; e.currentTarget.style.borderColor = "#e1e2e4"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
          {/* 
          <a href="https://linkedin.com/in/YOUR_LINKEDIN" target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "#727785", textDecoration: "none", padding: "6px 12px", borderRadius: "20px", border: "1px solid #e1e2e4", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#0077b5"; e.currentTarget.style.borderColor = "#0077b5"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#727785"; e.currentTarget.style.borderColor = "#e1e2e4"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
          </a> */}
          
        </div>
        <p style={{ fontSize: "12px", color: "#727785", margin: 0 }}>© 2025 Service Finder · Developed by Vishnu N</p>
      </footer>
    </div>
  );
}
