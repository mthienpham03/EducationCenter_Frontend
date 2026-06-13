"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function TopNavBar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const getProfileRoute = (role?: string | null) => {
    if (!role) return "/login";
    const r = role.toLowerCase();
    if (r.includes("student")) return "/student/profile";
    if (r.includes("lecturer") || r.includes("teacher") || r.includes("giangvien")) return "/lecturer/profile";
    if (r.includes("admin") || r.includes("administrator")) return "/admin/profile";
    return "/profile";
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <header className="w-full h-16 sticky top-0 bg-surface-container-lowest dark:bg-surface-container-high shadow-sm dark:border-b dark:border-outline-variant flex justify-between items-center px-margin-desktop max-w-container-max mx-auto z-40">
      <div className="flex items-center gap-stack-sm overflow-hidden">
        <div className="flex items-center gap-2 text-on-surface-variant font-label-md">
          <span>{/* Breadcrumbs có thể động sau */} Bảng điều khiển</span>
        </div>
      </div>
      <div className="flex items-center gap-stack-md">
        <div className="flex items-center gap-stack-sm ml-stack-sm border-l pl-stack-md border-outline-variant">
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer p-2 rounded-full hover:bg-surface-container-low">notifications</span>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer p-2 rounded-full hover:bg-surface-container-low">help</span>
          <div className="flex items-center gap-2 relative" ref={menuRef}>
            <div
              className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") setMenuOpen((v) => !v);
              }}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-primary">person</span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent("open-profile-panel"));
              }}
              className="ml-2 px-3 py-1 rounded-md bg-primary text-white text-sm hover:opacity-90"
            >
              Hồ sơ
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white shadow-md border border-outline-variant rounded-lg flex flex-col overflow-hidden z-50">
                <div className="p-3 border-b border-outline-variant">
                  <p className="font-bold text-sm truncate">{user?.fullName}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    window.dispatchEvent(new CustomEvent("open-profile-panel"));
                  }}
                  className="flex items-center gap-2 p-3 hover:bg-surface-container-low text-sm text-left w-full text-left"
                >
                  <span className="material-symbols-outlined text-sm">person</span>
                  Hồ sơ
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 p-3 text-error hover:bg-error-container/20 text-sm text-left"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
