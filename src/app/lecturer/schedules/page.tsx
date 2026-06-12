"use client";

import { useState } from "react";

export default function LecturerSchedulesPage() {
  const [scheduleItems] = useState([
    { id: 1, day: "Thứ Hai", date: "08/06/2026", time: "18:30 - 20:30", course: "IELTS Mastery (Standard Edition)", room: "Phòng 204" },
    { id: 2, day: "Thứ Tư", date: "10/06/2026", time: "18:30 - 20:30", course: "IELTS Mastery (Standard Edition)", room: "Phòng 204" },
    { id: 3, day: "Thứ Sáu", date: "12/06/2026", time: "19:00 - 21:00", course: "IELTS Writing Intensive", room: "Online via Meet" },
  ]);

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Lịch dạy giảng viên</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Xem thời khóa biểu các lớp học được phân công và đặt lịch dạy bù/dạy thay.
          </p>
        </div>
        <button className="bg-primary text-on-primary font-label-md px-stack-md py-stack-sm rounded-lg flex items-center gap-base hover:opacity-90 transition-all">
          <span className="material-symbols-outlined">event_note</span>
          Yêu Cầu Đổi Lịch
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low/30">
          <h3 className="font-headline-md text-lg text-on-surface">Lịch học trong tuần này</h3>
        </div>
        
        <div className="divide-y divide-outline-variant/20">
          {scheduleItems.map((item) => (
            <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-container-low/20 transition-all">
              <div className="flex items-center gap-6">
                <div className="bg-primary-container text-on-primary-container p-3 rounded-xl flex flex-col items-center justify-center w-20">
                  <span className="text-caption font-bold">{item.day}</span>
                  <span className="text-body-md font-bold mt-0.5">{item.date.split('/')[0]}</span>
                </div>
                <div>
                  <h4 className="font-body-md font-semibold text-on-surface">{item.course}</h4>
                  <p className="text-caption text-on-surface-variant mt-1">
                    <span className="inline-flex items-center gap-1 mr-4">
                      <span className="material-symbols-outlined text-sm">schedule</span> {item.time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">meeting_room</span> {item.room}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <button className="border border-outline-variant hover:bg-surface-container-low text-label-md font-semibold text-on-surface px-4 py-2 rounded-lg transition-all">
                  Xem chi tiết buổi học
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}