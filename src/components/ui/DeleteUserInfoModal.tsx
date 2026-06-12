"use client";

import React, { useEffect } from "react";

export interface DeleteUserTarget {
  id: string;
  fullName: string;
  email: string;
  status: "active" | "inactive" | "locked" | "pending";
  role: "student" | "lecturer";
  /** Học viên: mã HV | Giảng viên: chuyên ngành */
  extraInfo?: string;
  avatarUrl?: string | null;
}

interface DeleteUserInfoModalProps {
  user: DeleteUserTarget;
  /** Callback khi bấm "Xóa" → chuyển sang bước 2 */
  onProceed: () => void;
  /** Callback khi bấm "Hủy" */
  onCancel: () => void;
}

const statusLabel: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active:   { label: "Hoạt động",       color: "#059669", bg: "#ecfdf5", dot: "#059669" },
  locked:   { label: "Đang khóa",        color: "#dc2626", bg: "#fef2f2", dot: "#dc2626" },
  pending:  { label: "Chờ duyệt",        color: "#d97706", bg: "#fffbeb", dot: "#d97706" },
  inactive: { label: "Không hoạt động",  color: "#64748b", bg: "#f1f5f9", dot: "#64748b" },
};

/**
 * DeleteUserInfoModal — Bước 1
 *
 * Hiển thị thông tin người dùng sắp bị xóa.
 * Thiết kế theo mockup erase.html.
 */
export default function DeleteUserInfoModal({
  user,
  onProceed,
  onCancel,
}: DeleteUserInfoModalProps) {
  // ESC để đóng
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  // Ngăn scroll nền
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Inject keyframe animation
  useEffect(() => {
    const id = "erase-modal-kf";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @keyframes eraseModalIn {
        from { opacity: 0; transform: scale(0.94) translateY(14px); }
        to   { opacity: 1; transform: scale(1)    translateY(0);    }
      }
      #erase-modal-card { animation: eraseModalIn 0.24s cubic-bezier(0.16,1,0.3,1) both; }
    `;
    document.head.appendChild(s);
  }, []);

  const st = statusLabel[user.status] ?? statusLabel.inactive;
  const initials = user.fullName.split(" ").pop()?.charAt(0).toUpperCase() ?? "?";
  const isLecturer = user.role === "lecturer";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(25,28,29,0.45)", backdropFilter: "blur(5px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="erase-modal-title"
    >
      {/* Card */}
      <div
        id="erase-modal-card"
        className="bg-white rounded-2xl overflow-hidden w-full"
        style={{ maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
      >
        {/* ── Header màu đỏ ── */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)" }}
        >
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}
          >
            person_remove
          </span>
          <div>
            <h3
              id="erase-modal-title"
              className="text-white font-bold"
              style={{ fontSize: 18, margin: 0 }}
            >
              Xóa {isLecturer ? "giảng viên" : "học viên"}
            </h3>
            <p className="text-white/80" style={{ fontSize: 13, margin: 0 }}>
              Xem lại thông tin trước khi tiếp tục
            </p>
          </div>
        </div>

        {/* ── Thông tin người dùng ── */}
        <div className="px-6 py-5">
          {/* Avatar + tên */}
          <div className="flex items-center gap-4 mb-5 p-4 rounded-xl" style={{ background: "#f8f9fa" }}>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl overflow-hidden flex-shrink-0"
              style={{ background: isLecturer ? "#e0f2fe" : "#ede9fe", color: isLecturer ? "#0369a1" : "#6d28d9" }}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-on-surface truncate" style={{ fontSize: 16 }}>
                {user.fullName}
              </p>
              <p className="text-on-surface-variant truncate" style={{ fontSize: 13 }}>
                {user.email}
              </p>
            </div>
            {/* Badge trạng thái */}
            <span
              className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 font-bold"
              style={{ background: st.bg, color: st.color, fontSize: 12 }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: st.dot }}
              />
              {st.label}
            </span>
          </div>

          {/* Chi tiết dạng danh sách */}
          <div className="space-y-3">
            {/* Vai trò */}
            <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
              <span className="flex items-center gap-2 text-on-surface-variant font-medium" style={{ fontSize: 14 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#6b7280" }}>badge</span>
                Vai trò
              </span>
              <span className="font-bold text-on-surface" style={{ fontSize: 14 }}>
                {isLecturer ? "Giảng viên" : "Học viên"}
              </span>
            </div>

            {/* Thông tin thêm (mã HV / chuyên ngành) */}
            {user.extraInfo && (
              <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
                <span className="flex items-center gap-2 text-on-surface-variant font-medium" style={{ fontSize: 14 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#6b7280" }}>
                    {isLecturer ? "school" : "tag"}
                  </span>
                  {isLecturer ? "Chuyên ngành" : "Mã học viên"}
                </span>
                <span className="font-bold" style={{ fontSize: 14, color: "#1353d8" }}>
                  {user.extraInfo}
                </span>
              </div>
            )}

            {/* Email */}
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-2 text-on-surface-variant font-medium" style={{ fontSize: 14 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#6b7280" }}>mail</span>
                Email
              </span>
              <span className="font-medium text-on-surface-variant truncate ml-4" style={{ fontSize: 14 }}>
                {user.email}
              </span>
            </div>
          </div>

          {/* Cảnh báo */}
          <div
            className="flex items-start gap-3 rounded-xl mt-5 p-3"
            style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
          >
            <span
              className="material-symbols-outlined flex-shrink-0"
              style={{ fontSize: 20, color: "#ea580c", fontVariationSettings: "'FILL' 1" }}
            >
              warning
            </span>
            <p style={{ fontSize: 13, color: "#9a3412", margin: 0, lineHeight: 1.6 }}>
              Tài khoản và toàn bộ dữ liệu liên quan sẽ bị{" "}
              <strong>xóa vĩnh viễn</strong>. Bước tiếp theo sẽ yêu cầu xác nhận lần cuối.
            </p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div
          className="flex gap-3 px-6 pb-6"
          style={{ borderTop: "1px solid #f3f4f5", paddingTop: 20 }}
        >
          {/* Hủy */}
          <button
            id="erase-modal-cancel-btn"
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl font-bold transition-all"
            style={{
              padding: "12px 16px",
              border: "1px solid #c3c5d7",
              background: "white",
              color: "#434654",
              fontSize: 14,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f5"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
          >
            Hủy
          </button>

          {/* Tiếp tục xóa */}
          <button
            id="erase-modal-proceed-btn"
            type="button"
            onClick={onProceed}
            className="flex-1 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{
              padding: "12px 16px",
              background: "#dc2626",
              border: "none",
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(220,38,38,0.28)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#b91c1c"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#dc2626"; }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
            >
              delete
            </span>
            Xóa tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}
