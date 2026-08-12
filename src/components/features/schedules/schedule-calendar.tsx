"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, EventContentArg, DateSelectArg } from "@fullcalendar/core";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export interface ScheduleEvent {
  id: string;
  title: string;
  courseId?: string;
  courseName: string;
  classCode?: string;
  lecturerId?: string;
  lecturerName?: string;
  lecturerAvatar?: string;
  room?: string;
  start: string; // ISO string
  end: string;   // ISO string
  status?: "scheduled" | "active" | "completed" | "cancelled" | "on_hold";
  note?: string;
  color?: string;
}

export interface ScheduleCalendarProps {
  role?: "admin" | "lecturer" | "student";
  initialEvents?: ScheduleEvent[];
  onEventClick?: (event: ScheduleEvent) => void;
  onCreateSchedule?: (selectInfo?: DateSelectArg) => void;
}

// Default realistic sample data for calendar demo
const MOCK_SCHEDULE_EVENTS: ScheduleEvent[] = [
  {
    id: "sch-1",
    title: "IELTS Mastery - Listening & Speaking",
    courseId: "c-1",
    courseName: "IELTS Mastery (Standard Edition)",
    classCode: "IELTS-2026-A1",
    lecturerId: "lec-1",
    lecturerName: "ThS. Nguyễn Văn A",
    room: "Phòng 204 (Tòa A)",
    start: dayjs().startOf("week").add(1, "day").hour(18).minute(30).second(0).format("YYYY-MM-DDTHH:mm:ss"),
    end: dayjs().startOf("week").add(1, "day").hour(20).minute(30).second(0).format("YYYY-MM-DDTHH:mm:ss"),
    status: "active",
    note: "Ôn tập dạng bài Multiple Choice phần Listening Section 3",
    color: "#003fb1"
  },
  {
    id: "sch-2",
    title: "React & Next.js Advanced - App Router Architecture",
    courseId: "c-2",
    courseName: "Fullstack Web Next.js 16",
    classCode: "NEXT-2026-FE",
    lecturerId: "lec-2",
    lecturerName: "TS. Trần Thị B",
    room: "Phòng 102 (Lab Công Nghệ)",
    start: dayjs().startOf("week").add(2, "day").hour(14).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss"),
    end: dayjs().startOf("week").add(2, "day").hour(17).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss"),
    status: "scheduled",
    note: "Thực hành Server Actions và Middleware Authentication",
    color: "#006f4b"
  },
  {
    id: "sch-3",
    title: "IELTS Writing Intensive - Task 2 Essay",
    courseId: "c-1",
    courseName: "IELTS Mastery (Standard Edition)",
    classCode: "IELTS-2026-A1",
    lecturerId: "lec-1",
    lecturerName: "ThS. Nguyễn Văn A",
    room: "Online via Google Meet",
    start: dayjs().startOf("week").add(3, "day").hour(19).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss"),
    end: dayjs().startOf("week").add(3, "day").hour(21).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss"),
    status: "active",
    note: "Chữa bài Opinion Essay chủ đề Technology & Society",
    color: "#003fb1"
  },
  {
    id: "sch-4",
    title: "TOEIC 750+ - Part 5 Grammar Blitz",
    courseId: "c-3",
    courseName: "Luyện thi TOEIC 750+",
    classCode: "TOEIC-750-B2",
    lecturerId: "lec-3",
    lecturerName: "ThS. Lê Hoàng C",
    room: "Phòng 305 (Tòa B)",
    start: dayjs().startOf("week").add(4, "day").hour(18).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss"),
    end: dayjs().startOf("week").add(4, "day").hour(20).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss"),
    status: "scheduled",
    note: "Chiến thuật xử lý câu hỏi Từ vựng nâng cao Part 5",
    color: "#9d4300"
  },
  {
    id: "sch-5",
    title: "Python Machine Learning - Neural Networks",
    courseId: "c-4",
    courseName: "Python for Data Science & AI",
    classCode: "AI-2026-01",
    lecturerId: "lec-2",
    lecturerName: "TS. Trần Thị B",
    room: "Phòng 105 (Lab AI)",
    start: dayjs().startOf("week").add(5, "day").hour(9).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss"),
    end: dayjs().startOf("week").add(5, "day").hour(11).minute(30).second(0).format("YYYY-MM-DDTHH:mm:ss"),
    status: "completed",
    note: "Xây dựng mô hình CNN phân loại hình ảnh bằng PyTorch",
    color: "#5c2400"
  },
  {
    id: "sch-6",
    title: "IELTS Speaking Mock Test 1-on-1",
    courseId: "c-1",
    courseName: "IELTS Mastery (Standard Edition)",
    classCode: "IELTS-2026-A1",
    lecturerId: "lec-1",
    lecturerName: "ThS. Nguyễn Văn A",
    room: "Phòng 204 (Tòa A)",
    start: dayjs().startOf("week").add(6, "day").hour(10).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss"),
    end: dayjs().startOf("week").add(6, "day").hour(12).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss"),
    status: "scheduled",
    note: "Kiểm tra nói 1-1 với giảng viên bản ngữ",
    color: "#003fb1"
  }
];

