import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://educationalplatform-zwvt.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// إضافة التوكين لكل الطلبات
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
