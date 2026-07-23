"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { quizService } from "@/lib/api/service";
import { useRouter } from "next/navigation";

export default function StudentQuizzesPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizRes, attemptRes] = await Promise.all([
        quizService.getQuizzes(),
        quizService.getStudentAttempts(),
      ]);

      const quizData = quizRes?.data ?? (Array.isArray(quizRes) ? quizRes : []);
      const attemptData = attemptRes?.data ?? (Array.isArray(attemptRes) ? attemptRes : []);

      setQuizzes(Array.isArray(quizData) ? quizData : []);
      setAttempts(Array.isArray(attemptData) ? attemptData : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách bài thi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted]);

  if (!mounted) return null;

  const handleLogout = () => {
    useAuthStore.getState().logout();
    router.push("/login");
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

      {/* Main content */}
      <div className="flex-1 ml-72 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 w-full z-40 flex justify-between items-center px-margin-desktop py-4 bg-surface shadow-sm border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <Link href="/student/dashboard" className="p-2 rounded-lg hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </Link>
            <h2 className="text-headline-md font-headline-md text-on-surface font-semibold">Bài kiểm tra & Đề thi trắc nghiệm</h2>
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
          <div className="max-w-container-max mx-auto space-y-6">
            {/* Stats section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">assignment</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-on-surface">{quizzes.length}</p>
                  <p className="text-xs text-on-surface-variant">Tổng số đề thi</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">history</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-on-surface">{attempts.length}</p>
                  <p className="text-xs text-on-surface-variant">Lượt làm bài đã thực hiện</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">check_circle</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {Array.from(new Set(attempts.filter(a => a.submittedAt).map(a => a.quizId))).length}
                  </p>
                  <p className="text-xs text-on-surface-variant">Đề thi đã hoàn thành</p>
                </div>
              </div>
            </div>

            {/* Quizzes Grid */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3 className="text-headline-md font-semibold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">pending_actions</span>
                Danh sách đề thi khả dụng
              </h3>

              {loading ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-[48px] text-primary animate-spin block mb-3">progress_activity</span>
                  <p className="text-on-surface-variant">Đang tải danh sách đề thi...</p>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">search_off</span>
                  <p>Hiện tại chưa có đề thi trắc nghiệm nào dành cho bạn.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {quizzes.map((quiz) => {
                    const quizAttempts = attempts.filter((a) => a.quizId === quiz.id);
                    const bestAttempt = quizAttempts.reduce((best, curr) => 
                      (curr.totalScore || 0) > (best?.totalScore || 0) ? curr : best, 
                      null as any
                    );

                    return (
                      <div key={quiz.id} className="group bg-surface-container-low/40 border border-outline-variant/30 rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-caption font-semibold">
                              {quiz.course?.name || "Khóa học"}
                            </span>
                            {quizAttempts.length > 0 ? (
                              <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-caption font-semibold">
                                Đã làm ({quizAttempts.length} lần)
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-caption font-semibold">
                                Chưa làm
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-base font-bold text-on-surface line-clamp-2 group-hover:text-primary transition-colors min-h-[48px]">
                            {quiz.title}
                          </h4>

                          <div className="mt-4 space-y-2 text-xs text-on-surface-variant">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                              <span>Thời gian: {quiz.durationMinutes ? `${quiz.durationMinutes} phút` : "Không giới hạn"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-primary">layers</span>
                              <span>Số lượt cho phép: {quiz.maxAttempts} lượt</span>
                            </div>
                            {bestAttempt && (
                              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/10">
                                <span className="material-symbols-outlined text-[16px] text-green-600">military_tech</span>
                                <span className="font-bold text-green-600">Điểm cao nhất: {bestAttempt.totalScore} / 10.0</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-6">
                          <button
                            onClick={() => router.push(`/student/courses/quizzes/${quiz.id}`)}
                            className="w-full py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1 active:scale-[0.98]"
                          >
                            Chi tiết & Lịch sử
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
