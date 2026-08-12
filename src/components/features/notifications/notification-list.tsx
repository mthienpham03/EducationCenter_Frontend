"use client";

import React, { useState } from "react";
import { useNotificationStore, NotificationItem } from "@/lib/stores/notification.store";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface NotificationListProps {
  onClose?: () => void;
}

export default function NotificationList({ onClose }: NotificationListProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    triggerNotification,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "schedule" | "new">("all");

  const filtered = notifications.filter((item) => {
    if (activeTab === "unread") return item.status === "unread";
    if (activeTab === "schedule") return item.type === "schedule_cancellation";
    if (activeTab === "new") return item.type === "new_material" || item.type === "new_quiz";
    return true;
  });

  const getIconAndColor = (type?: string) => {
    switch (type) {
      case "schedule_cancellation":
        return {
          icon: "event_busy",
          color: "text-error bg-error-container/30 border-error/20",
          badge: "HỦY LỊCH",
          badgeBg: "bg-error text-on-error",
        };
      case "new_material":
        return {
          icon: "library_books",
          color: "text-primary bg-primary-container/30 border-primary/20",
          badge: "TÀI LIỆU MỚI",
          badgeBg: "bg-primary text-on-primary",
        };
      case "new_quiz":
        return {
          icon: "quiz",
          color: "text-tertiary bg-tertiary-container/30 border-tertiary/20",
          badge: "QUIZ MỚI",
          badgeBg: "bg-tertiary text-on-tertiary",
        };
      default:
        return {
          icon: "notifications",
          color: "text-secondary bg-secondary-container/30 border-secondary/20",
          badge: "THÔNG BÁO",
          badgeBg: "bg-secondary text-on-secondary",
        };
    }
  };

  const handleTestTriggerCancellation = () => {
    triggerNotification({
      type: "schedule_cancellation",
      title: "⚠️ Thông báo HỦY LỊCH HỌC đột xuất",
      content: "Lớp học IELTS Speaking ca tối ngày mai đã bị hủy do giảng viên bị ốm. Lịch học bù sẽ được cập nhật sau.",
      reason: "Giảng viên nghỉ ốm",
    });
  };

  const handleTestTriggerNewMaterial = () => {
    triggerNotification({
      type: "new_material",
      title: "📚 Bài học / Tài liệu MỚI đã đăng",
      content: "Bài giảng 'Chiến thuật làm bài Reading Part 3' và file PDF bài tập đã sẵn sàng trong mục Tài liệu.",
    });
  };

  const handleTestTriggerNewQuiz = () => {
    triggerNotification({
      type: "new_quiz",
      title: "📝 Bài kiểm tra MỚI đã tạo",
      content: "Bài kiểm tra trắc nghiệm 'Quiz 15 phút Vocabulary Unit 4' đã được công bố cho lớp của bạn.",
    });
  };

  return (
    <div className="flex flex-col max-h-[540px]">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/50">
        <div className="flex items-center gap-2">
          <h3 className="font-headline-sm font-bold text-on-surface text-base">Thông báo</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {unreadCount} chưa đọc
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary font-medium hover:underline focus:outline-none"
            >
              Đọc tất cả
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="px-3 pt-2 pb-1 border-b border-outline-variant/10 flex items-center gap-1 overflow-x-auto scrollbar-hide text-xs">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "all"
              ? "bg-primary text-on-primary font-semibold"
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "unread"
              ? "bg-primary text-on-primary font-semibold"
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          Chưa đọc
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "schedule"
              ? "bg-primary text-on-primary font-semibold"
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          Hủy lịch
        </button>
        <button
          onClick={() => setActiveTab("new")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "new"
              ? "bg-primary text-on-primary font-semibold"
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          Bài mới / Quiz
        </button>
      </div>

      {/* Notification List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10 p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl text-outline/50 mb-2">
              notifications_off
            </span>
            <p className="text-xs font-medium">Không có thông báo nào trong mục này</p>
          </div>
        ) : (
          filtered.map((item) => {
            const style = getIconAndColor(item.type);
            const isUnread = item.status === "unread";

            return (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                  isUnread
                    ? "bg-primary-container/10 border border-primary/10 shadow-xs"
                    : "hover:bg-surface-container-low/60 opacity-85"
                }`}
              >
                {/* Icon Box */}
                <div className={`p-2 rounded-xl border shrink-0 ${style.color}`}>
                  <span className="material-symbols-outlined text-xl">{style.icon}</span>
                </div>

                {/* Content Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${style.badgeBg}`}>
                      {style.badge}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      {dayjs(item.createdAt).fromNow()}
                    </span>
                  </div>

                  <h4 className={`text-xs font-semibold text-on-surface mt-1.5 ${isUnread ? "font-bold" : ""}`}>
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* Unread Dot */}
                {isUnread && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0 self-center"></span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Test Trigger Panel */}
      <div className="p-3 bg-surface-container-low/70 border-t border-outline-variant/20 space-y-2">
        <div className="text-[11px] font-semibold text-on-surface-variant flex items-center justify-between">
          <span>🧪 Trigger Test nhanh (Demo gửi tự động):</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          <button
            onClick={handleTestTriggerCancellation}
            className="px-2 py-1.5 bg-error/10 text-error hover:bg-error/20 border border-error/20 font-semibold rounded-lg transition-all text-center truncate"
            title="Kích hoạt trigger gửi thông báo Hủy Lịch"
          >
            + Hủy Lịch
          </button>
          <button
            onClick={handleTestTriggerNewMaterial}
            className="px-2 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-semibold rounded-lg transition-all text-center truncate"
            title="Kích hoạt trigger gửi thông báo Bài Mới"
          >
            + Bài Mới
          </button>
          <button
            onClick={handleTestTriggerNewQuiz}
            className="px-2 py-1.5 bg-tertiary/10 text-tertiary hover:bg-tertiary/20 border border-tertiary/20 font-semibold rounded-lg transition-all text-center truncate"
            title="Kích hoạt trigger gửi thông báo Quiz Mới"
          >
            + Quiz Mới
          </button>
        </div>
      </div>
    </div>
  );
}