"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizApi } from "@/lib/api/quiz.api";
import QuestionBankModal from "@/components/features/quizzes/QuestionBankModal";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { QuestionTypeEnum } from "@/lib/types/question.type";

export default function QuizQuestionsPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: quizRes, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ["quiz", id],
    queryFn: () => quizApi.getQuizById(id),
  });
  const quiz = quizRes?.data;

  const { data: questionsRes, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["quiz-questions", id],
    queryFn: () => quizApi.getQuizQuestions(id),
  });
  const quizQuestions = questionsRes?.data?.questions || [];

  const addMutation = useMutation({
    mutationFn: (questionIds: string[]) => {
      const payload = questionIds.map(qId => ({ questionId: qId, score: 1 }));
      return quizApi.addMultipleQuestionsToQuiz(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", id] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Đã xảy ra lỗi khi thêm câu hỏi");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (questionId: string) => quizApi.removeQuestionFromQuiz(id, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", id] });
      setDeleteId(null);
    }
  });

  const existingIds = quizQuestions.map((q: any) => q.questionId);

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case QuestionTypeEnum.MCQ_SINGLE: return "Một đáp án";
      case QuestionTypeEnum.MCQ_MULTIPLE: return "Nhiều đáp án";
      case QuestionTypeEnum.TRUE_FALSE: return "Đúng/Sai";
      default: return type;
    }
  };

  if (isLoadingQuiz) return <div className="p-10 text-center text-on-surface-variant">Đang tải thông tin...</div>;

  return (
    <div className="max-w-container-max mx-auto p-stack-md space-y-stack-md">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
            <Link href="/lecturer/quizzes" className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Quản lý Bài kiểm tra
            </Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span>Chi tiết câu hỏi</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Quản lý câu hỏi</h1>
          <p className="text-on-surface-variant max-w-2xl">Đề thi: <span className="font-bold text-on-surface">{quiz?.title}</span></p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white font-label-md px-6 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm câu hỏi
        </button>
      </div>

      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between bg-surface-container-lowest">
          <h2 className="font-headline-sm text-on-surface">Danh sách câu hỏi trong đề ({quizQuestions.length})</h2>
          <div className="text-sm text-on-surface-variant">Tổng điểm dự kiến: <span className="font-bold text-primary">{quizQuestions.reduce((acc: number, q: any) => acc + Number(q.score || 0), 0)}</span></div>
        </div>

        <div className="overflow-x-auto">
          {isLoadingQuestions ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <span className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-on-surface-variant text-sm">Đang tải dữ liệu...</span>
            </div>
          ) : quizQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined text-[48px] opacity-30">quiz</span>
              <p className="font-medium">Chưa có câu hỏi nào trong đề thi này</p>
              <button onClick={() => setIsModalOpen(true)} className="text-primary hover:underline text-sm font-semibold">Thêm câu hỏi ngay</button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider w-12 text-center">STT</th>
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Nội dung</th>
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Loại</th>
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider text-center">Điểm</th>
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {quizQuestions.map((q: any, index: number) => {
                  return (
                    <tr key={q.questionId} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="px-4 py-4 text-center font-medium text-on-surface-variant">{index + 1}</td>
                      <td className="px-4 py-4 max-w-[400px]">
                        <p className="font-medium text-on-surface text-sm line-clamp-2" title={q.content}>
                          {q.content || "Câu hỏi không khả dụng"}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded text-xs font-semibold">
                          {getQuestionTypeLabel(q.questionType)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-primary">
                        {q.score}
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setDeleteId(q.questionId)}
                            className="p-1.5 hover:bg-error-container/30 rounded-lg text-on-surface-variant hover:text-error transition-colors inline-flex"
                            title="Xóa khỏi đề"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <QuestionBankModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingQuestionIds={existingIds}
        onAdd={(ids) => addMutation.mutate(ids)}
        courseId={quiz?.courseId}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
        title="Bỏ câu hỏi khỏi đề?"
        message="Câu hỏi này sẽ bị gỡ khỏi đề thi. Bản gốc trong Ngân hàng câu hỏi không bị ảnh hưởng."
        confirmText={deleteMutation.isPending ? "Đang xóa..." : "Bỏ câu hỏi"}
        cancelText="Hủy"
        isDestructive={true}
      />
    </div>
  );
}
