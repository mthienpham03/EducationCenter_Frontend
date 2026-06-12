import { axiosClient } from "./axios";
import { Specialization } from "./specialization.api";

export interface Certificate {
  id: string;
  name: string;
  frontImageUrl: string;
  frontImagePublicId: string;
  backImageUrl?: string;
  backImagePublicId?: string;
}

export interface LecturerProfileData {
  specializations?: Specialization[] | null;
  experienceYears?: number | null;
  bio?: string | null;
  certificates?: Certificate[] | null;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: string;
  status: string;
  lecturerProfile?: LecturerProfileData | null;
}

export const profileApi = {
  getProfile: async () => {
    const response = await axiosClient.get<{ success: boolean; data: UserProfile }>("/profile");
    return response.data.data;
  },

  updateProfile: async (data: {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
    specializationIds?: string[];
    experienceYears?: number;
    bio?: string;
    certificates?: Certificate[];
  }) => {
    const response = await axiosClient.patch<{ success: boolean; message: string; data: UserProfile }>("/profile", data);
    return response.data;
  },

  uploadCertificateImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<{
      success: boolean;
      message: string;
      data: { url: string; publicId: string };
    }>("/profile/upload-certificate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  uploadAvatarImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<{
      success: boolean;
      message: string;
      data: { url: string; publicId: string };
    }>("/profile/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },
};
