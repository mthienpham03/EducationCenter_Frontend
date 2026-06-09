import { axiosClient } from "./axios";

export interface Specialization {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const specializationApi = {
  getSpecializations: async () => {
    const response = await axiosClient.get<{ success: boolean; data: Specialization[] }>("/specializations");
    return response.data.data;
  },

  getSpecialization: async (id: string) => {
    const response = await axiosClient.get<{ success: boolean; data: Specialization }>(`/specializations/${id}`);
    return response.data.data;
  },

  createSpecialization: async (data: { name: string; code: string; description?: string }) => {
    const response = await axiosClient.post<{ success: boolean; message: string; data: Specialization }>("/specializations", data);
    return response.data;
  },

  updateSpecialization: async (id: string, data: { name?: string; code?: string; description?: string }) => {
    const response = await axiosClient.patch<{ success: boolean; message: string; data: Specialization }>(`/specializations/${id}`, data);
    return response.data;
  },

  deleteSpecialization: async (id: string) => {
    const response = await axiosClient.delete<{ success: boolean; message: string }>(`/specializations/${id}`);
    return response.data;
  },
};
