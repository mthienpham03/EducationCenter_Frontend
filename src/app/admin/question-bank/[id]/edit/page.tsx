"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionBankApi } from "@/lib/api/question-bank.api";
import QuestionForm, { QuestionFormValues } from "@/components/features/question-bank/QuestionForm";
import Link from "next/link";
import { QuestionTypeEnum } from "@/lib/types/question.type";

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const questionId = params.id as string;

  // Fetch question detail
  const { data: response, isLoading: isFetching } = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => questionBankApi.getQuestionById(questionId),
    enabled: !!questionId,
  });

  const question = response?.data;

  // Update mutation
  const mutation = useMutation({
    mutationFn: (data: QuestionFormValues) => questionBankApi.updateQuestion(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["question", questionId] });
      router.push("/admin/question-bank");
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật câu hỏi:", error);
      alert("Đã có lỗi xảy ra khi cập nhật câu hỏi. Vui lòng thử lại!");
    }
  });

  const handleSubmit = (data: QuestionFormValues) => {
    mutation.mutate(data);
  };

  if (isFetching) {
    return <div className="text-center py-10">Đang tải dữ liệu câu hỏi...</div>;
  }

  if (!question) {
    return (
      <div className="text-center py-10">
        Không tìm thấy câu hỏi. 
        <Link href="/admin/question-bank" className="text-primary ml-2 hover:underline">Quay lại</Link>
      </div>
    );
  }

  // Transform backend data to form values
  const initialData: Partial<QuestionFormValues> = {
    courseId: question.courseId,
    content: question.content,
    questionType: question.questionType as QuestionTypeEnum,
    difficulty: question.difficulty,
    options: question.options?.map(o => ({
      id: o.id,
      content: o.content,
      isCorrect: o.isCorrect,
      orderIndex: o.orderIndex,
    })) || [],
  };

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md">
      <div className="flex flex-col gap-2 mb-stack-lg">
        <Link href="/admin/question-bank" className="text-primary hover:underline flex items-center gap-1 w-fit font-label-md">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Quay lại Ngân hàng câu hỏi
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Chỉnh sửa Câu hỏi</h1>
        <p className="font-body-md text-on-surface-variant">
          Cập nhật nội dung câu hỏi và các đáp án liên quan.
        </p>
      </div>

      <QuestionForm 
        initialData={initialData}
        onSubmit={handleSubmit} 
        isLoading={mutation.isPending} 
      />
    </div>
  );
}
