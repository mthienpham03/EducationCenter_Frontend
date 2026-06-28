"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

type Lesson = {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  current?: boolean;
  type: "video" | "reading" | "quiz";
};

type Chapter = {
  id: number;
  title: string;
  lessons: Lesson[];
  expanded?: boolean;
};

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "Chương 1: Giới thiệu & Tổng quan",
    lessons: [
      { id: "1.1", title: "Mục tiêu khóa học", duration: "08:24", completed: true, type: "video" },
      { id: "1.2", title: "Cài đặt môi trường làm việc", duration: "15:45", completed: true, type: "video" },
      { id: "1.3", title: "Bài kiểm tra kiến thức nền", duration: "10 câu", completed: true, type: "quiz" },
    ],
  },
  {
    id: 2,
    title: "Chương 2: Tư duy thiết kế Sản phẩm",
    lessons: [
      { id: "2.1", title: "Phân tích yêu cầu người dùng", duration: "22:10", completed: true, type: "video" },
      { id: "2.2", title: "Quy trình Wireframing chuyên sâu", duration: "18:30", completed: true, type: "video" },
      { id: "2.3", title: "Tài liệu: Design Thinking Framework", duration: "12 trang", completed: true, type: "reading" },
    ],
  },
  {
    id: 3,
    title: "Chương 3: Hệ thống Design System",
    lessons: [
      { id: "3.1", title: "Typography và Scale System", duration: "20:15", completed: true, type: "video" },
      { id: "3.2", title: "Color Theory & Palette Generation", duration: "25:00", completed: false, current: true, type: "video" },
      { id: "3.3", title: "Spacing & Layout Grid", duration: "15:20", completed: false, type: "video" },
      { id: "3.4", title: "Bài kiểm tra Design System", duration: "15 câu", completed: false, type: "quiz" },
    ],
  },
  {
    id: 4,
    title: "Chương 4: Component-Based Design",
    lessons: [
      { id: "4.1", title: "Atomic Design Methodology", duration: "18:40", completed: false, type: "video" },
      { id: "4.2", title: "Building Reusable Components", duration: "30:00", completed: false, type: "video" },
      { id: "4.3", title: "Tài liệu: Component Library Best Practices", duration: "8 trang", completed: false, type: "reading" },
    ],
  },
  {
    id: 5,
    title: "Chương 5: Prototyping & Animation",
    lessons: [
      { id: "5.1", title: "Micro-interactions Design", duration: "22:30", completed: false, type: "video" },
      { id: "5.2", title: "Prototyping trong Figma", duration: "28:15", completed: false, type: "video" },
      { id: "5.3", title: "Motion Design Principles", duration: "16:50", completed: false, type: "video" },
      { id: "5.4", title: "Bài kiểm tra cuối khóa", duration: "25 câu", completed: false, type: "quiz" },
    ],
  },
];

const RELATED_DOCS = [
  { name: "Color Theory Masterclass.pdf", size: "3.8 MB", icon: "picture_as_pdf", color: "text-red-600" },
  { name: "Wireframe Templates.png", size: "2.1 MB", icon: "image", color: "text-purple-600" },
  { name: "UI Components Library.zip", size: "15.6 MB", icon: "folder_zip", color: "text-amber-600" },
];

