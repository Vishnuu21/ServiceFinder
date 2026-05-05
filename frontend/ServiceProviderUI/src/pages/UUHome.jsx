import { useState } from "react";
import { Search, MapPin, Star, Phone } from "lucide-react";

const providersMock = [
  {
    id: 1,
    name: "Raj Plumber",
    distance: "0.5 km",
    rating: 4.8,
    services: ["Pipe Repair", "Installation"],
    phone: "9876543210",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
  },
  {
    id: 2,
    name: "Amit Electric",
    distance: "1.2 km",
    rating: 4.9,
    services: ["Wiring", "LED"],
    phone: "9123456780",
    image: "https://images.unsplash.com/photo-1581091870622-3e7f2f7c9c5d",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Service Finder</h1>
          <div className="w-10 h-10 rounded-full bg-gray-100" />
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-10">
        {/* LEFT SECTION */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold mb-2">Find local experts</h2>
          <p className="text-gray-500 mb-6">
            Professional services at your doorstep
          </p>

          {/* Search */}
          <div className="flex gap-3 mb-8">
            <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow w-full">
              <Search className="text-gray-400 mr-2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search service..."
                className="outline-none w-full"
              />
            </div>
            <button className="bg-blue-600 text-white px-6 rounded-xl">
              Search
            </button>
          </div>

          {/* Providers */}
          <div className="space-y-4">
            {providersMock.map((p) => (
              <div
                key={p.id}
                className="bg-white p-4 rounded-xl shadow flex gap-4"
              >
                <img
                  src={p.image}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-bold">{p.name}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      <Star size={14} /> {p.rating}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} /> {p.distance}
                  </div>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    {p.services.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <a
                    href={`tel:${p.phone}`}
                    className="text-blue-600 text-sm flex items-center gap-1 mt-2"
                  >
                    <Phone size={14} /> {p.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SECTION (Desktop only) */}
        <div className="hidden lg:block">
          <div className="bg-white p-4 rounded-xl shadow h-[400px] flex items-center justify-center text-gray-400">
            Map / Filters Panel
          </div>
        </div>
      </main>

      {/* Bottom Nav (Mobile only) */}
      <div className="fixed bottom-0 w-full bg-white shadow lg:hidden flex justify-around py-3">
        <span>Search</span>
        <span>Bookings</span>
        <span>Favorites</span>
        <span>Profile</span>
      </div>
    </div>
  );
}
