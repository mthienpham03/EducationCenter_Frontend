import { create } from "zustand";
import { api } from "@/lib/api";

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type?: "schedule_cancellation" | "new_material" | "new_quiz" | "system" | string;
  status: "unread" | "read";
  targetType?: string;
  targetId?: string;
  sentAt?: string;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isOpen: boolean;
  loading: boolean;

  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (item: NotificationItem) => void;
  triggerNotification: (payload: {
    type: "schedule_cancellation" | "new_material" | "new_quiz" | "system";
    title: string;
    content: string;
    courseId?: string;
    reason?: string;
  }) => Promise<void>;
}

// Fallback sample data if backend is offline or empty
const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "⚠️ Thông báo HỦY LỊCH HỌC",
    content: "Lớp IELTS Mastery buổi tối ngày Thứ Năm (15/08) tạm thời hủy do giảng viên bận công tác đột xuất.",
    type: "schedule_cancellation",
    status: "unread",
    targetType: "schedule",
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-2",
    title: "📚 Tài liệu / Bài học MỚI đã tải lên",
    content: "Slide bài giảng 'React Next.js 16 Server Actions' đã được tải lên thư viện tài liệu.",
    type: "new_material",
    status: "unread",
    targetType: "document",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "notif-3",
    title: "📝 Bài kiểm tra MỚI (Quiz) được giao",
    content: "Bài test 'IELTS Speaking Mock Test Part 2' đã mở. Hạn nộp: 23:59 ngày Chủ Nhật.",
    type: "new_quiz",
    status: "unread",
    targetType: "quiz",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: SAMPLE_NOTIFICATIONS,
  unreadCount: SAMPLE_NOTIFICATIONS.filter((n) => n.status === "unread").length,
  isOpen: false,
  loading: false,

  setIsOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const response = await api.notification.getNotifications();
      if (response.success && response.data && response.data.length > 0) {
        const mapped: NotificationItem[] = response.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          type: item.type || "system",
          status: item.status || "unread",
          targetType: item.targetType,
          targetId: item.targetId,
          sentAt: item.sentAt,
          createdAt: item.createdAt || new Date().toISOString(),
        }));

        const unread = mapped.filter((n) => n.status === "unread").length;
        set({ notifications: mapped, unreadCount: unread });
      }
    } catch (error) {
      console.warn("Không thể tải thông báo từ API server, dùng dữ liệu mẫu khởi tạo:", error);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, status: "read" as const } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => n.status === "unread").length,
      };
    });

    try {
      await api.notification.markAsRead(id);
    } catch (err) {
      console.warn("Error marking notification as read on API:", err);
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, status: "read" as const })),
      unreadCount: 0,
    }));

    try {
      await api.notification.markAllAsRead();
    } catch (err) {
      console.warn("Error marking all notifications as read on API:", err);
    }
  },

  addNotification: (item: NotificationItem) => {
    set((state) => {
      const exists = state.notifications.some((n) => n.id === item.id);
      if (exists) return state;

      const updated = [item, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => n.status === "unread").length,
      };
    });
  },

  triggerNotification: async (payload) => {
    const newItem: NotificationItem = {
      id: `notif-trig-${Date.now()}`,
      title: payload.title,
      content: payload.content,
      type: payload.type,
      status: "unread",
      createdAt: new Date().toISOString(),
    };

    get().addNotification(newItem);

    try {
      await api.notification.triggerNotification(payload);
    } catch (err) {
      console.warn("API Trigger triggerNotification warning:", err);
    }
  },
}));