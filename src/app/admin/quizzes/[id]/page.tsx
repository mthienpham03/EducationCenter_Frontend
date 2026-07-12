"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { quizService } from "@/lib/api/service";

export default function AdminQuizResultsPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { id: quizId } = useParams() as { id: string };

  const [mounted, setMounted] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizRes, attemptsRes] = await Promise.all([
        quizService.getQuizById(quizId),
        quizService.getAttemptsByQuiz(quizId),
      ]);

      if (quizRes.success) {
        setQuiz(quizRes.data);
      }
      if (attemptsRes.success) {
        setAttempts(attemptsRes.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải báo cáo bài thi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && quizId) {
      loadData();
    }
  }, [mounted, quizId]);

  if (!mounted) return null;

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    router.push("/login");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  // Tính toán thống kê
  const totalAttempts = attempts.length;
  const gradedAttempts = attempts.filter((a) => a.submittedAt !== null);
  const totalParticipants = new Set(attempts.map((a) => a.studentId)).size;

  const scores = gradedAttempts.map((a) => a.totalScore || 0);
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const averageScore =
    scores.length > 0
      ? parseFloat((scores.reduce((sum, val) => sum + val, 0) / scores.length).toFixed(1))
      : 0;
  const passCount = scores.filter((score) => score >= 5.0).length;
  const passRate =
    scores.length > 0 ? Math.round((passCount / scores.length) * 100) : 0;

  const menuItems = [
    { href: "/admin/dashboard", icon: "dashboard", label: "Bảng điều khiển" },
    { href: "/admin/users", icon: "admin_panel_settings", label: "Quản trị viên" },
    { href: "/admin/lecturers", icon: "school", label: "Giảng viên" },
    { href: "/admin/students", icon: "group", label: "Học viên" },
    { href: "/admin/specializations", icon: "category", label: "Chuyên ngành" },
    { href: "/admin/courses", icon: "library_books", label: "Khóa học" },
    { href: "/admin/quizzes", icon: "quiz", label: "Đề thi & Kiểm tra" },
    { href: "/admin/schedules", icon: "calendar_month", label: "Lịch học" },
    { href: "/admin/reports", icon: "assessment", label: "Báo cáo" },
  ];

  return (
    <div className="bg-background text-on-surface font-sans min-h-screen">
      {/* Sidebar */}
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
            const isActive = item.href === "/admin/quizzes";
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
        {/* Header */}
        <header className="sticky top-0 z-50 flex justify-between items-center px-margin-desktop w-full h-16 bg-surface border-b border-outline-variant shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/admin/quizzes" className="p-2 rounded-lg hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </Link>
            <h2 className="text-lg font-bold text-on-surface">Thống kê & Kết quả thi</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant relative">
              <div className="text-right hidden sm:block">
                <p className="font-label-md text-label-md text-on-surface leading-none">{user?.fullName || "Admin"}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Quản Trị Viên</p>
              </div>

              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {user?.avatarUrl ? (
                  <img alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-primary-container" src={user.avatarUrl} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    A
                  </div>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-outline-variant rounded-xl shadow-xl z-[60] p-1">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-error-container/20 rounded-lg text-error">
                    <span className="material-symbols-outlined text-sm">logout</span> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-margin-desktop max-w-[1280px] mx-auto w-full flex-1 space-y-6">
          {loading ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-[#bbe7ff]">
              <span className="material-symbols-outlined text-[48px] text-[#0288d1] animate-spin block mb-3">progress_activity</span>
              <p className="text-slate-500">Đang tải báo cáo kết quả bài kiểm tra...</p>
            </div>
          ) : !quiz ? (
            <div className="py-12 text-center text-slate-500 bg-white rounded-3xl border border-[#bbe7ff]">
              <span className="material-symbols-outlined text-[48px] text-red-500 mb-3 block">error</span>
              <p>Không tìm thấy thông tin đề thi này.</p>
            </div>
          ) : (
            <>
              {/* Header Title Section */}
              <div className="bg-white border border-[#bbe7ff] rounded-3xl p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0288d1]">{quiz.course?.name}</p>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">{quiz.title}</h1>
                <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-slate-400">schedule</span>Thời gian: {quiz.durationMinutes || "Không giới hạn"} phút</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-slate-400">layers</span>Lượt tối đa: {quiz.maxAttempts} lần / học viên</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-slate-400">group</span>Số lượt thi: {totalAttempts} lượt</span>
                </div>
              </div>

              {/* Statistical Bento Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-[#bbe7ff] p-5 rounded-3xl shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Học viên tham gia</p>
                  <p className="mt-3 text-3xl font-black text-slate-950">{totalParticipants}</p>
                </div>
                <div className="bg-white border border-[#bbe7ff] p-5 rounded-3xl shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Điểm trung bình</p>
                  <p className="mt-3 text-3xl font-black text-[#0288d1]">{averageScore} / 10.0</p>
                </div>
                <div className="bg-white border border-[#bbe7ff] p-5 rounded-3xl shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Điểm cao nhất</p>
                  <p className="mt-3 text-3xl font-black text-green-600">{highestScore} / 10.0</p>
                </div>
                <div className="bg-white border border-[#bbe7ff] p-5 rounded-3xl shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Tỷ lệ đạt (>= 5.0)</p>
                  <p className="mt-3 text-3xl font-black text-amber-500">{passRate}%</p>
                </div>
              </div>

              {/* Table of Results */}
              <div className="bg-white border border-[#bbe7ff] rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0288d1]">table_rows</span>
                  Danh sách bài làm của học viên
                </h3>

                {attempts.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-[36px] text-slate-300 mb-2 block">inbox</span>
                    <p className="text-sm">Chưa có học sinh nào nộp bài thi cho đề kiểm tra này.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="border-b border-[#bbe7ff] text-slate-500 font-semibold">
                        <tr>
                          <th scope="col" className="px-4 py-3">Mã học viên</th>
                          <th scope="col" className="px-4 py-3">Họ và tên</th>
                          <th scope="col" className="px-4 py-3 text-center">Lượt thi</th>
                          <th scope="col" className="px-4 py-3">Thời gian nộp bài</th>
                          <th scope="col" className="px-4 py-3 text-center">Điểm số</th>
                          <th scope="col" className="px-4 py-3 text-right">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#bbe7ff]/50">
                        {attempts.map((attempt) => (
                          <tr key={attempt.id} className="transition hover:bg-[#f8feff]">
                            <td className="px-4 py-4 text-slate-900 font-medium">
                              {attempt.student?.studentProfile?.studentCode || "—"}
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-semibold text-slate-950">{attempt.student?.fullName}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{attempt.student?.email}</div>
                            </td>
                            <td className="px-4 py-4 text-center text-slate-700">Lần {attempt.attemptNo}</td>
                            <td className="px-4 py-4 text-slate-600">{formatDate(attempt.submittedAt)}</td>
                            <td className="px-4 py-4 text-center">
                              {attempt.submittedAt ? (
                                <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                                  (attempt.totalScore || 0) >= 5.0 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-red-100 text-red-700"
                                }`}>
                                  {attempt.totalScore} / 10.0
                                </span>
                              ) : (
                                <span className="font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs">
                                  Chưa nộp
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-right">
                              {attempt.submittedAt ? (
                                <button
                                  onClick={() => router.push(`/admin/quizzes/attempt/${attempt.id}`)}
                                  className="px-4 py-2 border border-[#bbe7ff] text-[#0369a1] hover:bg-[#d6f1ff] rounded-xl text-xs font-semibold transition-all"
                                >
                                  Xem bài làm
                                </button>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
