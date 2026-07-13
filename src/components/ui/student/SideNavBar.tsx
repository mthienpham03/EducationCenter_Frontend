"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

export default function SideNavBar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { name: "Bảng điều khiển", icon: "dashboard", path: "/student/dashboard" },
    { name: "Quản lý khóa học", icon: "school", path: "/student/courses" },
    { name: "Tài liệu", icon: "folder_open", path: "/student/documents" },
    { name: "Bài kiểm tra", icon: "quiz", path: "/student/quizzes" },
    { name: "Lịch học", icon: "calendar_month", path: "/student/schedules" },
    { name: "Báo cáo tiến độ", icon: "insights", path: "/student/progress" },
  ];

  return (
    <aside className="h-full w-72 fixed left-0 top-0 flex flex-col p-stack-md bg-surface-container-lowest shadow-sm border-r border-outline-variant z-50 overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-headline-md font-headline-md font-bold text-primary">EduCenter</h1>
        <p className="text-label-md font-label-md text-on-surface-variant">Cổng học viên</p>
      </div>
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link 
              key={item.path}
              href={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all duration-200 active:scale-95 ${
                isActive 
                  ? "bg-primary-container text-on-primary-container" 
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-outline-variant">
        <button className="w-full mb-4 py-3 px-4 bg-secondary text-on-secondary rounded-xl font-label-md hover:opacity-90 transition-all">
          Xem tất cả lớp học
        </button>
        <Link 
          href="/student/profile" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all ${
            pathname === "/student/profile"
              ? "bg-primary-container text-on-primary-container"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>settings</span>
          <span>Cài đặt</span>
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-error hover:bg-error-container transition-all rounded-lg font-label-md">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
