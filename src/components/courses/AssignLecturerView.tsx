"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { courseService, userService } from "@/lib/api";
import type { UserProfile, TeachingAssignment, ClassEntity } from "@/lib/types/api.types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const ROLE_OPTIONS = [
  { value: "main", label: "Giảng viên chính" },
  { value: "assistant", label: "Trợ giảng" },
  { value: "homeroom", label: "Giáo viên chủ nhiệm" },
];

export default function AssignLecturerView({ courseId, classId }: { courseId: string; classId: string }) {
  const [classEntity, setClassEntity] = useState<ClassEntity | null>(null);
  const [lecturers, setLecturers] = useState<UserProfile[]>([]);
  const [assigned, setAssigned] = useState<TeachingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [selectedRole, setSelectedRole] = useState("main");

  const [lecturerToRemove, setLecturerToRemove] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [classRes, lecRes, assRes] = await Promise.all([
        courseService.getClassById(classId),
        userService.getLecturers(),
        courseService.getLecturersByClass(classId),
      ]);
      setClassEntity(classRes.data || null);
      setLecturers(lecRes.data || []);
      setAssigned(assRes.data || []);
    } catch {
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssign = async () => {
    if (!selectedLecturerId) return;
    setAssigning(true);
    setError(null);
    try {
      const res = await courseService.assignLecturer(classId, {
        lecturerId: selectedLecturerId,
        role: selectedRole,
      });
      if (res.success) {
        await fetchData();
        setSelectedLecturerId("");
      } else {
        setError(res.message || "Phân công thất bại");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || "Đã có lỗi xảy ra"));
    } finally {
      setAssigning(false);
    }
  };

  const confirmRemove = async () => {
    if (!lecturerToRemove) return;
    setRemovingId(lecturerToRemove);
    try {
      const res = await courseService.removeLecturer(classId, lecturerToRemove);
      if (res.success) {
        await fetchData();
      } else {
        setError(res.message || "Không thể hủy phân công");
      }
    } catch {
      setError("Không thể hủy phân công");
    } finally {
      setRemovingId(null);
      setLecturerToRemove(null);
    }
  };

  const filteredLecturers = lecturers.filter(
    (l) =>
      !assigned.some((a) => a.lecturerId === l.id) &&
      (l.fullName.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading && !classEntity) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-stack-md">
      {/* Breadcrumbs & Title */}
      <div className="flex items-center gap-2 text-on-surface-variant mb-2">
        <Link href={`/admin/courses/${courseId}/classes`} className="text-xs font-medium hover:text-primary transition-colors">Quản lý lớp</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-xs font-bold text-primary">{classEntity?.name || "Lớp học"}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            school
          </span>
        </div>
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Phân công giảng viên</h1>
          <p className="text-sm text-on-surface-variant mt-1">Lớp: <span className="font-bold text-primary">{classEntity?.name}</span></p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden mt-6">
        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-container/30 border border-error/30 rounded-lg text-error text-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Assign form */}
          <div className="bg-surface-container-low rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">person_add</span>
              Thêm giảng viên vào lớp
            </h3>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                placeholder="Tìm giảng viên theo tên hoặc email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {loading && filteredLecturers.length === 0 ? (
                <div className="text-center py-4 text-on-surface-variant text-sm">Đang tải...</div>
              ) : filteredLecturers.length === 0 ? (
                <div className="text-center py-4 text-on-surface-variant text-sm">
                  {search ? "Không tìm thấy giảng viên" : "Tất cả giảng viên đã được phân công"}
                </div>
              ) : (
                filteredLecturers.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSelectedLecturerId(l.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      selectedLecturerId === l.id
                        ? "bg-primary-fixed border-primary/30 shadow-sm"
                        : "bg-white border-outline-variant/50 hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-base flex-shrink-0">
                      {l.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface text-sm truncate">{l.fullName}</p>
                      <p className="text-xs text-on-surface-variant truncate mt-0.5">{l.email}</p>
                    </div>
                    {selectedLecturerId === l.id && (
                      <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="flex gap-4 items-center">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <button
                id="assign-lecturer-btn"
                type="button"
                onClick={handleAssign}
                disabled={!selectedLecturerId || assigning}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {assigning ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">add</span>
                )}
                Phân công
              </button>
            </div>
          </div>

          {/* Assigned list */}
          <div>
            <h3 className="font-bold text-on-surface text-base mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-tertiary">groups</span>
              Giảng viên đã phân công ({assigned.length})
            </h3>
            {assigned.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant text-sm bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-[40px] block mb-2 text-on-surface-variant/50">person_off</span>
                Chưa có giảng viên nào được phân công
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assigned.map((a) => {
                  const lec = a.lecturer || lecturers.find((l) => l.id === a.lecturerId);
                  return (
                    <div key={a.lecturerId} className="flex items-center gap-4 p-4 bg-white border border-outline-variant/30 rounded-xl hover:shadow-md transition-all">
                      <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                        {(lec?.fullName || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface text-base">{lec?.fullName || a.lecturerId}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {lec?.email && <span className="text-xs text-on-surface-variant truncate">{lec.email}</span>}
                        </div>
                        <div className="mt-2">
                          <span className="px-2.5 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-md">
                            {ROLE_OPTIONS.find((r) => r.value === a.role)?.label || a.role}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setLecturerToRemove(a.lecturerId)}
                        className="p-2 hover:bg-error-container/30 text-on-surface-variant hover:text-error rounded-xl transition-colors ml-auto self-start"
                        title="Hủy phân công"
                      >
                        <span className="material-symbols-outlined text-[20px]">person_remove</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!lecturerToRemove}
        title="Xác nhận hủy phân công"
        message={
          <>
            Bạn có chắc chắn muốn hủy phân công giảng viên này khỏi lớp học?
          </>
        }
        confirmText="Hủy phân công"
        cancelText="Đóng"
        onConfirm={confirmRemove}
        onCancel={() => setLecturerToRemove(null)}
        isLoading={!!removingId}
      />
    </div>
  );
}
