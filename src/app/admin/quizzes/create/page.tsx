"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quizApi } from "@/lib/api/quiz.api";
import QuizForm from "@/components/features/quizzes/QuizForm";
import Link from "next/link";

export default function CreateQuizPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => quizApi.createQuiz(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setSuccessMsg("Tạo bài kiểm tra thành công! Đang chuyển hướng...");
      // Chuyển hướng tới trang thêm câu hỏi
      setTimeout(() => {
        router.push(`/admin/quizzes/${res?.data?.id}/questions`);
      }, 1500);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Đã xảy ra lỗi khi tạo bài kiểm tra.");
    }
  });

  return (
    <div className="max-w-container-md mx-auto p-stack-md space-y-stack-md">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
          <Link href="/admin/quizzes" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Quản lý Bài kiểm tra
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Tạo mới</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Tạo bài kiểm tra mới</h1>
        <p className="text-on-surface-variant">Thiết lập cấu hình cho bài kiểm tra của bạn.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {errorMsg}
        </div>
      )}

      <QuizForm
        onSubmit={(data) => {
          setErrorMsg(null);
          mutation.mutate(data);
        }}
        isSubmitting={mutation.isPending}
        cancelHref="/admin/quizzes"
      />
    </div>
  );
}
