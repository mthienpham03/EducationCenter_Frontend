"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { courseService } from "@/lib/api";
import type { ClassEntity, Course } from "@/lib/types/api.types";
import ClassFormModal from "@/components/courses/ClassFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Link from "next/link";

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

type ActiveModal = null | "createClass" | "editClass";

export default function ClassManagementView({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedClass, setSelectedClass] = useState<ClassEntity | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassEntity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await courseService.getCourseById(courseId);
      setCourse(res.data || null);
    } catch {
      router.push("/admin/courses");
    }
  }, [courseId, router]);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await courseService.getClassesByCourse(courseId);
      setClasses(res.data || []);
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
    fetchClasses();
  }, [fetchCourse, fetchClasses]);

  const handleDeleteClick = (cls: ClassEntity) => {
    setClassToDelete(cls);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;
    setDeletingId(classToDelete.id);
    try {
      await courseService.deleteClass(classToDelete.id);
      await fetchClasses();
      setClassToDelete(null);
    } catch {
      alert("Không thể xóa lớp học này");
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (cls: ClassEntity) => {
    setSelectedClass(cls);
    setActiveModal("editClass");
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-stack-md">
      {/* Breadcrumbs & Title */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <Link href="/admin/courses" className="text-xs font-medium hover:text-primary transition-colors">Khóa học</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-xs font-bold text-primary">{course.name}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Quản lý Lớp học</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Quản lý danh sách lớp, học viên và giảng viên của khóa học.</p>
        </div>
        <button
          id="add-class-btn"
          onClick={() => { setSelectedClass(null); setActiveModal("createClass"); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm lớp học
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-fixed text-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>meeting_room</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-medium">Tổng số lớp</p>
            <p className="font-headline-xl text-headline-xl text-on-surface leading-none mt-0.5">{classes.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-tertiary-fixed text-tertiary rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-medium">Đang học</p>
            <p className="font-headline-xl text-headline-xl text-on-surface leading-none mt-0.5">
              {classes.filter((c) => c.status === "published").length}
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-outline-variant/20 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-surface-container-lowest">
          <div className="flex gap-3 flex-wrap items-center">
             <h3 className="text-base font-bold text-on-surface">Danh sách lớp học</h3>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <span className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-on-surface-variant text-sm">Đang tải danh sách lớp...</span>
              </div>
            </div>
          ) : classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined text-[48px] opacity-30">meeting_room</span>
              <p className="font-medium">Chưa có lớp học nào</p>
              <p className="text-sm">Nhấn "Thêm lớp học" để bắt đầu</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Tên lớp</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Sĩ số</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Trạng thái</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Giảng viên</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Học viên</th>
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
                      <Link
                        href={`/admin/courses/${courseId}/classes/${cls.id}/lecturers`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-fixed text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        <span className="material-symbols-outlined text-[14px]">school</span>
                        Phân công
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/courses/${courseId}/classes/${cls.id}/students`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-tertiary-fixed text-xs font-bold rounded-lg hover:opacity-80 transition-all"
                        style={{ color: "#005438" }}
                      >
                        <span className="material-symbols-outlined text-[14px]">group_add</span>
                        Ghi danh
                      </Link>
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
                          {deletingId === cls.id ? (
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

      {/* Sub-modals */}
      <ClassFormModal
        isOpen={activeModal === "createClass" || activeModal === "editClass"}
        onClose={() => setActiveModal(null)}
        onSuccess={fetchClasses}
        courseId={courseId}
        courseName={course.name}
        editingClass={activeModal === "editClass" ? selectedClass : null}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!classToDelete}
        title="Xác nhận xóa lớp học"
        message={
          <>
            Bạn có chắc chắn muốn xóa lớp học <span className="font-bold text-on-surface">{classToDelete?.name}</span> không? Hành động này không thể hoàn tác.
          </>
        }
        confirmText="Xóa lớp học"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setClassToDelete(null)}
        isLoading={!!deletingId}
      />
    </div>
  );
}
