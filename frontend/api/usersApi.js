// frontend/api/usersApi.js
import apiClient from "./apiClient";

/**
 * Admin only - list users
 * GET /api/users?role=&approved=
 * ملاحظة: عندك في الباك getAllUsers يرجّع Array مباشرة (مو {users})
 */
export async function fetchUsers(params = {}) {
  const res = await apiClient.get("/api/users", { params });
  return res.data; // Array of users
}

/**
 * Admin only - list teachers (for dropdowns)
 * GET /api/users?role=teacher
 */
export async function fetchTeachers() {
  const res = await apiClient.get("/api/users", {
    params: { role: "teacher" },
  });
  return res.data; // Array of teachers
}

/**
 * Admin only - list students (for multi-select)
 * GET /api/users?role=student
 */
export async function fetchStudents(params = {}) {
  const res = await apiClient.get("/api/users", {
    params: { role: "student", ...params },
  });
  return res.data; // Array of students
}

/**
 * ملاحظة: /api/users/:id غير موجود عندك حالياً في routes
 * (عشان كذا نخليه throw واضح بدل ما يكسر فجأة)
 */
export async function fetchUserById(id) {
  throw new Error("GET /api/users/:id غير متوفر حالياً في الباك.");
}
