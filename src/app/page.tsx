"use client";

import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api/auth.api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error(e);
    } finally {
      logout();
      router.push("/login");
    }
  };

  if (!isClient) return null; // Tránh hydration mismatch

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-[#87CEFA] p-6 text-center text-white">
          <h1 className="text-3xl font-bold">Trang Chủ</h1>
          <p className="mt-2 opacity-90">Chào mừng bạn đến với EduCenter!</p>
        </div>
        
        <div className="p-8">
          {user ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                <p className="text-sm text-gray-500 mb-1">Xin chào,</p>
                <h2 className="text-xl font-bold text-gray-800">{user.fullName}</h2>
                <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Vai trò: {user.role}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-xl border border-red-100 hover:bg-red-100 hover:text-red-700 transition-colors"
              >
                Đăng Xuất
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <p className="text-gray-600">Bạn chưa đăng nhập vào hệ thống.</p>
              <Link 
                href="/login"
                className="inline-block w-full py-3 bg-gradient-to-r from-[#87CEFA] to-[#60bafb] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Đăng Nhập Ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
