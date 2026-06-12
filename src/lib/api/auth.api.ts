import { axiosClient } from "./axios";
import { ForgotPasswordRequest, ResetPasswordRequest } from "../types/api.types";

export const authApi = {
  login: async (data: any) => {
    const response = await axiosClient.post("/auth/login", data);
    return response.data;
  },
  logout: async () => {
    const response = await axiosClient.post("/auth/logout");
    return response.data;
  },
  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await axiosClient.post("/auth/forgot-password", data);
    return response.data;
  },
  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await axiosClient.post("/auth/reset-password", data);
    return response.data;
  },
};
