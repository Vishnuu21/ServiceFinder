// src/components/LocationModal.jsx
import { useState } from "react";

export default function LocationModal({ onAllow, onDismiss }) {
  const [tried, setTried] = useState(false);

  const handleAllow = () => {
    setTried(true);
    onAllow();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">

        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
            className="w-10 h-10 text-[var(--color-brand)]">
            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 1 0-16 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742Z" clipRule="evenodd" />
          </svg>
        </div>

        <h2 className="text-xl font-extrabold text-[var(--color-text)] mb-2 text-center"
          style={{ fontFamily: "var(--font-display)" }}>
          Enable Location
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-5 text-center leading-relaxed">
          Service Finder needs your location to show nearby professionals sorted by distance.
        </p>

        {tried && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
            <p className="text-xs font-bold text-amber-800 mb-2">⚠️ Location access failed</p>
            <p className="text-xs text-amber-700 mb-2">Try these steps:</p>
            <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
              <li>Click the 🔒 lock icon in the address bar</li>
              <li>Go to <strong>Site Settings → Location → Allow</strong></li>
              <li>Refresh the page and try again</li>
            </ol>
          </div>
        )}

        <button
          onClick={handleAllow}
          className="w-full py-3.5 rounded-2xl bg-[var(--color-brand)] text-white font-bold text-sm hover:bg-[var(--color-brand-dark)] active:scale-[0.97] transition-all mb-3"
        >
          📍 Allow Location Access
        </button>
        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-2xl text-[var(--color-text-secondary)] text-sm font-semibold hover:bg-[var(--color-muted)] transition-all"
        >
          Not Now — Continue Without Location
        </button>
      </div>
    </div>
  );
}
