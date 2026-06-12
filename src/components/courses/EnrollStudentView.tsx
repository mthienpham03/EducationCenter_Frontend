"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { courseService, userService } from "@/lib/api";
import type { UserProfile, Enrollment, ClassEntity } from "@/lib/types/api.types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  transferred: "bg-secondary-fixed text-on-secondary-fixed-variant",
  completed: "bg-primary-fixed text-on-primary-fixed-variant",
  cancelled: "bg-surface-container-highest text-on-surface-variant",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Đang học",
  transferred: "Đã chuyển lớp",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export default function EnrollStudentView({ courseId, classId }: { courseId: string; classId: string }) {
  const [classEntity, setClassEntity] = useState<ClassEntity | null>(null);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [classRes, stuRes, enrRes] = await Promise.all([
        courseService.getClassById(classId),
        userService.getStudents(),
        courseService.getStudentsByClass(classId),
      ]);
      setClassEntity(classRes.data || null);
      setStudents(stuRes.data || []);
      setEnrollments(enrRes.data || []);
    } catch {
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEnroll = async () => {
    if (!selectedStudentId) return;
    setEnrolling(true);
    setError(null);
    try {
      const res = await courseService.enrollStudent(classId, { studentId: selectedStudentId });
      if (res.success) {
        await fetchData();
        setSelectedStudentId("");
      } else {
        setError(res.message || "Ghi danh thất bại");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đã có lỗi xảy ra");
    } finally {
      setEnrolling(false);
    }
  };

  const confirmRemove = async () => {
    if (!studentToRemove) return;
    setRemovingId(studentToRemove);
    try {
      const res = await courseService.removeStudent(classId, studentToRemove);
      if (res.success) {
        await fetchData();
      } else {
        setError(res.message || "Không thể xóa học viên");
      }
    } catch {
      setError("Không thể xóa học viên");
    } finally {
      setRemovingId(null);
      setStudentToRemove(null);
    }
  };

  const maxStudents = classEntity?.maxStudents;
  const activeCount = enrollments.filter((e) => e.status === "active").length;
  const isFull = maxStudents != null && activeCount >= maxStudents;

  const enrolledIds = new Set(enrollments.map((e) => e.studentId));
  const filteredStudents = students.filter(
    (s) =>
      !enrolledIds.has(s.id) &&
      (s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()))
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
        <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-tertiary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            group_add
          </span>
        </div>
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Quản lý học viên</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Lớp: <span className="font-bold text-primary">{classEntity?.name}</span>
            {maxStudents && (
              <span className={`ml-2 font-bold ${isFull ? "text-error" : "text-tertiary"}`}>
                ({activeCount}/{maxStudents} học viên)
              </span>
            )}
          </p>
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

          {isFull && (
            <div className="flex items-center gap-2 p-3 bg-secondary-fixed/50 border border-secondary/30 rounded-lg text-on-secondary-fixed-variant text-sm">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              Lớp đã đầy ({activeCount}/{maxStudents} học viên)
            </div>
          )}

          {/* Enroll form */}
          {!isFull && (
            <div className="bg-surface-container-low rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">person_add</span>
                Thêm học viên vào lớp
              </h3>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Tìm học viên theo tên hoặc email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {loading && filteredStudents.length === 0 ? (
                  <div className="text-center py-4 text-on-surface-variant text-sm">Đang tải...</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-4 text-on-surface-variant text-sm">
                    {search ? "Không tìm thấy học viên" : "Tất cả học viên đã được ghi danh"}
                  </div>
                ) : (
                  filteredStudents.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        selectedStudentId === s.id
                          ? "bg-primary-fixed border-primary/30 shadow-sm"
                          : "bg-white border-outline-variant/50 hover:bg-surface-container-low"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-base flex-shrink-0" style={{ color: "#005438" }}>
                        {s.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface text-sm truncate">{s.fullName}</p>
                        <p className="text-xs text-on-surface-variant truncate mt-0.5">{s.email}</p>
                      </div>
                      {selectedStudentId === s.id && (
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      )}
                    </button>
                  ))
                )}
              </div>

              <button
                id="enroll-student-btn"
                type="button"
                onClick={handleEnroll}
                disabled={!selectedStudentId || enrolling}
                className="w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {enrolling ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[20px]">add</span>
                )}
                Ghi danh học viên
              </button>
            </div>
          )}

          {/* Enrollment list */}
          <div>
            <h3 className="font-bold text-on-surface text-base mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-tertiary">groups</span>
              Danh sách học viên ({enrollments.length})
            </h3>
            {enrollments.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant text-sm bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-[40px] block mb-2 text-on-surface-variant/50">group_off</span>
                Chưa có học viên nào trong lớp
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {enrollments.map((e) => {
                  const stu = e.student || students.find((s) => s.id === e.studentId);
                  return (
                    <div key={e.studentId} className="flex flex-col p-4 bg-white border border-outline-variant/30 rounded-xl hover:shadow-md transition-all relative">
                      <button
                        onClick={() => setStudentToRemove(e.studentId)}
                        className="absolute top-3 right-3 p-1.5 hover:bg-error-container/30 text-on-surface-variant hover:text-error rounded-lg transition-colors"
                        title="Xóa khỏi lớp"
                      >
                        <span className="material-symbols-outlined text-[18px]">person_remove</span>
                      </button>
                      
                      <div className="flex items-start gap-3 mb-3 pr-8">
                        <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-base flex-shrink-0" style={{ color: "#005438" }}>
                          {(stu?.fullName || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface text-sm truncate">{stu?.fullName || e.studentId}</p>
                          {stu?.email && <p className="text-xs text-on-surface-variant truncate mt-0.5">{stu.email}</p>}
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${STATUS_COLORS[e.status] || STATUS_COLORS.active}`}>
                            {STATUS_LABELS[e.status] || e.status}
                          </span>
                          <span className="text-xs font-bold text-on-surface">{e.completedPercent}%</span>
                        </div>
                        <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${e.completedPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!studentToRemove}
        title="Xác nhận xóa học viên"
        message={
          <>
            Bạn có chắc chắn muốn xóa học viên này khỏi lớp học?
          </>
        }
        confirmText="Xóa học viên"
        cancelText="Đóng"
        onConfirm={confirmRemove}
        onCancel={() => setStudentToRemove(null)}
        isLoading={!!removingId}
      />
    </div>
  );
}
