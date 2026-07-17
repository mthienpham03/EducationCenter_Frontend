"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { quizApi } from "@/lib/api/quiz.api";
import { Quiz } from "@/lib/types/quiz.type";
import dayjs from "dayjs";

interface Option {
  id: string;
  content: string;
  orderIndex: number;
}

interface Question {
  questionId: string;
  orderIndex: number;
  score: number;
  content: string;
  questionType: string;
  difficulty: string;
  options: Option[];
}

export default function QuizTakePage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attemptData, setAttemptData] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{isOpen: boolean, type: 'confirm' | 'success' | 'error', message: string}>({isOpen: false, type: 'confirm', message: ''});
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initQuiz = async () => {
      try {
        setLoading(true);
        // Load quiz info for title
        const qRes = await quizApi.getQuizById(quizId);
        if (qRes.success && qRes.data) setQuiz(qRes.data);

        // Start attempt
        const aRes = await quizApi.startQuiz(quizId);
        if (aRes.success) {
          setAttemptData(aRes.data);
          setQuestions(aRes.data.questions || []);
          
          if (aRes.data.durationMinutes) {
            const startedAt = dayjs(aRes.data.startedAt);
            const endTime = startedAt.add(aRes.data.durationMinutes, 'minute');
            const diff = endTime.diff(dayjs(), 'second');
            setTimeLeft(diff > 0 ? diff : 0);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải đề thi. Có thể bạn chưa được ghi danh hoặc bài kiểm tra chưa mở.");
      } finally {
        setLoading(false);
      }
    };
    initQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev && prev <= 1) {
            clearInterval(timerRef.current!);
            executeSubmit(); // Auto submit when time's up
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  const handleOptionChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: [optionId]
    }));
  };

  const handleInitiateSubmit = () => {
    if (timeLeft !== null && timeLeft > 0) {
      setModal({
        isOpen: true,
        type: 'confirm',
        message: 'Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn không thể thay đổi đáp án.'
      });
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = async () => {
    if (!attemptData) return;
    if (submitting) return;

    try {
      setSubmitting(true);
      const answerList = Object.keys(answers).map(qId => ({
        questionId: qId,
        answerData: answers[qId]
      }));

      const res = await quizApi.submitQuiz(quizId, attemptData.attemptId, { answers: answerList });
      if (res.success) {
        setModal({
          isOpen: true,
          type: 'success',
          message: 'Nộp bài thành công! Bạn sẽ được chuyển về trang trước...'
        });
        setTimeout(() => {
          router.push(`/student/quizzes`);
        }, 2000);
      }
    } catch (err: any) {
      setModal({
        isOpen: true,
        type: 'error',
        message: err.response?.data?.message || 'Lỗi khi nộp bài'
      });
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] w-full p-4">
        <div className="bg-error-container text-on-error-container p-6 rounded-xl max-w-md w-full text-center">
          <span className="material-symbols-outlined text-4xl mb-2 text-error">error</span>
          <h2 className="text-xl font-bold mb-2">Không thể làm bài</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => router.push('/student/quizzes')} 
            className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progress = Math.round((Object.keys(answers).length / Math.max(1, questions.length)) * 100);

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen relative w-full -ml-4 sm:-ml-0">
      {/* Top Navigation Bar (Focused Mode) */}
      <header className="fixed top-0 left-0 lg:left-64 right-0 z-[60] bg-surface shadow-sm border-b border-outline-variant h-16 flex items-center transition-all">
        <div className="max-w-container-max mx-auto flex justify-between items-center w-full px-4 md:px-margin-desktop">
          <div className="flex items-center gap-2 md:gap-4 truncate">
            <span className="text-headline-md font-headline-md text-primary hidden md:block">EduCenter</span>
            <div className="h-6 w-[1px] bg-outline-variant mx-2 hidden md:block"></div>
            <h1 className="text-body-md font-bold text-on-surface truncate">{quiz?.title || "Bài kiểm tra"}</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-stack-md flex-shrink-0">
            {timeLeft !== null && (
              <div className={`flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border transition-colors ${timeLeft < 300 ? 'bg-error-container text-error border-error animate-pulse' : 'bg-primary-container/10 border-primary/20 text-primary'}`}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>timer</span>
                <span className="font-mono text-base md:text-lg font-bold">{formatTime(timeLeft)}</span>
              </div>
            )}
            <button 
              onClick={handleInitiateSubmit}
              disabled={submitting}
              className="bg-primary text-on-primary px-4 py-1.5 md:px-6 md:py-2 rounded-lg font-label-md transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </button>
          </div>
        </div>
      </header>

      <div className="pt-20 pb-28 md:pb-24 px-4 md:px-margin-desktop w-full max-w-container-max mx-auto flex flex-col lg:flex-row gap-gutter">
        {/* Main Question Canvas */}
        <section className="flex-1 flex flex-col gap-6">
          {currentQuestion ? (
            <div className="bg-surface-container-lowest p-6 md:p-stack-lg rounded-xl shadow-sm border border-outline-variant">
              <div className="flex justify-between items-center mb-base">
                <span className="text-primary font-bold font-label-md px-3 py-1 bg-primary/10 rounded-full">
                  Câu hỏi {currentIdx + 1} / {questions.length}
                </span>
                <button className="text-outline hover:text-primary flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">flag</span>
                  <span className="text-caption">Đánh dấu</span>
                </button>
              </div>
              <h2 
                className="text-headline-md font-headline-md text-on-surface mb-stack-md"
                dangerouslySetInnerHTML={{ __html: currentQuestion.content }}
              />
              
              <div className="space-y-4">
                {currentQuestion.options?.map((opt, i) => {
                  const labelLetter = String.fromCharCode(65 + i); // A, B, C, D
                  const isChecked = answers[currentQuestion.questionId]?.[0] === opt.id;
                  
                  return (
                    <div key={opt.id} className="relative">
                      <input 
                        className="peer hidden" 
                        id={`opt-${opt.id}`} 
                        name={`question-${currentQuestion.questionId}`} 
                        type="radio" 
                        value={opt.id}
                        checked={isChecked}
                        onChange={() => handleOptionChange(currentQuestion.questionId, opt.id)}
                      />
                      <label 
                        className="flex items-center p-4 border border-outline-variant rounded-lg cursor-pointer transition-all hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-primary/5 group" 
                        htmlFor={`opt-${opt.id}`}
                      >
                        <span className={`flex-shrink-0 w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center font-bold transition-colors mr-4 ${isChecked ? 'bg-primary text-white border-primary' : 'text-on-surface-variant group-hover:bg-outline-variant/20'}`}>
                          {labelLetter}
                        </span>
                        <div 
                          className="text-body-md text-on-surface break-words flex-1"
                          dangerouslySetInnerHTML={{ __html: opt.content }}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
             <div className="bg-surface-container-lowest p-10 rounded-xl shadow-sm border border-outline-variant text-center">
               <h3 className="text-lg text-on-surface-variant">Không có dữ liệu câu hỏi.</h3>
             </div>
          )}

          {/* Context Hint */}
          <div className="p-base bg-surface-container-low rounded-lg border border-dashed border-outline-variant flex items-start gap-3 mt-auto">
            <span className="material-symbols-outlined text-outline">info</span>
            <p className="text-caption text-on-surface-variant">Hệ thống sẽ tự động gửi bài làm của bạn khi hết thời gian quy định.</p>
          </div>
        </section>

        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm sticky top-24">
            <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">grid_view</span>
              Danh sách câu hỏi
            </h3>
            
            <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2 mb-6">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.questionId] && answers[q.questionId].length > 0;
                const isCurrent = idx === currentIdx;
                
                let btnClass = "h-10 w-full rounded flex items-center justify-center text-label-md transition-all cursor-pointer ";
                if (isCurrent) {
                  btnClass += "border-2 border-primary text-primary font-bold bg-primary/5";
                } else if (isAnswered) {
                  btnClass += "bg-primary text-on-primary border border-primary";
                } else {
                  btnClass += "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary";
                }

                return (
                  <button 
                    key={q.questionId}
                    onClick={() => setCurrentIdx(idx)}
                    className={btnClass}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 pt-4 border-t border-outline-variant">
              <div className="flex items-center gap-3 text-caption">
                <span className="w-3 h-3 bg-primary rounded-sm flex-shrink-0"></span>
                <span>Đã trả lời</span>
              </div>
              <div className="flex items-center gap-3 text-caption">
                <span className="w-3 h-3 border-2 border-primary rounded-sm bg-primary/5 flex-shrink-0"></span>
                <span>Đang làm</span>
              </div>
              <div className="flex items-center gap-3 text-caption">
                <span className="w-3 h-3 border border-outline-variant rounded-sm flex-shrink-0"></span>
                <span>Chưa trả lời</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Action Bar */}
      <footer className="fixed bottom-0 left-0 lg:left-64 right-0 h-20 bg-surface-container-lowest border-t border-outline-variant z-[60]">
        <div className="max-w-container-max mx-auto h-full flex justify-between items-center px-4 md:px-margin-desktop">
          <button 
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 md:gap-2 px-3 py-2 md:px-6 md:py-2.5 rounded-lg border border-primary text-primary font-label-md hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="hidden sm:inline">Quay lại</span>
          </button>
          
          <div className="hidden md:flex gap-4">
            <div className="flex flex-col items-center justify-center">
              <div className="w-48 h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-caption mt-1 text-on-surface-variant">
                Tiến độ: {Object.keys(answers).length}/{questions.length} ({progress}%)
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIdx === questions.length - 1}
            className="flex items-center gap-1 md:gap-2 px-3 py-2 md:px-6 md:py-2.5 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:active:scale-100"
          >
            <span className="hidden sm:inline">Tiếp theo</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </footer>

      {/* Centered Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              {modal.type === 'confirm' && (
                <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl">help</span>
                </div>
              )}
              {modal.type === 'success' && (
                <div className="w-16 h-16 bg-tertiary-container text-tertiary rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
              )}
              {modal.type === 'error' && (
                <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl">error</span>
                </div>
              )}
              
              <h3 className="text-headline-sm font-bold text-on-surface mb-2">
                {modal.type === 'confirm' ? 'Xác nhận nộp bài' : modal.type === 'success' ? 'Thành công' : 'Đã có lỗi xảy ra'}
              </h3>
              <p className="text-body-md text-on-surface-variant mb-8">
                {modal.message}
              </p>

              {modal.type === 'confirm' && (
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => setModal({ ...modal, isOpen: false })}
                    className="flex-1 py-3 px-4 rounded-xl font-label-md border border-outline hover:bg-surface-container-high transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    onClick={() => {
                      setModal({ ...modal, isOpen: false });
                      executeSubmit();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-label-md bg-primary text-on-primary hover:bg-primary/90 transition-colors"
                  >
                    Xác nhận nộp
                  </button>
                </div>
              )}
              
              {modal.type === 'error' && (
                <button 
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  className="w-full py-3 px-4 rounded-xl font-label-md bg-primary text-on-primary hover:bg-primary/90 transition-colors"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
