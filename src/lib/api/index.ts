/**
 * API Index - Central export for all API services and types
 */

// Export all services
export { default as api } from "./service";
export {
  authService,
  userService,
  profileService,
  specializationService,
  scheduleService,
  notificationService,
  reportService,
  courseService,
  axiosClient,
} from "./service";

// Export all types
export type {
  // Auth
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  // User
  UserProfile,
  UserRole,
  UserStatus,
  CreateUserRequest,
  UpdateUserStatusRequest,
  GetUsersResponse,
  // Lecturer
  LecturerProfile,
  CreateLecturerRequest,
  UpdateLecturerProfileRequest,
  // Student
  StudentProfile,
  CreateStudentRequest,
  // Specialization
  Specialization,
  CreateSpecializationRequest,
  UpdateSpecializationRequest,
  // Certificate
  Certificate,
  UploadFileResponse,
  // Schedule
  Schedule,
  CreateScheduleRequest,
  // Notification
  Notification,
  CreateNotificationRequest,
  // Report
  Report,
  // Course & Class
  Course,
  CourseStatus,
  CreateCourseRequest,
  UpdateCourseRequest,
  ClassEntity,
  ClassStatus,
  CreateClassRequest,
  UpdateClassRequest,
  TeachingAssignment,
  AssignLecturerRequest,
  Enrollment,
  EnrollmentStatus,
  EnrollStudentRequest,
  // Generic
  ApiResponse,
  PaginatedResponse,
  QueryParams,
} from "@/lib/types/api.types";
