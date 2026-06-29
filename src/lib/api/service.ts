/**
 * API Service - Consolidated API methods for all operations
 */

import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import * as ApiTypes from "@/lib/types/api.types";
import { documentService } from "./documents.api";

// ============================================================================
// AXIOS CLIENT CONFIGURATION
// ============================================================================

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor - Add token và CHỐNG CACHE cho mọi request GET
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

// ============================================================================
// AUTH SERVICE
// ============================================================================

export const authService = {
  login: async (data: ApiTypes.LoginRequest): Promise<ApiTypes.LoginResponse> => {
    const response = await axiosClient.post<ApiTypes.LoginResponse>("/auth/login", data);
    return response.data;
  },
  logout: async (): Promise<ApiTypes.LogoutResponse> => {
    const response = await axiosClient.post<ApiTypes.LogoutResponse>("/auth/logout");
    return response.data;
  },
  verifyToken: async (): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.UserProfile>>("/auth/verify");
    return response.data;
  },
  forgotPassword: async (data: ApiTypes.ForgotPasswordRequest): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse>("/auth/forgot-password", data);
    return response.data;
  },
  resetPassword: async (data: ApiTypes.ResetPasswordRequest): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse>("/auth/reset-password", data);
    return response.data;
  },
};

// ============================================================================
// USER SERVICE
// ============================================================================

export const userService = {
  getUsers: async (params?: ApiTypes.QueryParams): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.UserProfile[]>>("/users", { params });
    return response.data;
  },
  getUserById: async (id: string): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.UserProfile>>(`/users/${id}`);
    return response.data;
  },
  getLecturers: async (params?: ApiTypes.QueryParams): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.UserProfile[]>>("/users/lecturers", { params });
    return response.data;
  },
  getStudents: async (params?: ApiTypes.QueryParams): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.UserProfile[]>>("/users/students", { params });
    return response.data;
  },
  createLecturer: async (data: ApiTypes.CreateLecturerRequest): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.UserProfile>>("/users/lecturers", data);
    return response.data;
  },
  createStudent: async (data: ApiTypes.CreateStudentRequest): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.UserProfile>>("/users/students", data);
    return response.data;
  },
  updateUserStatus: async (id: string, request: ApiTypes.UpdateUserStatusRequest): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<ApiTypes.UserProfile>>(`/users/${id}/status`, request);
    return response.data;
  },
  lockUser: async (id: string, data: { reason: string; lockedUntil?: string | null }): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse>(`/users/${id}/lock`, data);
    return response.data;
  },
  unlockUser: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse>(`/users/${id}/unlock`);
    return response.data;
  },
  deleteUser: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(`/users/${id}`);
    return response.data;
  },
  uploadAvatar: async (file: File): Promise<ApiTypes.ApiResponse<ApiTypes.UploadFileResponse["data"]>> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.UploadFileResponse["data"]>>("/users/upload-avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response.data;
  },
};

// ============================================================================
// PROFILE SERVICE
// ============================================================================

export const profileService = {
  getProfile: async (): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.UserProfile>>("/profile");
    return response.data;
  },
  updateProfile: async (data: any): Promise<ApiTypes.ApiResponse<ApiTypes.UserProfile>> => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<ApiTypes.UserProfile>>("/profile", data);
    return response.data;
  },
  uploadCertificateImage: async (file: File): Promise<ApiTypes.ApiResponse<ApiTypes.UploadFileResponse["data"]>> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.UploadFileResponse["data"]>>("/profile/upload-certificate", formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response.data;
  },
  uploadAvatarImage: async (file: File): Promise<ApiTypes.ApiResponse<ApiTypes.UploadFileResponse["data"]>> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.UploadFileResponse["data"]>>("/profile/upload-avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response.data;
  },
};

// ============================================================================
// SPECIALIZATION, SCHEDULE, NOTIFICATION, REPORT, COURSE SERVICES
// ============================================================================
// (Các service khác giữ nguyên logic gọi apiClient như trên là đã tự chống cache)

export const specializationService = {
  getSpecializations: async (): Promise<ApiTypes.ApiResponse<ApiTypes.Specialization[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Specialization[]>>("/specializations");
    return response.data;
  },
  getSpecializationById: async (id: string): Promise<ApiTypes.ApiResponse<ApiTypes.Specialization>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Specialization>>(`/specializations/${id}`);
    return response.data;
  },
  createSpecialization: async (data: ApiTypes.CreateSpecializationRequest): Promise<ApiTypes.ApiResponse<ApiTypes.Specialization>> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.Specialization>>("/specializations", data);
    return response.data;
  },
  updateSpecialization: async (id: string, data: ApiTypes.UpdateSpecializationRequest): Promise<ApiTypes.ApiResponse<ApiTypes.Specialization>> => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<ApiTypes.Specialization>>(`/specializations/${id}`, data);
    return response.data;
  },
  deleteSpecialization: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(`/specializations/${id}`);
    return response.data;
  },
};

export const scheduleService = {
  getSchedules: async (params?: ApiTypes.QueryParams): Promise<ApiTypes.ApiResponse<ApiTypes.Schedule[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Schedule[]>>("/schedules", { params });
    return response.data;
  },
  getScheduleById: async (id: string): Promise<ApiTypes.ApiResponse<ApiTypes.Schedule>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Schedule>>(`/schedules/${id}`);
    return response.data;
  },
  createSchedule: async (data: ApiTypes.CreateScheduleRequest): Promise<ApiTypes.ApiResponse<ApiTypes.Schedule>> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.Schedule>>("/schedules", data);
    return response.data;
  },
  updateSchedule: async (id: string, data: Partial<ApiTypes.CreateScheduleRequest>): Promise<ApiTypes.ApiResponse<ApiTypes.Schedule>> => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<ApiTypes.Schedule>>(`/schedules/${id}`, data);
    return response.data;
  },
  deleteSchedule: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(`/schedules/${id}`);
    return response.data;
  },
};

