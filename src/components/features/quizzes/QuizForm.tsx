"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/lib/api";
import { QuizStatus } from "@/lib/types/quiz.type";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const quizSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề bài kiểm tra").max(255, "Tiêu đề không quá 255 ký tự"),
  courseId: z.string().min(1, "Vui lòng chọn khóa học"),
  lessonId: z.string().optional().nullable(),
  durationMinutes: z.number().nullable().optional(),
  maxAttempts: z.number().min(1, "Ít nhất 1 lần").max(100, "Tối đa 100 lần"),
  shuffleQuestions: z.boolean(),
  status: z.nativeEnum(QuizStatus),
});

type QuizFormValues = z.infer<typeof quizSchema>;

interface QuizFormProps {
  initialData?: any;
  onSubmit: (data: QuizFormValues) => void;
  isSubmitting: boolean;
  cancelHref: string;
}

export default function QuizForm({ initialData, onSubmit, isSubmitting, cancelHref }: QuizFormProps) {
  const router = useRouter();
  
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: initialData?.title || "",
      courseId: initialData?.courseId || "",
      lessonId: initialData?.lessonId || null,
      durationMinutes: initialData?.durationMinutes || null,
      maxAttempts: initialData?.maxAttempts || 1,
      shuffleQuestions: initialData?.shuffleQuestions || false,
      status: initialData?.status || QuizStatus.DRAFT,
    },
  });

  const { data: coursesData } = useQuery({
    queryKey: ["courses", "all"],
    queryFn: () => courseService.getCourses(),
  });
  const courses = coursesData?.data || [];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-stack-md bg-white p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/30">
      
      <div className="grid grid-cols-1 gap-stack-md">
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-on-surface">Tiêu đề bài kiểm tra <span className="text-error">*</span></label>
          <input
            {...form.register("title")}
            placeholder="VD: Kiểm tra 15 phút chương 1"
            className="p-3 bg-surface-container-low rounded-lg border border-outline-variant focus:border-primary outline-none"
          />
          {form.formState.errors.title && <span className="text-error text-caption">{form.formState.errors.title.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-on-surface">Khóa học <span className="text-error">*</span></label>
          <select 
            {...form.register("courseId")}
            className="p-3 bg-surface-container-low rounded-lg border border-outline-variant focus:border-primary outline-none"
          >
            <option value="">-- Chọn khóa học --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {form.formState.errors.courseId && <span className="text-error text-caption">{form.formState.errors.courseId.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-label-md text-on-surface">Trạng thái</label>
          <select 
            {...form.register("status")}
            className="p-3 bg-surface-container-low rounded-lg border border-outline-variant focus:border-primary outline-none"
          >
            <option value={QuizStatus.DRAFT}>Bản nháp</option>
            <option value={QuizStatus.OPEN}>Mở (Cho phép làm bài)</option>
            <option value={QuizStatus.CLOSED}>Đóng (Chỉ xem lại)</option>
            <option value={QuizStatus.ARCHIVED}>Lưu trữ</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-on-surface">Thời gian làm bài (Phút)</label>
          <input
            type="number"
            {...form.register("durationMinutes", { valueAsNumber: true, setValueAs: v => v === "" || isNaN(v) ? null : v })}
            placeholder="Bỏ trống nếu không giới hạn"
            className="p-3 bg-surface-container-low rounded-lg border border-outline-variant focus:border-primary outline-none"
          />
          <span className="text-caption text-on-surface-variant mt-1">Để trống tương đương không giới hạn thời gian.</span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-label-md text-on-surface">Số lần làm tối đa <span className="text-error">*</span></label>
          <input
            type="number"
            {...form.register("maxAttempts", { valueAsNumber: true })}
            className="p-3 bg-surface-container-low rounded-lg border border-outline-variant focus:border-primary outline-none"
          />
          {form.formState.errors.maxAttempts && <span className="text-error text-caption">{form.formState.errors.maxAttempts.message}</span>}
        </div>
      </div>

      <div className="flex items-center gap-3 py-2">
        <input
          type="checkbox"
          id="shuffle"
          {...form.register("shuffleQuestions")}
          className="w-5 h-5 rounded text-primary focus:ring-primary border-outline-variant"
        />
        <label htmlFor="shuffle" className="font-label-md text-on-surface cursor-pointer select-none">
          Xáo trộn ngẫu nhiên thứ tự câu hỏi khi học viên làm bài
        </label>
      </div>

      <div className="flex items-center justify-end gap-stack-md pt-4 border-t border-outline-variant/30">
        <button
          type="button"
          onClick={() => router.push(cancelHref)}
          className="px-6 py-2.5 font-label-md text-on-surface-variant hover:bg-surface-container rounded-xl transition-all"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-primary text-white font-label-md rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Đang lưu...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">save</span>
              Lưu cấu hình
            </>
          )}
        </button>
      </div>
    </form>
  );
}
