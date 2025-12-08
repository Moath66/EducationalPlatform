// frontend/src/api/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://educationalplatform-zwvt.onrender.com",
  // لو تحب تثبّت /api هنا بدل ما تكتبها بكل مكان:
  // baseURL: "https://educationalplatform-zwvt.onrender.com/api",
  withCredentials: false,
});

// ✅ Token لكل الطلبات
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // مهم: تأكد headers موجودة
    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // اختياري: امسح الهيدر لو ما فيه توكن
      delete config.headers.Authorization;
    }

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
