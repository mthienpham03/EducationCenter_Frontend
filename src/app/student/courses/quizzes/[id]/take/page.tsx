"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { quizService } from "@/lib/api/service";
import { QuizSecurityWrapper } from "@/components/ui/student/QuizSecurityWrapper";

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
  const [currentIdx, setCurrentIdx] = useState(0);

  // Answers: { [questionId]: [optionId, optionId, ...] }
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  
  // Flagged questions: Set of questionIds
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});

  // Countdown Timer (in seconds)
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Submit Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    if (!quizId || !attemptId || attemptId === "undefined") {
      alert("Thiếu hoặc sai tham số lượt làm bài! Hệ thống sẽ đưa bạn về trang danh sách bài thi.");
      router.push("/student/quizzes");
      return;
    }

    try {
      setLoading(true);
      const [quizRes, questionsRes] = await Promise.all([
        quizService.getQuizById(quizId),
        quizService.getQuizQuestions(quizId),
      ]);

      if (quizRes.success && quizRes.data) {
        setQuiz(quizRes.data);

        // Tính thời gian còn lại = toàn bộ duration (vì không biết startedAt)
        if (quizRes.data.durationMinutes) {
          const remainingSecs = quizRes.data.durationMinutes * 60;
          setTimeLeft(remainingSecs);
        }
      }

      if (questionsRes.success && questionsRes.data) {
        // Backend trả về data = { questions: [...] } hoặc data là mảng trực tiếp
        const rawData = questionsRes.data as any;
        const questionList = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData.questions)
          ? rawData.questions
          : [];
        setQuestions(questionList);
      }
    } catch (err) {
      console.error("Lỗi khi tải đề thi:", err);
      alert("Có lỗi xảy ra khi tải đề thi.");
      router.push("/student/quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted, quizId, attemptId]);

  // Countdown timer effect
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

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleQuizSubmit = async (isAutoSubmit = false) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setShowSubmitModal(false);
      if (timerRef.current) clearTimeout(timerRef.current);

      const formattedAnswers = questions.map((q) => {
        const selected = answers[q.questionId] || [];
        return {
          questionId: q.questionId,
          answerData: selected,
          selectedOptionIds: selected,
        };
      });

      const res = await quizService.submitAttempt(quizId, attemptId!, formattedAnswers);
      if (res.success) {
        router.push(`/student/courses/quizzes/attempt/${attemptId}`);
      } else {
        alert(res.message || "Lỗi khi nộp bài thi");
      }
    } catch (err: any) {
      console.error("Lỗi nộp bài thi:", err);
      alert(err.response?.data?.message || err.message || "Gặp lỗi trong quá trình nộp bài thi.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).filter((key) => answers[key]?.length > 0).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const currentQuestion = questions[currentIdx];

  return (
    <QuizSecurityWrapper enabled={true} maxViolations={3} onAutoSubmit={() => handleQuizSubmit(true)}>
      <div className="bg-surface-bright text-on-surface min-h-screen flex flex-col font-body-md select-none">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-outline-variant/40 shadow-sm py-3 px-4 md:px-margin-desktop flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">quiz</span>
            </div>
            <div>
              <span className="text-xs text-primary font-bold uppercase tracking-wider">
                {quiz?.course?.name || quiz?.course?.title || "Bài kiểm tra"}
              </span>
              <h1 className="text-lg md:text-xl font-black text-on-surface line-clamp-1">
                {quiz?.title || "Không gian làm bài thi"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer Badge */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono font-bold text-base md:text-lg transition-all ${
                timeLeft !== null && timeLeft < 120
                  ? "bg-red-500/10 text-red-600 border-red-500/30 animate-pulse"
                  : "bg-primary/10 text-primary border-primary/20"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                timer
              </span>
              <span>{timeLeft !== null ? formatTimer(timeLeft) : "—:—"}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={submitting}
              className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              <span>Nộp bài</span>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-3">progress_activity</span>
            <p className="text-on-surface-variant font-medium">Đang tải đề thi và bộ câu hỏi...</p>
          </div>
        ) : (
          <main className="flex-1 max-w-container-max mx-auto w-full p-4 md:p-margin-desktop grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left: Active Question Canvas */}
            <div className="lg:col-span-3 space-y-6">
              {currentQuestion ? (
                <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                  {/* Question Title Bar */}
                  <div className="flex justify-between items-start gap-4 pb-4 border-b border-outline-variant/20">
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1 bg-primary text-on-primary font-black rounded-xl text-sm">
                        Câu {currentIdx + 1} / {questions.length}
                      </span>
                      <span className="text-xs font-semibold bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full">
                        {currentQuestion.score} điểm • {
                          currentQuestion.questionType === "TRUE_FALSE"
                            ? "Đúng / Sai"
                            : (currentQuestion.questionType === "multiple" ||
                               currentQuestion.questionType === "MCQ_MULTIPLE" ||
                               currentQuestion.questionType === "multiple_choice") 
                              ? "Nhiều lựa chọn" 
                              : "Một lựa chọn"
                        }
                      </span>
                    </div>

                    <button
                      onClick={() => toggleFlagQuestion(currentQuestion.questionId)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        flaggedQuestions[currentQuestion.questionId]
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-high"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{
                          fontVariationSettings: flaggedQuestions[currentQuestion.questionId] ? "'FILL' 1" : "'FILL' 0",
                        }}
                      >
                        bookmark
                      </span>
                      <span>{flaggedQuestions[currentQuestion.questionId] ? "Đã đánh dấu" : "Đánh dấu"}</span>
                    </button>
                  </div>

                  {/* Question Content */}
                  <div className="text-base md:text-lg font-bold text-on-surface leading-relaxed">
                    {currentQuestion.content}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {currentQuestion.options?.map((opt: any, i: number) => {
                      const labelLetter = String.fromCharCode(65 + i);
                      const isMultiple =
                        currentQuestion.questionType === "multiple" ||
                        currentQuestion.questionType === "MCQ_MULTIPLE" ||
                        currentQuestion.questionType === "multiple_choice";
                      const selectedOptions = answers[currentQuestion.questionId] || [];
                      const isSelected = selectedOptions.includes(opt.id);

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(currentQuestion.questionId, opt.id, isMultiple)}
                          className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-start gap-4 ${
                            isSelected
                              ? "bg-primary/10 border-primary text-primary shadow-sm"
                              : "bg-surface-container-lowest border-outline-variant/30 hover:bg-surface-container-low/50 text-on-surface"
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                              isSelected
                                ? "bg-primary text-on-primary"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {labelLetter}
                          </span>
                          <span className="flex-1 pt-1">{opt.content}</span>
                          <span className="material-symbols-outlined text-[22px] text-primary/80 pt-0.5">
                            {isMultiple
                              ? isSelected
                                ? "check_box"
                                : "check_box_outline_blank"
                              : isSelected
                              ? "radio_button_checked"
                              : "radio_button_unchecked"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Question Navigation Controls */}
                  <div className="pt-6 border-t border-outline-variant/20 flex justify-between items-center">
                    <button
                      onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                      disabled={currentIdx === 0}
                      className="px-5 py-2.5 bg-surface-container-high text-on-surface font-semibold text-sm rounded-xl hover:bg-surface-container-highest transition-all disabled:opacity-40 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                      Câu trước
                    </button>

                    <div className="text-xs text-on-surface-variant font-medium hidden md:block">
                      Đã trả lời <strong className="text-primary">{answeredCount}</strong> / {questions.length} câu
                    </div>

                    <button
                      onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                      disabled={currentIdx === questions.length - 1}
                      className="px-5 py-2.5 bg-primary text-on-primary font-semibold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-40 flex items-center gap-1"
                    >
                      Câu tiếp
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right: Question Palette Navigator */}
            <div className="lg:col-span-1 space-y-6 sticky top-20">
              <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-5">
                <h3 className="font-bold text-base text-on-surface flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">grid_view</span>
                    Danh sách câu hỏi
                  </span>
                  <span className="text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full">
                    {progressPercent}%
                  </span>
                </h3>

                {/* Progress Bar */}
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Grid Buttons */}
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentIdx;
                    const isAnswered = (answers[q.questionId] || []).length > 0;
                    const isFlagged = flaggedQuestions[q.questionId];

                    let btnStyle = "bg-surface-container-lowest text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-low";
                    if (isCurrent) {
                      btnStyle = "bg-primary text-on-primary font-black border-primary shadow-sm scale-105";
                    } else if (isAnswered) {
                      btnStyle = "bg-green-500/15 text-green-700 border-green-500/40 font-bold";
                    }

                    return (
                      <button
                        key={q.questionId || idx}
                        onClick={() => setCurrentIdx(idx)}
                        className={`relative h-10 rounded-xl border text-xs font-bold transition-all flex items-center justify-center ${btnStyle}`}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px]">
                            ★
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="pt-4 border-t border-outline-variant/20 grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-green-500/20 border border-green-500/50"></span>
                    <span>Đã làm ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-surface-container-lowest border border-outline-variant"></span>
                    <span>Chưa làm ({questions.length - answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-primary"></span>
                    <span>Đang xem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-amber-500"></span>
                    <span>Đánh dấu</span>
                  </div>
                </div>

                {/* Submit Trigger */}
                <button
                  onClick={() => setShowSubmitModal(true)}
                  disabled={submitting}
                  className="w-full py-3 bg-primary text-on-primary font-bold text-sm rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Nộp bài thi
                </button>
              </div>
            </div>
          </main>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[28px]">help</span>
                </div>
                <div>
                  <h3 className="text-headline-sm font-bold text-on-surface">Xác nhận nộp bài?</h3>
                  <p className="text-xs text-on-surface-variant">Kiểm tra thông tin trước khi hoàn thành</p>
                </div>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Số câu đã trả lời:</span>
                  <span className="font-bold text-primary">{answeredCount} / {questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Số câu chưa trả lời:</span>
                  <span className="font-bold text-red-600">{questions.length - answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Thời gian còn lại:</span>
                  <span className="font-mono font-bold">{timeLeft !== null ? formatTimer(timeLeft) : "—"}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 border border-outline-variant rounded-xl font-semibold text-on-surface hover:bg-surface-container-high transition-all"
                >
                  Tiếp tục làm
                </button>
                <button
                  onClick={() => handleQuizSubmit(false)}
                  disabled={submitting}
                  className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  Xác nhận nộp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </QuizSecurityWrapper>
  );
}

export default function TakeQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface-bright">
          <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-3">progress_activity</span>
          <p className="text-on-surface-variant font-body-md">Đang tải không gian làm bài...</p>
        </div>
      }
    >
      <TakeQuizContent />
    </Suspense>
  );
}
