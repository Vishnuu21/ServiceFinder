// src/components/CategoryGrid.jsx
import { useState, useRef, useEffect } from "react";

const ICONS = ["🔧", "⚡", "🧹", "🪚", "🎨", "🌿", "🔨", "🚿", "❄️", "🛠️"];

export default function CategoryGrid({ activeCategory, onSelect, categories }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-bold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Quick Categories
        </h3>

        {/* View All button + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((p) => !p)}
            className="text-[var(--color-brand)] text-xs font-semibold uppercase tracking-wider"
          >
            View All {showDropdown ? "▲" : "▼"}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-[var(--color-border)] z-50 py-2">
              <button
                onClick={() => { onSelect(null); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[var(--color-muted)] transition-colors"
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { onSelect(cat.name); setShowDropdown(false); }}
                  className={`
                    w-full text-left px-4 py-2 text-xs font-semibold
                    hover:bg-[var(--color-muted)] transition-colors
                    ${activeCategory === cat.name ? "text-[var(--color-brand)]" : "text-[var(--color-text)]"}
                  `}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onSelect(null)}
          className={`
            flex-shrink-0
            px-4 py-2 rounded-full text-xs font-semibold border
            transition-all duration-200 active:scale-95
            ${
              activeCategory === null
                ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-md shadow-blue-500/20"
                : "bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-brand)]/40"
            }
          `}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.name)}
            className={`
              flex-shrink-0
              px-4 py-2 rounded-full text-xs font-semibold border
              transition-all duration-200 active:scale-95
              ${
                activeCategory === cat.name
                  ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-md shadow-blue-500/20"
                  : "bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-brand)]/40"
              }
            `}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </section>
  );
}
