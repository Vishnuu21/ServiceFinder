// src/components/LocationBar.jsx
import { useState, useEffect, useRef } from "react";

export default function LocationBar({ onLocationSelect, onDismiss, savedLabel }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 3) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query]);

  const handleSelect = (place) => {
    const coords = { lat: parseFloat(place.lat), lon: parseFloat(place.lon) };
    const label = place.display_name.split(",").slice(0, 2).join(",").trim();
    localStorage.setItem("savedLocation", JSON.stringify({ ...coords, label }));
    onLocationSelect(coords);
    setQuery(label);
    setResults([]);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div style={{ background: "#eff6ff" }} className="rounded-3xl shadow-2xl w-full max-w-md p-8 border border-blue-100 relative">
        {onDismiss && (
          <button onClick={onDismiss}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-100 text-[var(--color-text-secondary)] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📍</div>
          <h2 className="text-xl font-extrabold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
            Couldn't detect location
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {savedLabel
              ? <>Currently using <span className="font-bold text-[var(--color-text)]">{savedLabel}</span>. Search below to change it.</>
              : "Search your area, city or pincode to find nearby providers."}
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your area, city or pincode..."
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)] text-sm text-[var(--color-text)]"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
          )}
          {results.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {results.map((r) => (
                <li key={r.place_id}
                  onClick={() => handleSelect(r)}
                  className="px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 truncate">
                  📍 {r.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {savedLabel && onDismiss && (
          <button onClick={onDismiss}
            className="w-full mt-4 py-2.5 rounded-2xl border-2 border-[var(--color-brand-light)] text-[var(--color-brand)] text-sm font-bold hover:bg-blue-100 transition-all">
            Keep using "{savedLabel}"
          </button>
        )}
      </div>
    </div>
  );
}
