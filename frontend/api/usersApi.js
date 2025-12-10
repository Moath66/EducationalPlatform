// frontend/api/usersApi.js
import apiClient from "./apiClient";

/**
 * Admin only - list teachers (for dropdowns in Admin pages)
 * GET /api/users/teachers -> { users: [...] }
 */
export async function fetchTeachers() {
  const res = await apiClient.get("/api/users/teachers");
  return res.data; // { users: [...] }
}

/**
 * Admin only - list users (matches your userRoutes: GET /api/users is adminOnly)
 * GET /api/users?role=&approved=&q=
 */
export async function fetchUsers(params = {}) {
  const res = await apiClient.get("/api/users", { params });
  return res.data; // recommended: { users: [...] } (or array حسب الكنترولر)
}

/**
 * (Optional) If you add: GET /api/users/:id route later
 */
export async function fetchUserById(id) {
  if (!id) throw new Error("user id is required");
  const res = await apiClient.get(`/api/users/${id}`);
  return res.data;
}
