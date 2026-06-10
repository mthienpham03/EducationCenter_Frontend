/**
 * API Service - Consolidated API methods for all operations
 * This file consolidates all API calls into a single organized service
 */

import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import * as ApiTypes from "@/lib/types/api.types";

// ============================================================================
// AXIOS CLIENT CONFIGURATION
// ============================================================================

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor - Add token to all requests
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// AUTH SERVICE
// ============================================================================

export const authService = {
  /**
   * User login
   */
  login: async (data: ApiTypes.LoginRequest): Promise<ApiTypes.LoginResponse> => {
    const response = await axiosClient.post<ApiTypes.LoginResponse>("/auth/login", data);
    return response.data;
  },

  /**
   * User logout
   */
  logout: async (): Promise<ApiTypes.LogoutResponse> => {
    const response = await axiosClient.post<ApiTypes.LogoutResponse>("/auth/logout");
    return response.data;
  },

  /**
   * Verify token
   */
  verifyToken: async (): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.UserProfile>>("/auth/verify");
    return response.data;
  },
};

// ============================================================================
// USER SERVICE
// ============================================================================

export const userService = {
  /**
   * Get all users with filtering
   */
  getUsers: async (
    params?: ApiTypes.QueryParams
  ): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.UserProfile[]>>(
      "/users",
      { params }
    );
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.UserProfile>>(
      `/users/${id}`
    );
    return response.data;
  },

  /**
   * Get all lecturers
   */
  getLecturers: async (
    params?: ApiTypes.QueryParams
  ): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.UserProfile[]>>(
      "/users/lecturers",
      { params }
    );
    return response.data;
  },

  /**
   * Get all students
   */
  getStudents: async (
    params?: ApiTypes.QueryParams
  ): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.UserProfile[]>>(
      "/users/students",
      { params }
    );
    return response.data;
  },

  /**
   * Create lecturer account
   */
  createLecturer: async (
    data: ApiTypes.CreateLecturerRequest
  ): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.UserProfile>>(
      "/users/lecturers",
      data
    );
    return response.data;
  },

  /**
   * Create student account
   */
  createStudent: async (
    data: ApiTypes.CreateStudentRequest
  ): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.UserProfile>>(
      "/users/students",
      data
    );
    return response.data;
  },

  /**
   * Update user status
   */
  updateUserStatus: async (
    id: string,
    request: ApiTypes.UpdateUserStatusRequest
  ): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<ApiTypes.UserProfile>>(
      `/users/${id}/status`,
      request
    );
    return response.data;
  },

  /**
   * Lock user account
   */
  lockUser: async (
    id: string,
    data: { reason: string; lockedUntil?: string | null }
  ): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse>(
      `/users/${id}/lock`,
      data
    );
    return response.data;
  },

  /**
   * Unlock user account
   */
  unlockUser: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse>(
      `/users/${id}/unlock`
    );
    return response.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(
      `/users/${id}`
    );
    return response.data;
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (file: File): Promise<ApiTypes.ApiResponse<ApiTypes.UploadFileResponse["data"]>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.UploadFileResponse["data"]>>(
      "/users/upload-avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },
};

// ============================================================================
// PROFILE SERVICE
// ============================================================================

