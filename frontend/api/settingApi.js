import axios from "./axios"; // أو axiosInstance عندك

export const getSettings = async () => {
  const res = await axios.get("/settings");
  return res.data;
};

export const updateSettings = async (data) => {
  const res = await axios.put("/settings", data);
  return res.data;
};
