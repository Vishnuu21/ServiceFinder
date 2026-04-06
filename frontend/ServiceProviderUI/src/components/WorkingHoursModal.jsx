// src/components/WorkingHoursModal.jsx
import { useState, useEffect } from "react";
import { getWorkingHours, saveWorkingHours } from "../services/providerService";
import { useScrollLock } from "../hooks/useScrollLock";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABEL = {
  MONDAY: "Monday", TUESDAY: "Tuesday", WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday", FRIDAY: "Friday", SATURDAY: "Saturday", SUNDAY: "Sunday"
};
const DEFAULT = { startTime: "09:00", endTime: "18:00", active: false };

function to12h(time24) {
  if (!time24) return { display: "9:00", ampm: "AM" };
  const [h, m] = time24.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { display: `${hour}:${String(m).padStart(2, "0")}`, ampm };
}

function to24h(display, ampm) {
  const [hStr, mStr] = (display || "12:00").split(":");
  let h = parseInt(hStr) || 0;
  const m = parseInt(mStr) || 0;
  if (ampm === "AM" && h === 12) h = 0;
  if (ampm === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function TimeInput({ value, onChange }) {
  const { display, ampm } = to12h(value);
  return (
    <div className="flex gap-1.5 mt-1.5 items-center">
      <input
        type="text"
        value={display}
        onChange={(e) => onChange(to24h(e.target.value, ampm))}
        placeholder="9:00"
        className="w-16 px-2 py-2 rounded-lg bg-blue-50 border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)] transition-all text-sm font-semibold text-center"
      />
      <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)] flex-shrink-0">
        {["AM", "PM"].map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => onChange(to24h(display, period))}
            className={`px-2 py-2 text-xs font-bold transition-all
              ${ampm === period
                ? "bg-[var(--color-brand)] text-white"
                : "bg-blue-50 text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)]"
              }`}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function WorkingHoursModal({ providerId, serviceName, onClose, onSaved }) {
  useScrollLock();
  const [schedule, setSchedule] = useState(
    Object.fromEntries(DAYS.map((d) => [d, { ...DEFAULT }]))
  );
  const [savedDays, setSavedDays] = useState({});
  const [savingDay, setSavingDay] = useState(null);
  const [unsavedDays, setUnsavedDays] = useState([]);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!providerId) return;
    getWorkingHours(providerId).then((data) => {
      if (!Array.isArray(data)) return;
      const updated = Object.fromEntries(DAYS.map((d) => [d, { ...DEFAULT }]));
      data.forEach((wh) => {
        updated[wh.day] = {
          startTime: wh.startTime || "09:00",
          endTime: wh.endTime || "18:00",
          active: wh.active,
        };
      });
      setSchedule(updated);
    }).catch(() => {});
  }, [providerId]);

  const handleChange = (day, field, value) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
    setSavedDays((prev) => ({ ...prev, [day]: false }));
    setUnsavedDays((prev) => prev.includes(day) ? prev : [...prev, day]);
  };

  const handleSave = async (day) => {
    setSavingDay(day);
    setError("");
    try {
      const { startTime, endTime, active } = schedule[day];
      await saveWorkingHours(day, startTime, endTime, active, providerId);
      setSavedDays((prev) => ({ ...prev, [day]: true }));
      setUnsavedDays((prev) => prev.filter(d => d !== day));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingDay(null);
    }
  };

  const handleSaveAll = async () => {
    setShowUnsavedPrompt(false);
    for (const day of unsavedDays) {
      await handleSave(day);
    }
    onSaved?.();
    onClose();
  };

  const handleDone = () => {
    if (unsavedDays.length > 0) {
      setShowUnsavedPrompt(true);
      return;
    }
    onSaved?.();
    onClose();
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", padding: "16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleDone(); }}
    >
      <div style={{ background: "#eff6ff", borderRadius: "24px", width: "100%", maxWidth: "520px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", position: "relative", overflow: "hidden" }}>

        {/* Unsaved changes prompt */}
          {showUnsavedPrompt && (
            <div className="absolute inset-0 bg-blue-50/95 backdrop-blur-sm rounded-3xl z-10 flex flex-col items-center justify-center px-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-lg font-extrabold text-[var(--color-text)] mb-2">Unsaved Changes</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                You have unsaved changes for:
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {unsavedDays.map(d => (
                  <span key={d} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                    {DAY_LABEL[d]}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => { setShowUnsavedPrompt(false); onSaved?.(); onClose(); }}
                  className="flex-1 py-3 rounded-2xl border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-sm hover:bg-[var(--color-muted)] transition-all">
                  Discard
                </button>
                <button onClick={handleSaveAll}
                  className="flex-1 py-3 rounded-2xl bg-[var(--color-brand)] text-white font-bold text-sm hover:bg-[var(--color-brand-dark)] transition-all">
                  Save All
                </button>
              </div>
            </div>
          )}

        {/* Sticky header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-[var(--color-border)] flex-shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}>
              Set Working Hours
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {serviceName ? `For: ${serviceName}` : "Customers see you as available during these hours"}
            </p>
          </div>
          <button onClick={handleDone}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] text-[var(--color-text-secondary)] text-lg font-bold transition-all">
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-8 py-6 space-y-3 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {DAYS.map((day) => {
            const isSaving = savingDay === day;
            const isSaved = savedDays[day];
            const isActive = schedule[day].active;

            return (
              <div key={day} className={`rounded-2xl border-2 p-4 transition-all ${isActive ? "border-[var(--color-brand)]/40 bg-blue-100/40" : "border-blue-100 bg-blue-50/50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleChange(day, "active", !isActive)}
                      className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${isActive ? "bg-[var(--color-brand)]" : "bg-gray-200"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isActive ? "left-5" : "left-0.5"}`} />
                    </button>
                    <span className="font-bold text-sm text-[var(--color-text)]">{DAY_LABEL[day]}</span>
                    <span className={`text-xs font-semibold ${isActive ? "text-green-600" : "text-slate-400"}`}>
                      {isActive ? "Open" : "Closed"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSave(day)}
                    disabled={isSaving}
                    className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all min-w-[72px] text-center disabled:opacity-60
                      ${isSaved ? "bg-green-100 text-green-700 border-2 border-green-200" : "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)]"}`}
                  >
                    {isSaving ? "Saving..." : isSaved ? "✓ Saved" : "Save"}
                  </button>
                </div>

                {isActive && (
                  <div className="flex items-center gap-2 mt-3">
                    <div>
                      <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">From</label>
                      <TimeInput value={schedule[day].startTime} onChange={(v) => handleChange(day, "startTime", v)} />
                    </div>
                    <span className="text-[var(--color-text-secondary)] font-bold mt-4">→</span>
                    <div>
                      <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">To</label>
                      <TimeInput value={schedule[day].endTime} onChange={(v) => handleChange(day, "endTime", v)} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky footer */}
        <div className="px-8 py-5 border-t border-[var(--color-border)] flex-shrink-0">
          <button
            onClick={handleDone}
            className="w-full py-3 rounded-2xl bg-[var(--color-brand)] text-white font-bold text-sm hover:bg-[var(--color-brand-dark)] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
