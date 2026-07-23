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
      // Fetch quizzes - bắt buộc phải thành công
      const quizRes = await quizService.getQuizzes();
      const quizData = quizRes?.data ?? (Array.isArray(quizRes) ? quizRes : []);
      setQuizzes(Array.isArray(quizData) ? quizData : []);

      // Fetch attempts - nếu lỗi thì bỏ qua, không ảnh hưởng danh sách quiz
      try {
        const attemptRes = await quizService.getStudentAttempts();
        const attemptData = attemptRes?.data ?? (Array.isArray(attemptRes) ? attemptRes : []);
        setAttempts(Array.isArray(attemptData) ? attemptData : []);
      } catch (attemptErr) {
        console.warn("Không thể tải lịch sử làm bài, bỏ qua:", attemptErr);
        setAttempts([]);
      }
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-on-surface-variant">
        <Link href="/student/dashboard" className="text-label-md font-label-md cursor-pointer hover:text-primary transition-colors">
          Trang chủ
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-label-md font-label-md text-primary">Bài kiểm tra</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface mb-1">Danh sách Bài kiểm tra & Đề thi</h2>
          <p className="text-body-md text-on-surface-variant">
            Tổng hợp các bài kiểm tra trắc nghiệm khả dụng trong các khóa học bạn đã tham gia.
          </p>
        </div>
        <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          Hệ thống giám sát thi an toàn
        </div>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">assignment</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{quizzes.length}</p>
            <p className="text-xs text-on-surface-variant">Tổng số đề thi khả dụng</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">history</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{attempts.length}</p>
            <p className="text-xs text-on-surface-variant">Lượt làm bài đã thực hiện</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
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
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm">
        <h3 className="text-headline-md font-semibold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">pending_actions</span>
          Danh sách đề thi khả dụng
        </h3>

        {loading ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-primary animate-spin block mb-3">progress_activity</span>
            <p className="text-on-surface-variant font-medium">Đang tải danh sách đề thi...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant bg-surface-container-low/50 rounded-xl">
            <span className="material-symbols-outlined text-[56px] text-outline mb-3 block">search_off</span>
            <h4 className="text-lg font-bold text-on-surface mb-1">Chưa có bài kiểm tra nào được mở</h4>
            <p className="text-sm max-w-md mx-auto">
              Hiện tại không có bài kiểm tra trắc nghiệm nào ở trạng thái mở trong các khóa học bạn ghi danh.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const quizAttempts = attempts.filter((a) => a.quizId === quiz.id);
              const bestAttempt = quizAttempts.reduce((best, curr) => 
                (curr.totalScore || 0) > (best?.totalScore || 0) ? curr : best, 
                null as any
              );
              const attemptsUsed = quizAttempts.length;
              const maxAttempts = quiz.maxAttempts || 1;
              const isOutOfAttempts = attemptsUsed >= maxAttempts && !quizAttempts.some(a => !a.submittedAt);

              return (
                <div key={quiz.id} className="group bg-surface-container-low/40 border border-outline-variant/40 rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-caption font-semibold">
                        {quiz.course?.name || quiz.course?.title || "Khóa học"}
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
                        <span>Số lượt cho phép: {quiz.maxAttempts || 1} lượt</span>
                      </div>
                      {bestAttempt && bestAttempt.totalScore !== null && (
                        <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
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
                      Vào làm bài / Xem chi tiết
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
  );
}
