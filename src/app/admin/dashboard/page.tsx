"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
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
        .chart-bar {
            transition: height 1s ease-out;
        }
      `}} />

      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant z-40 flex flex-col p-base gap-stack-sm">
        <div className="px-4 py-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-black text-primary">EduCenter</h1>
            <p className="text-xs text-on-surface-variant font-medium">Management Portal</p>
          </div>
        </div>
        <nav className="flex-1 px-2 space-y-1 sidebar-scroll overflow-y-auto">
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-primary bg-primary-fixed rounded-lg font-bold transition-all scale-[0.98]">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all group">
            <span className="material-symbols-outlined">admin_panel_settings</span>
            <span className="font-label-md text-label-md">Admin</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
            <span className="material-symbols-outlined">school</span>
            <span className="font-label-md text-label-md">Tutors</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md text-label-md">Students</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
            <span className="material-symbols-outlined">library_books</span>
            <span className="font-label-md text-label-md">Courses</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
            <span className="material-symbols-outlined">quiz</span>
            <span className="font-label-md text-label-md">Quiz & Exams</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-label-md text-label-md">Schedules</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
            <span className="material-symbols-outlined">assessment</span>
            <span className="font-label-md text-label-md">Reports</span>
          </Link>
        </nav>
        <div className="px-2 pt-4 border-t border-outline-variant">
          <button className="w-full bg-secondary text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined">add</span>
            <span>Add New Course</span>
          </button>
        </div>
        <div className="mt-auto px-2 pb-4 space-y-1">
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-error hover:bg-error-container rounded-lg transition-all">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-50 flex justify-between items-center px-margin-desktop w-full h-16 bg-surface border-b border-outline-variant shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary text-body-md font-body-md" placeholder="Tìm kiếm khóa học, học viên..." type="text" />
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
                <p className="font-label-md text-label-md text-on-surface leading-none">{user?.fullName || "Admin"}</p>
                <p className="text-caption text-on-surface-variant mt-1">Super Administrator</p>
              </div>
              <img alt="User Profile Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-primary-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKqpoSQTK4ZTRaZGPpqXw0nJsr3Tzcc7F1utCBkanBtSd4ixuwduA5rjzTtwveak9O556huC5-u8IBqgY54e1l4SzJmAncB5Jh4HGfbxuGc1RnLFbAh_1Axl17wGzHWRYVezKvFLXmznolNEibjfRflhhWyVhbBj1fuHL6Pk6ma_Cq6HM18cf_7m47uURAGVNjzqyc6lPeX7CJt37Pn2Cij13pkd_9_9Irqr4NjK2n5fyFrGJhZlkrprgLg6iYOFek2Ji5NqTpK5wS" />
            </div>
          </div>
        </header>

        <div className="p-margin-desktop max-w-[1280px] mx-auto space-y-stack-lg">
          <section className="flex justify-between items-end">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Chào buổi sáng, {user?.fullName?.split(' ').pop() || "Admin"} 👋</h2>
              <p className="text-body-lg text-on-surface-variant">Dưới đây là tổng quan về hoạt động của hệ thống EduCenter hôm nay.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-outline text-on-surface font-label-md rounded-lg hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined text-xl">download</span> Xuất báo cáo
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-label-md rounded-lg shadow-md hover:opacity-90 transition-all">
                <span className="material-symbols-outlined text-xl">add</span> Tạo khóa học
              </button>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/10 hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary-fixed rounded-lg text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <span className="text-tertiary-container font-bold text-xs flex items-center">+12% ↑</span>
              </div>
              <p className="text-on-surface-variant font-label-md mb-1">Tổng số học viên</p>
              <h3 className="text-headline-xl font-headline-xl text-on-surface">12,480</h3>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/10 hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary-fixed rounded-lg text-secondary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <span className="text-tertiary-container font-bold text-xs flex items-center">+4% ↑</span>
              </div>
              <p className="text-on-surface-variant font-label-md mb-1">Tổng số giảng viên</p>
              <h3 className="text-headline-xl font-headline-xl text-on-surface">324</h3>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/10 hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-tertiary-fixed rounded-lg text-tertiary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">library_books</span>
                </div>
                <span className="text-on-surface-variant font-bold text-xs">Ổn định</span>
              </div>
              <p className="text-on-surface-variant font-label-md mb-1">Khóa học đang mở</p>
              <h3 className="text-headline-xl font-headline-xl text-on-surface">156</h3>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/10 hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary-container/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="text-tertiary-container font-bold text-xs flex items-center">+24% ↑</span>
              </div>
              <p className="text-on-surface-variant font-label-md mb-1">Doanh thu tháng (VNĐ)</p>
              <h3 className="text-headline-xl font-headline-xl text-on-surface">842M</h3>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-headline-md text-headline-md">Tăng trưởng học viên</h3>
                  <p className="text-caption text-on-surface-variant">Thống kê 6 tháng gần nhất (Đơn vị: Nghìn người)</p>
                </div>
                <select className="bg-surface-container border-none text-xs font-label-md rounded-lg py-1 px-3 focus:ring-1 focus:ring-primary">
                  <option>Năm 2024</option>
                  <option>Năm 2023</option>
                </select>
              </div>
              <div className="flex-1 flex items-end justify-between gap-2 h-64 pt-4 border-l border-b border-outline-variant px-4">
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="bg-primary/20 w-full rounded-t-lg relative chart-bar" style={{ height: mounted ? '40%' : '0%' }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-white text-[10px] px-2 py-1 rounded">2.4k</div>
                  </div>
                  <span className="text-[10px] font-medium text-on-surface-variant">T1</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="bg-primary/40 w-full rounded-t-lg relative chart-bar" style={{ height: mounted ? '55%' : '0%' }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-white text-[10px] px-2 py-1 rounded">3.2k</div>
                  </div>
                  <span className="text-[10px] font-medium text-on-surface-variant">T2</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="bg-primary/60 w-full rounded-t-lg relative chart-bar" style={{ height: mounted ? '70%' : '0%' }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-white text-[10px] px-2 py-1 rounded">4.5k</div>
                  </div>
                  <span className="text-[10px] font-medium text-on-surface-variant">T3</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="bg-primary/80 w-full rounded-t-lg relative chart-bar" style={{ height: mounted ? '65%' : '0%' }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-white text-[10px] px-2 py-1 rounded">4.1k</div>
                  </div>
                  <span className="text-[10px] font-medium text-on-surface-variant">T4</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="bg-primary w-full rounded-t-lg relative chart-bar" style={{ height: mounted ? '90%' : '0%' }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-white text-[10px] px-2 py-1 rounded">6.2k</div>
                  </div>
                  <span className="text-[10px] font-medium text-on-surface-variant">T5</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="bg-primary-container w-full rounded-t-lg relative chart-bar" style={{ height: mounted ? '100%' : '0%' }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-white text-[10px] px-2 py-1 rounded">7.5k</div>
                  </div>
                  <span className="text-[10px] font-medium text-on-surface-variant">T6</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-headline-md">Hoạt động gần đây</h3>
                <Link className="text-primary text-xs font-bold hover:underline" href="#">Xem tất cả</Link>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4 relative pb-6 border-l-2 border-surface-variant ml-3 last:pb-0 last:border-l-0">
                  <div className="absolute -left-[11px] top-0 w-5 h-5 bg-primary-container rounded-full border-4 border-white"></div>
                  <div className="pl-4">
                    <p className="text-label-md font-label-md text-on-surface">Giảng viên Phan Anh <span className="text-on-surface-variant font-normal">vừa tải lên bài giảng mới:</span></p>
                    <p className="text-primary text-xs font-bold mt-1 italic">"Cơ sở dữ liệu nâng cao - Chương 4"</p>
                    <p className="text-caption text-on-surface-variant mt-1">15 phút trước</p>
                  </div>
                </div>
                <div className="flex gap-4 relative pb-6 border-l-2 border-surface-variant ml-3 last:pb-0 last:border-l-0">
                  <div className="absolute -left-[11px] top-0 w-5 h-5 bg-tertiary-container rounded-full border-4 border-white"></div>
                  <div className="pl-4">
                    <p className="text-label-md font-label-md text-on-surface">Học viên Lê Minh <span className="text-on-surface-variant font-normal">đã đăng ký khóa học:</span></p>
                    <p className="text-primary text-xs font-bold mt-1 italic">"Kỹ năng lập trình React Native"</p>
                    <p className="text-caption text-on-surface-variant mt-1">42 phút trước</p>
                  </div>
                </div>
                <div className="flex gap-4 relative pb-6 border-l-2 border-surface-variant ml-3 last:pb-0 last:border-l-0">
                  <div className="absolute -left-[11px] top-0 w-5 h-5 bg-secondary-container rounded-full border-4 border-white"></div>
                  <div className="pl-4">
                    <p className="text-label-md font-label-md text-on-surface">Cảnh báo hệ thống: <span className="text-on-surface-variant font-normal">Dung lượng ổ đĩa lưu trữ đã đạt 85%</span></p>
                    <p className="text-caption text-on-surface-variant mt-1">2 giờ trước</p>
                  </div>
                </div>
                <div className="flex gap-4 relative pb-6 border-l-2 border-surface-variant ml-3 last:pb-0 last:border-l-0">
                  <div className="absolute -left-[11px] top-0 w-5 h-5 bg-primary rounded-full border-4 border-white"></div>
                  <div className="pl-4">
                    <p className="text-label-md font-label-md text-on-surface">Admin <span className="text-on-surface-variant font-normal">đã hoàn tất quyết toán tháng 5.</span></p>
                    <p className="text-caption text-on-surface-variant mt-1">4 giờ trước</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter pb-8">
            <div className="bg-primary p-6 rounded-xl text-white shadow-lg overflow-hidden relative group">
              <div className="relative z-10">
                <h4 className="font-headline-md mb-2">Quản lý đào tạo</h4>
                <p className="text-sm opacity-90 mb-6">Nhanh chóng thêm khóa học mới hoặc quản lý danh mục bài học.</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-white text-primary font-bold rounded-lg text-sm hover:bg-opacity-90 transition-all">Thêm khóa học</button>
                  <button className="p-2 border border-white rounded-lg hover:bg-white/10 transition-all">
                    <span className="material-symbols-outlined">settings_suggest</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-highest p-6 rounded-xl shadow-sm border border-outline-variant hover:bg-white transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-secondary shadow-sm">
                  <span className="material-symbols-outlined text-2xl">person_add</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Nhân sự mới</h4>
                  <p className="text-xs text-on-surface-variant">Phê duyệt giảng viên tham gia hệ thống</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-outline-variant">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    <span className="text-xs font-bold text-on-surface">Th.S Nguyễn Văn A</span>
                  </div>
                  <button className="text-[10px] text-primary font-black uppercase tracking-wider">Duyệt</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-outline-variant">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    <span className="text-xs font-bold text-on-surface">Dr. Trần Thị B</span>
                  </div>
                  <button className="text-[10px] text-primary font-black uppercase tracking-wider">Duyệt</button>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-outline-variant flex flex-col justify-between">
              <h4 className="font-label-md text-on-surface mb-4">Trạng thái hệ thống</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Bộ nhớ Cloud</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-error" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Thời gian uptime (30 ngày)</span>
                    <span className="font-bold">99.98%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary-container" style={{ width: '99%' }}></div>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button className="text-xs text-primary-container font-bold flex items-center gap-1">
                    Xem chi tiết kỹ thuật <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
