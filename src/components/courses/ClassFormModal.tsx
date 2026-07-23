"use client";

import React, { useEffect, useState } from "react";
import { courseService } from "@/lib/api";
import type { ClassEntity, CreateClassRequest, UpdateClassRequest, ClassStatus } from "@/lib/types/api.types";

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseId: string;
  courseName?: string;
  editingClass?: ClassEntity | null;
}

const STATUS_OPTIONS: { value: ClassStatus; label: string }[] = [
  { value: "scheduled", label: "Đã lên lịch" },
  { value: "active", label: "Đang học" },
  { value: "on_hold", label: "Tạm dừng" },
  { value: "completed", label: "Đã kết thúc" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function ClassFormModal({
  isOpen,
  onClose,
  onSuccess,
  courseId,
  courseName,
  editingClass,
}: ClassFormModalProps) {
  const isEdit = !!editingClass;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateClassRequest>({
    name: "",
    maxStudents: undefined,
    status: "scheduled",
    expectedStartDate: "",
    expectedEndDate: "",
    scheduleNote: "",
  });

  useEffect(() => {
    if (editingClass) {
      setForm({
        name: editingClass.name,
        maxStudents: editingClass.maxStudents ?? undefined,
        status: editingClass.status,
        expectedStartDate: editingClass.expectedStartDate ? editingClass.expectedStartDate.split('T')[0] : "",
        expectedEndDate: editingClass.expectedEndDate ? editingClass.expectedEndDate.split('T')[0] : "",
        scheduleNote: editingClass.scheduleNote || "",
      });
    } else {
      setForm({ 
        name: "", 
        maxStudents: undefined, 
        status: "scheduled",
        expectedStartDate: "",
        expectedEndDate: "",
        scheduleNote: "",
      });
    }
    setError(null);
  }, [editingClass, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (form.expectedStartDate || form.expectedEndDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (form.expectedStartDate) {
          const start = new Date(form.expectedStartDate);
          if (start < today) {
            setError("Khai giảng dự kiến không được là ngày trong quá khứ.");
            setLoading(false);
            return;
          }
        }
        if (form.expectedEndDate) {
          const end = new Date(form.expectedEndDate);
          if (end < today) {
            setError("Kết thúc dự kiến không được nhỏ hơn ngày hiện tại.");
            setLoading(false);
            return;
          }
        }
        if (form.expectedStartDate && form.expectedEndDate) {
          const start = new Date(form.expectedStartDate);
          const end = new Date(form.expectedEndDate);
          if (start >= end) {
            setError("Khai giảng dự kiến phải nhỏ hơn kết thúc dự kiến.");
            setLoading(false);
            return;
          }
        }
      }

      const payload: any = { ...form };
      if (!payload.expectedStartDate) delete payload.expectedStartDate;
      if (!payload.expectedEndDate) delete payload.expectedEndDate;
      if (!payload.scheduleNote) delete payload.scheduleNote;

      let res;
      if (isEdit && editingClass) {
        res = await courseService.updateClass(editingClass.id, payload as UpdateClassRequest);
      } else {
        res = await courseService.createClass(courseId, payload as CreateClassRequest);
      }
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Đã có lỗi xảy ra");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || "Đã có lỗi xảy ra"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                meeting_room
              </span>
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md font-bold text-on-surface">
                {isEdit ? "Cập nhật lớp học" : "Thêm lớp học mới"}
              </h2>
              {courseName && (
                <p className="text-xs text-on-surface-variant mt-0.5">Thuộc khóa: <span className="font-semibold text-primary">{courseName}</span></p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-container/30 border border-error/30 rounded-lg text-error text-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Class Name */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">
              Tên lớp học <span className="text-error">*</span>
            </label>
            <input
              id="class-name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="VD: IELTS-F-2401"
              className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Max Students */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Sĩ số tối đa</label>
              <input
                id="class-max-students"
                name="maxStudents"
                type="number"
                min={1}
                max={200}
                value={form.maxStudents ?? ""}
                onChange={handleChange}
                placeholder="VD: 20"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">
                Trạng thái <span className="text-error">*</span>
              </label>
              <select
                id="class-status"
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

          <div className="grid grid-cols-2 gap-4">
            {/* Expected Start Date */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Khai giảng dự kiến</label>
              <input
                name="expectedStartDate"
                type="date"
                value={form.expectedStartDate || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Expected End Date */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Kết thúc dự kiến</label>
              <input
                name="expectedEndDate"
                type="date"
                value={form.expectedEndDate || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Schedule Note */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Ghi chú lịch học</label>
            <input
              name="scheduleNote"
              type="text"
              value={form.scheduleNote || ""}
              onChange={handleChange}
              placeholder="VD: Tối 2-4-6 (18h-20h)"
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
              id="class-form-submit"
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-tertiary-container text-white font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#006f4b" }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">{isEdit ? "save" : "add"}</span>
                  {isEdit ? "Lưu thay đổi" : "Tạo lớp học"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
