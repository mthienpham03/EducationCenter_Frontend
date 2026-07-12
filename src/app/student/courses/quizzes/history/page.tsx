"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { quizService } from "@/lib/api/service";

export default function StudentQuizHistoryPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      // Tải danh sách quiz trước
      const quizRes = await quizService.getQuizzes();
      if (!quizRes.success) return;

      const quizzesData = quizRes.data || [];

      // Tải lịch sử từng quiz song song
      const allAttemptsRes = await Promise.all(
        quizzesData.map((q: any) =>
          quizService.getAttemptHistory(q.id).catch(() => null)
        )
      );

      // Gộp và đính kèm thông tin quiz vào từng attempt
      const flat = allAttemptsRes
        .filter((res) => res && res.success && res.data)
        .flatMap((res: any) => {
          const quiz = quizzesData.find((q: any) => q.id === res.data.quizId);
          return (res.data.attempts || []).map((a: any) => ({
            ...a,
            quizId: res.data.quizId,
            quizTitle: res.data.quizTitle,
            quiz,
          }));
        });

      // Sắp xếp mới nhất trước
      flat.sort((a: any, b: any) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );

      setAttempts(flat);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử làm bài:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      loadHistory();
    }
  }, [mounted]);

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
            <Link href="/student/courses/quizzes" className="p-2 rounded-lg hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </Link>
            <h2 className="text-headline-md font-headline-md text-on-surface font-semibold">Lịch sử làm bài trắc nghiệm</h2>
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
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              {loading ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-[48px] text-primary animate-spin block mb-3">progress_activity</span>
                  <p className="text-on-surface-variant">Đang tải lịch sử thi...</p>
                </div>
              ) : attempts.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">search_off</span>
                  <p>Bạn chưa tham gia bài thi trắc nghiệm nào.</p>
                  <Link href="/student/courses/quizzes" className="mt-4 inline-block bg-primary text-on-primary px-6 py-2.5 rounded-xl text-xs font-semibold">
                    Xem danh sách đề thi
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="border-b border-outline-variant/30 text-on-surface-variant font-semibold">
                      <tr>
                        <th scope="col" className="px-4 py-3">Tên đề thi</th>
                        <th scope="col" className="px-4 py-3">Khóa học</th>
                        <th scope="col" className="px-4 py-3 text-center">Lần thi</th>
                        <th scope="col" className="px-4 py-3">Nộp bài lúc</th>
                        <th scope="col" className="px-4 py-3 text-center">Điểm số</th>
                        <th scope="col" className="px-4 py-3 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {attempts.map((attempt) => (
                        <tr key={attempt.attemptId} className="transition hover:bg-surface-container-low/40">
                          <td className="px-4 py-4 font-bold text-on-surface">{attempt.quizTitle || attempt.quiz?.title}</td>
                          <td className="px-4 py-4 text-on-surface-variant">{attempt.quiz?.course?.name || "—"}</td>
                          <td className="px-4 py-4 text-center text-on-surface font-semibold">Lần {attempt.attemptNo}</td>
                          <td className="px-4 py-4 text-on-surface-variant">{formatDate(attempt.submittedAt)}</td>
                          <td className="px-4 py-4 text-center">
                            {attempt.submittedAt ? (
                              <span className="font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full text-xs">
                                {attempt.totalScore} / điểm
                              </span>
                            ) : (
                              <span className="font-medium text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full text-xs">
                                Đang làm...
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {attempt.submittedAt ? (
                              <button
                                onClick={() => router.push(`/student/courses/quizzes/attempt/${attempt.attemptId}?quizId=${attempt.quizId}`)}
                                className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:opacity-95 transition-all"
                              >
                                Xem kết quả
                              </button>
                            ) : (
                              <button
                                onClick={() => router.push(`/student/courses/quizzes/${attempt.quizId}/take?attemptId=${attempt.attemptId}`)}
                                className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:opacity-95 transition-all"
                              >
                                Làm tiếp
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
