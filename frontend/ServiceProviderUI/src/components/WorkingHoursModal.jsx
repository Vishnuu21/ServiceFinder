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
  if (!time24) return { hour: 9, minute: 0, ampm: "AM" };
  const [h, m] = time24.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { hour, minute: m, ampm };
}

function to24h(hour, minute, ampm) {
  let h = hour;
  if (ampm === "AM" && h === 12) h = 0;
  if (ampm === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function SpinBox({ value, min, max, pad, onChange }) {
  const [draft, setDraft] = useState(String(value).padStart(pad ? 2 : 1, "0"));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(value).padStart(pad ? 2 : 1, "0"));
  }, [value, focused]);

  const handleBlur = () => {
    setFocused(false);
    let v = parseInt(draft);
    if (isNaN(v) || v < min) v = min;
    if (v > max) v = max;
    onChange(v);
    setDraft(String(v).padStart(pad ? 2 : 1, "0"));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={draft}
      onFocus={(e) => { setFocused(true); e.target.select(); }}
      onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 2))}
      onBlur={handleBlur}
      className="w-10 h-9 text-center bg-white border-2 border-[var(--color-brand)] rounded-lg text-sm font-extrabold text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
    />
  );
}

function TimeInput({ value, onChange }) {
  const { hour, minute, ampm } = to12h(value);

  return (
    <div className="flex items-center gap-1.5 mt-2">
      <SpinBox value={hour} min={1} max={12} pad={false} onChange={(h) => onChange(to24h(h, minute, ampm))} />
      <span className="font-extrabold text-[var(--color-text-secondary)] text-sm mb-0.5">:</span>
      <SpinBox value={minute} min={0} max={59} pad={true} onChange={(m) => onChange(to24h(hour, m, ampm))} />
      <div className="flex flex-col gap-1 ml-1">
        {["AM", "PM"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(to24h(hour, minute, p))}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all
              ${ampm === p ? "bg-[var(--color-brand)] text-white" : "bg-blue-50 text-[var(--color-text-secondary)] hover:bg-blue-100"}`}
          >
            {p}
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
    for (const day of unsavedDays) await handleSave(day);
    onSaved?.();
    onClose();
  };

  const handleDone = () => {
    if (unsavedDays.length > 0) { setShowUnsavedPrompt(true); return; }
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
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">You have unsaved changes for:</p>
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
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-[var(--color-border)] flex-shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
              Set Working Hours
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {serviceName ? `For: ${serviceName}` : "Set your availability for customers"}
            </p>
          </div>
          <button onClick={handleDone}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] text-[var(--color-text-secondary)] text-lg font-bold transition-all flex-shrink-0">
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-4 py-4 space-y-3 flex-1">
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
              <div key={day} className={`rounded-2xl border-2 p-3 transition-all ${isActive ? "border-[var(--color-brand)]/40 bg-blue-100/40" : "border-blue-100 bg-blue-50/50"}`}>
                {/* Toggle row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleChange(day, "active", !isActive)}
                      className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${isActive ? "bg-[var(--color-brand)]" : "bg-gray-200"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? "left-5" : "left-0.5"}`} />
                    </button>
                    <span className="font-bold text-sm text-[var(--color-text)] truncate">{DAY_LABEL[day]}</span>
                    <span className={`text-[11px] font-semibold flex-shrink-0 ${isActive ? "text-green-600" : "text-slate-400"}`}>
                      {isActive ? "Open" : "Closed"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSave(day)}
                    disabled={isSaving}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all flex-shrink-0 disabled:opacity-60
                      ${isSaved ? "bg-green-100 text-green-700 border-2 border-green-200" : "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)]"}`}
                  >
                    {isSaving ? "..." : isSaved ? "✓ Saved" : "Save"}
                  </button>
                </div>

                {/* From / To spinners */}
                {isActive && (
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-blue-200/60">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">From</p>
                      <TimeInput value={schedule[day].startTime} onChange={(v) => handleChange(day, "startTime", v)} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">To</p>
                      <TimeInput value={schedule[day].endTime} onChange={(v) => handleChange(day, "endTime", v)} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky footer */}
        <div className="px-4 py-4 border-t border-[var(--color-border)] flex-shrink-0">
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
