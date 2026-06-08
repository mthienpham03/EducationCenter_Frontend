"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import AdminGuard from "@/components/auth/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuItems = [
    { href: "/admin/dashboard", icon: "dashboard", label: "Bảng điều khiển" },
    { href: "/admin/users", icon: "admin_panel_settings", label: "Quản trị viên" },
    { href: "/admin/lecturers", icon: "school", label: "Giảng viên" },
    { href: "/admin/students", icon: "group", label: "Học viên" },
    { href: "/admin/courses", icon: "library_books", label: "Khóa học" },
    { href: "/admin/quizzes", icon: "quiz", label: "Đề thi & Kiểm tra" },
    { href: "/admin/schedules", icon: "calendar_month", label: "Lịch học" },
    { href: "/admin/reports", icon: "assessment", label: "Báo cáo" },
  ];

  return (
    <AdminGuard>
      <div className="bg-background text-on-surface font-sans min-h-screen">
        <style dangerouslySetInnerHTML={{__html: `
          .sidebar-scroll::-webkit-scrollbar {
              width: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
              background: transparent;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
              background: #e1e3e4;
              border-radius: 10px;
          }
        `}} />

        {/* SideNavBar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant z-40 flex flex-col p-base gap-stack-sm">
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
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? "text-primary bg-primary-fixed font-bold scale-[0.98]"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className="font-label-md text-label-md">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="px-2 pt-4 border-t border-outline-variant">
            <button className="w-full bg-primary text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
              <span className="material-symbols-outlined">add</span>
              <span>Thêm Khóa Học</span>
            </button>
          </div>
          <div className="mt-auto px-2 pb-4 space-y-1">
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
              <span className="material-symbols-outlined">settings</span>
              <span className="font-label-md text-label-md">Cài đặt</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-error hover:bg-error-container/20 rounded-lg transition-all">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md text-label-md">Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Main Content Layout */}
        <main className="ml-64 min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 flex justify-between items-center px-margin-desktop w-full h-16 bg-surface border-b border-outline-variant shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary text-body-md font-body-md" placeholder="Tìm kiếm nhanh..." type="text" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button className="relative text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button className="text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
                <div className="text-right hidden sm:block">
                  <p className="font-label-md text-label-md text-on-surface leading-none">
                    {mounted ? user?.fullName || "Admin" : "Admin"}
                  </p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Quản Trị Viên Cao Cấp</p>
                </div>
                <img alt="User Profile Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-primary-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKqpoSQTK4ZTRaZGPpqXw0nJsr3Tzcc7F1utCBkanBtSd4ixuwduA5rjzTtwveak9O556huC5-u8IBqgY54e1l4SzJmAncB5Jh4HGfbxuGc1RnLFbAh_1Axl17wGzHWRYVezKvFLXmznolNEibjfRflhhWyVhbBj1fuHL6Pk6ma_Cq6HM18cf_7m47uURAGVNjzqyc6lPeX7CJt37Pn2Cij13pkd_9_9Irqr4NjK2n5fyFrGJhZlkrprgLg6iYOFek2Ji5NqTpK5wS" />
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