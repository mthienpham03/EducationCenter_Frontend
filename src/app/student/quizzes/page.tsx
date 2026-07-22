"use client";

import React, { useEffect, useState } from "react";
import { quizApi } from "@/lib/api/quiz.api";
import { Quiz, QuizStatus } from "@/lib/types/quiz.type";
import Link from "next/link";

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attemptsMap, setAttemptsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await quizApi.getQuizzes();
        if (res.success && res.data) {
          // Lọc bài kiểm tra đang mở
          const openQuizzes = res.data.filter(q => q.status === QuizStatus.OPEN);
          setQuizzes(openQuizzes);

          // Fetch lịch sử làm bài để cập nhật điểm và trạng thái
          const map: Record<string, any> = {};
          await Promise.all(openQuizzes.map(async (q) => {
            try {
              const hist = await quizApi.getAttemptHistory(q.id);
              if (hist.success) {
                map[q.id] = hist.data;
              }
            } catch (e) {
              console.error("Failed to fetch history for quiz", q.id, e);
            }
          }));
          setAttemptsMap(map);
        } else {
          setError("Không thể tải danh sách bài kiểm tra");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Đã xảy ra lỗi khi tải bài kiểm tra");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-container text-on-error-container rounded-lg font-body-md shadow-sm m-6">
        <p className="flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-margin-desktop flex flex-col items-center flex-1 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full max-w-container-max">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-stack-md text-on-surface-variant">
          <Link href="/student/courses" className="text-label-md font-label-md cursor-pointer hover:text-primary transition-colors">Khóa học</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-label-md font-label-md text-primary">Bài kiểm tra</span>
        </nav>

        {quizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-8 text-center">
            <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-5xl text-outline">quiz</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">Chưa có bài kiểm tra được mở</h3>
            <p className="max-w-md font-body-md text-on-surface-variant">
              Hiện tại không có bài kiểm tra nào đang trong trạng thái mở. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-gutter">
            {quizzes.map((quiz) => {
              const hist = attemptsMap[quiz.id];
              const maxAttempts = hist ? hist.maxAttempts : quiz.maxAttempts;
              const attemptsUsed = hist ? hist.attemptsUsed : 0;
              const attemptsList = hist?.attempts || [];

              let displayScore = "--";
              if (attemptsList.length > 0) {
                const scores = attemptsList.filter((a: any) => a.totalScore !== null).map((a: any) => parseFloat(a.totalScore));
                if (scores.length > 0) {
                  displayScore = Math.max(...scores).toString();
                }
              }

              // Kiểm tra xem thực sự có lượt làm dở nào còn thời gian hay không
              const nowMs = Date.now();
              const hasActiveInProgress = attemptsList.some((a: any) => {
                if (a.status !== 'in_progress') return false;
                if (!quiz.durationMinutes || quiz.durationMinutes <= 0) return true;
                const startedAtMs = new Date(a.startedAt).getTime();
                const durationMs = quiz.durationMinutes * 60 * 1000;
                return (nowMs - startedAtMs) <= (durationMs + 60000);
              });

              const isOutOfAttempts = maxAttempts ? attemptsUsed >= maxAttempts && !hasActiveInProgress : false;

              let statusStr = "Chưa làm";
              let statusClass = "bg-surface-variant text-on-surface-variant";

              if (hasActiveInProgress) {
                statusStr = "Đang làm dở";
                statusClass = "bg-amber-100 text-amber-800 border border-amber-300 font-bold";
              } else if (isOutOfAttempts) {
                statusStr = "Đã hết lượt";
                statusClass = "bg-red-100 text-red-800 border border-red-300 font-bold";
              } else if (attemptsUsed > 0) {
                statusStr = "Đã nộp bài";
                statusClass = "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold";
              }

              let remainingStr = maxAttempts ? `Còn ${Math.max(0, maxAttempts - attemptsUsed)}/${maxAttempts} lần` : "Nhiều lần";
              if (!maxAttempts && attemptsUsed > 0) remainingStr = `Đã làm ${attemptsUsed} lần`;

              const actionLabel = hasActiveInProgress
                ? "Tiếp tục làm bài"
                : (isOutOfAttempts
                  ? "Đã hết lượt làm bài"
                  : (attemptsUsed > 0 ? "Làm lại bài kiểm tra" : "Bắt đầu làm bài"));

              return (
                <div key={quiz.id} className="col-span-12 mx-auto w-full max-w-4xl mb-6">
                  <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-outline-variant/30">
                    {/* Visual Header */}
                    <div className="h-48 relative overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDIdIsXRIQ7MbMGvUL0bSe4BHw3xt0rUoL1KMKNeRiRUdrpA-LhdlenMP5th-Un0XIQMTv7_abBNE7Jls_ewFm00rXqPEJXM3cZUYIJcHKpLhL43h1A6u8y6Gp8T4TiwuC8rXtRxnmSEM3E_SVxGh92mmwfJ_YFaSgQgD5bboGMnKqsJ1ednwOr4dA6J_PlTNao9jfUlQWTMEomfvr5dK0Y6XsYoSikCFx8fHRqbQnsj_7iizbBkMAyqw')" }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-6 left-8 text-white">
                        {quiz.lessonId ? (
                          <span className="px-3 py-1 bg-secondary-container text-white text-caption rounded-full font-bold uppercase tracking-wider mb-2 inline-block">
                            Thuộc bài học
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-secondary-container text-white text-caption rounded-full font-bold uppercase tracking-wider mb-2 inline-block">
                            Kiểm tra cuối khóa
                          </span>
                        )}
                        <h2 className="font-headline-lg text-headline-lg">{quiz.course?.title || quiz.course?.name || "Khóa học"}</h2>
                      </div>
                    </div>

                    <div className="p-10">
                      <div className="flex flex-col gap-8">
                        {/* Header Section */}
                        <div className="border-b border-outline-variant/30 pb-6">
                          <p className="text-primary font-label-md text-label-md uppercase tracking-wider mb-2">
                            {quiz.course?.title || quiz.course?.name || "Khóa học"}
                          </p>
                          <h3 className="font-headline-lg text-headline-lg text-on-surface">{quiz.title}</h3>
                        </div>

                        {/* Description */}
                        <p className="text-body-lg text-on-surface-variant leading-relaxed">
                          Chào mừng bạn đến với bài kiểm tra. Bài thi này được thiết kế để đánh giá kiến thức bạn đã tích lũy được trong quá trình học.
                        </p>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/30">
                            <p className="text-caption text-on-surface-variant uppercase font-bold mb-1">Thời hạn</p>
                            <p className="font-label-md text-on-surface">{quiz.durationMinutes ? `${quiz.durationMinutes} phút` : "Không giới hạn"}</p>
                          </div>
                          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/30">
                            <p className="text-caption text-on-surface-variant uppercase font-bold mb-1">Trạng thái</p>
                            <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-md ${statusClass}`}>
                              {statusStr}
                            </span>
                          </div>
                          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/30">
                            <p className="text-caption text-on-surface-variant uppercase font-bold mb-1">Điểm cao nhất</p>
                            <p className="font-label-md text-on-surface">{displayScore}</p>
                          </div>
                          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/30">
                            <p className="text-caption text-on-surface-variant uppercase font-bold mb-1">Số lần làm lại</p>
                            <p className="font-label-md text-on-surface">{remainingStr}</p>
                          </div>
                        </div>

                        {/* Important Notes or Out of Attempts Warning */}
                        {isOutOfAttempts ? (
                          <div className="bg-red-50 p-5 rounded-xl border border-red-200 text-red-900 space-y-1">
                            <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                              <span className="material-symbols-outlined text-[20px]">block</span>
                              Đã hết lượt làm bài kiểm tra:
                            </div>
                            <p className="text-xs text-red-800 pl-7">
                              Bạn đã sử dụng hết <strong>{attemptsUsed}/{maxAttempts}</strong> lần làm bài cho phép. Nút làm bài đã bị khóa.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                            <h4 className="font-label-md text-label-md text-primary mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg">info</span>
                              Lưu ý quan trọng:
                            </h4>
                            <ul className="space-y-2">
                              <li className="flex items-center gap-3 text-body-md text-on-surface-variant">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                <span>{quiz.maxAttempts ? `Bạn được làm tối đa ${quiz.maxAttempts} lần cho bài thi này.` : "Bạn có thể thực hiện bài thi này nhiều lần."}</span>
                              </li>
                              <li className="flex items-center gap-3 text-body-md text-on-surface-variant">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                <span>Đảm bảo kết nối Internet ổn định trước khi bắt đầu.</span>
                              </li>
                            </ul>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                          {isOutOfAttempts ? (
                            <button
                              disabled
                              className="flex-1 bg-surface-variant/80 text-on-surface-variant/60 border border-outline-variant/50 px-8 py-4 rounded-lg font-label-md text-label-md shadow-none flex items-center justify-center gap-2 cursor-not-allowed font-bold"
                            >
                              <span className="material-symbols-outlined text-[20px]">lock</span>
                              {actionLabel} ({attemptsUsed}/{maxAttempts} lượt)
                            </button>
                          ) : (
                            <Link
                              href={`/student/quizzes/${quiz.id}/take`}
                              className="flex-1 bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-lg font-label-md text-label-md transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group font-bold"
                            >
                              {actionLabel}
                              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">play_arrow</span>
                            </Link>
                          )}
                          <Link
                            href="/student/courses"
                            className="px-8 py-4 border border-outline hover:bg-surface-container-high text-on-surface rounded-lg font-label-md text-label-md transition-all active:scale-[0.98] text-center"
                          >
                            Quay lại
                          </Link>
                        </div>
                      </div>
                    </div>
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
