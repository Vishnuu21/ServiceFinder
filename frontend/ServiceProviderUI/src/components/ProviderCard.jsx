// src/components/ProviderCard.jsx
import { useState, useEffect } from "react";
import { addFavourite, removeFavourite, checkFavourite } from "../services/providerService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/* Renders one star icon (filled or empty) */
function Star({ filled }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-3 h-3"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  );
}

/* Avatar fallback when no image is provided */
function AvatarFallback({ name }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--color-brand-light)] text-[var(--color-brand)] font-bold text-lg">
      {initials}
    </div>
  );
}

export default function ProviderCard({ provider, selected, onSelect, onReview, onBook }) {
  const { name, distance, phone, rating, totalReviews, skills, available, image, favouriteCount: initialFavCount } = provider;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fav, setFav] = useState(false);
  const [favCount, setFavCount] = useState(initialFavCount || 0);

  const handleCardClick = () => navigate(`/provider/${provider.id}`);

  useEffect(() => {
    setFavCount(initialFavCount || 0);
  }, [initialFavCount]);

  useEffect(() => {
    if (user?.role === "CUSTOMER") {
      checkFavourite(provider.id).then(setFav).catch(() => {});
    }
  }, [provider.id, user]);

  const toggleFav = async (e) => {
    e.stopPropagation();
    try {
      if (fav) {
        await removeFavourite(provider.id);
        setFav(false);
        setFavCount(c => Math.max(0, c - 1));
      } else {
        await addFavourite(provider.id);
        setFav(true);
        setFavCount(c => c + 1);
      }
    } catch {}
  };

  return (
    <div
      onClick={() => handleCardClick()}
      className={`
        bg-blue-50/70 backdrop-blur-sm rounded-2xl p-5
        shadow-lg shadow-blue-900/5
        flex items-center gap-4
        hover:shadow-xl hover:shadow-blue-900/10 hover:scale-[1.015]
        transition-all duration-300 cursor-pointer
        border-2
        ${selected ? "border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20" : "border-blue-100/80"}
      `}
    >
      {/* Avatar */}
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
        {image ? (
          <img
            src={image}
            alt={`${name} profile`}
            className="w-full h-full object-cover"
          />
        ) : (
          <AvatarFallback name={name} />
        )}

        {/* Available dot */}
        <span
          className={`
            absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white
            ${available ? "bg-green-400" : "bg-slate-300"}
          `}
        />
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0">
        {/* Name + Rating row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-[var(--color-text)] leading-tight">{name}</h4>
            <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1 mt-0.5">
              {/* Location pin icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3 h-3 flex-shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M11.54 22.351l.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 1 0-16 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742Z"
                  clipRule="evenodd"
                />
              </svg>
              {distance}
            </p>
          </div>

          {/* Rating badge + Heart */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              onClick={(e) => { e.stopPropagation(); onReview(provider); }}
              className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full cursor-pointer hover:bg-amber-100 transition-all"
              title="View / Write Reviews"
            >
              <Star filled={true} />
              <span className="text-[11px] font-bold">
                {rating > 0 ? rating : "—"}
              </span>
              {totalReviews > 0 && (
                <span className="text-[10px] text-amber-600">({totalReviews})</span>
              )}
            </div>
            {user?.role === "CUSTOMER" && (
              <button onClick={toggleFav} title={fav ? "Remove from favourites" : "Add to favourites"}
                className="transition-all hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                  fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"
                  className={`w-5 h-5 ${fav ? "text-red-500" : "text-slate-300 hover:text-red-400"}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Skills + Call + Book */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex gap-1 flex-wrap">
            {skills.map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-[var(--color-muted)] text-[10px] rounded-full text-[var(--color-text-secondary)] font-medium">
                {skill}
              </span>
            ))}
            <span className="px-2 py-0.5 bg-red-50 text-[10px] rounded-full text-red-400 font-medium flex items-center gap-0.5">
              ❤️ {favCount}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href={`tel:${phone}`} onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[var(--color-brand)] font-bold text-xs hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
              </svg>
              {phone}
            </a>
            {onBook && (
              <button onClick={(e) => { e.stopPropagation(); onBook(provider); }}
                className="px-3 py-1 bg-[var(--color-brand)] text-white text-xs font-bold rounded-full hover:bg-[var(--color-brand-dark)] transition-all">
                Book
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
