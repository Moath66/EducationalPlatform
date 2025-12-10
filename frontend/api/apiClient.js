// frontend/api/apiClient.js
import axios from "axios";

// ✅ خذ الرابط من env أولاً، وإذا ما موجود استخدم الافتراضي
const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://educationalplatform-zwvt.onrender.com"
).replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 20000, // ✅ مهم: يمنع التعليق
});

// ✅ Token لكل الطلبات
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ توحيد الأخطاء: نخليها Error(message) واضح
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Request failed";

    console.log("API ERROR:", msg, error?.response?.data);

    // ✅ رجّع Error موحّد
    return Promise.reject(new Error(msg));
  }
);

export default apiClient;
