// frontend/src/api/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://educationalplatform-zwvt.onrender.com",
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Request: add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: handle common errors safely
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // لو التوكن انتهى أو غلط
    if (status === 401) {
      // ما نمسح كل شيء لو انت محتاج user، لكن غالباً الأفضل logout
      localStorage.removeItem("token");
      // اختياري:
      // localStorage.removeItem("user");
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default apiClient;
