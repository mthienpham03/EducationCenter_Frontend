"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { QuestionTypeEnum } from "@/lib/types/question.type";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/service";

const optionSchema = z.object({
  id: z.string().optional(),
  content: z.string().min(1, "Vui lòng nhập nội dung đáp án"),
  isCorrect: z.boolean().default(false),
  orderIndex: z.number().default(0),
});

const formSchema = z.object({
  courseId: z.string().min(1, "Vui lòng chọn khóa học"),
  questionType: z.nativeEnum(QuestionTypeEnum),
  content: z.string().min(5, "Nội dung câu hỏi phải ít nhất 5 ký tự"),
  difficulty: z.string().min(1, "Vui lòng chọn độ khó"),
  options: z.array(optionSchema).min(2, "Phải có ít nhất 2 đáp án"),
}).refine(data => {
  if (data.questionType === QuestionTypeEnum.MCQ_SINGLE || data.questionType === QuestionTypeEnum.TRUE_FALSE) {
    return data.options.filter(o => o.isCorrect).length === 1;
  }
  if (data.questionType === QuestionTypeEnum.MCQ_MULTIPLE) {
    return data.options.filter(o => o.isCorrect).length >= 1;
  }
  return true;
}, {
  message: "Vui lòng chọn số lượng đáp án đúng phù hợp với loại câu hỏi",
  path: ["options"]
});

export type QuestionFormValues = z.infer<typeof formSchema>;

interface QuestionFormProps {
  initialData?: Partial<QuestionFormValues>;
  onSubmit: (data: QuestionFormValues) => void;
  isLoading: boolean;
}

