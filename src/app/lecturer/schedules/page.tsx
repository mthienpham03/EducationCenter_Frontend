"use client";

import React, { useState } from "react";
import ScheduleCalendar, { ScheduleEvent } from "@/components/features/schedules/schedule-calendar";

export default function LecturerSchedulesPage() {
  const [displayMode, setDisplayMode] = useState<"calendar" | "list">("calendar");

  const [scheduleItems] = useState([
    { id: "1", day: "Thứ Hai", date: "27/07/2026", time: "18:30 - 20:30", course: "IELTS Mastery (Standard Edition)", room: "Phòng 204 (Tòa A)" },
    { id: "2", day: "Thứ Tư", date: "29/07/2026", time: "18:30 - 20:30", course: "IELTS Mastery (Standard Edition)", room: "Phòng 204 (Tòa A)" },
    { id: "3", day: "Thứ Sáu", date: "31/07/2026", time: "19:00 - 21:00", course: "IELTS Writing Intensive", room: "Online via Google Meet" },
  ]);

  const handleRequestChange = () => {
    alert("Gửi yêu cầu xin đổi lịch dạy / dạy bù tới Quản trị viên.");
  };

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            Lịch Dạy Giảng Viên
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Xem thời khóa biểu các lớp học được phân công và tạo yêu cầu đổi lịch / dạy bù.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Display Mode Toggle */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
            <button
              onClick={() => setDisplayMode("calendar")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                displayMode === "calendar"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-base">calendar_view_week</span>
              Lịch FullCalendar
            </button>
            <button
              onClick={() => setDisplayMode("list")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                displayMode === "list"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-base">format_list_bulleted</span>
              Dạng Danh Sách
            </button>
          </div>

          <button
            onClick={handleRequestChange}
            className="bg-secondary text-on-secondary font-label-md px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-lg">event_note</span>
            Yêu Cầu Đổi Lịch
          </button>
        </div>
      </div>

      {/* View Content */}
      {displayMode === "calendar" ? (
        <ScheduleCalendar role="lecturer" />
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low/30 flex items-center justify-between">
            <h3 className="font-headline-md text-lg font-bold text-on-surface">
              Danh sách ca dạy trong tuần
            </h3>
            <span className="text-xs text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full font-medium">
              3 buổi dạy
            </span>
          </div>

          <div className="divide-y divide-outline-variant/20">
            {scheduleItems.map((item) => (
              <div
                key={item.id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-container-low/20 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="bg-primary-container text-on-primary-container p-3 rounded-xl flex flex-col items-center justify-center w-20 shrink-0">
                    <span className="text-caption font-bold uppercase">{item.day}</span>
                    <span className="text-headline-md font-bold mt-0.5">{item.date.split("/")[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-body-md font-semibold text-on-surface">{item.course}</h4>
                    <p className="text-caption text-on-surface-variant mt-1.5 flex flex-wrap items-center gap-4">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                        {item.time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-secondary">meeting_room</span>
                        {item.room}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRequestChange}
                    className="border border-outline-variant hover:bg-surface-container-low text-label-md font-semibold text-on-surface-variant px-3.5 py-2 rounded-lg transition-all text-xs"
                  >
                    Xin Đổi Lịch
                  </button>
                  <button className="bg-primary-container/30 hover:bg-primary-container text-primary font-semibold text-xs px-3.5 py-2 rounded-lg transition-all">
                    Xem Lớp Học
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}