"use client";

import React, { useEffect, useState } from "react";
import { courseService } from "@/lib/api";
import type { Course, CreateCourseRequest, UpdateCourseRequest, CourseStatus } from "@/lib/types/api.types";

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCourse?: Course | null;
}

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: "draft", label: "Nháp" },
  { value: "published", label: "Đã xuất bản" },
  { value: "archived", label: "Lưu trữ" },
];

export default function CourseFormModal({ isOpen, onClose, onSuccess, editingCourse }: CourseFormModalProps) {
  const isEdit = !!editingCourse;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateCourseRequest>({
    code: "",
    name: "",
    description: "",
    thumbnailUrl: "",
    level: "",
    status: "draft",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (editingCourse) {
      setForm({
        code: editingCourse.code,
        name: editingCourse.name,
        description: editingCourse.description || "",
        thumbnailUrl: editingCourse.thumbnailUrl || "",
        level: editingCourse.level || "",
        status: editingCourse.status,
        startDate: editingCourse.startDate ? editingCourse.startDate.split("T")[0] : "",
        endDate: editingCourse.endDate ? editingCourse.endDate.split("T")[0] : "",
      });
    } else {
      setForm({ code: "", name: "", description: "", thumbnailUrl: "", level: "", status: "draft", startDate: "", endDate: "" });
    }
    setError(null);
  }, [editingCourse, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: CreateCourseRequest = {
        ...form,
        description: form.description || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        level: form.level || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };
      let res;
      if (isEdit && editingCourse) {
        res = await courseService.updateCourse(editingCourse.id, payload as UpdateCourseRequest);
      } else {
        res = await courseService.createCourse(payload);
      }
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Đã có lỗi xảy ra");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                library_books
              </span>
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md font-bold text-on-surface">
                {isEdit ? "Cập nhật khóa học" : "Thêm khóa học mới"}
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {isEdit ? "Chỉnh sửa thông tin khóa học" : "Điền thông tin để tạo khóa học mới"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-container/30 border border-error/30 rounded-lg text-error text-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">
                Mã khóa học <span className="text-error">*</span>
              </label>
              <input
                id="course-code"
                name="code"
                type="text"
                required
                value={form.code}
                onChange={handleChange}
                placeholder="VD: IELTS-F-2024"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">
                Tên khóa học <span className="text-error">*</span>
              </label>
              <input
                id="course-name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="VD: IELTS Foundation"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Mô tả khóa học</label>
            <textarea
              id="course-description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Nhập mô tả ngắn về nội dung và mục tiêu khóa học..."
              className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Level */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Cấp độ</label>
              <select
                id="course-level"
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">-- Chọn cấp độ --</option>
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">
                Trạng thái <span className="text-error">*</span>
              </label>
              <select
                id="course-status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Ngày bắt đầu</label>
              <input
                id="course-start-date"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Ngày kết thúc</label>
              <input
                id="course-end-date"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">URL Ảnh bìa</label>
            <input
              id="course-thumbnail"
              name="thumbnailUrl"
              type="url"
              value={form.thumbnailUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-surface-container-high transition-all"
            >
              Hủy
            </button>
            <button
              id="course-form-submit"
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">{isEdit ? "save" : "add"}</span>
                  {isEdit ? "Lưu thay đổi" : "Tạo khóa học"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
