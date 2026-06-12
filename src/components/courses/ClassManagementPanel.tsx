"use client";

import React, { useEffect, useState, useCallback } from "react";
import { courseService } from "@/lib/api";
import type { ClassEntity, Course } from "@/lib/types/api.types";
import ClassFormModal from "./ClassFormModal";
import AssignLecturerModal from "./AssignLecturerModal";
import EnrollStudentModal from "./EnrollStudentModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ClassManagementPanelProps {
  course: Course;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-surface-container-highest text-on-surface-variant",
  published: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  archived: "bg-secondary-fixed text-on-secondary-fixed-variant",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Nháp",
  published: "Đang học",
  archived: "Lưu trữ",
};

type ActiveModal = null | "createClass" | "editClass" | "assignLecturer" | "enrollStudent";

export default function ClassManagementPanel({ course, onClose }: ClassManagementPanelProps) {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedClass, setSelectedClass] = useState<ClassEntity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Class delete confirm states
  const [classToDelete, setClassToDelete] = useState<ClassEntity | null>(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await courseService.getClassesByCourse(course.id);
      setClasses(res.data || []);
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [course.id]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleDeleteClick = (cls: ClassEntity) => {
    setClassToDelete(cls);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    setDeletingId(classToDelete.id);
    try {
      await courseService.deleteClass(classToDelete.id);
      setClassToDelete(null);
      await fetchClasses();
    } catch {
      alert("Không thể xóa lớp học này");
      setClassToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (cls: ClassEntity) => {
    setSelectedClass(cls);
    setActiveModal("editClass");
  };

  const openAssignLecturer = (cls: ClassEntity) => {
    setSelectedClass(cls);
    setActiveModal("assignLecturer");
  };

  const openEnrollStudent = (cls: ClassEntity) => {
    setSelectedClass(cls);
    setActiveModal("enrollStudent");
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between flex-shrink-0 bg-surface-container-lowest rounded-t-2xl">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Khóa học</span>
                  <span className="material-symbols-outlined text-xs text-on-surface-variant">chevron_right</span>
                  <span className="text-xs font-bold text-primary">{course.name}</span>
                </div>
                <h2 className="text-headline-md font-headline-md font-bold text-on-surface mt-0.5">
                  Quản lý lớp học
                </h2>
              </div>
            </div>
            <button
              id="add-class-btn"
              onClick={() => { setSelectedClass(null); setActiveModal("createClass"); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Thêm lớp học
            </button>
          </div>

          {/* Stats */}
          <div className="px-6 py-4 flex gap-4 border-b border-outline-variant/20 flex-shrink-0 bg-surface-container-lowest/50">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-primary-fixed rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[16px]">meeting_room</span>
              </div>
              <div>
                <span className="font-bold text-on-surface">{classes.length}</span>
                <span className="text-on-surface-variant ml-1">Lớp học</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-tertiary-fixed rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]" style={{ color: "#005438" }}>play_circle</span>
              </div>
              <div>
                <span className="font-bold text-on-surface">{classes.filter((c) => c.status === "published").length}</span>
                <span className="text-on-surface-variant ml-1">Đang học</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm ml-auto">
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{
                background: course.status === "published" ? "#6ffbbe" : course.status === "archived" ? "#ffdbca" : "#edeeef",
                color: course.status === "published" ? "#002113" : course.status === "archived" ? "#5c2400" : "#434654",
              }}>
                {course.status === "published" ? "Đang xuất bản" : course.status === "archived" ? "Lưu trữ" : "Nháp"}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">{course.code}</span>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="flex flex-col items-center gap-3">
                  <span className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <span className="text-on-surface-variant text-sm">Đang tải danh sách lớp...</span>
                </div>
              </div>
            ) : classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] mb-3 opacity-30">meeting_room</span>
                <p className="font-medium">Chưa có lớp học nào</p>
                <p className="text-sm mt-1">Nhấn "Thêm lớp học" để bắt đầu</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low sticky top-0 z-10">
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Tên lớp</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Sĩ số</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Giảng viên</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Học viên</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-primary">{cls.name}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[180px]">ID: {cls.id.slice(0, 8)}...</p>
                      </td>
                      <td className="px-6 py-4 min-w-[140px]">
                        {cls.maxStudents ? (
                          <>
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-xs font-bold">{cls.enrollmentCount ?? 0}/{cls.maxStudents}</span>
                              <span className="text-[10px] text-on-surface-variant">
                                {Math.round(((cls.enrollmentCount ?? 0) / cls.maxStudents) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-surface-container-highest rounded-full h-1.5">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min(((cls.enrollmentCount ?? 0) / cls.maxStudents) * 100, 100)}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-on-surface-variant">Không giới hạn</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[cls.status]}`}>
                          {STATUS_LABELS[cls.status] || cls.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openAssignLecturer(cls)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-fixed text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">school</span>
                          Phân công
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openEnrollStudent(cls)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-tertiary-fixed text-xs font-bold rounded-lg hover:opacity-80 transition-all"
                          style={{ color: "#005438" }}
                        >
                          <span className="material-symbols-outlined text-[14px]">group_add</span>
                          Ghi danh
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(cls)}
                            className="p-1.5 hover:bg-primary-fixed rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(cls)}
                            disabled={deletingId === cls.id}
                            className="p-1.5 hover:bg-error-container/30 rounded-lg text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
                            title="Xóa"
                          >
                            {deletingId === cls.id && classToDelete?.id === cls.id ? (
                              <span className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin block" />
                            ) : (
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <ClassFormModal
        isOpen={activeModal === "createClass" || activeModal === "editClass"}
        onClose={() => setActiveModal(null)}
        onSuccess={fetchClasses}
        courseId={course.id}
        courseName={course.name}
        editingClass={activeModal === "editClass" ? selectedClass : null}
      />

      {selectedClass && (
        <>
          <AssignLecturerModal
            isOpen={activeModal === "assignLecturer"}
            onClose={() => setActiveModal(null)}
            onSuccess={fetchClasses}
            classId={selectedClass.id}
            className={selectedClass.name}
          />
          <EnrollStudentModal
            isOpen={activeModal === "enrollStudent"}
            onClose={() => setActiveModal(null)}
            onSuccess={fetchClasses}
            classId={selectedClass.id}
            className={selectedClass.name}
            maxStudents={selectedClass.maxStudents}
          />
        </>
      )}

      {/* CONFIRM DELETE CLASS DIALOG */}
      <ConfirmDialog
        isOpen={classToDelete !== null}
        title="Xóa lớp học"
        message={`Bạn có chắc chắn muốn xóa lớp học "${classToDelete?.name}"? Hành động này không thể hoàn tác và mọi dữ liệu về học viên, giảng viên phân công trong lớp sẽ bị mất.`}
        confirmLabel="Xóa lớp"
        cancelLabel="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setClassToDelete(null)}
        isDanger={true}
        isLoading={deletingId === classToDelete?.id}
      />
    </>
  );
}
