const BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = async (endpoint, method = "GET", data) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const json = await res.json();
  return json;
};
