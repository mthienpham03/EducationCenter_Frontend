"use client";

import React, { useState } from 'react';
import { useQuizSecurity } from '@/hooks/useQuizSecurity';

interface QuizSecurityWrapperProps {
  children: React.ReactNode;
  maxViolations?: number;
  onAutoSubmit?: () => void;
  enabled?: boolean;
}

export function QuizSecurityWrapper({
  children,
  maxViolations = 3,
  onAutoSubmit,
  enabled = true,
}: QuizSecurityWrapperProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const { violationCount } = useQuizSecurity({
    enabled,
    maxViolations,
    onViolation: (count) => {
      setShowWarning(true);
      setWarningMessage(
        `Cảnh báo! Bạn đã vi phạm quy chế thi (chuyển tab/thu nhỏ cửa sổ) ${count}/${maxViolations} lần.`
      );
      
      // Auto dismiss warning after 5 seconds if not maxed out
      if (count < maxViolations) {
        setTimeout(() => setShowWarning(false), 5000);
      }
    },
    onViolationMaxReached: () => {
      setWarningMessage(
        `Bạn đã vi phạm quá số lần cho phép (${maxViolations} lần). Hệ thống sẽ tự động nộp bài.`
      );
      if (onAutoSubmit) {
        // Delay 3s before auto submit so user can read the message
        setTimeout(() => {
          onAutoSubmit();
        }, 3000);
      }
    },
  });

  return (
    <div className={`relative ${enabled ? 'select-none' : ''}`}>
      {children}

      {/* Warning Overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
            </div>
            <h3 className="text-headline-sm font-bold text-on-surface mb-2">Cảnh báo vi phạm!</h3>
            <p className="text-body-lg text-on-surface-variant mb-6">
              {warningMessage}
            </p>
            {violationCount < maxViolations && (
              <button
                onClick={() => setShowWarning(false)}
                className="w-full py-3 bg-primary text-on-primary rounded-xl font-label-lg hover:bg-primary/90 transition-colors"
              >
                Tôi đã hiểu
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
