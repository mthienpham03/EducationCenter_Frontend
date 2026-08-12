"use client";

import React from "react";
import ScheduleCalendar from "@/components/features/schedules/schedule-calendar";

export default function StudentSchedulesPage() {
  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            Lịch Học Cá Nhân
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Theo dõi thời khóa biểu hàng tuần, phòng học và thông tin giảng viên các lớp bạn tham gia.
          </p>
        </div>
      </div>

      {/* Stats Summary Cards for Student */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="p-3 bg-primary-container/30 text-primary rounded-xl">
            <span className="material-symbols-outlined text-2xl">schedule</span>
          </div>
          <div>
            <div className="text-caption text-on-surface-variant font-medium">Buổi học tuần này</div>
            <div className="text-headline-md font-bold text-on-surface mt-0.5">4 buổi học</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="p-3 bg-secondary-container/30 text-secondary rounded-xl">
            <span className="material-symbols-outlined text-2xl">menu_book</span>
          </div>
          <div>
            <div className="text-caption text-on-surface-variant font-medium">Khóa học tham gia</div>
            <div className="text-headline-md font-bold text-on-surface mt-0.5">2 khóa học</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="p-3 bg-tertiary-container/30 text-tertiary rounded-xl">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
          </div>
          <div>
            <div className="text-caption text-on-surface-variant font-medium">Tỷ lệ điểm danh</div>
            <div className="text-headline-md font-bold text-on-surface mt-0.5">96.5%</div>
          </div>
        </div>
      </div>

      {/* Main FullCalendar Component */}
      <ScheduleCalendar role="student" />
    </div>
  );
}
