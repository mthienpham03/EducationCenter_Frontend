import { axiosClient } from "./axios";

export const usersApi = {
  getUsers: async (search?: string, role?: string, status?: string) => {
    const response = await axiosClient.get("/users", {
      params: { search, role, status },
    });
    return response.data;
  },

  updateUserStatus: async (id: string, status: string) => {
    const response = await axiosClient.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
  },

  createLecturer: async (data: any) => {
    const response = await axiosClient.post("/users/lecturers", data);
    return response.data;
  },

  createStudent: async (data: any) => {
    const response = await axiosClient.post("/users/students", data);
    return response.data;
  },
};
