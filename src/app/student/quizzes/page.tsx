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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

              let statusStr = "Chưa làm";
              let statusClass = "bg-surface-variant text-on-surface-variant";
              const inProgress = attemptsList.some((a: any) => a.status === 'in_progress');

              if (inProgress) {
                 statusStr = "Đang làm dở";
                 statusClass = "bg-primary-container/20 text-primary";
              } else if (attemptsUsed > 0) {
                 statusStr = "Đã nộp";
                 statusClass = "bg-tertiary-container/20 text-tertiary";
              }

              let remainingStr = maxAttempts ? `Còn ${Math.max(0, maxAttempts - attemptsUsed)}/${maxAttempts} lần` : "Nhiều lần";
              if (!maxAttempts && attemptsUsed > 0) remainingStr = `Đã làm ${attemptsUsed} lần`;
              
              const isOutOfAttempts = maxAttempts ? attemptsUsed >= maxAttempts && !inProgress : false;
              const actionLabel = inProgress ? "Tiếp tục làm bài" : (isOutOfAttempts ? "Hết lượt làm bài" : "Bắt đầu làm bài");

              return (
                <div key={quiz.id} className="bg-surface-container-lowest rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-outline-variant/30 flex flex-col h-full hover:shadow-md transition-all hover:-translate-y-1">
                  {/* Card Header (without image) */}
                  <div className="p-6 border-b border-outline-variant/30 bg-primary/5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded">
                        {quiz.lessonId ? "Thuộc bài học" : "Kiểm tra cuối khóa"}
                      </span>
                      <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${statusClass}`}>
                        {statusStr}
                      </span>
                    </div>
                    <p className="text-primary font-bold uppercase tracking-wider mb-1 text-xs line-clamp-1">
                      {quiz.course?.title || quiz.course?.name || "Khóa học"}
                    </p>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold line-clamp-2" title={quiz.title}>
                      {quiz.title}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Thời hạn</p>
                        <p className="font-label-md text-on-surface">{quiz.durationMinutes ? `${quiz.durationMinutes} phút` : "Không giới hạn"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Điểm cao nhất</p>
                        <p className="font-label-md text-on-surface">{displayScore}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Số lần làm lại</p>
                        <p className="font-label-md text-on-surface">{remainingStr}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      {isOutOfAttempts ? (
                        <button disabled className="w-full bg-surface-variant text-on-surface-variant px-4 py-3 rounded-lg font-label-md shadow-sm flex items-center justify-center gap-2 cursor-not-allowed">
                          {actionLabel}
                        </button>
                      ) : (
                        <Link 
                          href={`/student/quizzes/${quiz.id}/take`}
                          className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-lg font-label-md transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                          {actionLabel}
                          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-sm">play_arrow</span>
                        </Link>
                      )}
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
