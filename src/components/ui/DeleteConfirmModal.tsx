"use client";

import React, { useEffect } from "react";

interface DeleteConfirmModalProps {
  /** Tên hiển thị của đối tượng bị xóa, dùng trong nội dung mô tả */
  targetName: string;
  /** Loại đối tượng: "student" | "lecturer" | string tùy chỉnh */
  targetType?: string;
  /** Có đang loading / gọi API không */
  isDeleting?: boolean;
  /** Callback khi người dùng bấm Xác nhận xóa */
  onConfirm: () => void;
  /** Callback khi người dùng bấm Hủy hoặc đóng modal */
  onCancel: () => void;
}

/**
 * DeleteConfirmModal
 *
 * Modal xác nhận xóa học viên / giảng viên theo thiết kế mockup confirm.html & erase.html.
 * Tái sử dụng được cho cả học viên và giảng viên.
 *
 * @example
 * <DeleteConfirmModal
 *   targetName={selectedUser.fullName}
 *   targetType="học viên"
 *   isDeleting={isDeleting}
 *   onConfirm={handleConfirmDelete}
 *   onCancel={() => setDeleteTarget(null)}
 * />
 */
export default function DeleteConfirmModal({
  targetName,
  targetType = "người dùng",
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  // Đóng modal khi nhấn phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, isDeleting]);

  // Ngăn scroll nền khi modal mở
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    /* Overlay - nhấn ra ngoài để đóng */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(25, 28, 29, 0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Modal Card */}
      <div
        className="bg-white w-full max-w-[440px] rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.2s ease-out" }}
      >
        {/* Header - Icon vùng nguy hiểm */}
        <div className="pt-10 pb-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 ring-4 ring-red-100">
            <span
              className="material-symbols-outlined text-red-600"
              style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}
            >
              delete_forever
            </span>
          </div>
          <h3
            id="delete-modal-title"
            className="font-bold text-on-surface"
            style={{ fontSize: "20px", lineHeight: 1.3 }}
          >
            Xóa {targetType}?
          </h3>
        </div>

        {/* Body */}
        <div className="px-8 pb-2 text-center">
          <p className="text-on-surface-variant leading-relaxed" style={{ fontSize: "15px" }}>
            Bạn có chắc chắn muốn xóa {targetType}{" "}
            <span className="font-bold text-on-surface">{targetName}</span> khỏi hệ thống?{" "}
            <br />
            <span className="text-red-600 font-semibold text-sm">
              Hành động này không thể hoàn tác và mọi dữ liệu liên quan sẽ bị mất.
            </span>
          </p>
        </div>

        {/* Footer - Actions */}
        <div className="px-8 py-6 flex gap-3">
          {/* Nút Hủy */}
          <button
            id="delete-modal-cancel-btn"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 border border-outline text-on-surface font-bold text-sm rounded-xl hover:bg-surface-container-high active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>

          {/* Nút Xác nhận xóa */}
          <button
            id="delete-modal-confirm-btn"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
                >
                  delete
                </span>
                Xác nhận xóa
              </>
            )}
          </button>
        </div>
      </div>

      {/* CSS animation */}
      <style jsx global>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
