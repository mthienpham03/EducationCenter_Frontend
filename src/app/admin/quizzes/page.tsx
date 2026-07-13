"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizApi } from "@/lib/api/quiz.api";
import { QuizStatus } from "@/lib/types/quiz.type";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function AdminQuizzesPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // States for Filtering & Pagination
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Fetch data
  const { data: response, isLoading } = useQuery({
    queryKey: ["quizzes", { search, statusFilter, courseFilter }],
    queryFn: () => quizApi.getQuizzes({
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      courseId: courseFilter !== "all" ? courseFilter : undefined,
    }),
  });

  const quizzes = response?.data || [];

  // Derived unique courses from current data for the dropdown (in a real app you might want to fetch all courses)
  const uniqueCourses = useMemo(() => {
    const coursesMap = new Map<string, string>();
    quizzes.forEach((q) => {
      const courseId = q.courseId;
      const courseName = q.course?.title || q.course?.name || "Chưa phân loại";
      if (courseId && !coursesMap.has(courseId)) {
        coursesMap.set(courseId, courseName);
      }
    });
    return Array.from(coursesMap.entries()).map(([id, name]) => ({ id, name }));
  }, [quizzes]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => quizApi.deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setDeleteId(null);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Không thể xóa bài kiểm tra");
      setDeleteId(null);
    }
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const getStatusLabel = (status: QuizStatus) => {
    switch (status) {
      case QuizStatus.DRAFT: return { label: "Nháp", class: "bg-surface-container-high text-on-surface-variant" };
      case QuizStatus.OPEN: return { label: "Đang Mở", class: "bg-primary-container text-on-primary-container" };
      case QuizStatus.CLOSED: return { label: "Đã Đóng", class: "bg-error-container text-on-error-container" };
      case QuizStatus.ARCHIVED: return { label: "Lưu trữ", class: "bg-secondary-container text-on-secondary-container" };
      default: return { label: status, class: "bg-surface-container-high" };
    }
  };

  const totalPages = Math.max(1, Math.ceil(quizzes.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  
  const paginatedQuizzes = quizzes.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-stack-md max-w-container-max mx-auto p-stack-md">
      {/* Title & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Quản lý Bài Kiểm Tra</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Tạo và cấu hình các bài kiểm tra trắc nghiệm cho khóa học.
          </p>
        </div>
        <Link
          href="/admin/quizzes/create"
          className="bg-primary text-white font-label-md px-6 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo Bài Kiểm Tra
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-5 border-b border-outline-variant/20 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-surface-container-lowest">
          <div className="flex gap-4 flex-wrap items-center flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Tìm tiêu đề..."
                className="w-full pl-9 pr-4 py-2 bg-surface-container rounded-lg border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Course Filter */}
            <select 
              value={courseFilter}
              onChange={(e) => { setCourseFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[150px]"
            >
              <option value="all">Tất cả Khóa học</option>
              {uniqueCourses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value={QuizStatus.DRAFT}>Nháp</option>
              <option value={QuizStatus.OPEN}>Đang Mở</option>
              <option value={QuizStatus.CLOSED}>Đã Đóng</option>
              <option value={QuizStatus.ARCHIVED}>Lưu trữ</option>
            </select>
          </div>
          
          <div className="text-on-surface-variant text-sm font-medium whitespace-nowrap">
            {isLoading ? "Đang tải..." : `${quizzes.length} bài thi`}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <span className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-on-surface-variant text-sm">Đang tải dữ liệu...</span>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined text-[48px] opacity-30">quiz</span>
              <p className="font-medium">Không tìm thấy bài kiểm tra nào</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Khóa học</th>
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Thông tin</th>
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {paginatedQuizzes.map((q) => {
                  const statusInfo = getStatusLabel(q.status);
                  return (
                    <tr key={q.id} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="px-4 py-4 max-w-[250px]">
                        <p className="font-bold text-on-surface text-sm line-clamp-2" title={q.title}>
                          {q.title}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1">Cập nhật: {new Date(q.updatedAt).toLocaleDateString("vi-VN")}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-on-surface-variant max-w-[200px] truncate" title={q.course?.title || q.course?.name || "Chưa phân loại"}>
                          {q.course?.title || q.course?.name || "Chưa phân loại"}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 text-xs text-on-surface-variant">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">timer</span> {q.durationMinutes ? `${q.durationMinutes} phút` : 'Không giới hạn'}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">replay</span> {q.maxAttempts} lần thử</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/quizzes/${q.id}/questions`}
                            className="p-1.5 hover:bg-tertiary-container rounded-lg text-on-surface-variant hover:text-tertiary transition-colors inline-flex"
                            title="Quản lý câu hỏi"
                          >
                            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                          </Link>
                          <Link
                            href={`/admin/quizzes/${q.id}/edit`}
                            className="p-1.5 hover:bg-primary-fixed rounded-lg text-on-surface-variant hover:text-primary transition-colors inline-flex"
                            title="Sửa cấu hình"
                          >
                            <span className="material-symbols-outlined text-[18px]">settings</span>
                          </Link>
                          {q.status !== QuizStatus.OPEN && (
                            <button
                              onClick={() => setDeleteId(q.id)}
                              className="p-1.5 hover:bg-error-container/30 rounded-lg text-on-surface-variant hover:text-error transition-colors inline-flex"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && quizzes.length > 0 && (
          <div className="px-5 py-4 bg-surface-container-lowest border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-on-surface-variant">
              Hiển thị <span className="font-bold text-on-surface">{(safeCurrentPage - 1) * PAGE_SIZE + 1}–{Math.min(safeCurrentPage * PAGE_SIZE, quizzes.length)}</span> trong tổng số <span className="font-bold text-on-surface">{quizzes.length}</span>
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const isNear = Math.abs(page - safeCurrentPage) <= 1 || page === 1 || page === totalPages;
                  const isDot  = !isNear && (page === safeCurrentPage - 2 || page === safeCurrentPage + 2);
                  if (!isNear && !isDot) return null;
                  if (isDot) return <span key={page} className="w-8 text-center text-on-surface-variant text-sm">…</span>;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                        page === safeCurrentPage
                          ? "bg-primary text-white shadow-sm shadow-primary/30"
                          : "border border-outline-variant/50 text-on-surface-variant hover:bg-primary-fixed hover:text-primary"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa bài kiểm tra?"
        message="Hành động này không thể hoàn tác. Bài thi sẽ bị xóa khỏi hệ thống."
        confirmText={deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
        cancelText="Hủy"
        isDestructive={true}
      />
    </div>
  );
}