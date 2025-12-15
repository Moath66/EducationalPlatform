// frontend/api/assignmentApi.js
import apiClient from "./apiClient";

/**
 * TEACHER
 * Create assignment
 * POST /api/assignments
 */
export async function createAssignment(payload) {
  const res = await apiClient.post("/api/assignments", payload);
  return res.data; // { message, payload }
}

/**
 * TEACHER
 * Get my assignments (optional: courseId)
 * GET /api/assignments/teacher?courseId=
 */
export async function fetchTeacherAssignments(params = {}) {
  const res = await apiClient.get("/api/assignments/teacher", { params });
  return res.data; // { message, payload: [...] }
}

/**
 * TEACHER
 * Update assignment
 * PUT /api/assignments/:id
 */
export async function updateAssignment(id, payload) {
  if (!id) throw new Error("assignment id is required");
  const res = await apiClient.put(`/api/assignments/${id}`, payload);
  return res.data;
}

/**
 * TEACHER
 * Delete assignment
 * DELETE /api/assignments/:id
 */
export async function deleteAssignment(id) {
  if (!id) throw new Error("assignment id is required");
  const res = await apiClient.delete(`/api/assignments/${id}`);
  return res.data;
}

/**
 * STUDENT
 * Get my assignments (optional: courseId)
 * GET /api/assignments/student?courseId=
 */
export async function fetchStudentAssignments(params = {}) {
  const res = await apiClient.get("/api/assignments/student", { params });
  return res.data; // { message, payload: [...] }
}
