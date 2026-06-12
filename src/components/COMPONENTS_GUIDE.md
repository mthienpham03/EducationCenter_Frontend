# Components Architecture Guide

## 📋 Overview

Components are organized by feature/domain and role, following a hierarchical structure for maintainability and reusability.

### Directory Structure

```
src/components/
├── admin/                          # Admin-specific components
│   └── SpecializationSelector.tsx  # Reusable specialization selector
├── auth/                           # Authentication guards & wrappers
│   ├── AdminGuard.tsx
│   ├── LecturerGuard.tsx
│   └── StudentGuard.tsx
├── features/                       # Feature-specific components
│   ├── auth/
│   │   └── login-form.tsx
│   ├── schedules/
│   │   ├── schedule-form.tsx
│   │   ├── schedule-calendar.tsx
│   │   └── cancel-dialog.tsx
│   ├── notifications/
│   │   ├── notification-list.tsx
│   │   └── notification-bell.tsx
│   ├── reports/
│   │   ├── quiz-result-table.tsx
│   │   └── progress-chart.tsx
│   └── ...
└── ui/                            # Reusable UI components
    └── lecturer/
        ├── TopNavBar.tsx
        └── SideNavBar.tsx
```

---

## 🎨 Component Categories

### 1. Admin Components (`admin/`)

Admin-specific reusable components for admin pages.

```typescript
// SpecializationSelector.tsx
export interface SpecializationSelectorProps {
  availableSpecs: Specialization[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  loading?: boolean;
}

export default function SpecializationSelector(props) { ... }
```

**Features:**
- ✅ Dropdown with search
- ✅ Multi-select checkboxes
- ✅ Tag display for selected items
- ✅ Scroll up/down controls
- ✅ Expandable list
- ✅ Swap position toggle

---

### 2. Auth Components (`auth/`)

Role-based access control components (Guards).

```typescript
// AdminGuard.tsx - Protects admin routes
// LecturerGuard.tsx - Protects lecturer routes
// StudentGuard.tsx - Protects student routes

export default function AdminGuard({ children }) {
  const { user } = useAuth();
  if (user?.role !== "admin") redirect("/");
  return children;
}
```

---

### 3. Feature Components (`features/`)

Feature-specific components organized by domain.

#### Authentication Features
- `login-form.tsx` - Login form component

#### Schedule Features
- `schedule-form.tsx` - Form for creating/editing schedules
- `schedule-calendar.tsx` - Calendar display for schedules
- `cancel-dialog.tsx` - Dialog for canceling schedules

#### Notification Features
- `notification-list.tsx` - List of notifications
- `notification-bell.tsx` - Notification bell with badge

#### Report Features
- `quiz-result-table.tsx` - Table for quiz results
- `progress-chart.tsx` - Chart for progress visualization

---

### 4. UI Components (`ui/`)

Generic reusable UI components used across the application.

```typescript
// ui/lecturer/TopNavBar.tsx - Top navigation bar
// ui/lecturer/SideNavBar.tsx - Sidebar navigation
```

---

## 📝 Component Naming Conventions

### File Naming
- Use `kebab-case.tsx` for feature/UI components
- Use `PascalCase.tsx` for complex components (guards, selectors)
- Use `.tsx` for TypeScript components with JSX

### Examples
```
✅ schedule-form.tsx
✅ login-form.tsx
✅ SpecializationSelector.tsx
✅ AdminGuard.tsx

❌ ScheduleForm.tsx (use kebab-case for simple features)
❌ specialization-selector.tsx (use PascalCase for complex)
```

---

## 🔧 Component Structure

### Recommended Pattern

```typescript
"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import type { ComponentProps } from "@/lib/types";

// Props interface
interface MyComponentProps {
  title: string;
  onSubmit?: (data: any) => void;
  disabled?: boolean;
}

// Component
export default function MyComponent({
  title,
  onSubmit,
  disabled = false,
}: MyComponentProps) {
  const [state, setState] = useState("");

  const handleClick = async () => {
    try {
      const result = await api.user.getUsers();
      if (result.success) {
        // Handle success
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      <h2>{title}</h2>
      <button onClick={handleClick} disabled={disabled}>
        Click me
      </button>
    </div>
  );
}
```

### Best Practices

1. **Props Interface** - Always define props with TypeScript
2. **Use "use client"** - For interactive components (React 18+)
3. **Error Handling** - Try-catch for async operations
4. **Type Safety** - Use explicit return types
5. **JSDoc** - Document complex components
6. **Separation of Concerns** - Keep components focused

---

## 🔌 Integration with API Service

### Pattern 1: Direct API Call

```typescript
const handleSubmit = async (data: CreateLecturerRequest) => {
  try {
    const response = await api.user.createLecturer(data);
    if (response.success) {
      setSuccessMsg("Created successfully");
      onSuccess?.();
    } else {
      setErrorMsg(response.error);
    }
  } catch (error) {
    setErrorMsg("Network error");
  }
};
```

### Pattern 2: Using Custom Hooks

```typescript
// In custom hook
export const useCreateLecturer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const create = async (data: CreateLecturerRequest) => {
    setLoading(true);
    try {
      const response = await api.user.createLecturer(data);
      return response;
    } catch (err) {
      setError("Failed to create lecturer");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};

// In component
export default function CreateLecturerForm() {
  const { create, loading } = useCreateLecturer();

  const handleSubmit = async (data) => {
    await create(data);
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

---

## 📚 Shared Component Examples

### SpecializationSelector

```typescript
import SpecializationSelector from "@/components/admin/SpecializationSelector";

export default function LecturerForm() {
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  return (
    <form>
      <SpecializationSelector
        availableSpecs={specializations}
        selectedIds={selectedSpecs}
        onSelectionChange={setSelectedSpecs}
      />
      <button type="submit">Save</button>
    </form>
  );
}
```

### Role Guards

```typescript
// Protect admin route
import AdminGuard from "@/components/auth/AdminGuard";

export default function AdminPage() {
  return (
    <AdminGuard>
      <div>Admin Content</div>
    </AdminGuard>
  );
}
```

---

## 🚀 Adding New Components

### Step 1: Create Component File

```typescript
// components/features/myfeature/my-component.tsx
"use client";

import React from "react";

interface MyComponentProps {
  // Define props
}

export default function MyComponent(props: MyComponentProps) {
  return <div>Component</div>;
}
```

### Step 2: Export from Index (if applicable)

Create `components/features/myfeature/index.ts`:

```typescript
export { default as MyComponent } from "./my-component";
export type { MyComponentProps } from "./my-component";
```

### Step 3: Use in Pages

```typescript
import MyComponent from "@/components/features/myfeature";

export default function MyPage() {
  return <MyComponent {...props} />;
}
```

---

## 🧪 Component Testing

```typescript
import { render, screen } from "@testing-library/react";
import MyComponent from "@/components/features/myfeature/my-component";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
```

---

## 📋 Checklist for New Components

- [ ] Component follows naming convention
- [ ] Props interface is defined and typed
- [ ] Component has "use client" if interactive
- [ ] Error handling is implemented
- [ ] TypeScript types are correct
- [ ] Component is exported properly
- [ ] JSDoc comments are added
- [ ] Tests are written (if needed)

---

## 🔗 Related Files

- **Components**: `src/components/`
- **API Service**: `src/lib/api/`
- **Types**: `src/lib/types/`
- **Hooks**: `src/lib/hooks/`

---

**Last Updated**: June 9, 2026
