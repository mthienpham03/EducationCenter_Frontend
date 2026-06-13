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

export interface StudentProfileData {
  studentCode?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  note?: string | null;
}

export interface AdminProfileData {
  employeeCode?: string | null;
  department?: string | null;
  note?: string | null;
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
  studentProfile?: StudentProfileData | null;
  adminProfile?: AdminProfileData | null;
}

export const profileApi = {
  getProfile: async () => {
    try {
      const response = await axiosClient.get<{
        success: boolean;
        data: UserProfile;
      }>("/profile");

      return response.data.data;
    } catch (err) {
      // Mock data for development
      const mock: UserProfile = {
        id: "mock-user-1",
        email: "student@educenter.com",
        fullName: "Nguyễn Văn A",
        phone: "0123456789",
        avatarUrl: null,
        role: "student",
        status: "active",

        studentProfile: {
          studentCode: "STU2023001",
          dateOfBirth: "2000-05-12",
          address: "Hà Nội",
          note: null,
        },

        lecturerProfile: null,
        adminProfile: null,
      };

      return mock;
    }
  },

  updateProfile: async (data: {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;

    specializationIds?: string[];
    experienceYears?: number;
    bio?: string;
    certificates?: Certificate[];

    studentCode?: string;
    dateOfBirth?: string;
    address?: string;

    employeeCode?: string;
    department?: string;
  }) => {
    const response = await axiosClient.patch<{
      success: boolean;
      message: string;
      data: UserProfile;
    }>("/profile", data);

    return response.data;
  },

  uploadCertificateImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<{
      success: boolean;
      message: string;
      data: {
        url: string;
        publicId: string;
      };
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
      data: {
        url: string;
        publicId: string;
      };
    }>("/profile/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },
};