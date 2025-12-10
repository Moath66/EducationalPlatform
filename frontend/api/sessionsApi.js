// src/api/sessionsApi.js

const BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function getToken() {
  return localStorage.getItem("token"); // غيّرها لو اسم التوكن مختلف
}

async function request(path, options = {}) {
  const token = getToken();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const ct = res.headers.get("content-type") || "";
    const isJson = ct.includes("application/json");
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const msg =
        (data && data.message) ||
        (typeof data === "string" && data) ||
        `Request failed: ${res.status}`;
      throw new Error(msg);
    }

    return data;
  } catch (e) {
    if (e.name === "AbortError")
      throw new Error("انتهت مهلة الاتصال بالسيرفر (timeout).");
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

export function fetchSessions(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "" || v === "all") return;
    qs.set(k, String(v));
  });

  const query = qs.toString();
  return request(`/api/sessions${query ? `?${query}` : ""}`, { method: "GET" });
}

export function createSession(payload) {
  return request("/api/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSession(id, payload) {
  return request(`/api/sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteSession(id) {
  return request(`/api/sessions/${id}`, { method: "DELETE" });
}

export function fetchSessionById(id) {
  return request(`/api/sessions/${id}`, { method: "GET" });
}