export default function LearningSpacePage() {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>(() =>
    CHAPTERS.map((ch) => ({
      ...ch,
      expanded: ch.lessons.some((l) => l.current) || ch.lessons.some((l) => !l.completed),
    }))
  );
  const [notes, setNotes] = useState("Ghi chú bài 3.2:\n- Color wheel: primary, secondary, tertiary\n- Contrast ratio quan trọng cho accessibility\n- Sử dụng HSL thay vì HEX để dễ điều chỉnh");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    CHAPTERS.flatMap((ch) => ch.lessons).find((l) => l.current) || null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleChapter = (id: number) => {
    setChapters((prev) => prev.map((ch) => ch.id === id ? { ...ch, expanded: !ch.expanded } : ch));
  };

  const toggleComplete = (lessonId: string) => {
    setChapters((prev) => prev.map((ch) => ({
      ...ch,
      lessons: ch.lessons.map((l) => l.id === lessonId ? { ...l, completed: !l.completed } : l),
    })));
  };

  const selectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setChapters((prev) => prev.map((ch) => ({
      ...ch,
      lessons: ch.lessons.map((l) => ({ ...l, current: l.id === lesson.id })),
    })));
  };

  // Progress
  const totalLessons = CHAPTERS.flatMap((ch) => ch.lessons).length;
  const completedLessons = chapters.flatMap((ch) => ch.lessons).filter((l) => l.completed).length;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.type === "quiz") return "quiz";
    if (lesson.type === "reading") return "auto_stories";
    return "play_circle";
  };

  if (!mounted) return null;

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen flex font-body-md">
      {/* Sidebar */}
      <aside className="h-full w-72 fixed left-0 top-0 flex flex-col p-stack-md bg-surface-container-lowest shadow-sm border-r border-outline-variant z-50 overflow-y-auto">
        <div className="mb-10">
          <h1 className="text-headline-md font-headline-md font-bold text-primary">EduCenter</h1>
          <p className="text-label-md font-label-md text-on-surface-variant">Cổng học viên</p>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <Link href="/student/dashboard" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">school</span><span>Quản lý khóa học</span>
          </Link>
          <Link href="/student/courses/documents" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">folder_open</span><span>Tài liệu</span>
          </Link>
          <Link href="/student/courses/quizzes" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">quiz</span><span>Bài kiểm tra</span>
          </Link>
          <Link href="/student/schedules" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">calendar_month</span><span>Lịch học</span>
          </Link>
          <Link href="/student/courses/progress" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">insights</span><span>Tiến độ học tập</span>
          </Link>
          <Link href="/student/courses/learning-space" className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg font-label-md transition-all duration-200">
            <span className="material-symbols-outlined">cast_for_education</span><span>Không gian học tập</span>
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-72 flex flex-col">
        {/* Sticky Progress Bar */}
        <div className="sticky top-0 z-40 bg-surface shadow-sm">
          <header className="flex justify-between items-center px-margin-desktop py-3">
            <div className="flex items-center gap-3">
              <Link href="/student/dashboard" className="p-2 rounded-lg hover:bg-surface-container-low transition-all">
                <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
              </Link>
              <div>
                <h2 className="text-headline-md font-headline-md text-on-surface leading-tight">UI/UX Advanced: Master the Design System</h2>
                <p className="text-xs text-on-surface-variant">GV. Nguyễn Thành Nam</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-xs text-on-surface-variant">Tiến độ</p>
                <p className="text-sm font-bold text-primary">{progressPercent}% ({completedLessons}/{totalLessons})</p>
              </div>
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-fixed">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-fixed text-[18px]">person</span>
                  </div>
                )}
              </div>
            </div>
          </header>
          <div className="h-1 bg-surface-container-high">
            <div className="h-full bg-gradient-to-r from-primary to-tertiary transition-all duration-700" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <main className="p-margin-desktop flex-1">
          <div className="max-w-container-max mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left: Video Player + Notes */}
              <div className="xl:col-span-2 space-y-5">
                {/* Video Player */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center cursor-pointer group" onClick={() => setIsPlaying(!isPlaying)}>
                    {/* Video placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Play/Pause button */}
                    <div className={`w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white/30 ${isPlaying ? "opacity-0 group-hover:opacity-100" : ""}`}>
                      <span className="material-symbols-outlined text-white text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isPlaying ? "pause" : "play_arrow"}
                      </span>
                    </div>

                    {/* Bottom overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                      <div>
                        <p className="text-white text-sm font-semibold">{activeLesson?.title || "Chọn bài học"}</p>
                        <p className="text-white/70 text-xs">{activeLesson?.duration || ""}</p>
                      </div>
                      {isPlaying && (
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="w-1 bg-white/80 rounded-full animate-pulse" style={{ height: `${12 + Math.random() * 16}px`, animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                          <span className="text-white/70 text-xs">Đang phát</span>
                        </div>
                      )}
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all">
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                      </button>
                      <button className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all">
                        <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div className="h-full w-1/3 bg-primary rounded-r-full" />
                    </div>
                  </div>
                </div>

                {/* Current Lesson Info */}
                {activeLesson && (
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-headline-md text-on-surface">Bài {activeLesson.id}: {activeLesson.title}</h3>
                        <p className="text-sm text-on-surface-variant mt-1">Thời lượng: {activeLesson.duration} • Loại: {activeLesson.type === "video" ? "Video bài giảng" : activeLesson.type === "quiz" ? "Bài kiểm tra" : "Tài liệu đọc"}</p>
                      </div>
                      <button
                        onClick={() => toggleComplete(activeLesson.id)}
                        className={`px-4 py-2 rounded-xl font-label-md flex items-center gap-2 transition-all ${
                          chapters.flatMap((c) => c.lessons).find((l) => l.id === activeLesson.id)?.completed
                            ? "bg-tertiary/10 text-tertiary border border-tertiary/30"
                            : "bg-primary text-on-primary hover:opacity-90"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {chapters.flatMap((c) => c.lessons).find((l) => l.id === activeLesson.id)?.completed ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        {chapters.flatMap((c) => c.lessons).find((l) => l.id === activeLesson.id)?.completed ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <h3 className="font-headline-md text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
                    Ghi chú cá nhân
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                    placeholder="Viết ghi chú cho bài học này..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-on-surface-variant">Tự động lưu</span>
                    <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-all">
                      <span className="material-symbols-outlined text-[14px] mr-1 align-middle">save</span>
                      Lưu ghi chú
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Course Content Accordion + Related Docs */}
              <div className="space-y-5">
                {/* Course Content */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/30">
                    <h3 className="font-headline-md text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">list</span>
                      Nội dung khóa học
                    </h3>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto">
                    {chapters.map((chapter) => {
                      const chapterCompleted = chapter.lessons.every((l) => l.completed);
                      const chapterProgress = Math.round((chapter.lessons.filter((l) => l.completed).length / chapter.lessons.length) * 100);
                      return (
                        <div key={chapter.id} className="border-b border-outline-variant/15 last:border-b-0">
                          <button
                            onClick={() => toggleChapter(chapter.id)}
                            className="w-full p-4 flex items-center gap-3 hover:bg-surface-container-low/30 transition-all text-left"
                          >
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              chapterCompleted ? "bg-tertiary/10 text-tertiary" : "bg-primary/10 text-primary"
                            }`}>
                              {chapterCompleted ? <span className="material-symbols-outlined text-[16px]">check</span> : chapter.id}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-on-surface truncate">{chapter.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${chapterProgress}%` }} />
                                </div>
                                <span className="text-xs text-on-surface-variant">{chapterProgress}%</span>
                              </div>
                            </div>
                            <span className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform ${chapter.expanded ? "rotate-180" : ""}`}>
                              expand_more
                            </span>
                          </button>

                          {chapter.expanded && (
                            <div className="px-4 pb-3 space-y-1">
                              {chapter.lessons.map((lesson) => (
                                <button
                                  key={lesson.id}
                                  onClick={() => selectLesson(lesson)}
                                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                                    lesson.current
                                      ? "bg-primary/10 border border-primary/20"
                                      : lesson.completed
                                      ? "bg-surface-container-low/50 hover:bg-surface-container-low"
                                      : "hover:bg-surface-container-low/50"
                                  }`}
                                >
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    lesson.completed
                                      ? "bg-tertiary/20 text-tertiary"
                                      : lesson.current
                                      ? "bg-primary text-on-primary"
                                      : "bg-surface-container-high text-on-surface-variant"
                                  }`}>
                                    {lesson.completed ? (
                                      <span className="material-symbols-outlined text-[14px]">check</span>
                                    ) : (
                                      <span className="material-symbols-outlined text-[14px]">{getLessonIcon(lesson)}</span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs truncate ${lesson.current ? "font-bold text-primary" : lesson.completed ? "text-on-surface-variant" : "text-on-surface"}`}>
                                      {lesson.id} {lesson.title}
                                    </p>
                                  </div>
                                  <span className="text-xs text-on-surface-variant flex-shrink-0">{lesson.duration}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Related Documents */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <h3 className="font-headline-md text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">attach_file</span>
                    Tài liệu liên quan
                  </h3>
                  <div className="space-y-2">
                    {RELATED_DOCS.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low/50 transition-all cursor-pointer group">
                        <span className={`material-symbols-outlined ${doc.color}`}>{doc.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-on-surface truncate group-hover:text-primary transition-colors">{doc.name}</p>
                          <p className="text-xs text-on-surface-variant">{doc.size}</p>
                        </div>
                        <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <span className="material-symbols-outlined text-[18px]">download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <Link href="/student/courses/documents" className="mt-3 w-full py-2.5 border border-outline-variant/50 text-on-surface-variant rounded-lg text-xs font-medium hover:bg-surface-container-low transition-all flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">folder_open</span>
                    Xem tất cả tài liệu
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
