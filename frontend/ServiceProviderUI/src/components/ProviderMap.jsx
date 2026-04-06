// src/components/ProviderMap.jsx
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { USER_LOCATION, SHOW_MAP_ATTRIBUTION } from "../config/location";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// user location — pulsing blue dot
const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="
        position:absolute;inset:0;
        background:rgba(0,88,190,0.2);
        border-radius:50%;
        animation:pulse 1.8s ease-out infinite;">
      </div>
      <div style="
        position:absolute;top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:12px;height:12px;
        background:#0058be;border:2px solid white;
        border-radius:50%;
        box-shadow:0 2px 6px rgba(0,88,190,0.6);">
      </div>
    </div>
    <style>
      @keyframes pulse {
        0%   { transform: scale(0.8); opacity: 0.8; }
        100% { transform: scale(2.2); opacity: 0; }
      }
    </style>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// selected provider — orange pin
const selectedIcon = L.divIcon({
  className: "",
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="
        width:22px;height:22px;
        background:#ef4444;border:3px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 3px 10px rgba(239,68,68,0.5);">
      </div>
    </div>`,
  iconSize: [22, 28],
  iconAnchor: [11, 26],
});

// normal provider — red pin
const normalIcon = L.divIcon({
  className: "",
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="
        width:16px;height:16px;
        background:#ef4444;border:2px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 6px rgba(239,68,68,0.3);">
      </div>
    </div>`,
  iconSize: [16, 20],
  iconAnchor: [8, 18],
});

function MapController({ selectedProvider, markerRefs }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedProvider?.lat) return;
    map.flyTo([selectedProvider.lat, selectedProvider.lon], 15, { duration: 1 });
    setTimeout(() => {
      markerRefs.current[selectedProvider.id]?.openPopup();
    }, 1100);
  }, [selectedProvider]);

  return null;
}

export default function ProviderMap({ providers, coords, selectedProvider }) {
  const markerRefs = useRef({});

  const displayCoords =
    coords?.lat && coords.lat !== 0
      ? coords
      : providers.length > 0
      ? { lat: providers[0].lat - 0.005, lon: providers[0].lon - 0.005 }
      : { lat: USER_LOCATION.lat, lon: USER_LOCATION.lon };

  const center = selectedProvider?.lat
    ? [selectedProvider.lat, selectedProvider.lon]
    : [displayCoords.lat, displayCoords.lon];

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--color-border)]/40 shadow-sm" style={{ height: "calc(50.5vh - 100px)" }}>
      <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true} attributionControl={SHOW_MAP_ATTRIBUTION}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />

        <MapController selectedProvider={selectedProvider} markerRefs={markerRefs} />

        {/* user location marker */}
        {displayCoords && (
          <Marker position={[displayCoords.lat, displayCoords.lon]} icon={userIcon}>
            <Popup>
              <p style={{ fontWeight: "bold", fontSize: "12px" }}>📍 Your Location</p>
            </Popup>
          </Marker>
        )}

        {/* provider markers */}
        {providers.map((p) =>
          p.lat && p.lon ? (
            <Marker
              key={p.id}
              position={[p.lat, p.lon]}
              icon={selectedProvider?.id === p.id ? selectedIcon : normalIcon}
              ref={(ref) => { if (ref) markerRefs.current[p.id] = ref; }}
            >
              <Popup>
                <div style={{ minWidth: "130px" }}>
                  <p style={{ fontWeight: "bold", marginBottom: "2px" }}>{p.name}</p>
                  <p style={{ color: "#666", fontSize: "12px" }}>{p.skills[0]}</p>
                  <p style={{ color: "#666", fontSize: "12px" }}>{p.distance}</p>
                  <a href={`tel:${p.phone}`} style={{ color: "#0058be", fontWeight: "600", fontSize: "12px" }}>
                    📞 {p.phone}
                  </a>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}
