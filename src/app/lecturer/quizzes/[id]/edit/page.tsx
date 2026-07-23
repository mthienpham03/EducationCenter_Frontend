"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizApi } from "@/lib/api/quiz.api";
import QuizForm from "@/components/features/quizzes/QuizForm";
import Link from "next/link";

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["quiz", id],
    queryFn: () => quizApi.getQuizById(id),
  });

  const quiz = response?.data;

  const mutation = useMutation({
    mutationFn: (data: any) => quizApi.updateQuiz(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", id] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setSuccessMsg("Cập nhật bài kiểm tra thành công!");
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật bài kiểm tra.");
    }
  });

  if (isLoading) return <div className="p-10 text-center text-on-surface-variant">Đang tải thông tin...</div>;
  if (isError || !quiz) return <div className="p-10 text-center text-error">Không tìm thấy bài kiểm tra.</div>;

  return (
    <div className="max-w-container-md mx-auto p-stack-md space-y-stack-md">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
          <Link href="/lecturer/quizzes" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Quản lý Bài kiểm tra
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Chỉnh sửa cấu hình</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Sửa cấu hình bài kiểm tra</h1>
        <p className="text-on-surface-variant">Cập nhật thiết lập cho bài kiểm tra của bạn.</p>
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
        initialData={quiz}
        onSubmit={(data) => {
          setErrorMsg(null);
          mutation.mutate(data);
        }}
        isSubmitting={mutation.isPending}
        cancelHref="/lecturer/quizzes"
      />
    </div>
  );
}
