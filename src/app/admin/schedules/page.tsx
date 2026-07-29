"use client";

import React, { useState, useEffect } from "react";
import ScheduleCalendar, { ScheduleEvent } from "@/components/features/schedules/schedule-calendar";
import { api } from "@/lib/api";

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const response = await api.schedule.getSchedules();
        if (response.success && response.data && response.data.length > 0) {
          const mapped: ScheduleEvent[] = response.data.map((item) => ({
            id: item.id,
            title: `Lớp học ${item.courseId}`,
            courseId: item.courseId,
            courseName: `Khóa học ${item.courseId}`,
            lecturerId: item.lecturerId,
            room: item.room || "Phòng học",
            start: `${item.date}T${item.startTime}`,
            end: `${item.date}T${item.endTime}`,
            status: "scheduled",
          }));
          setSchedules(mapped);
        }
      } catch (error) {
        console.warn("Lấy dữ liệu API lịch học chưa khả dụng, chuyển sang chế độ dữ liệu mẫu:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedules();
  }, []);

  const handleCreateSchedule = () => {
    alert("Mở Modal tạo Lịch Học mới dành cho Quản trị viên");
  };

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            Quản Lý Lịch Học Trung Tâm
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Theo dõi, phân lịch và quản lý ca học của tất cả khóa học và giảng viên.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateSchedule}
            className="bg-primary text-on-primary font-label-md px-4 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            Tạo Lịch Học Mới
          </button>
        </div>
      </div>

      {/* KPI / Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="p-3 bg-primary-container/30 text-primary rounded-xl">
            <span className="material-symbols-outlined text-2xl">calendar_month</span>
          </div>
          <div>
            <div className="text-caption text-on-surface-variant font-medium">Tổng ca học tuần này</div>
            <div className="text-headline-md font-bold text-on-surface mt-0.5">24 ca</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="p-3 bg-tertiary-container/30 text-tertiary rounded-xl">
            <span className="material-symbols-outlined text-2xl">meeting_room</span>
          </div>
          <div>
            <div className="text-caption text-on-surface-variant font-medium">Phòng học đang sử dụng</div>
            <div className="text-headline-md font-bold text-on-surface mt-0.5">12 / 15 phòng</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="p-3 bg-secondary-container/30 text-secondary rounded-xl">
            <span className="material-symbols-outlined text-2xl">co_present</span>
          </div>
          <div>
            <div className="text-caption text-on-surface-variant font-medium">Giảng viên đang dạy</div>
            <div className="text-headline-md font-bold text-on-surface mt-0.5">18 giảng viên</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="p-3 bg-error-container/30 text-error rounded-xl">
            <span className="material-symbols-outlined text-2xl">pending_actions</span>
          </div>
          <div>
            <div className="text-caption text-on-surface-variant font-medium">Yêu cầu đổi lịch chờ duyệt</div>
            <div className="text-headline-md font-bold text-on-surface mt-0.5">3 yêu cầu</div>
          </div>
        </div>
      </div>

      {/* Main FullCalendar Component */}
      <ScheduleCalendar
        role="admin"
        initialEvents={schedules.length > 0 ? schedules : undefined}
        onCreateSchedule={handleCreateSchedule}
      />
    </div>
  );
}
