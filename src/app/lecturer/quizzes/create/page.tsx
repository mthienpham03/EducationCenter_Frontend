"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { quizService, courseService } from "@/lib/api/service";

export default function LecturerCreateQuizPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [form, setForm] = useState({
    courseId: "",
    title: "",
    durationMinutes: 15,
    maxAttempts: 1,
    shuffleQuestions: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const loadCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await courseService.getCourses();
        if (res.success) {
          setCourses(res.data || []);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách khóa học:", err);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, [mounted]);

  if (!mounted) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === "number") {
      setForm((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.courseId) {
      alert("Vui lòng chọn khóa học!");
      return;
    }
    if (!form.title.trim()) {
      alert("Vui lòng nhập tiêu đề đề thi!");
      return;
    }

    try {
      setLoading(true);
      const res = await quizService.createQuiz({
        courseId: form.courseId,
        title: form.title.trim(),
        durationMinutes: form.durationMinutes || undefined,
        maxAttempts: form.maxAttempts || 1,
        shuffleQuestions: form.shuffleQuestions,
      });

      if (res.success) {
        alert("Tạo đề thi thành công!");
        router.push("/lecturer/quizzes");
      } else {
        alert(res.message || "Không thể tạo đề thi");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi khi tạo đề thi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-stack-md max-w-2xl mx-auto space-y-stack-md">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/lecturer/quizzes")}
          className="p-2 rounded-lg hover:bg-surface-container-low transition-all"
        >
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Tạo Đề Thi Mới</h1>
          <p className="font-body-md text-on-surface-variant mt-1">Thiết lập thông tin cơ bản cho đề thi trắc nghiệm</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
        {/* Khóa học */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">
            Khóa học <span className="text-error">*</span>
          </label>
          {loadingCourses ? (
            <p className="text-on-surface-variant text-sm">Đang tải danh sách khóa học...</p>
          ) : (
            <select
              name="courseId"
              value={form.courseId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-outline-variant/50 rounded-xl bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            >
              <option value="">-- Chọn khóa học --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          )}
        </div>

        {/* Tiêu đề */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">
            Tiêu đề đề thi <span className="text-error">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ví dụ: Bài kiểm tra Chương 1"
            className="w-full px-4 py-3 border border-outline-variant/50 rounded-xl bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        {/* Thời gian và số lượt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Thời gian làm bài (phút)
            </label>
            <input
              type="number"
              name="durationMinutes"
              value={form.durationMinutes}
              onChange={handleChange}
              min={1}
              max={600}
              className="w-full px-4 py-3 border border-outline-variant/50 rounded-xl bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Số lượt làm bài tối đa
            </label>
            <input
              type="number"
              name="maxAttempts"
              value={form.maxAttempts}
              onChange={handleChange}
              min={1}
              max={100}
              className="w-full px-4 py-3 border border-outline-variant/50 rounded-xl bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Xáo trộn câu hỏi */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="shuffleQuestions"
            id="shuffleQuestions"
            checked={form.shuffleQuestions}
            onChange={handleChange}
            className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
          />
          <label htmlFor="shuffleQuestions" className="text-sm font-medium text-on-surface cursor-pointer">
            Xáo trộn câu hỏi ngẫu nhiên khi làm bài
          </label>
        </div>

        {/* Nút submit */}
        <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 bg-primary text-on-primary rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                Đang tạo...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Tạo đề thi
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/lecturer/quizzes")}
            className="px-6 py-3.5 border border-outline-variant/50 text-on-surface-variant rounded-xl font-semibold hover:bg-surface-container-low transition-all"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
