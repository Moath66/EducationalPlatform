// frontend/src/api/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://educationalplatform-zwvt.onrender.com",
  withCredentials: false,
});

// ✅ Request: أضف التوكن تلقائيًا
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // ✅ لا تجبر Content-Type على JSON
    // لو الطلب FormData (رفع ملفات) اترك Axios يحدد الـ boundary تلقائيًا
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
      if (config.headers) delete config.headers["Content-Type"];
    } else {
      config.headers = config.headers || {};
      if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response: لا تفترض وجود payload + رجّع رسالة خطأ مفهومة
apiClient.interceptors.response.use(
  (response) => response, // خليه يرجع response كامل
  (error) => {
    error.friendlyMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Request failed";
    return Promise.reject(error);
  }
);

export default apiClient;
