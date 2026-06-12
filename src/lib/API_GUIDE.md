# API Service Architecture - Consolidation Guide

## 📋 Overview

The API services have been consolidated and standardized into a single, well-organized structure following clean architecture principles.

### File Structure

```
src/
├── lib/
│   ├── api/
│   │   ├── service.ts          # Main consolidated API service
│   │   ├── index.ts            # Central exports
│   │   └── axios.ts            # (Deprecated - use service.ts)
│   ├── types/
│   │   ├── api.types.ts        # All API type definitions
│   │   └── (other types)
│   ├── stores/
│   ├── hooks/
│   └── auth/
└── components/
```

---

## 🔧 API Service Structure

### Service Categories

The API is organized into **7 main services**:

1. **authService** - Authentication operations
2. **userService** - User management operations
3. **profileService** - User profile operations
4. **specializationService** - Specialization management
5. **scheduleService** - Schedule management
6. **notificationService** - Notification management
7. **reportService** - Report management

---

## 📚 Usage Examples

### Import the API Service

```typescript
// Option 1: Import entire API object
import { api } from "@/lib/api";

// Option 2: Import specific services
import { authService, userService } from "@/lib/api";

// Option 3: Import from index with types
import { api, UserProfile, LoginRequest } from "@/lib/api";
```

### Authentication Service

```typescript
// Login
const response = await api.auth.login({
  email: "user@example.com",
  password: "password123",
});

// Logout
await api.auth.logout();

// Verify token
const verified = await api.auth.verifyToken();
```

### User Service

```typescript
// Get all users with filtering
const users = await api.user.getUsers({
  search: "John",
  role: "lecturer",
  status: "active",
});

// Get specific user
const user = await api.user.getUserById("user-id");

// Create lecturer
const newLecturer = await api.user.createLecturer({
  email: "lecturer@example.com",
  fullName: "John Doe",
  phone: "0912345678",
  specializationIds: ["spec-id-1", "spec-id-2"],
  experienceYears: 5,
});

// Lock user account
await api.user.lockUser("user-id", {
  reason: "Violation of terms",
  lockedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
});

// Unlock user account
await api.user.unlockUser("user-id");

// Delete user
await api.user.deleteUser("user-id");
```

### Profile Service

```typescript
// Get current user profile
const profile = await api.profile.getProfile();

// Update profile
const updated = await api.profile.updateProfile({
  fullName: "Jane Doe",
  phone: "0987654321",
  experienceYears: 10,
  bio: "Experienced software engineer",
});

// Upload avatar
const avatarFile = document.getElementById("avatar-input").files[0];
const uploadResult = await api.profile.uploadAvatarImage(avatarFile);
console.log(uploadResult.url); // Image URL

// Upload certificate
const certFile = document.getElementById("cert-input").files[0];
const certResult = await api.profile.uploadCertificateImage(certFile);
```

### Specialization Service

```typescript
// Get all specializations
const specs = await api.specialization.getSpecializations();

// Create specialization
const newSpec = await api.specialization.createSpecialization({
  name: "Information Technology",
  code: "IT",
  description: "Computer Science & IT Programs",
});

// Update specialization
const updated = await api.specialization.updateSpecialization("spec-id", {
  name: "Updated IT",
  description: "Updated description",
});

// Delete specialization
await api.specialization.deleteSpecialization("spec-id");
```

### Schedule Service

```typescript
// Get all schedules
const schedules = await api.schedule.getSchedules({
  page: 1,
  pageSize: 10,
});

// Create schedule
const newSchedule = await api.schedule.createSchedule({
  courseId: "course-id",
  lecturerId: "lecturer-id",
  date: "2024-06-20",
  startTime: "09:00",
  endTime: "11:00",
  room: "Room 101",
});

// Delete schedule
await api.schedule.deleteSchedule("schedule-id");
```

### Notification Service

```typescript
// Get notifications
const notifications = await api.notification.getNotifications();

// Mark as read
await api.notification.markAsRead("notification-id");

// Delete notification
await api.notification.deleteNotification("notification-id");
```

---

## 🎯 Response Format

All API responses follow a standard format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Usage
const response = await api.auth.login(credentials);
if (response.success) {
  console.log("Login successful:", response.data);
} else {
  console.error("Login failed:", response.error);
}
```

---

## 📝 Type Definitions

All types are centralized in `src/lib/types/api.types.ts`:

```typescript
// User types
export interface UserProfile { ... }
export type UserRole = "admin" | "lecturer" | "student";
export type UserStatus = "active" | "inactive" | "locked" | "pending";

// Lecturer types
export interface LecturerProfile { ... }
export interface CreateLecturerRequest { ... }

// Generic types
export interface ApiResponse<T = any> { ... }
export interface QueryParams { ... }
```

---

## 🔌 Axios Configuration

The axios client is pre-configured with:
- Base URL from environment
- Automatic token injection in headers
- Error interceptors (can be extended)

```typescript
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});
```

---

## ✅ Migration Guide

### Old Way (Scattered Files)

```typescript
import { authApi } from "@/lib/api/auth.api";
import { usersApi } from "@/lib/api/users.api";
import { specializationApi } from "@/lib/api/specialization.api";

// Multiple imports, inconsistent naming
const user = await usersApi.getUsers();
const specs = await specializationApi.getSpecializations();
```

### New Way (Consolidated)

```typescript
import { api } from "@/lib/api";

// Single import, consistent API
const users = await api.user.getUsers();
const specs = await api.specialization.getSpecializations();
```

---

## 🚀 Benefits

✅ **Single Source of Truth** - All APIs in one place  
✅ **Consistent Naming** - snake_case methods, unified structure  
✅ **Type Safety** - Full TypeScript support with centralized types  
✅ **Easier Maintenance** - Update APIs in one location  
✅ **Better Organization** - Logical grouping by feature/domain  
✅ **Scalable** - Easy to add new services  

---

## 📋 Checklist for Migration

- [ ] Update imports in components from old API files to `api` service
- [ ] Replace direct axios calls with corresponding service methods
- [ ] Update type imports to use `api.types.ts`
- [ ] Test all API calls with new service
- [ ] Remove deprecated individual API files (after testing)
- [ ] Update component tests with mocked api calls

---

## 🔗 Related Files

- **API Service**: `src/lib/api/service.ts`
- **API Types**: `src/lib/types/api.types.ts`
- **API Index**: `src/lib/api/index.ts`
- **Axios Config**: `src/lib/api/service.ts` (axiosClient)

---

## 💡 Best Practices

1. **Use TypeScript** - Always add types to API calls
2. **Handle Errors** - Check `response.success` before accessing data
3. **Validate Input** - Validate parameters before API calls
4. **Use Query Params** - For filtering, pagination, search
5. **Consistent Naming** - Follow camelCase for service names
6. **Document** - Add JSDoc comments to new methods

---

## 📞 Support

For questions or issues with the API service, refer to:
- Service method comments in `service.ts`
- Type definitions in `api.types.ts`
- Component usage examples throughout the codebase

---

**Last Updated**: June 9, 2026
