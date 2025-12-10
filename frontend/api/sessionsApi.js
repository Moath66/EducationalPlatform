// src/api/sessionsApi.js
import apiClient from "./apiClient";

/**
 * Get sessions list
 * params مثال:
 * { q, status, courseId, teacherId, from, to, page, limit, sort }
 */
export async function fetchSessions(params = {}) {
  const res = await apiClient.get("/api/sessions", { params });
  return res.data; // { sessions, total, page, limit }
}

export async function fetchSessionById(id) {
  if (!id) throw new Error("session id is required");
  const res = await apiClient.get(`/api/sessions/${id}`);
  return res.data; // { session }
}

export async function createSession(payload) {
  const res = await apiClient.post("/api/sessions", payload);
  return res.data; // { message, session }
}

export async function updateSession(id, payload) {
  if (!id) throw new Error("session id is required");
  const res = await apiClient.put(`/api/sessions/${id}`, payload);
  return res.data; // { message, session }
}

export async function deleteSession(id) {
  if (!id) throw new Error("session id is required");
  const res = await apiClient.delete(`/api/sessions/${id}`);
  return res.data; // { message }
}

/**
 * Helpful wrappers
 */
export async function fetchUpcomingSessions({ limit = 50 } = {}) {
  const nowIso = new Date().toISOString();
  return fetchSessions({
    from: nowIso,
    status: "scheduled",
    sort: "startAt",
    limit,
  });
}

export async function fetchTeacherUpcomingSessions(
  teacherId,
  { limit = 50 } = {}
) {
  if (!teacherId) throw new Error("teacherId is required");
  const nowIso = new Date().toISOString();
  return fetchSessions({
    teacherId,
    from: nowIso,
    status: "scheduled",
    sort: "startAt",
    limit,
  });
}
