// src/components/SearchSection.jsx
export default function SearchSection({ query, setQuery, onSearch }) {
  return (
    <section className="mb-10">
      <div className="mb-6">
        <h2 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)] mb-2"
          style={{ fontFamily: "var(--font-display)" }}>
          Find local experts
        </h2>
        <p className="text-base text-[var(--color-text-secondary)]">
          Professional services at your doorstep — search by service type.
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 group">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-placeholder)] group-focus-within:text-[var(--color-brand)] transition-colors">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="Search service (e.g. Plumber, Electrician)"
            className="w-full pl-12 pr-4 py-4 bg-[var(--color-muted)] border border-gray-300 rounded-2xl outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-placeholder)] focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:bg-white focus:border-[var(--color-brand)] transition-all text-sm"
          />
        </div>

        <button
          onClick={onSearch}
          className="px-8 py-4 rounded-2xl bg-[var(--color-brand)] text-white font-semibold text-sm shadow-lg shadow-blue-600/20 hover:bg-[var(--color-brand-dark)] active:scale-[0.97] transition-all whitespace-nowrap"
        >
          Search Nearby
        </button>
      </div>
    </section>
  );
}
