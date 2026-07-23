"use client";

import { useQuery } from "@tanstack/react-query";
import { questionBankApi } from "@/lib/api/question-bank.api";
import { QuestionTypeEnum, QuestionApprovalStatus } from "@/lib/types/question.type";

interface QuestionDetailModalProps {
  isOpen: boolean;
  questionId: string | null;
  onClose: () => void;
  isAdmin?: boolean;
  currentUserId?: string | null;
  onApprove?: (id: string) => void;
  onOpenRejectModal?: (id: string) => void;
  onEdit?: (id: string) => void;
  isReviewPending?: boolean;
}

const APPROVAL_BADGES: Record<QuestionApprovalStatus, { bg: string; text: string; label: string; icon: string }> = {
  [QuestionApprovalStatus.PENDING]: { bg: "bg-amber-100 border-amber-300", text: "text-amber-800", label: "Chờ duyệt", icon: "hourglass_top" },
  [QuestionApprovalStatus.APPROVED]: { bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-800", label: "Đã duyệt", icon: "check_circle" },
  [QuestionApprovalStatus.REJECTED]: { bg: "bg-red-100 border-red-300", text: "text-red-800", label: "Bị từ chối", icon: "cancel" },
};

export default function QuestionDetailModal({
  isOpen,
  questionId,
  onClose,
  isAdmin = false,
  currentUserId,
  onApprove,
  onOpenRejectModal,
  onEdit,
  isReviewPending = false,
}: QuestionDetailModalProps) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["question-detail", questionId],
    queryFn: () => (questionId ? questionBankApi.getQuestionById(questionId) : null),
    enabled: !!isOpen && !!questionId,
  });

  if (!isOpen || !questionId) return null;

  const question = response?.data;

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case QuestionTypeEnum.MCQ_SINGLE:
        return "Một đáp án (Single Choice)";
      case QuestionTypeEnum.MCQ_MULTIPLE:
        return "Nhiều đáp án (Multiple Choice)";
      case QuestionTypeEnum.TRUE_FALSE:
        return "Đúng/Sai (True/False)";
      default:
        return type;
    }
  };

  const approvalInfo = question
    ? APPROVAL_BADGES[question.approvalStatus || QuestionApprovalStatus.PENDING]
    : null;

  const canEdit = question && onEdit && (!isAdmin || (isAdmin && currentUserId && question.createdBy === currentUserId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-outline-variant/30">
        {/* Modal Header */}
        <div className="p-5 border-b border-outline-variant/20 bg-surface-container-lowest flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">quiz</span>
            </div>
            <div>
              <h3 className="font-bold text-headline-sm text-on-surface">Chi tiết câu hỏi</h3>
              <p className="text-xs text-on-surface-variant">ID: {questionId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <span className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-on-surface-variant text-sm">Đang tải chi tiết câu hỏi...</span>
            </div>
          ) : error || !question ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              Không thể tải chi tiết câu hỏi. Vui lòng thử lại sau.
            </div>
          ) : (
            <>
              {/* Badges & Meta row */}
              <div className="flex flex-wrap items-center gap-2">
                {approvalInfo && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${approvalInfo.bg} ${approvalInfo.text}`}>
                    <span className="material-symbols-outlined text-[14px]">{approvalInfo.icon}</span>
                    {approvalInfo.label}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary-container text-on-primary-container">
                  {getQuestionTypeLabel(question.questionType)}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-tertiary-container text-on-tertiary-container">
                  Mức độ: {question.difficulty || "Chưa chọn"}
                </span>
              </div>

              {/* Creator & Course Info Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs">
                <div>
                  <span className="text-on-surface-variant font-medium block">Tác giả / Người tạo:</span>
                  <span className="font-bold text-on-surface text-sm">
                    {question.creator?.fullName || "Hệ thống"}
                  </span>
                  {question.creator?.role && (
                    <span className="ml-2 text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                      {question.creator.role === "lecturer" ? "Giảng viên" : question.creator.role === "admin" ? "Admin" : question.creator.role}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-on-surface-variant font-medium block">Khóa học liên quan:</span>
                  <span className="font-semibold text-on-surface">
                    {(question.course as any)?.title || (question.course as any)?.name || "Dùng chung / Chưa chọn"}
                  </span>
                </div>
              </div>

              {/* Rejection Reason Alert if Rejected */}
              {question.approvalStatus === QuestionApprovalStatus.REJECTED && question.rejectionReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    Lý do Admin từ chối:
                  </div>
                  <p className="text-xs text-red-800 pl-6">{question.rejectionReason}</p>
                </div>
              )}

              {/* Question Content Box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Nội dung câu hỏi:
                </label>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface font-medium leading-relaxed whitespace-pre-wrap text-sm shadow-inner">
                  {question.content}
                </div>
              </div>

              {/* Question Options List */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Danh sách đáp án ({question.options?.length || 0}):
                </label>

                {!question.options || question.options.length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic">Chưa có danh sách đáp án.</p>
                ) : (
                  <div className="space-y-2">
                    {question.options.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx); // A, B, C, D...
                      return (
                        <div
                          key={opt.id || idx}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-sm transition-all ${
                            opt.isCorrect
                              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold"
                              : "bg-surface-container-lowest border-outline-variant/30 text-on-surface"
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span
                              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                                opt.isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-surface-container text-on-surface-variant"
                              }`}
                            >
                              {letter}
                            </span>
                            <span className="truncate">{opt.content}</span>
                          </div>

                          {opt.isCorrect ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1 flex-shrink-0 border border-emerald-300">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Đáp án đúng
                            </span>
                          ) : (
                            <span className="text-xs text-on-surface-variant/60 flex-shrink-0">Sai</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest flex items-center justify-between gap-3">
          <div>
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit && onEdit(question.id);
                }}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs rounded-xl border border-outline-variant/40 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                {question.approvalStatus === QuestionApprovalStatus.REJECTED ? "Chỉnh sửa & Gửi lại" : "Chỉnh sửa"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && question?.approvalStatus === QuestionApprovalStatus.PENDING && (
              <>
                <button
                  type="button"
                  disabled={isReviewPending}
                  onClick={() => {
                    onClose();
                    onApprove && onApprove(question.id);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Phê duyệt
                </button>

                <button
                  type="button"
                  disabled={isReviewPending}
                  onClick={() => {
                    onClose();
                    onOpenRejectModal && onOpenRejectModal(question.id);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  Từ chối
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs rounded-xl transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
