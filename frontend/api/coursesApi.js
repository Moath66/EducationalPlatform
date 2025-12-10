// src/api/coursesApi.js
import apiClient from "./apiClient";

/**
 * Get courses list
 * @param {Object} params - optional query params (q, teacherId, isActive...)
 */
export async function fetchCourses(params = {}) {
  const res = await apiClient.get("/api/courses", { params });
  return res.data; // غالباً { courses: [...] }
}

/**
 * Get course details by id
 */
export async function fetchCourseById(courseId) {
  if (!courseId) throw new Error("courseId is required");
  const res = await apiClient.get(`/api/courses/${courseId}`);
  return res.data; // { course }
}

/**
 * Get students enrolled in a course
 */
export async function fetchCourseStudents(courseId) {
  if (!courseId) throw new Error("courseId is required");
  const res = await apiClient.get(`/api/courses/${courseId}/students`);
  return res.data; // { students: [...] }
}

/**
 * Admin: Create course
 */
export async function createCourse(payload) {
  const res = await apiClient.post("/api/courses", payload);
  return res.data; // { message, course }
}

/**
 * Admin: Update course
 */
export async function updateCourse(courseId, payload) {
  if (!courseId) throw new Error("courseId is required");
  const res = await apiClient.put(`/api/courses/${courseId}`, payload);
  return res.data; // { message, course }
}

/**
 * Admin: Delete course
 */
export async function deleteCourse(courseId) {
  if (!courseId) throw new Error("courseId is required");
  const res = await apiClient.delete(`/api/courses/${courseId}`);
  return res.data; // { message }
}

/**
 * Admin/Teacher: Update course students
 * body: { studentIds: [...] }  (استبدال القائمة)
 */
export async function updateCourseStudents(courseId, studentIds = []) {
  if (!courseId) throw new Error("courseId is required");
  if (!Array.isArray(studentIds)) {
    throw new Error("studentIds must be an array");
  }
  const res = await apiClient.put(`/api/courses/${courseId}/students`, {
    studentIds,
  });
  return res.data; // { message, courseId, students }
}
