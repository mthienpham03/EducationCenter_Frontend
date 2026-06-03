import { axiosClient } from "./axios";

export const authApi = {
  login: async (data: any) => {
    const response = await axiosClient.post("/auth/login", data);
    return response.data;
  },
  logout: async () => {
    const response = await axiosClient.post("/auth/logout");
    return response.data;
  },
};
