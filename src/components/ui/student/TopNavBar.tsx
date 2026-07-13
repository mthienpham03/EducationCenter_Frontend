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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 w-full z-40 flex justify-between items-center px-margin-desktop py-4 bg-surface shadow-sm">
      <div className="flex items-center gap-8">
        <div className="hidden lg:flex gap-6">
          <Link href="/student/dashboard" className="text-primary border-b-2 border-primary pb-1 font-label-md transition-all duration-200">Bảng điều khiển</Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors font-label-md">Thông báo</Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors font-label-md">Hỗ trợ</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
          <input className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-body-md focus:outline-none focus:border-primary w-64" placeholder="Tìm kiếm khóa học..." type="text" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full font-label-md hover:bg-primary-container transition-all">
          Đăng ký khóa học mới
        </button>
        <div className="flex items-center gap-2 ml-2 relative" ref={menuRef}>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
          </button>
          <div>
            <div
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed block cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setMenuOpen((v) => !v); }}
            >
              {user?.avatarUrl ? (
                <img alt="Student Avatar" className="w-full h-full object-cover" src={user.avatarUrl} />
              ) : (
                <span className="material-symbols-outlined text-primary w-full h-full flex items-center justify-center bg-surface-container">person</span>
              )}
            </div>
            {menuOpen && (
              <div className="absolute right-0 top-12 w-44 bg-white shadow-md border border-outline-variant rounded-lg flex flex-col overflow-hidden z-50">
                <div className="p-3 border-b border-outline-variant">
                  <p className="font-bold text-sm truncate">{user?.fullName}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('open-profile-panel'));
                  }}
                  className="flex items-center gap-2 p-3 hover:bg-surface-container-low text-sm text-left w-full text-left"
                >
                  <span className="material-symbols-outlined text-sm">person</span>
                  Hồ sơ
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 p-3 text-error hover:bg-error-container/20 text-sm text-left w-full"
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
