// src/components/FloatingBackground.jsx
const ICONS = ["🔧", "⚡", "🪠", "🔨", "🪛", "🏠", "🔌", "🛠️", "🪚", "💡"];

export default function FloatingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: "linear-gradient(135deg, #e0f0ff 0%, #f0e8ff 50%, #e8f5ff 100%)" }}>
      {ICONS.map((icon, i) => (
        <span key={i} style={{
          position: "absolute",
          left: `${(i * 11 + 5) % 95}%`,
          top: `${(i * 17 + 10) % 90}%`,
          fontSize: `${1.2 + (i % 3) * 0.6}rem`,
          opacity: 0.12,
          animation: `floatIcon ${4 + (i % 4)}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`,
        }}>{icon}</span>
      ))}
      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(8deg); }
        }
      `}</style>
    </div>
  );
}
