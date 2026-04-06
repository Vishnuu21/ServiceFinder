// src/pages/MyBookingsPage.jsx
import { useState, useEffect } from "react";
import { getMyBookings, updateBookingStatus } from "../services/providerService";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import FloatingBackground from "../components/FloatingBackground";

const STATUS_STYLES = {
  PENDING:   "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-500 border-red-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
};

const STATUS_ICONS = {
  PENDING: "⏳", CONFIRMED: "✅", CANCELLED: "❌", COMPLETED: "🎉"
};

function formatDateTime(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen relative flex items-center justify-center">
      <FloatingBackground />
      <div className="w-8 h-8 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen relative">
      <FloatingBackground />
      <Header />
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display)" }}>
          My Bookings
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {user?.role === "PROVIDER" ? "Manage booking requests from customers" : "Track your service bookings"}
        </p>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="font-bold text-lg text-[var(--color-text)]">No bookings yet</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {user?.role === "PROVIDER" ? "Customers will appear here when they book your service" : "Book a service to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-blue-50/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/80 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Provider / Customer name */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-light)] flex items-center justify-center text-[var(--color-brand)] font-bold text-sm flex-shrink-0">
                      {(user?.role === "PROVIDER" ? b.customerName : b.providerName)?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[var(--color-text)]">
                        {user?.role === "PROVIDER" ? b.customerName : b.providerName}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{b.serviceName}</p>
                    </div>
                  </div>

                  {/* Date & time */}
                  <div className="flex items-center gap-1.5 mt-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[var(--color-brand)]">
                      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold text-[var(--color-text)]">{formatDateTime(b.bookingTime)}</span>
                  </div>

                  {/* Note */}
                  {b.note && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-2 bg-[var(--color-muted)] px-3 py-2 rounded-lg">
                      📝 {b.note}
                    </p>
                  )}

                  {/* Phone for customer */}
                  {user?.role === "CUSTOMER" && b.providerPhone && (
                    <a href={`tel:${b.providerPhone}`} className="text-xs text-[var(--color-brand)] font-semibold mt-2 flex items-center gap-1">
                      📞 {b.providerPhone}
                    </a>
                  )}
                </div>

                {/* Status badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${STATUS_STYLES[b.status]}`}>
                  {STATUS_ICONS[b.status]} {b.status}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                {user?.role === "CUSTOMER" && b.status === "PENDING" && (
                  <button onClick={() => handleStatus(b.id, "CANCELLED")}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 border-2 border-red-200 hover:bg-red-50 transition-all">
                    Cancel Booking
                  </button>
                )}
                {user?.role === "PROVIDER" && b.status === "PENDING" && (
                  <>
                    <button onClick={() => handleStatus(b.id, "CONFIRMED")}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] transition-all">
                      Accept
                    </button>
                    <button onClick={() => handleStatus(b.id, "CANCELLED")}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 border-2 border-red-200 hover:bg-red-50 transition-all">
                      Reject
                    </button>
                  </>
                )}
                {user?.role === "PROVIDER" && b.status === "CONFIRMED" && (
                  <button onClick={() => handleStatus(b.id, "COMPLETED")}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-all">
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
