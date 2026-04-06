// src/components/BookingModal.jsx
import { useState } from "react";
import { createBooking } from "../services/providerService";
import { useScrollLock } from "../hooks/useScrollLock";
import DateTimePicker from "./DateTimePicker";

export default function BookingModal({ provider, onClose, onSuccess }) {
  useScrollLock();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // min date = today
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      setError("Please select a date and time");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const bookingTime = `${date}T${time}`;
      await createBooking(provider.id, bookingTime, note);
      setSuccess(true);
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#eff6ff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-[var(--color-border)]">
          <div>
            <h2
              className="text-xl font-extrabold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Book Service
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {provider.name} · {provider.skills[0]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] text-[var(--color-text-secondary)] text-lg font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="px-8 py-10 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-lg font-extrabold text-[var(--color-text)]">
              Booking Confirmed!
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Your booking request has been sent to {provider.name}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            {/* Provider info card */}
            <div className="#eff6ff rounded-2xl p-4 flex items-center gap-3 border border-gray-500">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--color-brand-light)] flex items-center justify-center text-[var(--color-brand)] font-bold flex-shrink-0">
                {provider.image || provider.profilePicture ? (
                  <img
                    src={provider.image || provider.profilePicture}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  provider.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--color-text)]">
                  {provider.name}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {provider.skills[0]} · {provider.distance}
                </p>
              </div>
            </div>

            {/* Date & Time */}
            <DateTimePicker
              date={date}
              time={time}
              onDateChange={setDate}
              onTimeChange={setTime}
              minDate={today}
            />

            {/* Note */}
            <div>
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Note <span className="normal-case font-normal">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe your issue or any special instructions..."
                rows={3}
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)] transition-all text-sm resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-sm hover:bg-[var(--color-muted)] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 rounded-2xl bg-[var(--color-brand)] text-white font-bold text-sm hover:bg-[var(--color-brand-dark)] active:scale-[0.97] transition-all disabled:opacity-60"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
