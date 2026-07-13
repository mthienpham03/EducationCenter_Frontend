"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { questionBankApi } from "@/lib/api/question-bank.api";
import QuestionForm, { QuestionFormValues } from "@/components/features/question-bank/QuestionForm";
import Link from "next/link";

export default function CreateQuestionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: QuestionFormValues) => questionBankApi.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      router.push("/admin/question-bank");
    },
    onError: (error) => {
      console.error("Lỗi khi tạo câu hỏi:", error);
      alert("Đã có lỗi xảy ra khi tạo câu hỏi. Vui lòng thử lại!");
    }
  });

  const handleSubmit = (data: QuestionFormValues) => {
    // format data to match API expectations if needed
    mutation.mutate(data);
  };

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md">
      <div className="flex flex-col gap-2 mb-stack-lg">
        <Link href="/admin/question-bank" className="text-primary hover:underline flex items-center gap-1 w-fit font-label-md">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Quay lại Ngân hàng câu hỏi
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Tạo Câu hỏi Mới</h1>
        <p className="font-body-md text-on-surface-variant">
          Biên soạn nội dung câu hỏi và các đáp án. Đừng quên đánh dấu đáp án đúng nhé!
        </p>
      </div>

      <QuestionForm 
        onSubmit={handleSubmit} 
        isLoading={mutation.isPending} 
      />
    </div>
  );
}
