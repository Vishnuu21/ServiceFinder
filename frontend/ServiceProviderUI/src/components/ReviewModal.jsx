// src/components/ReviewModal.jsx
import { useState, useEffect } from "react";
import { getReviews, addReview, editReview, deleteReview } from "../services/providerService";
import { useAuth } from "../context/AuthContext";
import { useScrollLock } from "../hooks/useScrollLock";

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="text-2xl transition-transform active:scale-90"
        >
          <span className={s <= value ? "text-amber-400" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ value }) {
  return (
    <span className="text-sm">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= value ? "text-amber-400" : "text-gray-300"}>★</span>
      ))}
    </span>
  );
}

export default function ReviewModal({ provider, onClose, onReviewChange }) {
  const { user } = useAuth();
  useScrollLock();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchReviews = async () => {
    const data = await getReviews(provider.id);
    const sorted = [...data].sort((a, b) => (b.isOwner ? 1 : 0) - (a.isOwner ? 1 : 0));
    setReviews(sorted);
    const mine = sorted.find((r) => r.isOwner);
    setMyReview(mine || null);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (editingId) {
        await editReview(editingId, rating, comment);
      } else {
        await addReview(provider.id, rating, comment);
      }
      setRating(5);
      setComment("");
      setEditingId(null);
      await fetchReviews();
      onReviewChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment || "");
  };

  const handleDelete = async (reviewId) => {
    setConfirmDelete(false);
    try {
      await deleteReview(reviewId);
      await fetchReviews();
      onReviewChange();
    } catch (err) {
      setError(err.message);
    }
  };

  const canReview = user?.role === "CUSTOMER" && !myReview;
  const isEditing = editingId !== null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", padding: "16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#eff6ff", borderRadius: "24px", width: "100%", maxWidth: "500px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}>
              Reviews — {provider.name}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              {provider.rating > 0 && ` · ⭐ ${provider.rating} `}
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-muted)] text-[var(--color-text-secondary)] text-lg font-bold transition-all">
            ✕
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* Delete confirmation */}
          {confirmDelete && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-sm font-bold text-red-700 mb-3">Delete your review?</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2 rounded-xl border-2 border-[var(--color-border)] text-sm font-bold text-[var(--color-text-secondary)] hover:bg-blue-50 transition-all">
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all">
                  Yes, Delete
                </button>
              </div>
            </div>
          )}

          {/* Write / Edit review form */}
          {(canReview || isEditing) && (
            <div className="bg-[var(--color-muted)] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-[var(--color-text)] mb-3">
                {isEditing ? "Edit Your Review" : "Write a Review"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <StarPicker value={rating} onChange={setRating} />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience (optional)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)] transition-all text-sm resize-none"
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <div className="flex gap-2">
                  {isEditing && (
                    <button type="button" onClick={() => { setEditingId(null); setRating(5); setComment(""); }}
                      className="flex-1 py-2.5 rounded-xl border-2 border-[var(--color-border)] text-sm font-bold text-[var(--color-text-secondary)] hover:bg-blue-50 transition-all">
                      Cancel
                    </button>
                  )}
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand)] text-white text-sm font-bold hover:bg-[var(--color-brand-dark)] transition-all disabled:opacity-60">
                    {loading ? "Saving..." : isEditing ? "Update Review" : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Already reviewed message */}
          {myReview && !isEditing && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 font-semibold">
              ✅ You have already reviewed this provider. You can edit or delete your review below.
            </div>
          )}

          {/* Provider only message */}
          {user?.role === "PROVIDER" && (
            <div className="bg-[var(--color-muted)] rounded-2xl p-4 text-xs text-[var(--color-text-secondary)] text-center">
              Only customers can write reviews.
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            user?.role !== "PROVIDER" && (
              <p className="text-center text-sm text-[var(--color-text-secondary)] py-6">
                No reviews yet. Be the first to review!
              </p>
            )
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className={`rounded-2xl p-4 border ${r.isOwner ? "border-[var(--color-brand)]/30 bg-blue-100/40" : "border-blue-100 bg-blue-50/50"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[var(--color-brand-light)] flex items-center justify-center text-[var(--color-brand)] font-bold text-xs">
                          {r.userName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-[var(--color-text)]">{r.userName}</span>
                        {r.isOwner && <span className="text-[10px] bg-[var(--color-brand)] text-white px-2 py-0.5 rounded-full">You</span>}
                      </div>
                      <div className="mt-1 ml-9">
                        <StarDisplay value={r.rating} />
                        {r.comment && <p className="text-sm text-[var(--color-text-secondary)] mt-1">{r.comment}</p>}
                        <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {r.isOwner && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => handleEdit(r)}
                          className="text-xs text-[var(--color-brand)] font-semibold hover:underline px-2 py-1">
                          Edit
                        </button>
                        <button onClick={() => setConfirmDelete(r.id)}
                          className="text-xs text-red-500 font-semibold hover:underline px-2 py-1">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
