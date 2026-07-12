"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { quizService } from "@/lib/api/service";

export default function StudentQuizDetailPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { id: quizId } = useParams() as { id: string };

  const [mounted, setMounted] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      const [quizRes, attemptsRes] = await Promise.all([
        quizService.getQuizById(quizId),
        quizService.getStudentAttempts(),
      ]);

      if (quizRes.success) {
        setQuiz(quizRes.data);
      }
      if (attemptsRes.success) {
        // Lọc lượt thi của đề thi này
        const filtered = (attemptsRes.data || []).filter((a: any) => a.quizId === quizId);
        setAttempts(filtered);
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin chi tiết bài thi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && quizId) {
      loadQuizData();
    }
  }, [mounted, quizId]);

  if (!mounted) return null;

  const handleStartAttempt = async () => {
    if (!quiz) return;
    
    // Xác thực số lượt làm bài còn lại ở client trước
    if (attempts.length >= quiz.maxAttempts) {
      alert(`Bạn đã hết lượt làm bài. Số lượt tối đa cho phép là ${quiz.maxAttempts}.`);
      return;
    }

    const confirmStart = window.confirm(
      `Bạn có chắc chắn muốn bắt đầu làm bài thi không?\nThời gian làm bài: ${quiz.durationMinutes} phút.\nLượt thi này sẽ tính là lượt thứ ${attempts.length + 1}.`
    );

    if (!confirmStart) return;

    try {
      setSubmitting(true);
      const res = await quizService.startAttempt(quizId);
      if (res.success && res.data) {
        // Chuyển hướng học viên tới trang làm bài thi kèm theo attemptId
        router.push(`/student/courses/quizzes/${quizId}/take?attemptId=${res.data.id}`);
      } else {
        alert(res.message || "Không thể bắt đầu lượt thi");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi khi khởi tạo lượt thi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    router.push("/login");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
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
            <Link href="/student/courses/quizzes" className="p-2 rounded-lg hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </Link>
            <h2 className="text-headline-md font-headline-md text-on-surface font-semibold">Chi tiết bài thi</h2>
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
            {loading ? (
              <div className="py-12 text-center bg-white rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-[48px] text-primary animate-spin block mb-3">progress_activity</span>
                <p className="text-on-surface-variant">Đang tải thông tin đề thi...</p>
              </div>
            ) : !quiz ? (
              <div className="py-12 text-center text-on-surface-variant bg-white rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">error</span>
                <p>Không tìm thấy đề thi này hoặc bạn không có quyền truy cập.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: General Quiz Info */}
                <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
                  <div className="pb-4 border-b border-outline-variant/20">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                      {quiz.course?.name || "Khóa học"}
                    </span>
                    <h3 className="text-xl font-bold text-on-surface mt-2">{quiz.title}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface-variant">Thời gian làm bài:</span>
                      <span className="text-sm font-bold text-on-surface">
                        {quiz.durationMinutes ? `${quiz.durationMinutes} phút` : "Không giới hạn"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface-variant">Lượt thi tối đa:</span>
                      <span className="text-sm font-bold text-on-surface">{quiz.maxAttempts} lần</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface-variant">Lượt thi đã dùng:</span>
                      <span className="text-sm font-bold text-on-surface">{attempts.length} lần</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface-variant">Số câu hỏi:</span>
                      <span className="text-sm font-bold text-on-surface">5 câu</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/20">
                    {attempts.length >= quiz.maxAttempts ? (
                      <div className="bg-error-container/20 text-error p-4 rounded-xl text-xs font-medium text-center">
                        Bạn đã hết lượt tham gia bài thi này.
                      </div>
                    ) : (
                      <button
                        onClick={handleStartAttempt}
                        disabled={submitting}
                        className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1 active:scale-[0.98] disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[20px]">play_circle</span>
                        {attempts.length === 0 ? "Bắt đầu làm bài" : `Làm lại bài thi (Lần ${attempts.length + 1})`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Attempt History */}
                <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">history</span>
                    Lịch sử làm bài trắc nghiệm
                  </h3>

                  {attempts.length === 0 ? (
                    <div className="py-12 text-center text-on-surface-variant border border-dashed border-outline-variant/50 rounded-xl">
                      <span className="material-symbols-outlined text-[36px] text-outline mb-2 block">playlist_add_check</span>
                      <p className="text-sm">Bạn chưa thực hiện lượt làm bài nào cho đề thi này.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="border-b border-outline-variant/30 text-on-surface-variant font-semibold">
                          <tr>
                            <th scope="col" className="px-4 py-3">Lần thi</th>
                            <th scope="col" className="px-4 py-3">Bắt đầu lúc</th>
                            <th scope="col" className="px-4 py-3">Nộp bài lúc</th>
                            <th scope="col" className="px-4 py-3">Thời gian</th>
                            <th scope="col" className="px-4 py-3 text-center">Điểm số</th>
                            <th scope="col" className="px-4 py-3 text-right">Xem lại</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                          {attempts.map((attempt) => (
                            <tr key={attempt.id} className="transition hover:bg-surface-container-low/40">
                              <td className="px-4 py-4 font-semibold text-on-surface">Lần {attempt.attemptNo}</td>
                              <td className="px-4 py-4 text-on-surface-variant">{formatDate(attempt.startedAt)}</td>
                              <td className="px-4 py-4 text-on-surface-variant">{formatDate(attempt.submittedAt)}</td>
                              <td className="px-4 py-4 text-on-surface-variant">
                                {calculateDuration(attempt.startedAt, attempt.submittedAt)}
                              </td>
                              <td className="px-4 py-4 text-center">
                                {attempt.submittedAt ? (
                                  <span className="font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full text-xs">
                                    {attempt.totalScore} / 10.0
                                  </span>
                                ) : (
                                  <span className="font-medium text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full text-xs animate-pulse">
                                    Đang làm...
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-right">
                                {attempt.submittedAt ? (
                                  <button
                                    onClick={() => router.push(`/student/courses/quizzes/attempt/${attempt.id}`)}
                                    className="px-3 py-1.5 border border-primary/20 text-primary hover:bg-primary/5 rounded-lg text-xs font-semibold transition-all"
                                  >
                                    Chi tiết
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => router.push(`/student/courses/quizzes/${quizId}/take?attemptId=${attempt.id}`)}
                                    className="px-3 py-1.5 bg-amber-500 text-white hover:bg-amber-600 rounded-lg text-xs font-semibold transition-all"
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
