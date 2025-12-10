// src/api/coursesApi.js
import apiClient from "./apiClient";

/**
 * Get courses list
 * @param {Object} params - optional query params (search, page, limit... حسب الباك)
 */
export async function fetchCourses(params = {}) {
  const res = await apiClient.get("/api/courses", { params });
  return res.data;
}

/**
 * Get course details by id
 */
export async function fetchCourseById(courseId) {
  if (!courseId) throw new Error("courseId is required");
  const res = await apiClient.get(`/api/courses/${courseId}`);
  return res.data;
}

/**
 * Get students enrolled in a course
 */
export async function fetchCourseStudents(courseId) {
  if (!courseId) throw new Error("courseId is required");
  const res = await apiClient.get(`/api/courses/${courseId}/students`);
  return res.data;
}

/**
 * (Optional) Admin: Create course
 */
export async function createCourse(payload) {
  const res = await apiClient.post("/api/courses", payload);
  return res.data;
}

/**
 * (Optional) Admin: Update course
 */
export async function updateCourse(courseId, payload) {
  if (!courseId) throw new Error("courseId is required");
  const res = await apiClient.put(`/api/courses/${courseId}`, payload);
  return res.data;
}

/**
 * (Optional) Admin: Delete course
 */
export async function deleteCourse(courseId) {
  if (!courseId) throw new Error("courseId is required");
  const res = await apiClient.delete(`/api/courses/${courseId}`);
  return res.data;
}
