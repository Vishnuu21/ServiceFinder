// src/components/ProviderList.jsx
import ProviderCard from "./ProviderCard";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 flex gap-4 animate-pulse border border-[var(--color-border)]/40">
      <div className="w-16 h-16 rounded-xl bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function ProviderList({ providers, loading, selectedProvider, onSelect, onReview, onBook }) {
  return (
    <section>
      <h3 className="font-bold text-[var(--color-text)] mb-4 text-lg"
        style={{ fontFamily: "var(--font-display)" }}>
        Nearby Professionals
      </h3>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-[var(--color-text)] font-semibold text-lg mb-1">No providers found nearby</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Try a different search term or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              selected={selectedProvider?.id === provider.id}
              onSelect={onSelect}
              onReview={onReview}
              onBook={onBook}
            />
          ))}
        </div>
      )}
    </section>
  );
}
