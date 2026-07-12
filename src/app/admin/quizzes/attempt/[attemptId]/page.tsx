"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { quizService } from "@/lib/api/service";

function AdminStudentAttemptDetailsContent() {

  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { attemptId } = useParams() as { attemptId: string };
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quizId") || "";

  const [mounted, setMounted] = useState(false);
  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadAttemptDetails = async () => {
    if (!quizId) {
      router.push("/admin/quizzes");
      return;
    }
    try {
      setLoading(true);
      const res = await quizService.getAttemptDetails(quizId, attemptId);
      if (res.success && res.data) {
        // Backend returns flat: { attemptId, attemptNo, startedAt, submittedAt, totalScore, answers }
        setAttempt(res.data);
        setAnswers(res.data.answers || []);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải bài làm học viên:", err);
      alert(err.response?.data?.message || "Lỗi khi tải chi tiết bài làm");
      router.push("/admin/quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && attemptId) {
      loadAttemptDetails();
    }
  }, [mounted, attemptId, quizId]);

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

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return "—";
    try {
      const diffMs = new Date(end).getTime() - new Date(start).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const mins = Math.floor(diffSecs / 60);
      const secs = diffSecs % 60;
      return `${mins} phút ${secs} giây`;
    } catch {
      return "—";
    }
  };

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
            <button
              onClick={() => router.push(`/admin/quizzes/${attempt?.quiz?.id}`)}
              className="p-2 rounded-lg hover:bg-surface-container-low transition-all"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
            <h2 className="text-lg font-bold text-on-surface">Chi tiết bài làm học viên</h2>
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
        <div className="p-margin-desktop max-w-[960px] mx-auto w-full flex-1 space-y-6">
          {loading ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-[#bbe7ff]">
              <span className="material-symbols-outlined text-[48px] text-[#0288d1] animate-spin block mb-3">progress_activity</span>
              <p className="text-slate-500">Đang tải kết quả bài làm...</p>
            </div>
          ) : !attempt ? (
            <div className="py-12 text-center text-slate-500 bg-white rounded-3xl border border-[#bbe7ff]">
              <span className="material-symbols-outlined text-[48px] text-red-500 mb-3 block">error</span>
              <p>Không tìm thấy thông tin lượt làm bài này.</p>
            </div>
          ) : (
            <>
              {/* Attempt Overview & Student Info */}
              <div className="bg-white border border-[#bbe7ff] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0288d1]">{attempt.quiz?.courseName}</span>
                  <h3 className="text-xl font-bold text-slate-950">{attempt.quiz?.title}</h3>
                  
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <p>Học viên: <strong className="text-slate-900">{attempt.student?.fullName}</strong> ({attempt.student?.studentCode})</p>
                    <p>Email: <span className="text-slate-700">{attempt.student?.email}</span></p>
                    <p>Thời gian nộp: <strong className="text-slate-800">{formatDate(attempt.submittedAt)}</strong> ({calculateDuration(attempt.startedAt, attempt.submittedAt)})</p>
                    <p>Lần làm bài: <strong>Lần thứ {attempt.attemptNo}</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#f8feff] border border-[#bbe7ff] rounded-2xl p-4 md:min-w-[200px] justify-center flex-col">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Điểm số</p>
                  <p className="text-3xl font-black text-[#0288d1]">{attempt.totalScore} <span className="text-sm text-slate-500 font-normal">/ 10.0</span></p>
                </div>
              </div>

              {/* Answers Breakdown */}
              <div className="space-y-6">
                <h3 className="text-base font-bold text-slate-900 px-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0288d1]">rule</span>
                  Chi tiết kết quả chấm điểm các câu
                </h3>

                {answers.map((ans, idx) => {
                  const isCorrect = ans.isCorrect;

                  return (
                    <div key={ans.questionId} className={`bg-white border rounded-3xl p-6 shadow-sm space-y-4 ${
                      isCorrect ? "border-green-300/40" : "border-red-300/40"
                    }`}>
                      <div className="flex justify-between items-start gap-4 pb-2 border-b border-[#bbe7ff]/40">
                        <h4 className="font-bold text-base text-slate-900 flex gap-2">
                          <span className="text-[#0288d1] font-black">Câu {idx + 1}:</span>
                          {ans.content}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                            isCorrect 
                              ? "bg-green-50 text-green-700 border border-green-200" 
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                            <span className="material-symbols-outlined text-sm">
                              {isCorrect ? "check_circle" : "cancel"}
                            </span>
                            {isCorrect ? "Đúng" : "Sai"}
                          </span>
                          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                            {ans.score} điểm
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {ans.options.map((opt: any) => {
                          const isSelected = (ans.answerData || []).includes(opt.id);
                          const isOptCorrect = opt.isCorrect;

                          let containerClass = "bg-white border-slate-200 text-slate-700";
                          let icon = "radio_button_unchecked";
                          let iconClass = "text-slate-400";

                          if (isOptCorrect) {
                            containerClass = "bg-green-50 border-green-300 text-green-800 font-medium";
                            icon = "check_circle";
                            iconClass = "text-green-600";
                          } else if (isSelected && !isOptCorrect) {
                            containerClass = "bg-red-50 border-red-300 text-red-800 font-medium";
                            icon = "cancel";
                            iconClass = "text-red-600";
                          } else if (isSelected) {
                            containerClass = "bg-slate-50 border-slate-400 text-slate-900";
                            icon = "radio_button_checked";
                            iconClass = "text-[#0288d1]";
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${containerClass}`}
                            >
                              <span className={`material-symbols-outlined text-[20px] ${iconClass}`}>
                                {icon}
                              </span>
                              <span className="flex-1">{opt.content}</span>
                              {isOptCorrect && (
                                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                                  Đáp án đúng
                                </span>
                              )}
                              {isSelected && !isOptCorrect && (
                                <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                                  Học viên chọn
                                </span>
                              )}
                              {isSelected && isOptCorrect && (
                                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                                  Học viên chọn chính xác
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 pb-12 flex justify-center">
                <button
                  onClick={() => router.push(`/admin/quizzes/${quizId}`)}
                  className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                  Quay lại danh sách kết quả
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminStudentAttemptDetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <span className="material-symbols-outlined text-[48px] text-[#0288d1] animate-spin mb-3">progress_activity</span>
        <p className="text-slate-500">Đang tải chi tiết bài làm...</p>
      </div>
    }>
      <AdminStudentAttemptDetailsContent />
    </Suspense>
  );
}
