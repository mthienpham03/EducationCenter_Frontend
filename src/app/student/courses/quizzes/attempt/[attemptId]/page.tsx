"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { quizService } from "@/lib/api/service";

function StudentAttemptDetailsContent() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { attemptId } = useParams() as { attemptId: string };
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quizId") || "";

  const [mounted, setMounted] = useState(false);
  const [attempt, setAttempt] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadAttemptDetails = async () => {
    if (!quizId) {
      router.push("/student/courses/quizzes");
      return;
    }
    try {
      setLoading(true);
      const [attemptRes, quizRes] = await Promise.all([
        quizService.getAttemptDetails(quizId, attemptId),
        quizService.getQuizById(quizId).catch(() => null),
      ]);

      if (attemptRes.success && attemptRes.data) {
        // Backend tráº£ vá» flat: { attemptId, attemptNo, startedAt, submittedAt, totalScore, answers: [...] }
        setAttempt(attemptRes.data);
        setAnswers(attemptRes.data.answers || []);
      }
      if (quizRes && quizRes.success) {
        setQuiz(quizRes.data);
      }
    } catch (err: any) {
      console.error("Lá»—i khi táº£i káº¿t quáº£ lÆ°á»£t thi:", err);
      router.push(`/student/courses/quizzes/${quizId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && attemptId) {
      loadAttemptDetails();
    }
  }, [mounted, attemptId, quizId]);

  if (!mounted) return null;

  const handleLogout = () => {
    useAuthStore.getState().logout();
    router.push("/login");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "â€”";
    try {
      return new Date(dateStr).toLocaleString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return "â€”";
    try {
      const diffMs = new Date(end).getTime() - new Date(start).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const mins = Math.floor(diffSecs / 60);
      const secs = diffSecs % 60;
      return `${mins} phÃºt ${secs} giÃ¢y`;
    } catch {
      return "â€”";
    }
  };

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen flex font-body-md">
      {/* Sidebar */}
      <aside className="h-full w-72 fixed left-0 top-0 flex flex-col p-stack-md bg-surface-container-lowest shadow-sm border-r border-outline-variant z-50 overflow-y-auto">
        <div className="mb-10">
          <h1 className="text-headline-md font-headline-md font-bold text-primary">EduCenter</h1>
          <p className="text-label-md font-label-md text-on-surface-variant">Cá»•ng há»c viÃªn</p>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <Link href="/student/dashboard" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">school</span>
            <span>Quáº£n lÃ½ khÃ³a há»c</span>
          </Link>
          <Link href="/student/courses/documents" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">folder_open</span>
            <span>TÃ i liá»‡u</span>
          </Link>
          <Link href="/student/courses/quizzes" className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg font-label-md transition-all duration-200">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
            <span>BÃ i kiá»ƒm tra</span>
          </Link>
          <Link href="/student/schedules" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">calendar_month</span>
            <span>Lá»‹ch há»c</span>
          </Link>
          <Link href="/student/courses/progress" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">insights</span>
            <span>Tiáº¿n Ä‘á»™ há»c táº­p</span>
          </Link>
          <Link href="/student/courses/learning-space" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">cast_for_education</span>
            <span>KhÃ´ng gian há»c táº­p</span>
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-outline-variant">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-error hover:bg-error-container transition-all rounded-lg font-label-md">
            <span className="material-symbols-outlined">logout</span>
            <span>ÄÄƒng xuáº¥t</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-72 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 w-full z-40 flex justify-between items-center px-margin-desktop py-4 bg-surface shadow-sm border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/student/courses/quizzes/${quizId}`)}
              className="p-2 rounded-lg hover:bg-surface-container-low transition-all"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
            <h2 className="text-headline-md font-headline-md text-on-surface font-semibold">Káº¿t quáº£ chi tiáº¿t bÃ i lÃ m</h2>
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
          <div className="max-w-4xl mx-auto space-y-6">
            {loading ? (
              <div className="py-12 text-center bg-white rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-[48px] text-primary animate-spin block mb-3">progress_activity</span>
                <p className="text-on-surface-variant">Äang táº£i chi tiáº¿t káº¿t quáº£...</p>
              </div>
            ) : !attempt ? (
              <div className="py-12 text-center text-on-surface-variant bg-white rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">error</span>
                <p>KhÃ´ng tÃ¬m tháº¥y káº¿t quáº£ lÆ°á»£t thi nÃ y.</p>
              </div>
            ) : (
              <>
                {/* Score Summary Card */}
                <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-xs text-primary font-bold uppercase tracking-wider">{quiz?.course?.name || "BÃ i kiá»ƒm tra"}</span>
                    <h3 className="text-2xl font-black text-on-surface">{quiz?.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-on-surface-variant pt-1">
                      <span>LÆ°á»£t thi: <strong>Láº§n {attempt.attemptNo}</strong></span>
                      <span>â€¢</span>
                      <span>Ná»™p bÃ i: <strong>{formatDate(attempt.submittedAt)}</strong></span>
                      <span>â€¢</span>
                      <span>Thá»i gian lÃ m bÃ i: <strong>{calculateDuration(attempt.startedAt, attempt.submittedAt)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 rounded-2xl p-4 md:min-w-[200px] justify-center flex-col md:flex-row">
                    <span className="material-symbols-outlined text-[48px] text-primary">analytics</span>
                    <div className="text-center md:text-left">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Äiá»ƒm sá»‘ Ä‘áº¡t Ä‘Æ°á»£c</p>
                      <p className="text-3xl font-black text-primary">{attempt.totalScore} <span className="text-base text-on-surface-variant font-normal">/ Ä‘iá»ƒm</span></p>
                    </div>
                  </div>
                </div>

                {/* Score breakdown per question */}
                <div className="space-y-6">
                  <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 px-2">
                    <span className="material-symbols-outlined text-primary">rule</span>
                    Chi tiáº¿t bÃ i lÃ m tá»«ng cÃ¢u
                  </h3>

                  {answers.map((ans: any, idx: number) => {
                    const isCorrect = ans.isCorrect;
                    // answerData is string[] of selected option IDs (from new API)
                    const answerData: string[] = ans.answerData || [];

                    return (
                      <div key={ans.questionId} className={`bg-white border rounded-2xl p-6 shadow-sm space-y-4 ${
                        isCorrect ? "border-green-500/20" : "border-red-500/20"
                      }`}>
                        <div className="flex justify-between items-start gap-4 pb-2 border-b border-outline-variant/10">
                          <h4 className="font-bold text-base text-on-surface flex gap-2">
                            <span className="text-primary font-black">CÃ¢u {idx + 1}:</span>
                            {ans.content}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                              isCorrect
                                ? "bg-green-500/10 text-green-600"
                                : "bg-red-500/10 text-red-600"
                            }`}>
                              <span className="material-symbols-outlined text-sm">
                                {isCorrect ? "check_circle" : "cancel"}
                              </span>
                              {isCorrect ? "ÄÃºng" : "Sai"}
                            </span>
                            <span className="text-xs font-semibold bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full">
                              {ans.score} Ä‘iá»ƒm
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {(ans.options || []).map((opt: any) => {
                            const isSelected = answerData.includes(opt.id);
                            const isOptCorrect = opt.isCorrect;

                            let containerClass = "bg-surface-container-lowest border-outline-variant/30 text-on-surface";
                            let icon = "radio_button_unchecked";
                            let iconClass = "text-on-surface-variant/40";

                            if (isOptCorrect && isSelected) {
                              containerClass = "bg-green-500/5 border-green-500/45 text-green-700 font-medium";
                              icon = "check_circle";
                              iconClass = "text-green-600";
                            } else if (isOptCorrect) {
                              containerClass = "bg-green-500/5 border-green-500/45 text-green-700 font-medium";
                              icon = "check_circle";
                              iconClass = "text-green-600";
                            } else if (isSelected && !isOptCorrect) {
                              containerClass = "bg-red-500/5 border-red-500/45 text-red-700 font-medium";
                              icon = "cancel";
                              iconClass = "text-red-600";
                            }

                            return (
                              <div
                                key={opt.id}
                                className={`p-4 rounded-xl border text-sm flex items-center gap-3 transition-all ${containerClass}`}
                              >
                                <span className={`material-symbols-outlined text-[20px] ${iconClass}`}>
                                  {icon}
                                </span>
                                <span className="flex-1">{opt.content}</span>
                                {isOptCorrect && !isSelected && (
                                  <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-md">
                                    ÄÃ¡p Ã¡n Ä‘Ãºng
                                  </span>
                                )}
                                {isSelected && !isOptCorrect && (
                                  <span className="text-xs font-bold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-md">
                                    Lá»±a chá»n cá»§a báº¡n
                                  </span>
                                )}
                                {isSelected && isOptCorrect && (
                                  <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-md">
                                    Chá»n Ä‘Ãºng âœ“
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 pb-12 flex justify-center">
                  <button
                    onClick={() => router.push(`/student/courses/quizzes/${quizId}`)}
                    className="px-8 py-3 bg-surface-container border border-outline-variant/60 text-on-surface font-semibold rounded-xl hover:bg-surface-container-high transition-all active:scale-[0.98]"
                  >
                    Quay láº¡i lá»‹ch sá»­ thi
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function StudentAttemptDetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-bright">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-3">progress_activity</span>
        <p className="text-on-surface-variant font-body-md">Äang táº£i chi tiáº¿t káº¿t quáº£...</p>
      </div>
    }>
      <StudentAttemptDetailsContent />
    </Suspense>
  );
}
