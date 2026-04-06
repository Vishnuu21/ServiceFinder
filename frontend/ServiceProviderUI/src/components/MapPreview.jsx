// src/components/MapPreview.jsx

export default function MapPreview({ nearbyCount = 0, coords }) {
  const handleOpenMap = () => {
    const lat = coords?.lat || 0;
    const lon = coords?.lon || 0;
    const url = lat === 0 && lon === 0
      ? "https://www.google.com/maps"
      : `https://www.google.com/maps/@${lat},${lon},15z`;
    window.open(url, "_blank");
  };
  return (
    <div className="rounded-2xl overflow-hidden relative h-44 bg-[var(--color-muted)] group">
      {/* Map image */}
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBkv-4GkRF6P0xgnH7yaCWBa2eYO9asDgikC1xmQ1QqgMTCO7jm4DxKr_j-ashEBNUBvRAE13Qb_0mgCbKhoOJrtMP2jz5vijy8xFerUv7qKv_ALfS6wYdZ2g6L2Qz1PyKJ05mpeZKyQeNMw7GslP4aAUC6GA6DFmxqYUwH01I7gXP7IYI-yYqaCjf-xcKV8ybzm6euh1uTFszvyaLgAM4NncmtGjc2EbpDP-k8jkVl18Rnao7mKBknOBLTCBaqXfo0ZgHct5zedfa"
        alt="Map view of nearby area"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Nearby count badge */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow">
          <span className="w-2 h-2 rounded-full bg-[var(--color-brand)] animate-pulse" />
          <span className="text-[11px] font-bold text-[var(--color-text)]">
            {nearbyCount} Pros nearby
          </span>
        </div>
      </div>

      {/* Open map button */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          onClick={handleOpenMap}
          className="
            bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full
            text-[11px] font-bold text-[var(--color-brand)] shadow
            hover:bg-white transition-colors
          "
        >
          Open Map →
        </button>
      </div>
    </div>
  );
}
