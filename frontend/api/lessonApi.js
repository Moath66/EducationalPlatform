// frontend/api/lessonApi.js
import apiClient from "./apiClient";

/**
 * TEACHER
 * Create lesson
 * POST /api/lessons
 */
export async function createLesson(payload) {
  const res = await apiClient.post("/api/lessons", payload);
  return res.data; // { message, payload }
}

/**
 * TEACHER
 * Get my lessons (optional: courseId)
 * GET /api/lessons/teacher?courseId=
 */
export async function fetchTeacherLessons(params = {}) {
  const res = await apiClient.get("/api/lessons/teacher", { params });
  return res.data; // { message, payload: [...] }
}

/**
 * TEACHER
 * Update lesson
 * PUT /api/lessons/:id
 */
export async function updateLesson(id, payload) {
  if (!id) throw new Error("lesson id is required");
  const res = await apiClient.put(`/api/lessons/${id}`, payload);
  return res.data; // { message, payload }
}

/**
 * TEACHER
 * Delete lesson
 * DELETE /api/lessons/:id
 */
export async function deleteLesson(id) {
  if (!id) throw new Error("lesson id is required");
  const res = await apiClient.delete(`/api/lessons/${id}`);
  return res.data; // { message, payload }
}

/**
 * STUDENT
 * Get my lessons (optional: courseId)
 * GET /api/lessons/student?courseId=
 */
export async function fetchStudentLessons(params = {}) {
  const res = await apiClient.get("/api/lessons/student", { params });
  return res.data; // { message, payload: [...] }
}