export const notificationService = {
  getNotifications: async (params?: ApiTypes.QueryParams): Promise<ApiTypes.ApiResponse<ApiTypes.Notification[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Notification[]>>("/notifications", { params });
    return response.data;
  },
  getNotificationById: async (id: string): Promise<ApiTypes.ApiResponse<ApiTypes.Notification>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Notification>>(`/notifications/${id}`);
    return response.data;
  },
  markAsRead: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse>(`/notifications/${id}/read`);
    return response.data;
  },
  deleteNotification: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(`/notifications/${id}`);
    return response.data;
  },
};

export const reportService = {
  getReports: async (params?: ApiTypes.QueryParams): Promise<ApiTypes.ApiResponse<ApiTypes.Report[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Report[]>>("/reports", { params });
    return response.data;
  },
  getReportById: async (id: string): Promise<ApiTypes.ApiResponse<ApiTypes.Report>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Report>>(`/reports/${id}`);
    return response.data;
  },
  deleteReport: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(`/reports/${id}`);
    return response.data;
  },
};

export const courseService = {
  getCourses: async (params?: { search?: string; status?: string }): Promise<ApiTypes.ApiResponse<ApiTypes.Course[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Course[]>>("/courses", { params });
    return response.data;
  },
  getCourseById: async (id: string): Promise<ApiTypes.ApiResponse<ApiTypes.Course>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Course>>(`/courses/${id}`);
    return response.data;
  },
  createCourse: async (data: ApiTypes.CreateCourseRequest): Promise<ApiTypes.ApiResponse<ApiTypes.Course>> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.Course>>("/courses", data);
    return response.data;
  },
  updateCourse: async (id: string, data: ApiTypes.UpdateCourseRequest): Promise<ApiTypes.ApiResponse<ApiTypes.Course>> => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<ApiTypes.Course>>(`/courses/${id}`, data);
    return response.data;
  },
  deleteCourse: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(`/courses/${id}`);
    return response.data;
  },
  getClassesByCourse: async (courseId: string): Promise<ApiTypes.ApiResponse<ApiTypes.ClassEntity[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.ClassEntity[]>>(`/courses/${courseId}/classes`);
    return response.data;
  },
  getClassById: async (id: string): Promise<ApiTypes.ApiResponse<ApiTypes.ClassEntity>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.ClassEntity>>(`/courses/classes/${id}`);
    return response.data;
  },
  createClass: async (courseId: string, data: ApiTypes.CreateClassRequest): Promise<ApiTypes.ApiResponse<ApiTypes.ClassEntity>> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<ApiTypes.ClassEntity>>(`/courses/${courseId}/classes`, data);
    return response.data;
  },
  updateClass: async (id: string, data: ApiTypes.UpdateClassRequest): Promise<ApiTypes.ApiResponse<ApiTypes.ClassEntity>> => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<ApiTypes.ClassEntity>>(`/courses/classes/${id}`, data);
    return response.data;
  },
  deleteClass: async (id: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(`/courses/classes/${id}`);
    return response.data;
  },
  getLecturersByClass: async (classId: string): Promise<ApiTypes.ApiResponse<ApiTypes.TeachingAssignment[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.TeachingAssignment[]>>(`/courses/classes/${classId}/lecturers`);
    return response.data;
  },
  assignLecturer: async (classId: string, data: ApiTypes.AssignLecturerRequest): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse>(`/courses/classes/${classId}/lecturers`, data);
    return response.data;
  },
  removeLecturer: async (classId: string, lecturerId: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(`/courses/classes/${classId}/lecturers/${lecturerId}`);
    return response.data;
  },
  getStudentsByClass: async (classId: string): Promise<ApiTypes.ApiResponse<ApiTypes.Enrollment[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<ApiTypes.Enrollment[]>>(`/courses/classes/${classId}/students`);
    return response.data;
  },
  enrollStudent: async (classId: string, data: ApiTypes.EnrollStudentRequest): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse>(`/courses/classes/${classId}/students`, data);
    return response.data;
  },
  removeStudent: async (classId: string, studentId: string): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse>(`/courses/classes/${classId}/students/${studentId}`);
    return response.data;
  },
  getChaptersAndLessons: async (courseId: string): Promise<ApiTypes.ApiResponse<any[]>> => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<any[]>>(`/courses/${courseId}/chapters`);
    return response.data;
  },

  /** Chuyển lớp học viên (Admin) */
  transferStudent: async (classId: string, studentId: string, data: { targetClassId: string; reason?: string; note?: string }): Promise<ApiTypes.ApiResponse> => {
    const response = await axiosClient.post<ApiTypes.ApiResponse>(`/courses/classes/${classId}/students/${studentId}/transfer`, data);
    return response.data;
  },
};

export { documentService } from "./documents.api";

export const api = {
  auth: authService,
  user: userService,
  profile: profileService,
  specialization: specializationService,
  schedule: scheduleService,
  notification: notificationService,
  report: reportService,
  course: courseService,
  document: documentService,
  client: axiosClient,
};

export default api;