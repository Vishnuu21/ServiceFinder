const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const PROVIDERS_URL = `${API_BASE}/providers`;
export const SERVICES_URL = `${API_BASE}/services`;
export const REVIEWS_URL = `${API_BASE}/reviews`;
export const WORKING_HOURS_URL = `${API_BASE}/working-hours`;
export const BOOKINGS_URL = `${API_BASE}/bookings`;
export const FAVOURITES_URL = `${API_BASE}/favourites`;
export const AUTH_URL = `${API_BASE}/auth`;
