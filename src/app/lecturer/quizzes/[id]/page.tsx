"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { quizService } from "@/lib/api/service";

export default function LecturerQuizDetailPage() {
  const router = useRouter();
  const { id: quizId } = useParams() as { id: string };
  const [mounted, setMounted] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizRes, questionsRes] = await Promise.all([
        quizService.getQuizById(quizId),
        quizService.getQuizQuestions(quizId).catch(() => null),
      ]);

      if (quizRes.success) setQuiz(quizRes.data);
      if (questionsRes && questionsRes.success) setQuestions(questionsRes.data || []);
    } catch (err) {
      console.error("Lỗi khi tải quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && quizId) loadData();
  }, [mounted, quizId]);

  if (!mounted) return null;

  const handleStatusChange = async (newStatus: string) => {
    const statusLabels: Record<string, string> = {
      OPEN: "Mở đề thi",
      CLOSED: "Đóng đề thi",
      DRAFT: "Chuyển về nháp",
    };
    if (!window.confirm(`Bạn muốn ${statusLabels[newStatus] || newStatus}?`)) return;

    try {
      setUpdatingStatus(true);
      const res = await quizService.updateQuizStatus(quizId, newStatus);
      if (res.success) {
        setQuiz((prev: any) => ({ ...prev, status: newStatus }));
      } else {
        alert(res.message || "Không thể cập nhật trạng thái");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "OPEN": return { label: "Đang mở", cls: "bg-green-500/10 text-green-600", icon: "check_circle" };
      case "CLOSED": return { label: "Đã đóng", cls: "bg-red-500/10 text-red-600", icon: "cancel" };
      case "ARCHIVED": return { label: "Lưu trữ", cls: "bg-gray-500/10 text-gray-500", icon: "archive" };
      default: return { label: "Bản nháp", cls: "bg-yellow-500/10 text-yellow-600", icon: "edit_note" };
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin block mb-3">progress_activity</span>
        <p className="text-on-surface-variant">Đang tải thông tin đề thi...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="py-12 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">error</span>
        <p>Không tìm thấy đề thi này.</p>
      </div>
    );
  }

  const statusInfo = getStatusInfo(quiz.status);

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/lecturer/quizzes")}
          className="p-2 rounded-lg hover:bg-surface-container-low transition-all"
        >
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <div className="flex-1">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{quiz.title}</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Khóa: {quiz.course?.name || "—"} &bull; {quiz.durationMinutes ? `${quiz.durationMinutes} phút` : "Không giới hạn"} &bull; Tối đa {quiz.maxAttempts || 1} lượt
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 ${statusInfo.cls}`}>
          <span className="material-symbols-outlined text-[18px]">{statusInfo.icon}</span>
          {statusInfo.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {quiz.status === "DRAFT" && (
          <button
            onClick={() => handleStatusChange("OPEN")}
            disabled={updatingStatus}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">play_circle</span>
            Mở đề thi
          </button>
        )}
        {quiz.status === "OPEN" && (
          <button
            onClick={() => handleStatusChange("CLOSED")}
            disabled={updatingStatus}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">stop_circle</span>
            Đóng đề thi
          </button>
        )}
        {quiz.status === "CLOSED" && (
          <button
            onClick={() => handleStatusChange("OPEN")}
            disabled={updatingStatus}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">play_circle</span>
            Mở lại đề thi
          </button>
        )}
        <button
          onClick={() => router.push(`/lecturer/quizzes/${quizId}/results`)}
          className="px-5 py-2.5 border border-outline-variant/50 text-on-surface rounded-xl font-semibold hover:bg-surface-container-low transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">bar_chart</span>
          Xem kết quả
        </button>
      </div>

      {/* Quiz Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 text-center">
          <p className="text-2xl font-bold text-primary">{questions.length}</p>
          <p className="text-xs text-on-surface-variant mt-1">Câu hỏi</p>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 text-center">
          <p className="text-2xl font-bold text-on-surface">{quiz.durationMinutes || "∞"}</p>
          <p className="text-xs text-on-surface-variant mt-1">Phút làm bài</p>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 text-center">
          <p className="text-2xl font-bold text-on-surface">{quiz.maxAttempts || 1}</p>
          <p className="text-xs text-on-surface-variant mt-1">Lượt tối đa</p>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 text-center">
          <p className="text-2xl font-bold text-on-surface">{quiz.shuffleQuestions ? "Có" : "Không"}</p>
          <p className="text-xs text-on-surface-variant mt-1">Xáo trộn</p>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
        <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">list</span>
          Danh sách câu hỏi ({questions.length})
        </h3>

        {questions.length === 0 ? (
          <div className="py-8 text-center text-on-surface-variant border border-dashed border-outline-variant/50 rounded-xl">
            <span className="material-symbols-outlined text-[36px] text-outline mb-2 block">help_outline</span>
            <p className="text-sm">Chưa có câu hỏi nào. Hãy thêm câu hỏi từ ngân hàng câu hỏi.</p>
            <p className="text-xs text-on-surface-variant mt-1">
              (Lưu ý: Cần có ít nhất 1 câu hỏi mới có thể mở đề thi)
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q: any, index: number) => (
              <div key={q.questionId || q.id} className="bg-white border border-outline-variant/20 rounded-xl p-4 flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-on-surface">
                    <span className="text-primary font-bold mr-2">Câu {index + 1}:</span>
                    {q.content}
                  </p>
                  <div className="mt-2 flex gap-3 text-xs text-on-surface-variant">
                    <span>{q.options?.length || 0} lựa chọn</span>
                    <span>&bull;</span>
                    <span>{q.score || 1} điểm</span>
                    <span>&bull;</span>
                    <span>{q.questionType === "multiple" ? "Nhiều đáp án" : "Một đáp án"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
