"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import StudentGuard from "@/components/auth/StudentGuard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    router.push("/login");
  };

  const menuItems = [
    { name: "Bảng điều khiển", icon: "dashboard", path: "/student/dashboard" },
    { name: "Quản lý khóa học", icon: "school", path: "/student/courses" },
    { name: "Tài liệu", icon: "folder_open", path: "/student/documents" },
    { name: "Bài kiểm tra", icon: "quiz", path: "/student/quizzes" },
    { name: "Lịch học", icon: "calendar_month", path: "/student/schedules" },
    { name: "Báo cáo tiến độ", icon: "insights", path: "/student/progress" },
  ];

  return (
    <StudentGuard>
      <div className="bg-background text-on-surface font-sans min-h-screen">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant z-40 flex flex-col p-base gap-stack-sm">
          <div className="px-4 py-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-black text-primary leading-tight">EduCenter</h1>
              <p className="text-xs text-on-surface-variant font-medium">Cổng Học Viên</p>
            </div>
          </div>
          <nav className="flex-1 px-2 space-y-1 sidebar-scroll overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== "/student/dashboard" && pathname.startsWith(item.path));
              return (
                <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive ? "text-primary bg-primary-fixed font-bold scale-[0.98]" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
                  <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
                  <span className="font-label-md text-label-md">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto px-2 pb-4 space-y-1">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-error hover:bg-error-container/20 rounded-lg transition-all">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md text-label-md">Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 flex justify-between items-center px-margin-desktop w-full h-16 bg-surface border-b border-outline-variant shadow-sm">
            <div className="flex-1">
              <input className="w-full max-w-md px-4 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary text-body-md" placeholder="Tìm kiếm khóa học..." type="text" />
            </div>

            <div className="flex items-center gap-6">
              {/* Notifications / Actions */}
              <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
              </button>

              {/* Avatar Dropdown */}
              <div className="flex items-center gap-3 pl-4 border-l border-outline-variant relative">
                <div className="text-right hidden sm:block">
                  <p className="font-label-md text-label-md text-on-surface leading-none">
                    {mounted ? user?.fullName || "Học viên" : "Học viên"}
                  </p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Học Viên</p>
                </div>

                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
                    {mounted && user?.avatarUrl ? (
                      <img alt="Avatar" className="w-full h-full object-cover" src={user.avatarUrl} />
                    ) : (
                      <span className="material-symbols-outlined text-primary w-full h-full flex items-center justify-center bg-surface-container">person</span>
                    )}
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-outline-variant rounded-xl shadow-xl z-[60] p-1 animate-in fade-in zoom-in duration-200">
                    <div className="px-3 py-2 border-b border-outline-variant">
                      <p className="font-bold text-sm text-on-surface truncate">
                        {mounted ? user?.fullName || "Tài khoản" : "Tài khoản"}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {mounted ? user?.email || "" : ""}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/student/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        Hồ sơ cá nhân
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error hover:bg-error-container/20 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="p-margin-desktop bg-surface-bright flex-1">
            <div className="max-w-container-max mx-auto h-full">
              {children}
            </div>
          </div>
        </main>
      </div>

      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-50 bg-transparent"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </StudentGuard>
  );
}
