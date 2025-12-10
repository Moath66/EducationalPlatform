// frontend/api/adminApi.js
import apiClient from "./apiClient";

export async function fetchAdminStats() {
  const [studentsRes, teachersRes, sessionsRes, coursesRes] = await Promise.all(
    [
      apiClient.get("/api/users", { params: { role: "student" } }),
      apiClient.get("/api/users/teachers"),
      apiClient.get("/api/sessions", { params: { limit: 1 } }), // نجيب total لو موجود
      apiClient.get("/api/courses"),
    ]
  );

  // users endpoints عندك ترجع Array غالباً
  const students = Array.isArray(studentsRes.data)
    ? studentsRes.data
    : studentsRes.data.users || [];
  const teachers = Array.isArray(teachersRes.data)
    ? teachersRes.data
    : teachersRes.data.users || [];

  // courses غالبًا { courses: [...] } أو [...]
  const courses = Array.isArray(coursesRes.data)
    ? coursesRes.data
    : coursesRes.data.courses || [];

  // sessions غالبًا { sessions, total } حسب sessionController
  const sessionsPayload = sessionsRes.data || {};
  const sessions = Array.isArray(sessionsPayload)
    ? sessionsPayload
    : sessionsPayload.sessions || [];
  const totalSessions =
    typeof sessionsPayload.total === "number"
      ? sessionsPayload.total
      : sessions.length;

  return {
    studentsCount: students.length,
    teachersCount: teachers.length,
    coursesCount: courses.length,
    sessionsCount: totalSessions,
  };
}
