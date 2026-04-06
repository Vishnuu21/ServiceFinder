// src/services/authService.js
const BASE_URL = "http://localhost:8080/auth";

async function parseError(res) {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json.message || json || text;
  } catch {
    return text;
  }
}

export async function register(name, email, password, role) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function uploadProfilePicture(base64Image) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/profile-picture`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ profilePicture: base64Image }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
