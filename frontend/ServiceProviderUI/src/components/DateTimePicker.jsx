// src/components/DateTimePicker.jsx
import { useState } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function DateTimePicker({ date, time, onDateChange, onTimeChange }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [showCal, setShowCal] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("AM");

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const handleDayClick = (day) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onDateChange(`${viewYear}-${mm}-${dd}`);
    setShowCal(false);
  };

  const isSelected = (day) => {
    if (!date) return false;
    const [y, m, d] = date.split("-").map(Number);
    return y === viewYear && m === viewMonth + 1 && d === day;
  };

  const isToday = (day) => {
    return today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day;
  };

  const isPast = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0,0,0,0);
    const t = new Date();
    t.setHours(0,0,0,0);
    return d < t;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const applyTime = () => {
    let h = parseInt(hour);
    if (ampm === "AM" && h === 12) h = 0;
    if (ampm === "PM" && h !== 12) h += 12;
    const hh = String(h).padStart(2, "0");
    const mm = String(parseInt(minute)).padStart(2, "0");
    onTimeChange(`${hh}:${mm}`);
    setShowTime(false);
  };

  const displayDate = date
    ? new Date(date + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Select date";

  const displayTime = time
    ? (() => {
        const [h, m] = time.split(":").map(Number);
        const ap = h < 12 ? "AM" : "PM";
        const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${hr}:${String(m).padStart(2,"0")} ${ap}`;
      })()
    : "Select time";

  return (
    <div className="grid grid-cols-2 gap-3">

      {/* Date picker */}
      <div className="relative">
        <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Date</label>
        <button type="button" onClick={() => { setShowCal(!showCal); setShowTime(false); }}
          className={`w-full mt-1.5 px-4 py-3 rounded-xl text-sm font-semibold text-left flex items-center gap-2 transition-all border-2
            ${showCal ? "bg-white border-[var(--color-brand)]/40 ring-2 ring-[var(--color-brand)]/20" : "bg-white border-gray-300"}
            ${date ? "text-[var(--color-text)]" : "text-[var(--color-text-placeholder)]"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[var(--color-brand)] flex-shrink-0">
            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
          </svg>
          <span className="truncate">{displayDate}</span>
        </button>

        {showCal && (
          <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] p-4 w-72">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-text-secondary)] font-bold">‹</button>
              <span className="text-sm font-bold text-[var(--color-text)]">{MONTHS[viewMonth]} {viewYear}</span>
              <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-text-secondary)] font-bold">›</button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-[var(--color-text-secondary)] py-1">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const day = i + 1;
                const past = isPast(day);
                const sel = isSelected(day);
                const tod = isToday(day);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={past}
                    onClick={() => handleDayClick(day)}
                    className={`h-8 w-full rounded-lg text-xs font-semibold transition-all
                      ${sel ? "bg-[var(--color-brand)] text-white" :
                        tod ? "border-2 border-[var(--color-brand)] text-[var(--color-brand)]" :
                        past ? "text-gray-300 cursor-not-allowed" :
                        "hover:bg-[var(--color-muted)] text-[var(--color-text)]"}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Time picker */}
      <div className="relative">
        <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Time</label>
        <button type="button" onClick={() => { setShowTime(!showTime); setShowCal(false); }}
          className={`w-full mt-1.5 px-4 py-3 rounded-xl text-sm font-semibold text-left flex items-center gap-2 transition-all border-2
            ${showTime ? "bg-white border-[var(--color-brand)]/40 ring-2 ring-[var(--color-brand)]/20" : "bg-white border-gray-300"}
            ${time ? "text-[var(--color-text)]" : "text-[var(--color-text-placeholder)]"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[var(--color-brand)] flex-shrink-0">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
          </svg>
          <span>{displayTime}</span>
        </button>

        {showTime && (
          <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] p-5 w-56">
            <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Select Time</p>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={hour}
                onChange={(e) => setHour(e.target.value.replace(/\D/g,"").slice(0,2))}
                placeholder="09"
                className="w-14 px-3 py-2.5 rounded-xl bg-[var(--color-muted)] text-center text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:bg-white transition-all"
              />
              <span className="font-bold text-[var(--color-text-secondary)]">:</span>
              <input
                type="text"
                value={minute}
                onChange={(e) => setMinute(e.target.value.replace(/\D/g,"").slice(0,2))}
                placeholder="00"
                className="w-14 px-3 py-2.5 rounded-xl bg-[var(--color-muted)] text-center text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:bg-white transition-all"
              />
              <div className="flex flex-col gap-1">
                {["AM","PM"].map(p => (
                  <button key={p} type="button" onClick={() => setAmpm(p)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all
                      ${ampm === p ? "bg-[var(--color-brand)] text-white" : "bg-[var(--color-muted)] text-[var(--color-text-secondary)] hover:bg-gray-200"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick time chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {["9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","4:00 PM","6:00 PM"].map(t => (
                <button key={t} type="button"
                  onClick={() => {
                    const [hm, ap] = t.split(" ");
                    const [h, m] = hm.split(":");
                    setHour(h); setMinute(m); setAmpm(ap);
                  }}
                  className="px-2 py-1 rounded-full text-[10px] font-semibold bg-[var(--color-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-brand-light)] hover:text-[var(--color-brand)] transition-all">
                  {t}
                </button>
              ))}
            </div>

            <button type="button" onClick={applyTime}
              className="w-full py-2.5 rounded-xl bg-[var(--color-brand)] text-white text-xs font-bold hover:bg-[var(--color-brand-dark)] transition-all">
              Confirm Time
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
