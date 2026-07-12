"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { quizService } from "@/lib/api/service";

export default function LecturerQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const res = await quizService.getQuizzes();
      if (res.success) {
        setQuizzes(res.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) loadQuizzes();
  }, [mounted]);

  if (!mounted) return null;

  const handleDelete = async (quizId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đề thi "${title}"?`)) return;
    try {
      const res = await quizService.deleteQuiz(quizId);
      if (res.success) {
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      } else {
        alert(res.message || "Không thể xóa đề thi");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi xóa đề thi");
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN": return { label: "Đang mở", cls: "bg-green-500/10 text-green-600" };
      case "CLOSED": return { label: "Đã đóng", cls: "bg-red-500/10 text-red-600" };
      case "ARCHIVED": return { label: "Lưu trữ", cls: "bg-gray-500/10 text-gray-500" };
      default: return { label: "Bản nháp", cls: "bg-yellow-500/10 text-yellow-600" };
    }
  };

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Đề trắc nghiệm & Bài kiểm tra</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Thiết lập các đề thi thử, bài kiểm tra định kỳ và đánh giá năng lực học viên.
          </p>
        </div>
        <button
          onClick={() => router.push("/lecturer/quizzes/create")}
          className="bg-primary text-on-primary font-label-md px-stack-md py-stack-sm rounded-lg flex items-center gap-base hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Tạo Đề Thi Mới
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-primary animate-spin block mb-3">progress_activity</span>
          <p className="text-on-surface-variant">Đang tải danh sách đề thi...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="py-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">quiz</span>
          <p>Chưa có đề thi nào. Hãy tạo đề thi mới!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {quizzes.map((quiz) => {
            const statusInfo = getStatusLabel(quiz.status);
            return (
              <div key={quiz.id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-[0_8px_35px_rgba(0,0,0,0.06)] hover:border-primary/20 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="w-10 h-10 rounded-lg bg-secondary-container/10 text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined">quiz</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-caption font-semibold ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-lg text-on-surface font-semibold line-clamp-1">{quiz.title}</h3>
                  <p className="text-caption text-on-surface-variant mt-1">
                    {quiz.questionCount || 0} Câu hỏi &bull; Thời gian: {quiz.durationMinutes ? `${quiz.durationMinutes} phút` : "Không giới hạn"}
                  </p>
                  <p className="text-caption text-on-surface-variant mt-0.5">
                    Khóa: {quiz.course?.name || "—"} &bull; Tối đa {quiz.maxAttempts || 1} lượt
                  </p>
                </div>
                
                <div className="pt-4 flex gap-2 border-t border-outline-variant/20 justify-end">
                  <button
                    onClick={() => router.push(`/lecturer/quizzes/${quiz.id}`)}
                    className="text-caption font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span> Xem
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id, quiz.title)}
                    className="text-caption font-semibold text-error hover:underline flex items-center gap-1 ml-4"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span> Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
