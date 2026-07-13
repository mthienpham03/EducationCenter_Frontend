"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionBankApi } from "@/lib/api/question-bank.api";
import { QuestionTypeEnum } from "@/lib/types/question.type";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function QuestionBankPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch data
  const { data: response, isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: () => questionBankApi.getQuestions(),
  });

  const questions = response?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionBankApi.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      setDeleteId(null);
    },
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case QuestionTypeEnum.MCQ_SINGLE:
        return "Một đáp án";
      case QuestionTypeEnum.MCQ_MULTIPLE:
        return "Nhiều đáp án";
      case QuestionTypeEnum.TRUE_FALSE:
        return "Đúng/Sai";
      default:
        return type;
    }
  };

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Ngân hàng câu hỏi</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Quản lý và cập nhật danh sách các câu hỏi trắc nghiệm dùng chung cho khóa học.
          </p>
        </div>
        <Link
          href="/admin/question-bank/create"
          className="bg-primary text-on-primary font-label-md px-stack-md py-stack-sm rounded-lg flex items-center gap-base hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Tạo Câu Hỏi Mới
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-10 text-on-surface-variant bg-surface-container-low rounded-xl">
          Chưa có câu hỏi nào. Hãy tạo mới!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {questions.map((question) => (
            <div
              key={question.id}
              className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-[0_8px_35px_rgba(0,0,0,0.06)] hover:border-primary/20 transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined">help_center</span>
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-caption font-semibold ${
                      question.status === "active"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-yellow-500/10 text-yellow-600"
                    }`}
                  >
                    {question.status === "active" ? "Đang hoạt động" : "Bản nháp"}
                  </span>
                </div>
                <h3 className="font-headline-md text-lg text-on-surface font-semibold line-clamp-2">
                  {question.content}
                </h3>
                <div className="text-caption text-on-surface-variant mt-2 flex flex-wrap gap-2">
                  <span className="bg-surface-container-high px-2 py-1 rounded-md">
                    {getQuestionTypeLabel(question.questionType)}
                  </span>
                  <span className="bg-surface-container-high px-2 py-1 rounded-md">
                    Mức độ: {question.difficulty}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 flex gap-2 border-t border-outline-variant/20 justify-end">
                <Link
                  href={`/admin/question-bank/${question.id}/edit`}
                  className="text-caption font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">edit</span> Sửa
                </Link>
                <button
                  onClick={() => setDeleteId(question.id)}
                  className="text-caption font-semibold text-error hover:underline flex items-center gap-1 ml-4"
                >
                  <span className="material-symbols-outlined text-sm">delete</span> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Xóa Modal */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa câu hỏi?"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa câu hỏi này không?"
        confirmText={deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
        cancelText="Hủy"
        isDestructive={true}
      />
    </div>
  );
}
