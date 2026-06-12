"use client";

import React, { useEffect } from "react";

interface DeleteConfirmModalProps {
  /** Tên hiển thị của đối tượng bị xóa */
  targetName: string;
  /** Loại đối tượng: "học viên" | "giảng viên" | ... */
  targetType?: string;
  /** Đang gọi API xóa */
  isDeleting?: boolean;
  /** Callback khi xác nhận xóa */
  onConfirm: () => void;
  /** Callback khi hủy / đóng modal */
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  targetName,
  targetType = "người dùng",
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  // ESC để đóng modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, isDeleting]);

  // Ngăn scroll nền
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Inject keyframe animation một lần vào <head>
  useEffect(() => {
    const id = "delete-modal-keyframes";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @keyframes deleteModalIn {
        from { opacity: 0; transform: scale(0.93) translateY(12px); }
        to   { opacity: 1; transform: scale(1)    translateY(0);    }
      }
      #delete-modal-card {
        animation: deleteModalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
    `;
    document.head.appendChild(el);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(25,28,29,0.5)", backdropFilter: "blur(5px)" }}
      onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Card */}
      <div
        id="delete-modal-card"
        className="bg-white w-full rounded-2xl overflow-hidden"
        style={{ maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
      >
        {/* Icon header */}
        <div className="pt-10 pb-4 flex flex-col items-center gap-0">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "#fef2f2", outline: "4px solid #fee2e2" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 32, color: "#dc2626", fontVariationSettings: "'FILL' 1" }}
            >
              delete_forever
            </span>
          </div>
          <h3
            id="delete-modal-title"
            style={{ fontSize: 20, fontWeight: 700, color: "#191c1d", margin: 0 }}
          >
            Xóa {targetType}?
          </h3>
        </div>

        {/* Body */}
        <div className="px-8 pb-2 text-center">
          <p style={{ fontSize: 15, color: "#434654", lineHeight: 1.65, margin: 0 }}>
            Bạn có chắc chắn muốn xóa {targetType}{" "}
            <strong style={{ color: "#191c1d" }}>&quot;{targetName}&quot;</strong> khỏi hệ thống?
          </p>
          <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 600, marginTop: 10 }}>
            Hành động này không thể hoàn tác và mọi dữ liệu liên quan sẽ bị mất.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, padding: "24px 32px" }}>
          {/* Hủy */}
          <button
            id="delete-modal-cancel-btn"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #737686",
              borderRadius: 12,
              background: "white",
              color: "#191c1d",
              fontWeight: 700,
              fontSize: 14,
              cursor: isDeleting ? "not-allowed" : "pointer",
              opacity: isDeleting ? 0.5 : 1,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (!isDeleting) (e.currentTarget as HTMLButtonElement).style.background = "#edeeef"; }}
            onMouseLeave={(e) => { if (!isDeleting) (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
          >
            Hủy
          </button>

          {/* Xác nhận xóa */}
          <button
            id="delete-modal-confirm-btn"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "none",
              borderRadius: 12,
              background: "#dc2626",
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              cursor: isDeleting ? "not-allowed" : "pointer",
              opacity: isDeleting ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(220,38,38,0.3)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (!isDeleting) (e.currentTarget as HTMLButtonElement).style.background = "#b91c1c"; }}
            onMouseLeave={(e) => { if (!isDeleting) (e.currentTarget as HTMLButtonElement).style.background = "#dc2626"; }}
          >
            {isDeleting ? (
              <>
                <div
                  style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
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
    </div>
  );
}
