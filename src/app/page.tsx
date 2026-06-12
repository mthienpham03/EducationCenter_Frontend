"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth.api";

export default function Home() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      const role = user.role?.toLowerCase();
      if (role === "admin") router.replace("/admin/dashboard");
      else if (role === "lecturer") router.replace("/lecturer/courses");
      else if (role === "student") router.replace("/student/dashboard");
    }
  }, [user, router]);

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

  const getDashboardLink = () => {
    if (!user) return "/login";
    const role = user.role?.toLowerCase();
    if (role === "admin") return "/admin/dashboard";
    if (role === "lecturer") return "/lecturer/courses";
    if (role === "student") return "/student/dashboard";
    return "/";
  };

  if (!mounted || user) return <div className="min-h-screen bg-background" />;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
      {/* Header */}
      <header className="bg-surface-container-lowest shadow-sm fixed top-0 w-full z-50">
        <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          {/* Logo */}
          <Link href="/" className="text-headline-md font-headline-md font-bold text-primary flex items-center gap-2 scale-95 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            EduCenter
          </Link>

          {/* Navigation & Auth */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-2">
              <Link href="#" className="flex items-center px-4 py-2 text-on-surface font-label-md hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors duration-200">
                Về chúng tôi
              </Link>
              <Link href="#" className="flex items-center px-4 py-2 text-on-surface font-label-md hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors duration-200">
                Khóa học
              </Link>
              <Link href="#" className="flex items-center px-4 py-2 text-on-surface font-label-md hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors duration-200">
                Cơ sở
              </Link>
            </nav>
            <div className="h-8 w-[1px] bg-outline-variant hidden md:block"></div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-opacity">
                Đăng nhập
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow mt-20">
        <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center bg-surface-container overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <img alt="Hero background" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLuijzmm2Y5AoHhL7xPs7oMak8J5l8SOEvc_f9KIdkY33Pl6f1ANt2ELhCraqUsfDnh4zzp4wYg2MDQiNshOTQCy4Q6mWENMA83rswNGXG9PUr9SSpuimNv03Ld7uT_zZ-djEKlbs9MKAkfJgmX4kZb6iqaYlbjfZXx8GqSokrv9D5lwiYMAoBv0s0AN4TFQyQtvZfjgX1KXGAII_AI15-Z-E4kNUYcH0CCY7Fs3OqcK-aMxSXiryhhNWYg" />
            <div className="absolute inset-0 bg-gradient-to-r from-on-background/80 to-on-background/40"></div>
          </div>
          <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-on-primary">
            <h1 className="text-headline-xl font-headline-xl md:text-[64px] font-bold mb-stack-md leading-tight max-w-4xl mx-auto drop-shadow-md">
              Hệ thống Quản lý Đào tạo<br />
              <span className="text-primary-fixed">EduCenter</span>
            </h1>
            <p className="text-body-lg font-body-lg md:text-[24px] mb-stack-lg max-w-2xl mx-auto text-surface-bright drop-shadow-sm">
              Nâng tầm tri thức, vững bước tương lai. Giải pháp toàn diện cho quản lý giáo dục hiện đại.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={getDashboardLink()} className="px-8 py-4 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors shadow-sm flex items-center justify-center gap-2">
                Bắt đầu ngay
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <button className="px-8 py-4 bg-surface-container-lowest/10 backdrop-blur-md border border-outline-variant text-on-primary rounded-lg font-label-md text-label-md hover:bg-surface-container-lowest/20 transition-colors shadow-sm flex items-center justify-center gap-2">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full mt-stack-lg bg-inverse-surface border-t border-outline-variant py-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start gap-gutter font-body-md text-body-md text-on-primary-fixed">
        <div className="flex flex-col gap-stack-sm max-w-sm">
          <Link href="/" className="text-headline-md font-headline-md font-bold text-surface-container-lowest flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            EduCenter
          </Link>
          <p className="text-surface-variant font-caption text-caption opacity-80 hover:opacity-100 transition-opacity">
            Giải pháp quản lý đào tạo toàn diện, nâng cao hiệu quả giảng dạy và học tập.
          </p>
          <p className="font-caption text-caption text-surface-variant mt-stack-sm">
            © 2024 Trung tâm Gia sư EduCenter. Bảo lưu mọi quyền.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-stack-lg w-full md:w-auto mt-stack-md md:mt-0">
          <div className="flex flex-col gap-stack-sm">
            <span className="font-label-md text-label-md font-bold text-primary-fixed mb-2">Liên kết</span>
            <Link href="#" className="text-surface-variant hover:text-white hover:underline transition-all font-body-md text-body-md">Điều khoản</Link>
            <Link href="#" className="text-surface-variant hover:text-white hover:underline transition-all font-body-md text-body-md">Bảo mật</Link>
          </div>
          <div className="flex flex-col gap-stack-sm">
            <span className="font-label-md text-label-md font-bold text-primary-fixed mb-2">Hỗ trợ</span>
            <Link href="#" className="text-surface-variant hover:text-white hover:underline transition-all font-body-md text-body-md">Liên hệ</Link>
            <Link href="#" className="text-surface-variant hover:text-white hover:underline transition-all font-body-md text-body-md">Tuyển dụng</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
