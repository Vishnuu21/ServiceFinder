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
  PENDING:   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 inline-block"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" /></svg>,
  CONFIRMED: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 inline-block"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" /></svg>,
  CANCELLED: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 inline-block"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" /></svg>,
  COMPLETED: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 inline-block"><path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" /></svg>,
};

function formatDateTime(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function BookingCard({ b, user, onAction }) {
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  return (
    <div className="bg-blue-50/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/80 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[var(--color-brand-light)] flex items-center justify-center text-[var(--color-brand)] font-bold text-sm flex-shrink-0">
              {user?.role === "CUSTOMER" && b.providerProfilePicture
                ? <img src={b.providerProfilePicture} alt={b.providerName} className="w-full h-full object-cover" />
                : (user?.role === "PROVIDER" ? b.customerName : b.providerName)?.charAt(0).toUpperCase()
              }
            </div>
            <div>
              {isAdmin ? (
                <p className="font-bold text-sm text-[var(--color-text)]">
                  {b.customerName} → {b.providerName}
                </p>
              ) : (
                <p className="font-bold text-sm text-[var(--color-text)]">
                  {user?.role === "PROVIDER" ? b.customerName : b.providerName}
                </p>
              )}
              <p className="text-xs text-[var(--color-text-secondary)]">{b.serviceName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[var(--color-brand)]">
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-[var(--color-text)]">{formatDateTime(b.bookingTime)}</span>
          </div>

          {b.note && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-2 bg-[var(--color-muted)] px-3 py-2 rounded-lg">
              📝 {b.note}
            </p>
          )}

          {user?.role === "CUSTOMER" && b.providerPhone && (
            <a href={`tel:${b.providerPhone}`} className="text-xs text-[var(--color-brand)] font-semibold mt-2 flex items-center gap-1">
              📞 {b.providerPhone}
            </a>
          )}
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 flex items-center gap-1 ${STATUS_STYLES[b.status]}`}>
          {STATUS_ICONS[b.status]} {b.status}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {user?.role === "CUSTOMER" && b.status === "PENDING" && (
          <button onClick={() => onAction(b.id, "CANCELLED")}
            className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 border-2 border-red-200 hover:bg-red-50 transition-all">
            Cancel Booking
          </button>
        )}
        {user?.role === "PROVIDER" && b.status === "PENDING" && (
          <>
            <button onClick={() => onAction(b.id, "CONFIRMED")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] transition-all">
              Accept
            </button>
            <button onClick={() => onAction(b.id, "CANCELLED")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 border-2 border-red-200 hover:bg-red-50 transition-all">
              Reject
            </button>
          </>
        )}
        {user?.role === "PROVIDER" && b.status === "CONFIRMED" && (
          <button onClick={() => onAction(b.id, "COMPLETED")}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-all">
            Mark Complete
          </button>
        )}
        {isAdmin && b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
          <>
            {b.status === "PENDING" && (
              <button onClick={() => onAction(b.id, "CONFIRMED")}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] transition-all">
                Confirm
              </button>
            )}
            {b.status === "CONFIRMED" && (
              <button onClick={() => onAction(b.id, "COMPLETED")}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-all">
                Mark Complete
              </button>
            )}
            <button onClick={() => onAction(b.id, "CANCELLED")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 border-2 border-red-200 hover:bg-red-50 transition-all">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

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

  const myBookings = isAdmin ? bookings.filter(b => b.customerId === user?.userId) : [];
  const othersBookings = isAdmin ? bookings.filter(b => b.customerId !== user?.userId) : [];

  return (
    <div className="min-h-screen relative">
      <FloatingBackground />
      <Header />
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-28 md:pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}>
            {isAdmin ? "All Bookings" : "My Bookings"}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {user?.role === "PROVIDER" ? "Manage booking requests from customers"
              : isAdmin ? "Manage all bookings"
              : "Track your service bookings"}
          </p>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="font-bold text-lg text-[var(--color-text)]">No bookings yet</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {user?.role === "PROVIDER" ? "Customers will appear here when they book your service"
                : isAdmin ? "No bookings in the system yet"
                : "Book a service to get started"}
            </p>
          </div>
        ) : isAdmin ? (
          <div className="space-y-8">
            {myBookings.length > 0 && (
              <div>
                <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Your Bookings</p>
                <div className="space-y-4">
                  {myBookings.map(b => <BookingCard key={b.id} b={b} user={user} onAction={handleStatus} />)}
                </div>
              </div>
            )}
            <div>
              {myBookings.length > 0 && (
                <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">All Users' Bookings</p>
              )}
              <div className="space-y-4">
                {othersBookings.map(b => <BookingCard key={b.id} b={b} user={user} onAction={handleStatus} />)}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => <BookingCard key={b.id} b={b} user={user} onAction={handleStatus} />)}
          </div>
        )}
      </div>
    </div>
  );
}
