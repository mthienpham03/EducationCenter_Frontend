/**
 * API Types - Consolidated type definitions for all API operations
 */

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: UserProfile;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = "admin" | "lecturer" | "student";
export type UserStatus = "active" | "inactive" | "locked" | "pending";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  lockedUntil?: string | null;
  lockReason?: string | null;
  lecturerProfile?: LecturerProfile | null;
  studentProfile?: StudentProfile | null;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

export interface GetUsersResponse {
  success: boolean;
  data: UserProfile[];
  total: number;
}

// ============================================================================
// LECTURER TYPES
// ============================================================================

export interface LecturerProfile {
  userId: string;
  specializations?: Specialization[] | null;
  experienceYears?: number | null;
  bio?: string | null;
  certificates?: Certificate[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLecturerRequest {
  email: string;
  fullName: string;
  phone?: string;
  specializationIds?: string[];
  experienceYears?: number;
  avatarUrl?: string;
}

export interface UpdateLecturerProfileRequest {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  specializationIds?: string[];
  experienceYears?: number;
  bio?: string;
  certificates?: Certificate[];
}

// ============================================================================
// STUDENT TYPES
// ============================================================================

export interface StudentProfile {
  userId: string;
  studentCode: string;
  specialization?: Specialization | null;
  enrolledCourses?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentRequest {
  email: string;
  fullName: string;
  phone?: string;
  studentCode: string;
  specializationId?: string;
}

// ============================================================================
// SPECIALIZATION TYPES
// ============================================================================

export interface Specialization {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecializationRequest {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateSpecializationRequest {
  name?: string;
  code?: string;
  description?: string;
}

// ============================================================================
// CERTIFICATE TYPES
// ============================================================================

export interface Certificate {
  id: string;
  name: string;
  frontImageUrl: string;
  frontImagePublicId: string;
  backImageUrl?: string;
  backImagePublicId?: string;
}

export interface UploadFileResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    publicId: string;
  };
}

// ============================================================================
// SCHEDULE TYPES
// ============================================================================

export interface Schedule {
  id: string;
  courseId: string;
  lecturerId: string;
  date: string;
  startTime: string;
  endTime: string;
  room?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleRequest {
  courseId: string;
  lecturerId: string;
  date: string;
  startTime: string;
  endTime: string;
  room?: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface Report {
  id: string;
  courseId: string;
  studentId: string;
  type: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// GENERIC RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  pageSize?: number;
  [key: string]: any;
}
