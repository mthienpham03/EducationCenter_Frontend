import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
});

// Interceptor đính kèm Token và CHỐNG CACHE vào mọi request
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Tự động thêm timestamp để trình duyệt không bị lỗi 304 (Not Modified)
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: new Date().getTime(),
    };
  }

  return config;
});
