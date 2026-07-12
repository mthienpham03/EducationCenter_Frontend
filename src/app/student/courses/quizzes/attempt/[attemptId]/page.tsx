"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { quizService } from "@/lib/api/service";

export default function StudentAttemptDetailsPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { attemptId } = useParams() as { attemptId: string };

  const [mounted, setMounted] = useState(false);
  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadAttemptDetails = async () => {
    try {
      setLoading(true);
      const res = await quizService.getAttemptDetails(attemptId);
      if (res.success && res.data) {
        setAttempt(res.data.attempt);
        setAnswers(res.data.answers || []);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải kết quả lượt thi:", err);
      alert(err.response?.data?.message || "Lỗi khi tải thông tin kết quả");
      router.push("/student/courses/quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && attemptId) {
      loadAttemptDetails();
    }
  }, [mounted, attemptId]);

  if (!mounted) return null;

  const handleLogout = () => {
    useAuthStore.getState().logout();
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

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen flex font-body-md">
      {/* Sidebar */}
      <aside className="h-full w-72 fixed left-0 top-0 flex flex-col p-stack-md bg-surface-container-lowest shadow-sm border-r border-outline-variant z-50 overflow-y-auto">
        <div className="mb-10">
          <h1 className="text-headline-md font-headline-md font-bold text-primary">EduCenter</h1>
          <p className="text-label-md font-label-md text-on-surface-variant">Cổng học viên</p>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <Link href="/student/dashboard" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">school</span>
            <span>Quản lý khóa học</span>
          </Link>
          <Link href="/student/courses/documents" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">folder_open</span>
            <span>Tài liệu</span>
          </Link>
          <Link href="/student/courses/quizzes" className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg font-label-md transition-all duration-200">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
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
        {/* Top bar */}
        <header className="sticky top-0 w-full z-40 flex justify-between items-center px-margin-desktop py-4 bg-surface shadow-sm border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/student/courses/quizzes/${attempt?.quiz?.id}`)}
              className="p-2 rounded-lg hover:bg-surface-container-low transition-all"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
            <h2 className="text-headline-md font-headline-md text-on-surface font-semibold">Kết quả chi tiết bài làm</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-fixed">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-fixed text-[18px]">person</span>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-margin-desktop flex-1">
          <div className="max-w-4xl mx-auto space-y-6">
            {loading ? (
              <div className="py-12 text-center bg-white rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-[48px] text-primary animate-spin block mb-3">progress_activity</span>
                <p className="text-on-surface-variant">Đang tải chi tiết kết quả...</p>
              </div>
            ) : !attempt ? (
              <div className="py-12 text-center text-on-surface-variant bg-white rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">error</span>
                <p>Không tìm thấy kết quả lượt thi này.</p>
              </div>
            ) : (
              <>
                {/* Score Summary Card */}
                <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-xs text-primary font-bold uppercase tracking-wider">{attempt.quiz?.courseName}</span>
                    <h3 className="text-2xl font-black text-on-surface">{attempt.quiz?.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-on-surface-variant pt-1">
                      <span>Lượt thi: <strong>Lần {attempt.attemptNo}</strong></span>
                      <span>•</span>
                      <span>Nộp bài: <strong>{formatDate(attempt.submittedAt)}</strong></span>
                      <span>•</span>
                      <span>Thời gian làm bài: <strong>{calculateDuration(attempt.startedAt, attempt.submittedAt)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 rounded-2xl p-4 md:min-w-[200px] justify-center flex-col md:flex-row">
                    <span className="material-symbols-outlined text-[48px] text-primary">analytics</span>
                    <div className="text-center md:text-left">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Điểm số đạt được</p>
                      <p className="text-3xl font-black text-primary">{attempt.totalScore} <span className="text-base text-on-surface-variant font-normal">/ 10.0</span></p>
                    </div>
                  </div>
                </div>

                {/* Score breakdown per question */}
                <div className="space-y-6">
                  <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 px-2">
                    <span className="material-symbols-outlined text-primary">rule</span>
                    Chi tiết bài làm từng câu
                  </h3>

                  {answers.map((ans, idx) => {
                    const isCorrect = ans.isCorrect;
                    
                    return (
                      <div key={ans.questionId} className={`bg-white border rounded-2xl p-6 shadow-sm space-y-4 ${
                        isCorrect ? "border-green-500/20" : "border-red-500/20"
                      }`}>
                        <div className="flex justify-between items-start gap-4 pb-2 border-b border-outline-variant/10">
                          <h4 className="font-bold text-base text-on-surface flex gap-2">
                            <span className="text-primary font-black">Câu {idx + 1}:</span>
                            {ans.content}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                              isCorrect 
                                ? "bg-green-500/10 text-green-600" 
                                : "bg-red-500/10 text-red-600"
                            }`}>
                              <span className="material-symbols-outlined text-sm">
                                {isCorrect ? "check_circle" : "cancel"}
                              </span>
                              {isCorrect ? "Đúng" : "Sai"}
                            </span>
                            <span className="text-xs font-semibold bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full">
                              {ans.scoreObtained} / {ans.maxScore} điểm
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {ans.options.map((opt: any) => {
                            const isSelected = ans.selectedOptionIds.includes(opt.id);
                            const isOptCorrect = opt.isCorrect;

                            // Trạng thái hiển thị viền/màu sắc của option:
                            // 1. Nếu đáp án đúng -> Viền xanh lá, nền xanh lá nhạt.
                            // 2. Nếu đáp án sai mà học sinh chọn -> Viền đỏ, nền đỏ nhạt.
                            // 3. Bình thường -> Viền xám.
                            let containerClass = "bg-surface-container-lowest border-outline-variant/30 text-on-surface";
                            let icon = "radio_button_unchecked";
                            let iconClass = "text-on-surface-variant/40";

                            if (isOptCorrect) {
                              containerClass = "bg-green-500/5 border-green-500/45 text-green-700 font-medium";
                              icon = "check_circle";
                              iconClass = "text-green-600";
                            } else if (isSelected && !isOptCorrect) {
                              containerClass = "bg-red-500/5 border-red-500/45 text-red-700 font-medium";
                              icon = "cancel";
                              iconClass = "text-red-600";
                            } else if (isSelected) {
                              containerClass = "bg-surface-container-high border-outline-variant/70 text-on-surface";
                              icon = "radio_button_checked";
                              iconClass = "text-primary";
                            }

                            return (
                              <div
                                key={opt.id}
                                className={`p-4 rounded-xl border text-sm flex items-center gap-3 transition-all ${containerClass}`}
                              >
                                <span className={`material-symbols-outlined text-[20px] ${iconClass}`}>
                                  {icon}
                                </span>
                                <span className="flex-1">{opt.content}</span>
                                {isOptCorrect && (
                                  <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-md">
                                    Đáp án đúng
                                  </span>
                                )}
                                {isSelected && !isOptCorrect && (
                                  <span className="text-xs font-bold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-md">
                                    Lựa chọn của bạn
                                  </span>
                                )}
                                {isSelected && isOptCorrect && (
                                  <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-md">
                                    Chính xác
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
                    onClick={() => router.push(`/student/courses/quizzes/${attempt.quiz?.id}`)}
                    className="px-8 py-3 bg-surface-container border border-outline-variant/60 text-on-surface font-semibold rounded-xl hover:bg-surface-container-high transition-all active:scale-[0.98]"
                  >
                    Quay lại lịch sử thi
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
