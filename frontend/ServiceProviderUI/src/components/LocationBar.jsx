// src/components/LocationBar.jsx
import { useState, useEffect, useRef } from "react";

export default function LocationBar({ onLocationSelect }) {
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
    onLocationSelect({ lat: parseFloat(place.lat), lon: parseFloat(place.lon) });
    setQuery(place.display_name.split(",").slice(0, 2).join(","));
    setResults([]);
  };

  return (
    <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a" }} className="w-full px-6 py-3 flex items-center gap-3">
      <span className="text-lg flex-shrink-0">📍</span>
      <p className="text-xs font-semibold text-amber-700 flex-shrink-0 hidden sm:block">Couldn't detect location —</p>
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your area, city or pincode..."
          className="w-full px-4 py-2 rounded-xl border border-amber-300 bg-white outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 text-sm text-[var(--color-text)]"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
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
    </div>
  );
}
