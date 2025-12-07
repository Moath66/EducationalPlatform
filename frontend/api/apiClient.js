// frontend/src/api/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://educationalplatform-zwvt.onrender.com",
  withCredentials: false,
});

// ✅ Token لكل الطلبات
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ توحيد رسالة الأخطاء
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Request failed";
    console.log("API ERROR:", msg, error?.response?.data);
    return Promise.reject(error);
  }
);

export default apiClient;
