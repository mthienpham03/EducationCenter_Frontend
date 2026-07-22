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

  // State for Question Detail Modal
  const [detailQuestionId, setDetailQuestionId] = useState<string | null>(null);

  // States for Approval Modal
  const [rejectingQuestionId, setRejectingQuestionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");

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

  // Count pending questions
  const pendingCount = useMemo(() => {
    return questions.filter((q) => q.approvalStatus === QuestionApprovalStatus.PENDING).length;
  }, [questions]);

  // Review mutation (Approve / Reject)
  const reviewMutation = useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: string; status: QuestionApprovalStatus; rejectionReason?: string }) =>
      questionBankApi.reviewQuestion(id, { status, rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      setRejectingQuestionId(null);
      setRejectionReason("");
      setRejectError("");
    },
    onError: (err: any) => {
      setRejectError(err?.response?.data?.message || "Đã xảy ra lỗi khi kiểm duyệt câu hỏi");
    },
  });

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

  const handleApprove = (id: string) => {
    reviewMutation.mutate({ id, status: QuestionApprovalStatus.APPROVED });
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectError("Vui lòng nhập lý do từ chối câu hỏi.");
      return;
    }
    if (rejectingQuestionId) {
      reviewMutation.mutate({
        id: rejectingQuestionId,
        status: QuestionApprovalStatus.REJECTED,
        rejectionReason: rejectionReason.trim(),
      });
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
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Ngân hàng câu hỏi & Kiểm duyệt</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Quản lý, tạo mới và phê duyệt danh sách các câu hỏi trắc nghiệm do Giảng viên đóng góp.
          </p>
        </div>
        <Link
          href="/admin/question-bank/create"
          className="bg-primary text-white font-label-md px-6 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm Câu Hỏi
        </Link>
      </div>

      {/* Quick Status Tabs / Badges */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <button
          onClick={() => { setApprovalFilter("all"); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            approvalFilter === "all"
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/40"
          }`}
        >
          <span>Tất cả</span>
          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{questions.length}</span>
        </button>

        <button
          onClick={() => { setApprovalFilter(QuestionApprovalStatus.PENDING); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            approvalFilter === QuestionApprovalStatus.PENDING
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
              : "bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
          <span>Chờ kiểm duyệt</span>
          {pendingCount > 0 && (
            <span className="bg-amber-800 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => { setApprovalFilter(QuestionApprovalStatus.APPROVED); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            approvalFilter === QuestionApprovalStatus.APPROVED
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Đã duyệt</span>
        </button>

        <button
          onClick={() => { setApprovalFilter(QuestionApprovalStatus.REJECTED); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            approvalFilter === QuestionApprovalStatus.REJECTED
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "bg-red-50 text-red-900 border border-red-300 hover:bg-red-100"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">cancel</span>
          <span>Bị từ chối</span>
        </button>
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
                placeholder="Tìm kiếm câu hỏi, tác giả..."
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
                  <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase tracking-wider text-right">Thao tác / Kiểm duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {paginatedQuestions.map((q) => {
                  const approvalInfo = APPROVAL_BADGES[q.approvalStatus || QuestionApprovalStatus.PENDING];
                  const isPending = q.approvalStatus === QuestionApprovalStatus.PENDING;

                  return (
                    <tr key={q.id} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="px-4 py-4 max-w-[300px] xl:max-w-[420px]">
                        <p className="font-medium text-on-surface text-sm line-clamp-2" title={q.content}>
                          {q.content}
                        </p>
                        {q.approvalStatus === QuestionApprovalStatus.REJECTED && q.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1 italic">Lý do từ chối: {q.rejectionReason}</p>
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
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(q.id)}
                                disabled={reviewMutation.isPending}
                                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-sm"
                                title="Duyệt câu hỏi"
                              >
                                <span className="material-symbols-outlined text-[16px]">check</span>
                                Duyệt
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingQuestionId(q.id);
                                  setRejectionReason("");
                                  setRejectError("");
                                }}
                                disabled={reviewMutation.isPending}
                                className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all flex items-center gap-1 shadow-sm"
                                title="Từ chối câu hỏi"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                                Từ chối
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setDetailQuestionId(q.id)}
                            className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors inline-flex"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          {user?.id && q.createdBy === user.id && (
                            <Link
                              href={`/admin/question-bank/${q.id}/edit`}
                              className="p-1.5 hover:bg-primary-fixed rounded-lg text-on-surface-variant hover:text-primary transition-colors inline-flex"
                              title="Sửa câu hỏi"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </Link>
                          )}
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

      {/* Reject Reason Modal */}
      {rejectingQuestionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-headline-sm text-red-600 flex items-center gap-2">
                <span className="material-symbols-outlined">cancel</span>
                Từ chối câu hỏi
              </h3>
              <button
                onClick={() => setRejectingQuestionId(null)}
                className="p-1 text-on-surface-variant hover:bg-surface-container rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              {rejectError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {rejectError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  Lý do từ chối câu hỏi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    setRejectError("");
                  }}
                  placeholder="Nhập chi tiết lý do từ chối để Giảng viên chỉnh sửa..."
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingQuestionId(null)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-bold text-on-surface hover:bg-surface-container transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {reviewMutation.isPending ? "Đang xử lý..." : "Xác nhận Từ chối"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <QuestionDetailModal
        isOpen={!!detailQuestionId}
        questionId={detailQuestionId}
        onClose={() => setDetailQuestionId(null)}
        isAdmin={true}
        currentUserId={user?.id}
        onApprove={(id) => handleApprove(id)}
        onOpenRejectModal={(id) => {
          setRejectingQuestionId(id);
          setRejectionReason("");
          setRejectError("");
        }}
        onEdit={(id) => {
          window.location.href = `/admin/question-bank/${id}/edit`;
        }}
        isReviewPending={reviewMutation.isPending}
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
