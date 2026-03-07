import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://memo-backend-d1n8.onrender.com/api";
// const BASE_URL = "http://localhost:8000/api"

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

//interceptors
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//error handling (global)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("jwt_token");
    }
    return Promise.reject(error);
  },
);