export const profileService = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.UserProfile>>(
      "/profile"
    );
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (
    data: ApiTypes.UpdateLecturerProfileRequest
  ): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<ApiTypes.UserProfile>>(
      "/profile",
      data
    );
    return response.data;
  },

  /**
   * Upload certificate image
   */
  uploadCertificateImage: async (
    file: File
  ): Promise<ApiTypes.ApiResponse<ApiTypes.UploadFileResponse["data"]>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.UploadFileResponse["data"]>>(
      "/profile/upload-certificate",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  /**
   * Upload avatar image
   */
  uploadAvatarImage: async (
    file: File
  ): Promise<ApiTypes.ApiResponse<ApiTypes.UploadFileResponse["data"]>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.UploadFileResponse["data"]>>(
      "/profile/upload-avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },
};

// ============================================================================
// SPECIALIZATION SERVICE
// ============================================================================

export const specializationService = {
  /**
   * Get all specializations
   */
  getSpecializations: async (): Promise<ApiTypes.ApiResponse<ApiTypes.Specialization[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Specialization[]>>(
      "/specializations"
    );
    return response.data;
  },

  /**
   * Get specialization by ID
   */
  getSpecializationById: async (
    id: string
  ): Promise<ApiTypes.ApiResponse<ApiTypes.Specialization>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Specialization>>(
      `/specializations/${id}`
    );
    return response.data;
  },

  /**
   * Create specialization
   */
  createSpecialization: async (
    data: ApiTypes.CreateSpecializationRequest
  ): Promise<ApiTypes.ApiResponse<ApiTypes.Specialization>> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.Specialization>>(
      "/specializations",
      data
    );
    return response.data;
  },

  /**
   * Update specialization
   */
  updateSpecialization: async (
    id: string,
    data: ApiTypes.UpdateSpecializationRequest
  ): Promise<ApiTypes.ApiResponse<ApiTypes.Specialization>> => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<ApiTypes.Specialization>>(
      `/specializations/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete specialization
   */
  deleteSpecialization: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(
      `/specializations/${id}`
    );
    return response.data;
  },
};

// ============================================================================
// SCHEDULE SERVICE
// ============================================================================

export const scheduleService = {
  /**
   * Get all schedules
   */
  getSchedules: async (
    params?: ApiTypes.QueryParams
  ): Promise<ApiTypes.ApiResponse<ApiTypes.Schedule[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Schedule[]>>(
      "/schedules",
      { params }
    );
    return response.data;
  },

  /**
   * Get schedule by ID
   */
  getScheduleById: async (id: string): Promise<ApiTypes.ApiResponse<ApiTypes.Schedule>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Schedule>>(
      `/schedules/${id}`
    );
    return response.data;
  },

  /**
   * Create schedule
   */
  createSchedule: async (
    data: ApiTypes.CreateScheduleRequest
  ): Promise<ApiTypes.ApiResponse<ApiTypes.Schedule>> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.Schedule>>(
      "/schedules",
      data
    );
    return response.data;
  },

  /**
   * Update schedule
   */
  updateSchedule: async (
    id: string,
    data: Partial<ApiTypes.CreateScheduleRequest>
  ): Promise<ApiTypes.ApiResponse<ApiTypes.Schedule>> => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<ApiTypes.Schedule>>(
      `/schedules/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete schedule
   */
  deleteSchedule: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(
      `/schedules/${id}`
    );
    return response.data;
  },
};

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

export const notificationService = {
  /**
   * Get all notifications for current user
   */
  getNotifications: async (
    params?: ApiTypes.QueryParams
  ): Promise<ApiTypes.ApiResponse<ApiTypes.Notification[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Notification[]>>(
      "/notifications",
      { params }
    );
    return response.data;
  },

  /**
   * Get notification by ID
   */
  getNotificationById: async (
    id: string
  ): Promise<ApiTypes.ApiResponse<ApiTypes.Notification>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Notification>>(
      `/notifications/${id}`
    );
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse>(
      `/notifications/${id}/read`
    );
    return response.data;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(
      `/notifications/${id}`
    );
    return response.data;
  },
};

// ============================================================================
// REPORT SERVICE
// ============================================================================

export const reportService = {
  /**
   * Get all reports
   */
  getReports: async (
    params?: ApiTypes.QueryParams
  ): Promise<ApiTypes.ApiResponse<ApiTypes.Report[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Report[]>>(
      "/reports",
      { params }
    );
    return response.data;
  },

  /**
   * Get report by ID
   */
  getReportById: async (id: string): Promise<ApiTypes.ApiResponse<ApiTypes.Report>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Report>>(
      `/reports/${id}`
    );
    return response.data;
  },

  /**
   * Delete report
   */
  deleteReport: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(
      `/reports/${id}`
    );
    return response.data;
  },
};

// ============================================================================
// API OBJECT - Exported as unified interface
// ============================================================================

export const api = {
  auth: authService,
  user: userService,
  profile: profileService,
  specialization: specializationService,
  schedule: scheduleService,
  notification: notificationService,
  report: reportService,
  client: axiosClient,
};

// Default export
export default api;
