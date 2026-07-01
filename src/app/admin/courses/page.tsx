"use client";

import React, { useEffect, useState, useCallback } from "react";
import { courseService } from "@/lib/api";
import type { Course, CourseStatus } from "@/lib/types/api.types";
import CourseFormModal from "@/components/courses/CourseFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── helpers ───────────────────────────────────────────────────────────────

const STATUS_PILL: Record<CourseStatus, { bg: string; text: string; label: string }> = {
  draft:     { bg: "#edeeef", text: "#434654", label: "Nháp" },
  published: { bg: "#6ffbbe", text: "#002113", label: "Đang diễn ra" },
  archived:  { bg: "#ffdbca", text: "#5c2400", label: "Lưu trữ" },
};

const LEVEL_COLORS: Record<string, string> = {
  Beginner:     "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  Intermediate: "bg-primary-fixed text-on-primary-fixed",
  Advanced:     "bg-secondary-fixed text-on-secondary-fixed-variant",
  Expert:       "bg-error-container text-on-error-container",
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

// ─── component ─────────────────────────────────────────────────────────────

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CourseStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await courseService.getCourses({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setCourses(res.data || []);
      setCurrentPage(1); // reset về trang đầu khi filter/search thay đổi
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

  const router = useRouter();

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowFormModal(true);
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    setDeletingId(courseToDelete.id);
    try {
      await courseService.deleteCourse(courseToDelete.id);
      showSuccess(`Đã xóa khóa học "${courseToDelete.name}"`);
      await fetchCourses();
      setCourseToDelete(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể xóa khóa học");
    } finally {
      setDeletingId(null);
    }
  };

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === "published").length,
    draft: courses.filter((c) => c.status === "draft").length,
    archived: courses.filter((c) => c.status === "archived").length,
  };

  const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
  const paginatedCourses = courses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-stack-md">
      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 bg-on-surface text-inverse-on-surface rounded-xl shadow-2xl animate-in slide-in-from-right-4 duration-300">
          <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">check_circle</span>
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {/* Breadcrumbs & Title */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-medium">EduCenter</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-xs font-bold text-primary">Khóa học</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Quản lý Khóa học</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Tạo, chỉnh sửa và quản lý các khóa học và lớp học tại trung tâm.</p>
        </div>
        <button
          id="add-course-btn"
          onClick={() => { setEditingCourse(null); setShowFormModal(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm khóa học
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng khóa học", value: stats.total, icon: "library_books", bg: "bg-primary-fixed", color: "text-primary" },
          { label: "Đang diễn ra", value: stats.published, icon: "play_circle", bg: "bg-tertiary-fixed", color: "text-tertiary" },
          { label: "Nháp", value: stats.draft, icon: "edit_note", bg: "bg-surface-container-high", color: "text-on-surface-variant" },
          { label: "Lưu trữ", value: stats.archived, icon: "archive", bg: "bg-secondary-fixed", color: "text-secondary" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-medium">{s.label}</p>
              <p className="font-headline-xl text-headline-xl text-on-surface leading-none mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-outline-variant/20 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-surface-container-lowest">
          <div className="flex gap-3 flex-wrap items-center">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                id="course-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm khóa học..."
                className="pl-9 pr-4 py-2 bg-surface-container rounded-lg border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64 transition-all"
              />
            </div>

            {/* Status filter tabs */}
            <div className="flex border border-outline-variant rounded-lg overflow-hidden">
              {(["all", "published", "draft", "archived"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-l border-outline-variant first:border-l-0 ${
                    statusFilter === s
                      ? "bg-primary-fixed text-primary font-bold"
                      : "hover:bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  {s === "all" ? "Tất cả" : STATUS_PILL[s as CourseStatus].label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-on-surface-variant text-sm font-medium">
            {loading ? "Đang tải..." : `${courses.length} khóa học`}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <span className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-on-surface-variant text-sm">Đang tải dữ liệu...</span>
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined text-[48px] opacity-30">library_books</span>
              <p className="font-medium">Không có khóa học nào</p>
              <p className="text-sm">Nhấn "Thêm khóa học" để bắt đầu</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  {["Khóa học", "Thời gian", "Trạng thái", "Lớp học", ""].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {paginatedCourses.map((course) => {
                  const pill = STATUS_PILL[course.status];
                  return (
                    <tr key={course.id} className="hover:bg-surface-container-lowest transition-colors group">
                      {/* Course info */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          {course.thumbnailUrl ? (
                            <img src={course.thumbnailUrl} alt={course.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-primary-fixed rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>library_books</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-on-surface truncate">{course.name}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5 font-mono">{course.code}</p>
                            {course.description && (
                              <p className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[220px]">{course.description}</p>
                            )}
                          </div>
                        </div>
                      </td>


                      {/* Date range */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-on-surface">{formatDate(course.startDate)}</span>
                          {course.endDate && (
                            <span className="text-[11px] text-on-surface-variant">→ {formatDate(course.endDate)}</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: pill.bg, color: pill.text }}
                        >
                          {pill.label}
                        </span>
                      </td>

                      {/* Class management */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/courses/${course.id}/classes`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">meeting_room</span>
                          Quản lý lớp
                        </Link>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(course)}
                            className="p-1.5 hover:bg-primary-fixed rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(course)}
                            disabled={deletingId === course.id}
                            className="p-1.5 hover:bg-error-container/30 rounded-lg text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
                            title="Xóa"
                          >
                            {deletingId === course.id ? (
                              <span className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin block" />
                            ) : (
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer / Pagination */}
        {!loading && courses.length > 0 && (
          <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-on-surface-variant">
              Hiển thị <span className="font-bold text-on-surface">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, courses.length)}</span> trong tổng số <span className="font-bold text-on-surface">{courses.length}</span> khóa học
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

      {/* Modals */}
      <CourseFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSuccess={() => { showSuccess(editingCourse ? "Cập nhật khóa học thành công!" : "Tạo khóa học thành công!"); fetchCourses(); }}
        editingCourse={editingCourse}
      />

      <ConfirmDialog
        isOpen={!!courseToDelete}
        title="Xác nhận xóa khóa học"
        message={
          <>
            Bạn có chắc chắn muốn xóa khóa học <span className="font-bold text-on-surface">{courseToDelete?.name}</span> không? Hành động này không thể hoàn tác.
          </>
        }
        confirmText="Xóa khóa học"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setCourseToDelete(null)}
        isLoading={!!deletingId}
      />
    </div>
  );
}
