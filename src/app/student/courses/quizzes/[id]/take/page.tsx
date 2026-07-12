"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { quizService } from "@/lib/api/service";

function TakeQuizContent() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { id: quizId } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");

  const [mounted, setMounted] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Lưu câu trả lời dưới dạng: { [questionId]: [optionId, optionId, ...] }
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  
  // Quản lý thời gian còn lại (giây)
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    if (!quizId || !attemptId) {
      alert("Thiếu tham số lượt làm bài!");
      router.push("/student/courses/quizzes");
      return;
    }

    try {
      setLoading(true);
      const [quizRes, attemptStartRes] = await Promise.all([
        quizService.getQuizById(quizId),
        quizService.startAttempt(quizId),
      ]);

      if (quizRes.success) {
        setQuiz(quizRes.data);
      }

      if (attemptStartRes.success && attemptStartRes.data) {
        const attemptData = attemptStartRes.data;
        setQuestions(attemptData.questions || []);

        // Tính thời gian còn lại dựa trên startedAt và durationMinutes
        const startedTime = new Date(attemptData.startedAt).getTime();
        const durationMinutes = attemptData.durationMinutes || (quizRes.success ? quizRes.data.durationMinutes : 15);
        const durationMs = durationMinutes * 60 * 1000;
        const endTime = startedTime + durationMs;
        const remainingSecs = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        
        setTimeLeft(remainingSecs);
      }
    } catch (err) {
      console.error("Lỗi khi tải đề thi:", err);
      alert("Có lỗi xảy ra khi tải đề thi.");
      router.push("/student/courses/quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted, quizId, attemptId]);

  // Bộ đếm thời gian
  useEffect(() => {
    if (timeLeft === null || submitting) return;

    if (timeLeft <= 0) {
      alert("Hết giờ làm bài! Hệ thống tự động nộp bài thi.");
      handleQuizSubmit(true);
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, submitting]);

  if (!mounted) return null;

  // Lựa chọn đáp án
  const handleSelectOption = (questionId: string, optionId: string, isMultiple: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  // Nộp bài thi
  const handleQuizSubmit = async (isAutoSubmit = false) => {
    if (submitting) return;

    if (!isAutoSubmit) {
      const confirmSubmit = window.confirm("Bạn có chắc chắn muốn nộp bài thi trắc nghiệm này không?");
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      if (timerRef.current) clearTimeout(timerRef.current);

      // Chuyển cấu trúc answers thành định dạng API
      const formattedAnswers = questions.map((q) => ({
        questionId: q.questionId,
        answerData: answers[q.questionId] || [],
      }));

      const res = await quizService.submitAttempt(quizId, attemptId!, formattedAnswers);
      if (res.success) {
        alert("Đã nộp bài thi thành công!");
        router.push(`/student/courses/quizzes/attempt/${attemptId}?quizId=${quizId}`);
      } else {
        alert(res.message || "Lỗi khi nộp bài thi");
      }
    } catch (err) {
      console.error(err);
      alert("Gặp lỗi trong quá trình nộp bài thi.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen flex flex-col font-body-md">
      {/* Quiz Header Bar (Sticky) */}
      <header className="sticky top-0 z-50 bg-white border-b border-outline-variant shadow-sm py-4 px-margin-desktop flex justify-between items-center">
        <div>
          <span className="text-xs text-primary font-bold uppercase tracking-wider">{quiz?.course?.name || "Lớp học"}</span>
          <h1 className="text-xl font-black text-on-surface line-clamp-1">{quiz?.title}</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-2xl border border-primary/20">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
            <span className="font-bold font-mono text-lg">{timeLeft !== null ? formatTimer(timeLeft) : "—:—"}</span>
          </div>
          <button
            onClick={() => handleQuizSubmit(false)}
            disabled={submitting}
            className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Nộp bài
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-3">progress_activity</span>
          <p className="text-on-surface-variant">Đang tải đề thi và câu hỏi...</p>
        </div>
      ) : (
        <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6">
          {questions.map((q, index) => {
            const isMultiple = q.questionType === "multiple";
            const selectedOptions = answers[q.questionId] || [];

            return (
              <div key={q.questionId} className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-base text-on-surface flex gap-2">
                    <span className="text-primary font-black">Câu {index + 1}:</span>
                    {q.content}
                  </h3>
                  <span className="text-xs font-semibold bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full flex-shrink-0">
                    {q.score} điểm • {isMultiple ? "Nhiều lựa chọn" : "Một lựa chọn"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  {q.options.map((opt: any) => {
                    const isSelected = selectedOptions.includes(opt.id);

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(q.questionId, opt.id, isMultiple)}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center gap-3 ${
                          isSelected
                            ? "bg-primary/5 border-primary text-primary"
                            : "bg-surface-container-lowest border-outline-variant/30 hover:bg-surface-container-low/40 text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] text-primary/80">
                          {isMultiple
                            ? isSelected
                              ? "check_box"
                              : "check_box_outline_blank"
                            : isSelected
                            ? "radio_button_checked"
                            : "radio_button_unchecked"}
                        </span>
                        {opt.content}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="pt-6 pb-12 flex justify-center">
            <button
              onClick={() => handleQuizSubmit(false)}
              disabled={submitting}
              className="px-10 py-4 bg-primary text-on-primary font-bold text-base rounded-2xl shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              Nộp bài thi
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

export default function TakeQuizPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-bright">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-3">progress_activity</span>
        <p className="text-on-surface-variant font-body-md">Đang tải không gian làm bài...</p>
      </div>
    }>
      <TakeQuizContent />
    </Suspense>
  );
}