export default function QuestionForm({ initialData, onSubmit, isLoading }: QuestionFormProps) {
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: initialData?.courseId || "",
      questionType: initialData?.questionType || QuestionTypeEnum.MCQ_SINGLE,
      content: initialData?.content || "",
      difficulty: initialData?.difficulty || "Dễ",
      options: initialData?.options || [
        { content: "", isCorrect: false, orderIndex: 1 },
        { content: "", isCorrect: false, orderIndex: 2 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const questionType = form.watch("questionType");

  useEffect(() => {
    // Fetch courses for dropdown
    api.course.getCourses().then(res => {
      if (res.success && res.data) {
        setCourses(res.data.map(c => ({ id: c.id, title: c.title })));
      }
    }).catch(console.error);
  }, []);

  // Handle logic when questionType changes
  useEffect(() => {
    if (questionType === QuestionTypeEnum.TRUE_FALSE) {
      form.setValue("options", [
        { content: "Đúng", isCorrect: true, orderIndex: 1 },
        { content: "Sai", isCorrect: false, orderIndex: 2 }
      ]);
    }
  }, [questionType, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-stack-lg max-w-4xl mx-auto bg-surface-container-lowest p-stack-xl rounded-2xl shadow-sm border border-outline-variant/50">
      
      {/* 1. Thông tin cơ bản */}
      <div className="space-y-stack-md">
        <h2 className="font-headline-sm text-on-surface border-b border-outline-variant/30 pb-2">Thông tin cơ bản</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface">Khóa học <span className="text-error">*</span></label>
            <select {...form.register("courseId")} className="p-3 bg-surface-container-low rounded-lg border border-outline-variant focus:border-primary outline-none">
              <option value="">-- Chọn khóa học --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            {form.formState.errors.courseId && <span className="text-error text-caption">{form.formState.errors.courseId.message}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface">Loại câu hỏi <span className="text-error">*</span></label>
            <select {...form.register("questionType")} className="p-3 bg-surface-container-low rounded-lg border border-outline-variant focus:border-primary outline-none">
              <option value={QuestionTypeEnum.MCQ_SINGLE}>Một đáp án đúng (MCQ Single)</option>
              <option value={QuestionTypeEnum.MCQ_MULTIPLE}>Nhiều đáp án đúng (MCQ Multiple)</option>
              <option value={QuestionTypeEnum.TRUE_FALSE}>Đúng/Sai (True/False)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface">Độ khó</label>
            <select {...form.register("difficulty")} className="p-3 bg-surface-container-low rounded-lg border border-outline-variant focus:border-primary outline-none">
              <option value="Dễ">Dễ</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Khó">Khó</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-label-md text-on-surface">Nội dung câu hỏi <span className="text-error">*</span></label>
          <textarea 
            {...form.register("content")} 
            rows={4} 
            className="p-3 bg-surface-container-low rounded-lg border border-outline-variant focus:border-primary outline-none resize-none"
            placeholder="Nhập nội dung câu hỏi vào đây..."
          ></textarea>
          {form.formState.errors.content && <span className="text-error text-caption">{form.formState.errors.content.message}</span>}
        </div>
      </div>

      {/* 2. Danh sách đáp án */}
      <div className="space-y-stack-md">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
          <h2 className="font-headline-sm text-on-surface">Danh sách đáp án</h2>
          {questionType !== QuestionTypeEnum.TRUE_FALSE && (
            <button 
              type="button" 
              onClick={() => append({ content: "", isCorrect: false, orderIndex: fields.length + 1 })}
              className="text-primary font-label-md hover:bg-primary-container px-3 py-1.5 rounded-md transition-colors"
            >
              + Thêm đáp án
            </button>
          )}
        </div>

        {form.formState.errors.options?.root && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm">
            {form.formState.errors.options.root.message}
          </div>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-4 p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container shrink-0 mt-1">
                {String.fromCharCode(65 + index)}
              </div>
              
              <div className="flex-1 flex flex-col gap-2">
                <input 
                  {...form.register(`options.${index}.content`)} 
                  placeholder="Nội dung đáp án..."
                  className="p-3 bg-surface-container-low rounded-lg border border-outline-variant focus:border-primary outline-none"
                  readOnly={questionType === QuestionTypeEnum.TRUE_FALSE}
                />
                {form.formState.errors.options?.[index]?.content && (
                  <span className="text-error text-caption">{form.formState.errors.options[index]?.content?.message}</span>
                )}
              </div>

              <div className="flex flex-col items-center gap-1 shrink-0 px-2 mt-2">
                <label className="text-caption text-on-surface-variant">Đáp án đúng</label>
                <input 
                  type={questionType === QuestionTypeEnum.MCQ_SINGLE || questionType === QuestionTypeEnum.TRUE_FALSE ? "radio" : "checkbox"} 
                  {...form.register(`options.${index}.isCorrect`)}
                  className="w-5 h-5 accent-primary cursor-pointer"
                  // Handling radio logic for single correct answer manually via react-hook-form could be tricky, 
                  // but standard checkbox mapped via zod refinement is easier. 
                  // If single, we can just onChange manually to uncheck others, or let user check and Zod will error if >1.
                  onChange={(e) => {
                    const checked = e.target.checked;
                    form.setValue(`options.${index}.isCorrect`, checked, { shouldValidate: true });
                    
                    // Xử lý logic cho MCQ_SINGLE / TRUE_FALSE: Chỉ cho phép 1 đáp án đúng
                    if (checked && (questionType === QuestionTypeEnum.MCQ_SINGLE || questionType === QuestionTypeEnum.TRUE_FALSE)) {
                      fields.forEach((_, i) => {
                        if (i !== index) form.setValue(`options.${i}.isCorrect`, false, { shouldValidate: true });
                      });
                    }
                  }}
                  checked={form.watch(`options.${index}.isCorrect`)}
                />
              </div>

              {questionType !== QuestionTypeEnum.TRUE_FALSE && fields.length > 2 && (
                <button 
                  type="button" 
                  onClick={() => remove(index)}
                  className="text-error hover:bg-error-container p-2 rounded-lg mt-1 transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/30">
        <button type="button" onClick={() => window.history.back()} className="px-6 py-2.5 rounded-lg border border-outline font-label-md hover:bg-surface-container-highest transition-colors">
          Hủy bỏ
        </button>
        <button type="submit" disabled={isLoading} className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md hover:opacity-90 transition-opacity disabled:opacity-50">
          {isLoading ? "Đang lưu..." : "Lưu Câu Hỏi"}
        </button>
      </div>

    </form>
  );
}
