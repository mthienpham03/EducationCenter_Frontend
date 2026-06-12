"use client";

import React, { useEffect, useState } from "react";
import { courseService, userService } from "@/lib/api";
import type { UserProfile, TeachingAssignment } from "@/lib/types/api.types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface AssignLecturerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classId: string;
  className?: string;
}

const ROLE_OPTIONS = [
  { value: "main", label: "Giảng viên chính" },
  { value: "assistant", label: "Trợ giảng" },
  { value: "homeroom", label: "Giáo viên chủ nhiệm" },
];

export default function AssignLecturerModal({
  isOpen,
  onClose,
  onSuccess,
  classId,
  className: classNameProp,
}: AssignLecturerModalProps) {
  const [lecturers, setLecturers] = useState<UserProfile[]>([]);
  const [assigned, setAssigned] = useState<TeachingAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [selectedRole, setSelectedRole] = useState("main");

  // Remove confirm dialog states
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removingName, setRemovingName] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSearch("");
    setSelectedLecturerId("");
    setSelectedRole("main");
    fetchData();
  }, [isOpen, classId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lecRes, assRes] = await Promise.all([
        userService.getLecturers(),
        courseService.getLecturersByClass(classId),
      ]);
      setLecturers(lecRes.data || []);
      setAssigned(assRes.data || []);
    } catch {
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

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
        onSuccess();
      } else {
        setError(res.message || "Phân công thất bại");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đã có lỗi xảy ra");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveClick = (lecturerId: string, fullName: string) => {
    setRemovingId(lecturerId);
    setRemovingName(fullName);
  };

  const handleConfirmRemove = async () => {
    if (!removingId) return;
    setIsRemoving(true);
    setError(null);
    try {
      const res = await courseService.removeLecturer(classId, removingId);
      if (res.success) {
        await fetchData(); // refresh list
        onSuccess();
        setRemovingId(null);
      } else {
        setError(res.message || "Không thể hủy phân công");
        setRemovingId(null);
      }
    } catch {
      setError("Không thể hủy phân công");
      setRemovingId(null);
    } finally {
      setIsRemoving(false);
    }
  };

  const filteredLecturers = lecturers.filter(
    (l) =>
      !assigned.some((a) => a.lecturerId === l.id) &&
      (l.fullName.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                school
              </span>
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md font-bold text-on-surface">Phân công giảng viên</h2>
              {classNameProp && (
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Lớp: <span className="font-semibold text-primary">{classNameProp}</span>
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

          {/* Assign form */}
          <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">person_add</span>
              Thêm giảng viên vào lớp
            </h3>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                placeholder="Tìm giảng viên theo tên hoặc email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5">
              {loading ? (
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
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                      selectedLecturerId === l.id
                        ? "bg-primary-fixed border-primary/30"
                        : "bg-white border-outline-variant/50 hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {l.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-on-surface text-sm truncate">{l.fullName}</p>
                      <p className="text-xs text-on-surface-variant truncate">{l.email}</p>
                    </div>
                    {selectedLecturerId === l.id && (
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5 text-sm"
              >
                {assigning ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[16px]">add</span>
                )}
                Phân công
              </button>
            </div>
          </div>

          {/* Assigned list */}
          <div>
            <h3 className="font-bold text-on-surface text-sm mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-tertiary">groups</span>
              Giảng viên đã phân công ({assigned.length})
            </h3>
            {assigned.length === 0 ? (
              <div className="text-center py-6 text-on-surface-variant text-sm bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-[32px] block mb-2 text-on-surface-variant/50">person_off</span>
                Chưa có giảng viên nào được phân công
              </div>
            ) : (
              <div className="space-y-2">
                {assigned.map((a) => {
                  const lec = a.lecturer || lecturers.find((l) => l.id === a.lecturerId);
                  return (
                    <div key={a.lecturerId} className="flex items-center gap-3 p-3 bg-white border border-outline-variant/30 rounded-xl hover:shadow-sm transition-all">
                      <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {(lec?.fullName || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface text-sm">{lec?.fullName || a.lecturerId}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lec?.email && <span className="text-xs text-on-surface-variant">{lec.email}</span>}
                          <span className="px-2 py-0.5 bg-primary-fixed text-primary text-[10px] font-bold rounded-full">
                            {ROLE_OPTIONS.find((r) => r.value === a.role)?.label || a.role}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveClick(a.lecturerId, lec?.fullName || a.lecturerId)}
                        className="p-1.5 hover:bg-error-container/30 text-on-surface-variant hover:text-error rounded-lg transition-colors ml-auto"
                        title="Hủy phân công"
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

      {/* CONFIRM REMOVE DIALOG */}
      <ConfirmDialog
        isOpen={removingId !== null}
        title="Hủy phân công giảng viên"
        message={`Bạn có chắc chắn muốn hủy phân công giảng viên "${removingName}" khỏi lớp học này?`}
        confirmLabel="Hủy phân công"
        cancelLabel="Hủy"
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemovingId(null)}
        isDanger={true}
        isLoading={isRemoving}
      />
    </div>
  );
}
