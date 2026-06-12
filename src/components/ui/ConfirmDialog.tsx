"use client";

import React, { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onConfirm,
  onCancel,
  isDanger = false,
  isLoading = false,
}: ConfirmDialogProps) {
  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel, isLoading]);

  // Prevent background scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    const id = "confirm-dialog-keyframes";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @keyframes confirmDialogIn {
        from { opacity: 0; transform: scale(0.95) translateY(10px); }
        to   { opacity: 1; transform: scale(1)    translateY(0);    }
      }
      .confirm-dialog-card {
        animation: confirmDialogIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
    `;
    document.head.appendChild(el);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[3px]"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onCancel();
      }}
    >
      <div
        className="confirm-dialog-card bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 border border-outline-variant/30"
      >
        {/* Title */}
        <h3 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
          {isDanger && (
            <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
          )}
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-outline-variant text-on-surface font-bold text-sm rounded-lg hover:bg-surface-container-high transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white font-bold text-sm rounded-lg transition-all flex items-center gap-1.5 shadow-md ${
              isDanger
                ? "bg-error hover:bg-error/90 shadow-error/10"
                : "bg-primary hover:bg-primary/90 shadow-primary/10"
            } disabled:opacity-75`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