export default function ScheduleCalendar({
  role = "admin",
  initialEvents,
  onEventClick,
  onCreateSchedule,
}: ScheduleCalendarProps) {
  const calendarRef = useRef<FullCalendar | null>(null);

  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents || MOCK_SCHEDULE_EVENTS);
  const [viewMode, setViewMode] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("timeGridWeek");
  const [currentTitle, setCurrentTitle] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedLecturer, setSelectedLecturer] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Selected event modal
  const [selectedEventModal, setSelectedEventModal] = useState<ScheduleEvent | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = ev.title?.toLowerCase().includes(query);
        const matchCourse = ev.courseName?.toLowerCase().includes(query);
        const matchRoom = ev.room?.toLowerCase().includes(query);
        const matchLec = ev.lecturerName?.toLowerCase().includes(query);
        if (!matchTitle && !matchCourse && !matchRoom && !matchLec) return false;
      }
      if (selectedCourse !== "all" && ev.courseId !== selectedCourse && ev.courseName !== selectedCourse) return false;
      if (selectedLecturer !== "all" && ev.lecturerId !== selectedLecturer && ev.lecturerName !== selectedLecturer) return false;
      if (selectedRoom !== "all" && ev.room !== selectedRoom) return false;
      if (selectedStatus !== "all" && ev.status !== selectedStatus) return false;
      return true;
    });
  }, [events, searchQuery, selectedCourse, selectedLecturer, selectedRoom, selectedStatus]);

  // Transform to FullCalendar event format
  const calendarEvents = useMemo(() => {
    return filteredEvents.map((ev) => {
      let bg = ev.color || "#003fb1";
      if (ev.status === "cancelled") bg = "#ba1a1a";
      if (ev.status === "completed") bg = "#737686";
      if (ev.status === "on_hold") bg = "#9d4300";

      return {
        id: ev.id,
        title: ev.title,
        start: ev.start,
        end: ev.end,
        backgroundColor: bg,
        borderColor: bg,
        extendedProps: { ...ev },
      };
    });
  }, [filteredEvents]);

  // Unique Lists for Dropdown Filters
  const coursesList = useMemo(() => {
    const map = new Map<string, string>();
    events.forEach(e => { if (e.courseName) map.set(e.courseId || e.courseName, e.courseName); });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [events]);

  const lecturersList = useMemo(() => {
    const map = new Map<string, string>();
    events.forEach(e => { if (e.lecturerName) map.set(e.lecturerId || e.lecturerName, e.lecturerName); });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [events]);

  const roomsList = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => { if (e.room) set.add(e.room); });
    return Array.from(set);
  }, [events]);

  // Calendar Controls
  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
      updateTitle();
    }
  };

  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
      updateTitle();
    }
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      updateTitle();
    }
  };

  const handleChangeView = (view: "dayGridMonth" | "timeGridWeek" | "timeGridDay") => {
    setViewMode(view);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
      updateTitle();
    }
  };

  const updateTitle = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      setCurrentTitle(calendarApi.view.title);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const rawProps = clickInfo.event.extendedProps as ScheduleEvent;
    setSelectedEventModal(rawProps);
    if (onEventClick) {
      onEventClick(rawProps);
    }
  };

  const handleSelectSlot = (selectInfo: DateSelectArg) => {
    if (role === "admin" && onCreateSchedule) {
      onCreateSchedule(selectInfo);
    }
  };

  // Render Custom Event Block in Calendar
  const renderEventContent = (eventInfo: EventContentArg) => {
    const ext = eventInfo.event.extendedProps as ScheduleEvent;
    const timeStr = eventInfo.timeText;
    const isMonthView = eventInfo.view.type === "dayGridMonth";

    if (isMonthView) {
      return (
        <div className="px-2 py-1 w-full flex items-center gap-1.5 text-xs font-medium text-white truncate cursor-pointer rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 inline-block"></span>
          <span className="font-mono text-[11px] opacity-90 shrink-0">{timeStr}</span>
          <span className="truncate font-semibold">{eventInfo.event.title}</span>
        </div>
      );
    }

    return (
      <div className="p-2 h-full flex flex-col justify-between overflow-hidden text-xs cursor-pointer select-none group">
        <div>
          <div className="font-semibold text-white truncate flex items-center gap-1.5 leading-snug">
            <span className="w-2 h-2 rounded-full bg-white/90 shrink-0 inline-block"></span>
            <span className="truncate font-medium">{eventInfo.event.title}</span>
          </div>
          <div className="text-white/90 text-[11px] font-mono mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">schedule</span>
            <span>{timeStr}</span>
          </div>
        </div>

        <div className="mt-1 pt-1 border-t border-white/20 text-white/90 text-[11px] flex items-center justify-between gap-1">
          {ext.room && (
            <span className="truncate flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[11px]">meeting_room</span>
              {ext.room}
            </span>
          )}
          {ext.lecturerName && role === "admin" && (
            <span className="truncate flex items-center gap-0.5 font-medium">
              <span className="material-symbols-outlined text-[11px]">person</span>
              {ext.lecturerName}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (!mounted) {
    return (
      <div className="p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-center animate-pulse">
        <div className="h-8 w-48 bg-surface-container-high rounded mx-auto mb-4"></div>
        <div className="h-96 bg-surface-container-low rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* TOOLBAR & FILTERS BAR */}
      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        {/* Top Bar: Controls & View Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Navigation Controls & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-surface-container-low rounded-lg p-1 border border-outline-variant/20">
              <button
                onClick={handlePrev}
                className="p-1.5 hover:bg-surface-container-high text-on-surface rounded-md transition-colors"
                title="Lịch trước"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-xs font-semibold text-primary hover:bg-primary-container/20 rounded-md transition-colors"
              >
                Hôm nay
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 hover:bg-surface-container-high text-on-surface rounded-md transition-colors"
                title="Lịch sau"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>

            <h2 className="font-headline-md text-lg text-on-surface font-bold capitalize">
              {currentTitle || dayjs().format("MMMM YYYY")}
            </h2>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Switcher */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant/20">
              <button
                onClick={() => handleChangeView("dayGridMonth")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === "dayGridMonth"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Tháng
              </button>
              <button
                onClick={() => handleChangeView("timeGridWeek")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === "timeGridWeek"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Tuần
              </button>
              <button
                onClick={() => handleChangeView("timeGridDay")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === "timeGridDay"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Ngày
              </button>
            </div>

            {/* Admin Add Button */}
            {role === "admin" && (
              <button
                onClick={() => onCreateSchedule?.()}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Tạo Lịch Học
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="pt-3 border-t border-outline-variant/20 flex flex-wrap items-center gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-base">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm môn học, phòng, giảng viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg pl-8 pr-3 py-1.5 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Filter Course */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-on-surface focus:outline-none focus:border-primary transition-all"
          >
            <option value="all">Tất cả Khóa học</option>
            {coursesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Filter Lecturer (Admin only) */}
          {role === "admin" && (
            <select
              value={selectedLecturer}
              onChange={(e) => setSelectedLecturer(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-on-surface focus:outline-none focus:border-primary transition-all"
            >
              <option value="all">Tất cả Giảng viên</option>
              {lecturersList.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          )}

          {/* Filter Room */}
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-on-surface focus:outline-none focus:border-primary transition-all"
          >
            <option value="all">Tất cả Phòng học</option>
            {roomsList.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-on-surface focus:outline-none focus:border-primary transition-all"
          >
            <option value="all">Trạng thái: Tất cả</option>
            <option value="scheduled">Sắp diễn ra</option>
            <option value="active">Đang học</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* FULLCALENDAR MAIN CANVAS */}
      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] fullcalendar-custom-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={viewMode}
          headerToolbar={false}
          locale="vi"
          firstDay={1} // Start week on Monday
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"
          allDaySlot={false}
          nowIndicator={true}
          events={calendarEvents}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          selectable={role === "admin"}
          select={handleSelectSlot}
          datesSet={() => updateTitle()}
          height="auto"
        />
      </div>

      {/* EVENT DETAILS MODAL */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="p-6 bg-primary-container/20 border-b border-outline-variant/20 flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary px-2.5 py-0.5 bg-primary-container rounded-full">
                  {selectedEventModal.classCode || "Môn học"}
                </span>
                <h3 className="font-headline-md text-xl font-bold text-on-surface mt-2">
                  {selectedEventModal.title}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 font-medium">
                  {selectedEventModal.courseName}
                </p>
              </div>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="p-1 hover:bg-surface-container-high text-on-surface-variant rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm">
              {/* Date & Time */}
              <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                  <span className="material-symbols-outlined">event</span>
                </div>
                <div>
                  <div className="font-semibold text-on-surface">
                    {dayjs(selectedEventModal.start).format("DD/MM/YYYY (dddd)")}
                  </div>
                  <div className="text-xs text-on-surface-variant font-mono mt-0.5">
                    {dayjs(selectedEventModal.start).format("HH:mm")} - {dayjs(selectedEventModal.end).format("HH:mm")}
                  </div>
                </div>
              </div>

              {/* Location Room */}
              <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
                <div className="p-2.5 bg-secondary-container/30 text-secondary rounded-lg">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <div className="text-xs text-on-surface-variant">Địa điểm / Phòng học</div>
                  <div className="font-semibold text-on-surface">
                    {selectedEventModal.room || "Chưa xếp phòng"}
                  </div>
                </div>
              </div>

              {/* Lecturer Info */}
              <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
                <div className="p-2.5 bg-tertiary-container/20 text-tertiary rounded-lg">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <div className="text-xs text-on-surface-variant">Giảng viên phụ trách</div>
                  <div className="font-semibold text-on-surface">
                    {selectedEventModal.lecturerName || "Đang cập nhật"}
                  </div>
                </div>
              </div>

              {/* Note */}
              {selectedEventModal.note && (
                <div className="p-3 bg-surface-container-low rounded-xl space-y-1">
                  <div className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">notes</span>
                    Ghi chú buổi học
                  </div>
                  <p className="text-xs text-on-surface leading-relaxed">
                    {selectedEventModal.note}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface-container-low/50 border-t border-outline-variant/20 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
              >
                Đóng
              </button>
              {role === "lecturer" && (
                <button
                  onClick={() => {
                    alert("Yêu cầu xin đổi lịch học đã được gửi tới Quản trị viên.");
                    setSelectedEventModal(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-secondary text-on-secondary hover:opacity-90 rounded-lg transition-all"
                >
                  Xin Đổi Lịch
                </button>
              )}
              {role === "admin" && (
                <button
                  onClick={() => {
                    alert(`Sửa lịch học ID: ${selectedEventModal.id}`);
                    setSelectedEventModal(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-primary text-on-primary hover:opacity-90 rounded-lg transition-all"
                >
                  Chỉnh Sửa Lịch
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
