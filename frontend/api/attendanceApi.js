// frontend/api/attendanceApi.js
import apiClient from "./apiClient";

/**
 * Get attendance records for a session
 * GET /api/attendance/session/:sessionId
 * Returns: { session: {...}, records: [...] }
 */
export async function fetchAttendanceBySession(sessionId) {
  if (!sessionId) throw new Error("sessionId is required");
  const res = await apiClient.get(`/api/attendance/session/${sessionId}`);
  return res.data;
}

/**
 * Save attendance for a session (bulk upsert)
 * POST /api/attendance/session/:sessionId
 * body: { records: [ { studentId, status, note? }, ... ] }
 * Returns: { message, result: { matched, modified, upserted } }
 */
export async function saveAttendanceForSession(sessionId, records = []) {
  if (!sessionId) throw new Error("sessionId is required");
  if (!Array.isArray(records)) throw new Error("records must be an array");

  const res = await apiClient.post(`/api/attendance/session/${sessionId}`, {
    records,
  });

  return res.data;
}

/**
 * Student: get my attendance
 * GET /api/attendance/student/me
 * Returns: { records: [...] }
 */
export async function fetchMyAttendance() {
  const res = await apiClient.get("/api/attendance/student/me");
  return res.data;
}
