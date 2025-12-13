import apiClient from "./apiClient";

export const getSettings = async () => {
  const res = await apiClient.get("/api/settings");
  return res.data;
};

export const updateSettings = async (data) => {
  const res = await apiClient.put("/api/settings", data);
  return res.data;
};
