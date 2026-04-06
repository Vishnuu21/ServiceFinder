const BASE_URL = "http://localhost:8080/providers";
const SERVICES_URL = "http://localhost:8080/services";
const REVIEWS_URL = "http://localhost:8080/reviews";

export async function getServices() {
  const res = await fetch(SERVICES_URL);
  return res.json();
}

export async function getNearbyProviders(lat, lon) {
  const res = await fetch(`${BASE_URL}/nearby?lat=${lat}&lon=${lon}`);
  return res.json();
}

export async function searchProviders(lat, lon, serviceName) {
  const res = await fetch(`${BASE_URL}/search?lat=${lat}&lon=${lon}&serviceName=${serviceName}`);
  return res.json();
}

export async function getOrCreateService(name) {
  const res = await fetch(`${SERVICES_URL}/get-or-create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function registerProvider(providerData, token) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(providerData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

export async function getReviews(providerId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${REVIEWS_URL}/provider/${providerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function addReview(providerId, rating, comment) {
  const token = localStorage.getItem("token");
  const res = await fetch(REVIEWS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ providerId, rating, comment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add review");
  return data;
}

export async function editReview(reviewId, rating, comment) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${REVIEWS_URL}/${reviewId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating, comment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to edit review");
  return data;
}

const WORKING_HOURS_URL = "http://localhost:8080/working-hours";

export async function getWorkingHours(providerId) {
  const res = await fetch(`${WORKING_HOURS_URL}/provider/${providerId}`);
  return res.json();
}

export async function saveWorkingHours(day, startTime, endTime, active, providerId) {
  const token = localStorage.getItem("token");
  const res = await fetch(WORKING_HOURS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ day, startTime, endTime, active, providerId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save");
  return data;
}

const BOOKINGS_URL = "http://localhost:8080/bookings";

export async function createBooking(providerId, bookingTime, note) {
  const token = localStorage.getItem("token");
  const res = await fetch(BOOKINGS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ providerId, bookingTime, note }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create booking");
  return data;
}

export async function getMyBookings() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BOOKINGS_URL}/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function updateBookingStatus(bookingId, status) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BOOKINGS_URL}/${bookingId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update booking");
  return data;
}

export async function deleteReview(reviewId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${REVIEWS_URL}/${reviewId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete review");
}

const FAVOURITES_URL = "http://localhost:8080/favourites";

export async function getMyFavourites() {
  const token = localStorage.getItem("token");
  const res = await fetch(FAVOURITES_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function addFavourite(providerId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${FAVOURITES_URL}/${providerId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to add favourite");
}

export async function removeFavourite(providerId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${FAVOURITES_URL}/${providerId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove favourite");
}

export async function checkFavourite(providerId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${FAVOURITES_URL}/${providerId}/check`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.favourited;
}

export async function getMyFavouriteCount() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${FAVOURITES_URL}/my-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.count;
}

export async function getProviderById(id) {
  const res = await fetch(`http://localhost:8080/providers/${id}`);
  return res.json();
}

export async function getMyProviderServices() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${FAVOURITES_URL}/my-services`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function updateProviderService(providerId, data) {
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:8080/providers/${providerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update");
  return json;
}

export async function deleteProviderService(providerId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:8080/providers/${providerId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete service");
}
