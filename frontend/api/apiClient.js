// frontend/api/apiClient.js
import axios from "axios";

const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://educationalplatform-zwvt.onrender.com"
).replace(/\/$/, "");

// إعدادات عامة
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 30000, // ✅ مهلة مناسبة (ومع الـ retry بنعطي المحاولة الثانية وقت أطول)
});

// =======================
// Request interceptor
// =======================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    config.headers = config.headers || {};

    if (token) config.headers.Authorization = `Bearer ${token}`;
    else delete config.headers.Authorization;

    return config;
  },
  (error) => Promise.reject(error)
);

// =======================
// Response interceptor (Retry + unified error)
// =======================
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error?.config || {};

    const isTimeout =
      error?.code === "ECONNABORTED" ||
      String(error?.message || "")
        .toLowerCase()
        .includes("timeout");

    const isNetworkError =
      !error?.response &&
      (String(error?.message || "").includes("Network Error") ||
        String(error?.message || "").includes("ERR_NETWORK"));

    // ✅ Retry مرة واحدة فقط (ممتاز لحالة Render cold start)
    if ((isTimeout || isNetworkError) && !config.__isRetryRequest) {
      config.__isRetryRequest = true;

      // انتظار بسيط عشان السيرفر يصحى
      await new Promise((r) => setTimeout(r, 1200));

      // زود مهلة المحاولة الثانية
      config.timeout = 45000;

      return apiClient(config);
    }

    // ✅ error موحد
    const status = error?.response?.status;
    const data = error?.response?.data;

    const msg =
      data?.message ||
      data?.error ||
      error?.message ||
      (isTimeout ? "انتهت مهلة الاتصال بالسيرفر" : "Request failed");

    console.log("API ERROR:", msg, { status, data });

    const err = new Error(msg);
    err.status = status;
    err.data = data;
    return Promise.reject(err);
  }
);

export default apiClient;
