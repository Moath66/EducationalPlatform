// frontend/api/apiClient.js
import axios from "axios";

const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://educationalplatform-zwvt.onrender.com"
).replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 20000,
});

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

// ✅ Error موحّد + يحافظ على response
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    const msg =
      data?.message || data?.error || error?.message || "Request failed";

    console.log("API ERROR:", msg, { status, data });

    const err = new Error(msg);
    err.status = status;
    err.data = data; // ✅ هنا بدل payload undefined
    return Promise.reject(err);
  }
);

export default apiClient;
