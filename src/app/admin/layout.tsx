"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import AdminGuard from "@/components/auth/AdminGuard";
import NotificationBell from "@/components/features/notifications/notification-bell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Thêm state cho dropdown
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
    { href: "/admin/dashboard", icon: "dashboard", label: "Bảng điều khiển" },
    { href: "/admin/users", icon: "admin_panel_settings", label: "Quản trị viên" },
    { href: "/admin/lecturers", icon: "school", label: "Giảng viên" },
    { href: "/admin/students", icon: "group", label: "Học viên" },
    { href: "/admin/specializations", icon: "category", label: "Chuyên ngành" },
    { href: "/admin/courses", icon: "library_books", label: "Khóa học" },
    { href: "/admin/question-bank", icon: "database", label: "Ngân hàng câu hỏi" },
    { href: "/admin/quizzes", icon: "quiz", label: "Bài kiểm tra" },
    { href: "/admin/schedules", icon: "calendar_month", label: "Lịch học" },
    { href: "/admin/documents", icon: "description", label: "Tài liệu" },
    { href: "/admin/reports", icon: "assessment", label: "Báo cáo" },
  ];

  return (
    <AdminGuard>
      <div className="bg-background text-on-surface font-sans min-h-screen">
        {/* Sidebar giữ nguyên */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant z-40 flex flex-col p-base gap-stack-sm">
          {/* ... (Giữ nguyên nội dung cũ của aside) ... */}
          <div className="px-4 py-6 flex items-center gap-3">
             <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
             </div>
             <div>
                <h1 className="font-headline-md text-headline-md font-black text-primary leading-tight">EduCenter</h1>
                <p className="text-xs text-on-surface-variant font-medium">Cổng Quản Trị</p>
             </div>
          </div>
          <nav className="flex-1 px-2 space-y-1 sidebar-scroll overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive ? "text-primary bg-primary-fixed font-bold scale-[0.98]" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
                  <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
                  <span className="font-label-md text-label-md">{item.label}</span>
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
               <input className="w-full max-w-md px-4 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary text-body-md" placeholder="Tìm kiếm nhanh..." type="text" />
            </div>
            
            <div className="flex items-center gap-6">
              {/* Notifications Bell */}
              <NotificationBell />

              {/* Avatar Dropdown */}
              <div className="flex items-center gap-3 pl-4 border-l border-outline-variant relative">
                <div className="text-right hidden sm:block">
                  <p className="font-label-md text-label-md text-on-surface leading-none">
                    {mounted ? user?.fullName || "Admin" : "Admin"}
                  </p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Quản Trị Viên</p>
                </div>

                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <img alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-primary-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKqpoSQTK4ZTRaZGPpqXw0nJsr3Tzcc7F1utCBkanBtSd4ixuwduA5rjzTtwveak9O556huC5-u8IBqgY54e1l4SzJmAncB5Jh4HGfbxuGc1RnLFbAh_1Axl17wGzHWRYVezKvFLXmznolNEibjfRflhhWyVhbBj1fuHL6Pk6ma_Cq6HM18cf_7m47uURAGVNjzqyc6lPeX7CJt37Pn2Cij13pkd_9_9Irqr4NjK2n5fyFrGJhZlkrprgLg6iYOFek2Ji5NqTpK5wS" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-outline-variant rounded-xl shadow-xl z-[60] p-1 animate-in fade-in zoom-in duration-200">
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        window.dispatchEvent(new Event("open-profile-panel"));
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-container rounded-lg text-on-surface"
                    >
                      <span className="material-symbols-outlined text-sm">person</span> Hồ sơ
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-error-container/20 rounded-lg text-error">
                      <span className="material-symbols-outlined text-sm">logout</span> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="p-margin-desktop max-w-[1280px] mx-auto w-full flex-1">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}