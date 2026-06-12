"use client";

import React, { useEffect, useState } from "react";
import { courseService, userService } from "@/lib/api";
import type { UserProfile, Enrollment } from "@/lib/types/api.types";

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classId: string;
  className?: string;
  maxStudents?: number | null;
}

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

export default function EnrollStudentModal({
  isOpen,
  onClose,
  onSuccess,
  classId,
  className: classNameProp,
  maxStudents,
}: EnrollStudentModalProps) {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSearch("");
    setSelectedStudentId("");
    fetchData();
  }, [isOpen, classId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, enrRes] = await Promise.all([
        userService.getStudents(),
        courseService.getStudentsByClass(classId),
      ]);
      setStudents(stuRes.data || []);
      setEnrollments(enrRes.data || []);
    } catch {
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudentId) return;
    setEnrolling(true);
    setError(null);
    try {
      const res = await courseService.enrollStudent(classId, { studentId: selectedStudentId });
      if (res.success) {
        await fetchData();
        setSelectedStudentId("");
        onSuccess();
      } else {
        setError(res.message || "Ghi danh thất bại");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đã có lỗi xảy ra");
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemove = async (studentId: string) => {
    if (!confirm("Xóa học viên này khỏi lớp?")) return;
    try {
      const res = await courseService.removeStudent(classId, studentId);
      if (res.success) {
        await fetchData();
        onSuccess();
      } else {
        setError(res.message || "Không thể xóa học viên");
      }
    } catch {
      setError("Không thể xóa học viên");
    }
  };

  const activeCount = enrollments.filter((e) => e.status === "active").length;
  const isFull = maxStudents != null && activeCount >= maxStudents;

  const enrolledIds = new Set(enrollments.map((e) => e.studentId));
  const filteredStudents = students.filter(
    (s) =>
      !enrolledIds.has(s.id) &&
      (s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(111,251,190,0.2)" }}>
              <span className="material-symbols-outlined" style={{ color: "#005438", fontVariationSettings: "'FILL' 1" }}>
                group_add
              </span>
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md font-bold text-on-surface">Quản lý học viên</h2>
              {classNameProp && (
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Lớp: <span className="font-semibold text-primary">{classNameProp}</span>
                  {maxStudents && (
                    <span className={`ml-2 font-bold ${isFull ? "text-error" : "text-tertiary"}`}>
                      ({activeCount}/{maxStudents} học viên)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
            <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">person_add</span>
                Thêm học viên vào lớp
              </h3>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Tìm học viên theo tên hoặc email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5">
                {loading ? (
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
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                        selectedStudentId === s.id
                          ? "bg-primary-fixed border-primary/30"
                          : "bg-white border-outline-variant/50 hover:bg-surface-container-low"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ color: "#005438" }}>
                        {s.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-on-surface text-sm truncate">{s.fullName}</p>
                        <p className="text-xs text-on-surface-variant truncate">{s.email}</p>
                      </div>
                      {selectedStudentId === s.id && (
                        <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
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
                className="w-full py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm"
              >
                {enrolling ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[16px]">add</span>
                )}
                Ghi danh học viên
              </button>
            </div>
          )}

          {/* Enrollment list */}
          <div>
            <h3 className="font-bold text-on-surface text-sm mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-tertiary">groups</span>
              Danh sách học viên ({enrollments.length})
            </h3>
            {enrollments.length === 0 ? (
              <div className="text-center py-6 text-on-surface-variant text-sm bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-[32px] block mb-2 text-on-surface-variant/50">group_off</span>
                Chưa có học viên nào trong lớp
              </div>
            ) : (
              <div className="space-y-2">
                 {enrollments.map((e) => {
                  const stu = e.student || students.find((s) => s.id === e.studentId);
                  return (
                    <div key={e.studentId} className="flex items-center gap-3 p-3 bg-white border border-outline-variant/30 rounded-xl hover:shadow-sm transition-all">
                      <div className="w-9 h-9 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ color: "#005438" }}>
                        {(stu?.fullName || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface text-sm">{stu?.fullName || e.studentId}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {stu?.email && <span className="text-xs text-on-surface-variant truncate">{stu.email}</span>}
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${STATUS_COLORS[e.status] || STATUS_COLORS.active}`}>
                            {STATUS_LABELS[e.status] || e.status}
                          </span>
                          <span className="text-xs text-on-surface-variant">ID: {e.studentId.slice(0,8)}...</span>
                        </div>
                      </div>
                      {/* Progress */}
                      <div className="flex flex-col items-end gap-1 min-w-[80px]">
                        <span className="text-xs font-bold text-on-surface">{e.completedPercent}%</span>
                        <div className="w-16 bg-surface-container-highest rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${e.completedPercent}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(e.studentId)}
                        className="p-1.5 hover:bg-error-container/30 text-on-surface-variant hover:text-error rounded-lg transition-colors ml-2"
                        title="Xóa khỏi lớp"
                      >
                        <span className="material-symbols-outlined text-[18px]">person_remove</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-outline-variant/30 px-6 py-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-surface-container-high transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
