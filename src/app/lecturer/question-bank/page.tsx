"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionBankApi } from "@/lib/api/question-bank.api";
import { QuestionTypeEnum, QuestionApprovalStatus } from "@/lib/types/question.type";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import QuestionDetailModal from "@/components/ui/QuestionDetailModal";

const APPROVAL_BADGES: Record<QuestionApprovalStatus, { bg: string; text: string; label: string; icon: string }> = {
  [QuestionApprovalStatus.PENDING]: { bg: "bg-amber-100 border-amber-300", text: "text-amber-800", label: "Chờ duyệt", icon: "hourglass_top" },
  [QuestionApprovalStatus.APPROVED]: { bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-800", label: "Đã duyệt", icon: "check_circle" },
  [QuestionApprovalStatus.REJECTED]: { bg: "bg-red-100 border-red-300", text: "text-red-800", label: "Bị từ chối", icon: "cancel" },
};

export default function QuestionBankPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailQuestionId, setDetailQuestionId] = useState<string | null>(null);

  // States for Filtering & Pagination
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Fetch data
  const { data: response, isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: () => questionBankApi.getQuestions(),
  });

  const questions = response?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionBankApi.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      setDeleteId(null);
    },
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case QuestionTypeEnum.MCQ_SINGLE:
        return "Một đáp án";
      case QuestionTypeEnum.MCQ_MULTIPLE:
        return "Nhiều đáp án";
      case QuestionTypeEnum.TRUE_FALSE:
        return "Đúng/Sai";
      default:
        return type;
    }
  };

  // Derive unique courses for the dropdown
  const uniqueCourses = useMemo(() => {
    const coursesMap = new Map<string, string>();
    questions.forEach((q) => {
      const courseId = q.courseId;
      const courseName = (q.course as any)?.title || (q.course as any)?.name || "Chưa phân loại";
      if (courseId && !coursesMap.has(courseId)) {
        coursesMap.set(courseId, courseName);
      }
    });
    return Array.from(coursesMap.entries()).map(([id, name]) => ({ id, name }));
  }, [questions]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        q.content.toLowerCase().includes(search.toLowerCase()) ||
        (q.creator?.fullName && q.creator.fullName.toLowerCase().includes(search.toLowerCase()));
      const matchCourse = courseFilter === "all" || q.courseId === courseFilter;
      const matchType = typeFilter === "all" || q.questionType === typeFilter;
      const matchDiff = difficultyFilter === "all" || q.difficulty === difficultyFilter;
      const matchApproval = approvalFilter === "all" || q.approvalStatus === approvalFilter;
      return matchSearch && matchCourse && matchType && matchDiff && matchApproval;
    });
  }, [questions, search, courseFilter, typeFilter, difficultyFilter, approvalFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  
  const paginatedQuestions = filteredQuestions.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-stack-md max-w-container-max mx-auto p-stack-md">
      {/* Title & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Ngân hàng câu hỏi</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Quản lý và cập nhật danh sách các câu hỏi trắc nghiệm. Các câu hỏi tạo mới cần được Admin phê duyệt.
          </p>
        </div>
        <Link
          href="/lecturer/question-bank/create"
          className="bg-primary text-white font-label-md px-6 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm Câu Hỏi Mới
        </Link>
      </div>

      {/* Alert Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 shadow-sm text-sm">
        <span className="material-symbols-outlined text-amber-600 mt-0.5 text-[20px]">info</span>
        <div>
          <p className="font-semibold">Quy trình kiểm duyệt câu hỏi:</p>
          <p className="mt-0.5 text-xs text-amber-800">
            Câu hỏi do Giảng viên thêm sẽ ở trạng thái <span className="font-bold">Chờ duyệt</span>. Khi Admin kiểm duyệt, trạng thái sẽ được cập nhật thành <span className="font-bold text-emerald-700">Đã duyệt</span> hoặc <span className="font-bold text-red-700">Bị từ chối</span>. Bạn có thể xem lý do từ chối và gửi lại bản chỉnh sửa bất kỳ lúc nào.
          </p>
        </div>
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
                placeholder="Tìm kiếm câu hỏi..."
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

            {/* Type Filter */}
            <select 
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tất cả Loại</option>
              <option value={QuestionTypeEnum.MCQ_SINGLE}>Một đáp án</option>
              <option value={QuestionTypeEnum.MCQ_MULTIPLE}>Nhiều đáp án</option>
              <option value={QuestionTypeEnum.TRUE_FALSE}>Đúng/Sai</option>
            </select>

            {/* Approval Status Filter */}
            <select 
              value={approvalFilter}
              onChange={(e) => { setApprovalFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              <option value="all">Tất cả Trạng thái duyệt</option>
              <option value={QuestionApprovalStatus.PENDING}>🟡 Chờ duyệt</option>
              <option value={QuestionApprovalStatus.APPROVED}>🟢 Đã duyệt</option>
              <option value={QuestionApprovalStatus.REJECTED}>🔴 Bị từ chối</option>
            </select>

            {/* Difficulty Filter */}
            <select 
              value={difficultyFilter}
              onChange={(e) => { setDifficultyFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tất cả Mức độ</option>
              <option value="Dễ">Dễ</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Khó">Khó</option>
            </select>
          </div>
          
          <div className="text-on-surface-variant text-sm font-medium whitespace-nowrap">
            {isLoading ? "Đang tải..." : `${filteredQuestions.length} câu hỏi`}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <span className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-on-surface-variant text-sm">Đang tải dữ liệu...</span>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined text-[48px] opacity-30">database</span>
              <p className="font-medium">Không tìm thấy câu hỏi nào</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Nội dung</th>
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Tác giả</th>
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Phân loại</th>
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Khóa học</th>
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Trạng thái duyệt</th>
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {paginatedQuestions.map((q) => {
                  const approvalInfo = APPROVAL_BADGES[q.approvalStatus || QuestionApprovalStatus.PENDING];
                  return (
                    <tr key={q.id} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="px-4 py-4 max-w-[300px] xl:max-w-[420px]">
                        <p className="font-medium text-on-surface text-sm line-clamp-2" title={q.content}>
                          {q.content}
                        </p>
                        {q.approvalStatus === QuestionApprovalStatus.REJECTED && q.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-red-600 flex-shrink-0 mt-0.5">error</span>
                            <div>
                              <span className="font-bold">Lý do từ chối:</span> {q.rejectionReason}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-on-surface">
                            {q.creator?.fullName || "Hệ thống"}
                          </span>
                          {q.creator?.role && (
                            <span className="text-[11px] text-on-surface-variant">
                              {q.creator.role === "lecturer" ? "Giảng viên" : q.creator.role === "admin" ? "Admin" : q.creator.role}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="inline-flex bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-xs font-semibold">
                            {getQuestionTypeLabel(q.questionType)}
                          </span>
                          <span className="inline-flex bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded text-xs font-semibold">
                            Mức độ: {q.difficulty || "Chưa chọn"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-on-surface-variant max-w-[150px] truncate" title={(q.course as any)?.title || (q.course as any)?.name || "Chưa phân loại"}>
                          {(q.course as any)?.title || (q.course as any)?.name || "Chưa phân loại"}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${approvalInfo.bg} ${approvalInfo.text}`}>
                          <span className="material-symbols-outlined text-[14px]">{approvalInfo.icon}</span>
                          {approvalInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailQuestionId(q.id)}
                            className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors inline-flex"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <Link
                            href={`/lecturer/question-bank/${q.id}/edit`}
                            className="p-1.5 hover:bg-primary-fixed rounded-lg text-on-surface-variant hover:text-primary transition-colors inline-flex"
                            title={q.approvalStatus === QuestionApprovalStatus.REJECTED ? "Sửa & Gửi lại" : "Sửa"}
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                          <button
                            onClick={() => setDeleteId(q.id)}
                            className="p-1.5 hover:bg-error-container/30 rounded-lg text-on-surface-variant hover:text-error transition-colors inline-flex"
                            title="Xóa"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
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

        {/* Pagination */}
        {!isLoading && filteredQuestions.length > 0 && (
          <div className="px-5 py-4 bg-surface-container-lowest border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-on-surface-variant">
              Hiển thị <span className="font-bold text-on-surface">{(safeCurrentPage - 1) * PAGE_SIZE + 1}–{Math.min(safeCurrentPage * PAGE_SIZE, filteredQuestions.length)}</span> trong tổng số <span className="font-bold text-on-surface">{filteredQuestions.length}</span>
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

      <QuestionDetailModal
        isOpen={!!detailQuestionId}
        questionId={detailQuestionId}
        onClose={() => setDetailQuestionId(null)}
        isAdmin={false}
        currentUserId={user?.id}
        onEdit={(id) => {
          window.location.href = `/lecturer/question-bank/${id}/edit`;
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa câu hỏi?"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa câu hỏi này không?"
        confirmText={deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
        cancelText="Hủy"
        isDestructive={true}
      />
    </div>
  );
}
