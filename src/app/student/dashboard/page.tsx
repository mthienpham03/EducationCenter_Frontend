"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return (
    <>
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">Khóa học của tôi</h2>
          <p className="text-body-md text-on-surface-variant">Chào mừng trở lại, {user?.fullName || "Học viên"}! Bạn có <span className="font-bold text-primary">3 khóa học</span> đang diễn ra.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>filter_list</span>
            Lọc
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>sort</span>
            Sắp xếp
          </button>
        </div>
      </div>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-10">
              <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/10 transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center text-on-primary-fixed">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>menu_book</span>
                </div>
                <div>
                  <p className="text-headline-md font-headline-md text-on-surface">12/48</p>
                  <p className="text-label-md text-on-surface-variant">Bài học đã hoàn thành</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/10 transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-tertiary-fixed rounded-full flex items-center justify-center text-on-tertiary-fixed">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>schedule</span>
                </div>
                <div>
                  <p className="text-headline-md font-headline-md text-on-surface">24h</p>
                  <p className="text-label-md text-on-surface-variant">Thời gian học tuần này</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/10 transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary-fixed rounded-full flex items-center justify-center text-on-secondary-fixed">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>military_tech</span>
                </div>
                <div>
                  <p className="text-headline-md font-headline-md text-on-surface">02</p>
                  <p className="text-label-md text-on-surface-variant">Chứng chỉ đạt được</p>
                </div>
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter">
              {/* Course Card 1 */}
              <div className="group bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/20 transition-all overflow-hidden flex flex-col md:flex-row h-full">
                <div className="md:w-2/5 relative h-48 md:h-auto overflow-hidden">
                  <img alt="UI/UX Design Course" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTwx0wIFX9LkNoW-poUrb8KAIv4VVO15Ul8gBOFIEwzF6K13rNjdDp0BwBkx8GbZUnbGzmpo5Lmv_CBxJNSB6Vncny6lLw-mDxWNfmWLsObxtv2wwDlywbtYaTvIfFz8ZXPo8poGyC_dou7DKs9Gg51KqimcdhSxcD0IE7_koqBYjB9TknFlX-Fy1vLucSkC8i7K3cfVmwpe3UKmmIQ_tqQuz-CJ1hrvcZG80L4JIzrgl_nLvgWG4CWy50Jhb6my--G72PPyWwTBvq" />
                  <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full text-caption text-on-primary font-bold">Thiết kế</div>
                </div>
                <div className="md:w-3/5 p-6 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-headline-md font-headline-md text-on-surface mb-2">UI/UX Advanced: Master the Design System</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <img alt="Instructor" className="w-6 h-6 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGmhJuncd5iEBA3MjfgiDjC3mK6cwdhYnAyyje9ECBvnJVaDmYtspMfGrDQKiFmPSuJF9OoluDc8rpvYs_7i4ICIt3JtO0axYX8IGj3yfztrobsWi-NLnSnumTvDLUQgXuvCgVG72ctbB5Btq0UOL4c8ThFEX5MgIcHE5Ftcw33x2vd8kbqfgLfAX_ZtUrYlSLemh0sw45UnJEqzpvKxo8UMZc-9ROrgKwdzUTGICbvQbVaT5vpJGQAS34qCKUmBuKhpwq0r5Qt7pi" />
                      <span className="text-label-md text-on-surface-variant">GV. Nguyễn Thành Nam</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-label-md text-on-surface-variant">Tiến độ</span>
                      <span className="text-label-md font-bold text-primary">75%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-6">
                      <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <button className="w-full py-3 px-6 bg-primary text-on-primary rounded-xl font-label-md hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2">
                      Vào học
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
              {/* Course Card 2 */}
              <div className="group bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/20 transition-all overflow-hidden flex flex-col md:flex-row h-full">
                <div className="md:w-2/5 relative h-48 md:h-auto overflow-hidden">
                  <img alt="Fullstack Web Course" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbtLTkZfruv0WkYaGvK_5HvKKoqtkNXzvxXZQyL_8MO6F8IG3Q6a-c91vV9VDlz6fccLgAX5AY-GdrykMui8jRYRqDrXYAcU5B9xVTz8eMi1nROtLSL8f1MmNPKggOnDGztMpky_9rZZJALiUNBK1Qnt7E-u-59R5a-e--um0tHNWFJLAQZTXE7ZLcLUvOWHV-prtQd2Ked7-P9sk_IxxG6sSE2aLrsb7Eq3pXHNudDO-GJxhgb95TfwhAeW1v1_HGplZRzN2YY4oF" />
                  <div className="absolute top-4 left-4 bg-secondary px-3 py-1 rounded-full text-caption text-on-primary font-bold">Lập trình</div>
                </div>
                <div className="md:w-3/5 p-6 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Fullstack Web Development with Next.js</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <img alt="Instructor" className="w-6 h-6 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJw4dhDpWnjAOPsY97eEkrwsPeQ9ccN75TzG9Z8J7VKd4k8BQxBscObCPa_HDTcALdxFrDtsUftByaV8Azhg8Iq6vxA-n4vRionE11dkS4OIIT2g6wlFhMHvMBC_JdY03lahdOagNys8wDCoU9xqJNZ_Uz_T3tAf47OWK5gdanggvW87m9D4uwyqFfagpAsIvILUWKAdY6UrGSy556MqhjxDIcYH6XpThDgY72rFWbZiQ-U-4m4nSv7D4IX5YpPa79cZx1Yne3O9yo" />
                      <span className="text-label-md text-on-surface-variant">GV. Trần Thị Mai</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-label-md text-on-surface-variant">Tiến độ</span>
                      <span className="text-label-md font-bold text-primary">32%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-6">
                      <div className="h-full bg-primary rounded-full" style={{ width: '32%' }}></div>
                    </div>
                    <button className="w-full py-3 px-6 bg-primary text-on-primary rounded-xl font-label-md hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2">
                      Vào học
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
              {/* Course Card 3 (Coming Soon/Recently Started) */}
              <div className="group bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/20 transition-all overflow-hidden flex flex-col md:flex-row h-full">
                <div className="md:w-2/5 relative h-48 md:h-auto overflow-hidden">
                  <img alt="Digital Marketing" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAkZw1ahdZKuwH9mWccCpRAB2UqnBuI3YnlrY3Bvn9QFlm6_HBZVmVNivd04etqJCUurQrc2foT3qEtrLNKQ6XMBhSv5vwRcEmTLUVXRh7350ElkwWV9ASdv6EQBOhPzDpakhj4UrTyrXwpLtyyK4TNsmQux8gNakWZ0GiHtrta_pKmqLfkj_-BpwOFe8G39cdbrMs6ECcz2UJqYV95M02qnlLAHpUTe-yzJH3xUdPLy-plgsuH4yLGYnZSeuly2SqQVopC79UpS8j" />
                  <div className="absolute top-4 left-4 bg-tertiary-container px-3 py-1 rounded-full text-caption text-on-primary font-bold">Tiếp thị</div>
                </div>
                <div className="md:w-3/5 p-6 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Digital Marketing & Growth Hacking</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <img alt="Instructor" className="w-6 h-6 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZAyONUmJD1OpmG0nEich5dwZZkhq4es4ULcWTPTUGTWjdPh2JLgb0pp1SCiAGUvg4qixfsAPkFuTVS5j0Sj4wSRyX91V1hS5Qj_xU7vDo4LOsnoCLfyzy7zihYfbKoBVhGg9qz7-2w2Qb0MVXuPsptKaBDQk2gK-CHXpbnVr8yKQMCX-5YkeN0X68Z8ZbU0d6SYi8S4A08n3DaQLE7qwmtX_dHdWq-47XMQXBIZe8OMq9iiZjLz_V_sWjU7i_d_KWmis5elMdvr9F" />
                      <span className="text-label-md text-on-surface-variant">GV. Lê Hoàng Anh</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-label-md text-on-surface-variant">Tiến độ</span>
                      <span className="text-label-md font-bold text-primary">0%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-6">
                      <div className="h-full bg-primary rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <button className="w-full py-3 px-6 bg-primary text-on-primary rounded-xl font-label-md hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2">
                      Bắt đầu học
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>play_circle</span>
                    </button>
                  </div>
                </div>
              </div>
              {/* Empty State / Placeholder for New Course */}
              <div className="group bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-dashed border-outline-variant hover:border-primary transition-all overflow-hidden flex items-center justify-center min-h-[240px] cursor-pointer">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4 text-outline group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 0" }}>add</span>
                  </div>
                  <h4 className="text-headline-md font-headline-md text-on-surface-variant group-hover:text-primary transition-colors">Đăng ký thêm khóa học</h4>
                  <p className="text-body-md text-on-surface-variant mt-2">Khám phá hàng ngàn khóa học mới mỗi ngày</p>
                </div>
              </div>
            </div>

            {/* Learning Structure (Non-editable view) */}
            <div className="mt-stack-lg bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                <div>
                  <h3 className="text-headline-md font-headline-md text-on-surface">Cấu trúc lộ trình học tập</h3>
                  <p className="text-label-md text-on-surface-variant italic mt-1">* Chế độ xem dành cho học viên</p>
                </div>
                <span className="px-4 py-1 bg-surface-container-low text-on-surface-variant rounded-full text-label-md">Đang học: Chương 4</span>
              </div>
              <div className="divide-y divide-outline-variant">
                {/* Chapter 1 */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-body-lg flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center bg-primary-fixed text-on-primary-fixed rounded-full text-caption">01</span>
                      Chương 1: Giới thiệu & Tổng quan
                    </h4>
                    <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 0" }}>check_circle</span>
                  </div>
                  <div className="ml-10 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>play_lesson</span>
                        <span className="text-body-md">1.1 Mục tiêu khóa học</span>
                      </div>
                      <span className="text-caption text-on-surface-variant">08:24</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>play_lesson</span>
                        <span className="text-body-md">1.2 Cài đặt môi trường làm việc</span>
                      </div>
                      <span className="text-caption text-on-surface-variant">15:45</span>
                    </div>
                  </div>
                </div>
                {/* Chapter 2 */}
                <div className="p-6 bg-surface-container-low/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-body-lg flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center bg-primary-container text-on-primary-container rounded-full text-caption">02</span>
                      Chương 2: Tư duy thiết kế Sản phẩm
                    </h4>
                    <span className="text-label-md text-primary font-bold">Đang học</span>
                  </div>
                  <div className="ml-10 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-surface-container-lowest border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>play_lesson</span>
                        <span className="text-body-md font-bold">2.1 Phân tích yêu cầu người dùng</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-caption text-primary">Tiếp tục xem</span>
                        <span className="text-caption text-on-surface-variant">22:10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg opacity-60">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0" }}>lock</span>
                        <span className="text-body-md">2.2 Quy trình Wireframing chuyên sâu</span>
                      </div>
                      <span className="text-caption text-on-surface-variant">12:30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Section (Mentor Feedback) */}
            <div className="mt-stack-lg flex flex-col items-center text-center max-w-2xl mx-auto pb-10">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-primary-fixed">
                <img alt="Advisor Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBa5g9Yw-omVldVhgHaCbJ0yGFEVYo8hP9wIeon0K3Xo3BBGsr44ZgLjEaTeyzkB_IiXzm57z4WdpR-jyuFbYZcnXnFqQqnW1ontcWAdWTmEsjhvqmiDoPanPf6dypyo5uwOzYRAc9zM6mCNSAK1m1EEgCS76PQgTIP6U0E66dDijeKdy4Wrt1_zyru9buDKJhkemYhkzlxxZlEEcS_2k1N2bzXz9WTN_uUtd8r96meaz9boqochCvNJjEEaTFvKjlFFJ2G6AJEcoWL" />
              </div>
              <p className="text-body-lg italic text-on-surface mb-2">"Chào Minh, tiến độ học tập của bạn rất ấn tượng. Hãy tiếp tục duy trì và đừng ngần ngại đặt câu hỏi trong mục Quizzes nhé!"</p>
              <p className="text-label-md font-bold text-primary">— Cố vấn học tập Minh Anh</p>
            </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
      </button>
    </>
  );
}
