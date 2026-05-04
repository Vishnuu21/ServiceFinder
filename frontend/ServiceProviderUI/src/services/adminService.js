const API = import.meta.env.VITE_API_URL || "http://localhost:8080";
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" });

export const adminGetStats           = ()           => fetch(`${API}/admin/stats`, { headers: headers() }).then(r => r.json());
export const adminGetUsers           = ()           => fetch(`${API}/admin/users`, { headers: headers() }).then(r => r.json());
export const adminDeleteUser         = (id)         => fetch(`${API}/admin/users/${id}`, { method: "DELETE", headers: headers() }).then(r => r.json());
export const adminPromoteUser        = (id)         => fetch(`${API}/admin/users/${id}/promote`, { method: "POST", headers: headers() }).then(r => r.json());
export const adminDemoteAdmin        = (id)         => fetch(`${API}/admin/users/${id}/demote`, { method: "POST", headers: headers() }).then(r => r.json());
export const adminTransferSuperAdmin = (id)         => fetch(`${API}/admin/users/${id}/transfer-super-admin`, { method: "POST", headers: headers() }).then(r => r.json());
export const adminGetProviders       = ()           => fetch(`${API}/admin/providers`, { headers: headers() }).then(r => r.json());
export const adminDeleteProvider     = (id)         => fetch(`${API}/admin/providers/${id}`, { method: "DELETE", headers: headers() }).then(r => r.json());
export const adminGetServices        = ()           => fetch(`${API}/admin/services`, { headers: headers() }).then(r => r.json());
export const adminRenameService      = (id, name)   => fetch(`${API}/admin/services/${id}/rename`, { method: "PATCH", headers: headers(), body: JSON.stringify({ name }) }).then(r => r.json());
export const adminMergeServices      = (keepId, deleteId) => fetch(`${API}/admin/services/merge`, { method: "POST", headers: headers(), body: JSON.stringify({ keepId, deleteId }) }).then(r => r.json());
export const adminDeleteService      = (id)         => fetch(`${API}/admin/services/${id}`, { method: "DELETE", headers: headers() }).then(r => r.json());
export const verifyPassword          = (password)   => fetch(`${API}/auth/verify-password`, { method: "POST", headers: headers(), body: JSON.stringify({ password }) }).then(r => r.json());
export const adminGetBookings        = ()           => fetch(`${API}/admin/bookings`, { headers: headers() }).then(r => r.json());
export const adminGetReviews         = ()           => fetch(`${API}/admin/reviews`, { headers: headers() }).then(r => r.json());
