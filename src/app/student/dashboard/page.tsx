"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { courseService } from "@/lib/api/service";

export default function StudentDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseLessonCounts, setCourseLessonCounts] = useState<Record<string, number>>({});

  const MOCK_COURSES = [
    {
      id: "uiux-mock",
      code: "UI/UX",
      name: "UI/UX Advanced: Master the Design System",
      description: "Học cách thiết kế hệ thống Design System chuyên sâu trong Figma và nguyên lý UI/UX.",
    },
    {
      id: "nextjs-mock",
      code: "NEXTJS",
      name: "Fullstack Web Development with Next.js",
      description: "Xây dựng ứng dụng web hiện đại với React, Next.js App Router, TailwindCSS và Node.js.",
    },
    {
      id: "marketing-mock",
      code: "MARKETING",
      name: "Digital Marketing & Growth Hacking",
      description: "Chiến dịch marketing tăng trưởng, quảng cáo Google/Facebook ads chuyên nghiệp.",
    }
  ];

  useEffect(() => {
    setMounted(true);
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await courseService.getCourses();
        if (res.success && res.data && res.data.length > 0) {
          setCourses(res.data);
          const counts: Record<string, number> = {};
          await Promise.all(
            res.data.map(async (course: any) => {
              try {
                const curriculumRes = await courseService.getChaptersAndLessons(course.id);
                if (curriculumRes.success && curriculumRes.data) {
                  const total = curriculumRes.data.reduce(
                    (sum: number, ch: any) => sum + (ch.lessons?.length || 0),
                    0
                  );
                  counts[course.id] = total;
                }
              } catch {
                counts[course.id] = 0;
              }
            })
          );
          setCourseLessonCounts(counts);
        } else {
          setCourses(MOCK_COURSES);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách khóa học, sử dụng dữ liệu mặc định:", err);
        setCourses(MOCK_COURSES);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
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
    <div className="bg-surface-bright text-on-surface min-h-screen flex font-body-md">
      {/* Sidebar */}
      <aside className="h-full w-72 fixed left-0 top-0 flex flex-col p-stack-md bg-surface-container-lowest shadow-sm border-r border-outline-variant z-50 overflow-y-auto">
        <div className="mb-10">
          <h1 className="text-headline-md font-headline-md font-bold text-primary">EduCenter</h1>
          <p className="text-label-md font-label-md text-on-surface-variant">Cổng học viên</p>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <Link href="/student/dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg font-label-md transition-all duration-200">
            <span className="material-symbols-outlined">school</span>
            <span>Quản lý khóa học</span>
          </Link>
          <Link href="/student/courses/documents" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">folder_open</span>
            <span>Tài liệu</span>
          </Link>
          <Link href="/student/quizzes" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">quiz</span>
            <span>Bài kiểm tra</span>
          </Link>
          <Link href="/student/schedules" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">calendar_month</span>
            <span>Lịch học</span>
          </Link>
          <Link href="/student/courses/progress" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">insights</span>
            <span>Tiến độ học tập</span>
          </Link>
          <Link href="/student/courses/learning-space" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">cast_for_education</span>
            <span>Không gian học tập</span>
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-outline-variant">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-error hover:bg-error-container transition-all rounded-lg font-label-md">
            <span className="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-72 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 w-full z-40 flex justify-between items-center px-margin-desktop py-4 bg-surface shadow-sm border-b border-outline-variant">
          <div className="flex items-center gap-4">
            <h2 className="text-headline-md font-bold text-on-surface">Bảng điều khiển học viên</h2>
          </div>
          <div className="flex items-center gap-4 relative" ref={menuRef}>
            <div
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed block cursor-pointer"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {user?.avatarUrl ? (
                <img alt="Avatar" className="w-full h-full object-cover" src={user.avatarUrl} />
              ) : (
                <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
              )}
            </div>

            {menuOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white shadow-xl border border-outline-variant rounded-xl flex flex-col overflow-hidden z-50">
                <div className="p-3 border-b border-outline-variant bg-surface-container-low">
                  <p className="font-bold text-sm truncate">{user?.fullName}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('open-profile-panel'));
                  }}
                  className="flex items-center gap-2 p-3 hover:bg-surface-container-low text-sm text-left"
                >
                  <span className="material-symbols-outlined text-sm">person</span>
                  Hồ sơ cá nhân
                </button>
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 p-3 text-error hover:bg-error-container/20 text-sm text-left"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Main */}
        <main className="p-margin-desktop bg-surface-bright flex-1 space-y-8">
          {/* Welcome section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-headline-lg font-bold text-on-surface mb-1">Khóa học của tôi</h2>
              <p className="text-body-md text-on-surface-variant">
                Chào mừng trở lại, <span className="font-bold text-primary">{user?.fullName || "Học viên"}</span>! Bạn có{" "}
                <span className="font-bold text-primary">{courses.length} khóa học</span> đang diễn ra.
              </p>
            </div>
          </div>

          {/* Bento Grid Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center text-on-primary-fixed">
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <div>
                <p className="text-headline-md font-bold text-on-surface">{courses.length}</p>
                <p className="text-label-md text-on-surface-variant">Khóa học đang tham gia</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-tertiary-fixed rounded-full flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <p className="text-headline-md font-bold text-on-surface">24h</p>
                <p className="text-label-md text-on-surface-variant">Thời gian học tuần này</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-fixed rounded-full flex items-center justify-center text-on-secondary-fixed">
                <span className="material-symbols-outlined">military_tech</span>
              </div>
              <div>
                <p className="text-headline-md font-bold text-on-surface">02</p>
                <p className="text-label-md text-on-surface-variant">Chứng chỉ đạt được</p>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter">
            {loading ? (
              <div className="col-span-2 p-12 text-center bg-surface-container-lowest rounded-xl">
                <span className="material-symbols-outlined text-[48px] text-primary animate-spin block mb-3">progress_activity</span>
                <p className="text-on-surface-variant font-body-md">Đang tải danh sách khóa học...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="col-span-2 p-12 text-center bg-surface-container-lowest rounded-xl">
                <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">search_off</span>
                <p className="text-on-surface-variant font-body-md">Bạn chưa đăng ký khóa học nào.</p>
              </div>
            ) : (
              courses.map((course) => {
                const completedKey = `completed_lessons_${user?.id}_${course.id}`;
                let completedCount = 0;
                try {
                  const completed = JSON.parse(localStorage.getItem(completedKey) || "[]");
                  completedCount = completed.length;
                } catch {}

                const totalLessons = courseLessonCounts[course.id] ?? 0;
                const progress = totalLessons > 0
                  ? Math.min(Math.round((completedCount / totalLessons) * 100), 100)
                  : 0;

                return (
                  <div key={course.id} className="group bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 hover:border-primary/20 transition-all overflow-hidden flex flex-col md:flex-row h-full">
                    <div className="md:w-2/5 relative h-48 md:h-auto overflow-hidden bg-primary-container/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[64px] text-primary/30">school</span>
                      <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full text-caption text-on-primary font-bold">
                        {course.code || "Khóa học"}
                      </div>
                    </div>
                    <div className="md:w-3/5 p-6 flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-headline-md font-bold text-on-surface mb-2 line-clamp-2">{course.name}</h3>
                        <p className="text-xs text-on-surface-variant line-clamp-2 mb-4">{course.description || "Chưa có mô tả cho khóa học này."}</p>
                      </div>
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-label-md text-on-surface-variant">Tiến độ</span>
                          <span className="text-label-md font-bold text-primary">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-6">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <button
                          onClick={() => router.push(`/student/courses/learning-space?courseId=${course.id}`)}
                          className="w-full py-3 px-6 bg-primary text-on-primary rounded-xl font-label-md hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          Vào học
                          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
