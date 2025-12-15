// frontend/api/profileApi.js
import apiClient from "./apiClient";

export async function fetchMyProfile() {
  const res = await apiClient.get("/api/profile/me");
  return res.data; // { user }
}

export async function updateMyProfile(payload) {
  const res = await apiClient.put("/api/profile/me", payload);
  return res.data; // { message, user }
}

// ✅ تغيير كلمة المرور
export async function changeMyPassword(payload) {
  const res = await apiClient.put("/api/profile/password", payload);
  return res.data; // { message }
}
