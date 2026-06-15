"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 5;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const totalPages = Math.max(1, Math.ceil(classes.length / PAGE_SIZE));
  const paginatedClasses = classes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm">
        {/* Toolbar */}
        <div className="p-5 border-b border-outline-variant/20 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-surface-container-lowest">
          <div className="flex gap-3 flex-wrap items-center">
             <h3 className="text-base font-bold text-on-surface">Danh sách lớp học</h3>
          </div>
        </div>

        {/* Table */}
        <div>
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
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {paginatedClasses.map((cls) => (
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
                    <td className="px-6 py-4 text-right">

                      {/* Menu thao tác */}
                      <div className="relative inline-block" ref={openMenuId === cls.id ? menuRef : undefined}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === cls.id ? null : cls.id)}
                          className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-all"
                          title="Thao tác"
                        >
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>

                        {openMenuId === cls.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-52 bg-white border border-outline-variant rounded-xl shadow-lg z-50 py-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                            <Link
                              href={`/admin/courses/${courseId}/classes/${cls.id}/students`}
                              className="flex items-center gap-2.5 px-4 py-3 hover:bg-surface-container-low transition-colors text-sm text-on-surface"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">group</span>
                              Quản lý học viên
                            </Link>
                            <Link
                              href={`/admin/courses/${courseId}/classes/${cls.id}/lecturers`}
                              className="flex items-center gap-2.5 px-4 py-3 hover:bg-surface-container-low transition-colors text-sm text-on-surface"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">school</span>
                              Quản lý giảng viên
                            </Link>
                            <button
                              onClick={() => { openEdit(cls); setOpenMenuId(null); }}
                              className="flex items-center gap-2.5 px-4 py-3 hover:bg-surface-container-low transition-colors text-sm text-on-surface w-full text-left"
                            >
                              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">edit</span>
                              Chỉnh sửa lớp
                            </button>
                            <div className="border-t border-outline-variant/30 my-1" />
                            <button
                              onClick={() => { handleDeleteClick(cls); setOpenMenuId(null); }}
                              disabled={deletingId === cls.id}
                              className="flex items-center gap-2.5 px-4 py-3 hover:bg-error-container/20 transition-colors text-sm text-error w-full text-left disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                              Xóa lớp
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer / Pagination */}
        {!loading && classes.length > 0 && (
          <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-on-surface-variant">
              Hiển thị <span className="font-bold text-on-surface">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, classes.length)}</span> trong tổng số <span className="font-bold text-on-surface">{classes.length}</span> lớp học
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Trang trước"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const isNear = Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
                  const isDot  = !isNear && (page === currentPage - 2 || page === currentPage + 2);
                  if (!isNear && !isDot) return null;
                  if (isDot) return <span key={page} className="w-8 text-center text-on-surface-variant text-sm">…</span>;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                        page === currentPage
                          ? "bg-primary text-white shadow-sm shadow-primary/30"
                          : "border border-outline-variant/50 text-on-surface-variant hover:bg-primary-fixed hover:text-primary"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Trang tiếp"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        )}
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
