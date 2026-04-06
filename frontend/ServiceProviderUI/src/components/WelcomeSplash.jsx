// src/components/WelcomeSplash.jsx
import { useEffect, useLayoutEffect, useState, useRef } from "react";

const ICONS = ["🔧", "⚡", "🪠", "🔨", "🪛", "🏠", "🔌", "🛠️", "🪚", "💡"];
const AVATAR_SIZE = 180;
const FLY_DURATION = 700;

export default function WelcomeSplash({ user, onDone }) {
  const avatarRef = useRef(null);
  const [phase, setPhase] = useState("enter");
  const [flip,  setFlip]  = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setPhase("measure"), 2400);
    return () => clearTimeout(t);
  }, []);

  useLayoutEffect(() => {
    if (phase !== "measure") return;

    const el     = avatarRef.current;
    const target = document.querySelector("[data-avatar]");
    if (!el || !target) { onDone(); return; }

    const first = el.getBoundingClientRect();
    const last  = target.getBoundingClientRect();

    setFlip({
      startTop:  first.top,
      startLeft: first.left,
      startSize: first.width,
      dx:    (last.left + last.width  / 2) - (first.left + first.width  / 2),
      dy:    (last.top  + last.height / 2) - (first.top  + first.height / 2),
      scale: last.width / first.width,
    });

    el.style.opacity = "0";

    requestAnimationFrame(() =>
      requestAnimationFrame(() => setPhase("flip"))
    );
  }, [phase]);

  useEffect(() => {
    if (phase !== "flip") return;
    const t = setTimeout(onDone, FLY_DURATION + 50);
    return () => clearTimeout(t);
  }, [phase]);

  const isFading = phase === "flip";

  return (
    <>
      <style>{`
        @keyframes sfFloat  { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-16px) rotate(5deg)} }
        @keyframes sfPopIn  { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        @keyframes sfFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sfFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes sfPulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
      `}</style>

      {/* Background + all content — fades out together */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 99998,
        background: "linear-gradient(135deg, #e8f0ff 0%, #f3eeff 55%, #e8f8ff 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "0 10vw", gap: "28px",
        overflow: "hidden", pointerEvents: "none",
        opacity: isFading ? 0 : 1,
        transition: isFading ? "opacity 0.15s ease" : "opacity 0.3s ease",
      }}>

        {/* Floating icons */}
        {ICONS.map((icon, i) => (
          <span key={i} style={{
            position: "absolute",
            left: `${(i * 11 + 5) % 92}%`,
            top:  `${(i * 17 + 8) % 88}%`,
            fontSize: `${1.3 + (i % 3) * 0.6}rem`,
            opacity: 0.1,
            animation: `sfFloat ${5 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}>{icon}</span>
        ))}

        {/* Blobs */}
        <div style={{ position:"absolute", width:"700px", height:"700px", borderRadius:"50%", top:"-250px", left:"-200px", background:"radial-gradient(circle, rgba(0,88,190,0.07) 0%, transparent 70%)", animation:"sfPulse 7s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:"600px", height:"600px", borderRadius:"50%", bottom:"-200px", right:"-150px", background:"radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)", animation:"sfPulse 9s ease-in-out infinite reverse", pointerEvents:"none" }} />

        {/* Avatar — original, hidden the moment clone takes over */}
        <div
          ref={avatarRef}
          style={{
            width: AVATAR_SIZE, height: AVATAR_SIZE, flexShrink: 0,
            borderRadius: "36px", overflow: "hidden",
            border: "4px solid rgba(0,88,190,0.12)",
            boxShadow: "0 20px 56px rgba(0,88,190,0.18), 0 0 0 8px rgba(0,88,190,0.05)",
            background: "#d8e2ff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "64px", fontWeight: 800, color: "#0058be",
            animation: "sfPopIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          {user.profilePicture
            ? <img src={user.profilePicture} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            : <span style={{ lineHeight:1 }}>{user.name?.charAt(0).toUpperCase()}</span>
          }
        </div>

        {/* Text */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", textAlign:"center" }}>
          <p style={{ margin:0, fontSize:"11px", fontWeight:700, color:"#0058be", letterSpacing:"0.22em", textTransform:"uppercase", animation:"sfFadeUp 0.5s ease 0.1s both" }}>
            {user.isNew ? "Welcome" : "Welcome back"}
          </p>
          <h1 style={{ margin:0, fontSize:"clamp(36px, 4.5vw, 64px)", fontWeight:800, color:"#191c1e", fontFamily:"Sora, sans-serif", lineHeight:1.0, animation:"sfFadeUp 0.5s ease 0.2s both" }}>
            {user.name}
          </h1>
          <div style={{ animation:"sfFadeUp 0.5s ease 0.3s both" }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"8px 22px", borderRadius:"999px", background:"#d8e2ff", color:"#0058be", fontSize:"14px", fontWeight:700 }}>
              {user.role === "PROVIDER" ? "🔧 Service Provider" : "👤 Customer"}
            </span>
          </div>
          <p style={{ margin:0, fontSize:"14px", color:"#9aa0b0", animation:"sfFadeUp 0.5s ease 0.4s both" }}>
            Service Finder · Ready to go
          </p>
        </div>
      </div>

      {/* FLIP clone — only exists during fly, no animation conflict */}
      {flip && (
        <div style={{
          position: "fixed",
          top:    flip.startTop,
          left:   flip.startLeft,
          width:  flip.startSize,
          height: flip.startSize,
          zIndex: 99999,
          pointerEvents: "none",
          overflow: "hidden",
          background: "#d8e2ff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "64px", fontWeight: 800, color: "#0058be",
          borderRadius: isFading ? "50%" : "36px",
          border: "4px solid rgba(0,88,190,0.12)",
          boxShadow: isFading ? "none" : "0 20px 56px rgba(0,88,190,0.18)",
          // ease(0,0,0.2,1) = starts fast, decelerates into target — no slow start
          transform: isFading
            ? `translate(${flip.dx}px, ${flip.dy}px) scale(${flip.scale})`
            : "translate(0,0) scale(1)",
          transition: isFading
            ? `transform ${FLY_DURATION}ms cubic-bezier(0,0,0.2,1), border-radius ${FLY_DURATION}ms ease, box-shadow 300ms ease`
            : "none",
        }}>
          {user.profilePicture
            ? <img src={user.profilePicture} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            : <span style={{ lineHeight:1 }}>{user.name?.charAt(0).toUpperCase()}</span>
          }
        </div>
      )}
    </>
  );
}
