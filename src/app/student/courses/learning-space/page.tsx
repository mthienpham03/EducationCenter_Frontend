"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { courseService, documentService } from "@/lib/api/service";

function getFileIcon(type: string) {
  if (type === "pdf") return { icon: "picture_as_pdf", color: "text-red-600", bg: "bg-red-50", label: "PDF" };
  if (type === "doc") return { icon: "description", color: "text-blue-600", bg: "bg-blue-50", label: "DOCX" };
  if (type === "slide") return { icon: "slideshow", color: "text-orange-500", bg: "bg-orange-50", label: "PPTX" };
  if (type === "image") return { icon: "image", color: "text-purple-600", bg: "bg-purple-50", label: "IMG" };
  if (type === "video") return { icon: "movie", color: "text-pink-600", bg: "bg-pink-50", label: "VIDEO" };
  return { icon: "draft", color: "text-gray-600", bg: "bg-gray-50", label: "FILE" };
}

function LearningSpaceContent() {
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [relatedDocs, setRelatedDocs] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load course, chapters and initial active lesson
  useEffect(() => {
    if (!mounted || !courseId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        // Load completed lessons from LocalStorage
        const storageKey = `completed_lessons_${user?.id}_${courseId}`;
        const completed = JSON.parse(localStorage.getItem(storageKey) || "[]");
        setCompletedLessonIds(completed);

        // Load personal notes
        const notesKey = `notes_${user?.id}_${courseId}`;
        setNotes(localStorage.getItem(notesKey) || "Ghi chú cho khóa học này...");

        // Fetch course info
        let courseData = { id: courseId, name: "Khóa học chất lượng cao EduCenter", code: "EDU-101" };
        try {
          if (!courseId.endsWith("-mock")) {
            const courseRes = await courseService.getCourseById(courseId);
            if (courseRes.success && courseRes.data) {
              courseData = courseRes.data;
            }
          } else {
            // Set matching names for mock courses
            if (courseId === "uiux-mock") {
              courseData = { id: courseId, name: "UI/UX Advanced: Master the Design System", code: "UI/UX" };
            } else if (courseId === "nextjs-mock") {
              courseData = { id: courseId, name: "Fullstack Web Development with Next.js", code: "NEXTJS" };
            } else if (courseId === "marketing-mock") {
              courseData = { id: courseId, name: "Digital Marketing & Growth Hacking", code: "MARKETING" };
            }
          }
        } catch (e) {
          console.error("Lỗi khi tải thông tin khóa học:", e);
        }
        setCourseInfo(courseData);

        // Fetch chapters & lessons
        let chaptersData: any[] = [];
        try {
          if (!courseId.endsWith("-mock")) {
            const curriculumRes = await courseService.getChaptersAndLessons(courseId);
            if (curriculumRes.success && curriculumRes.data && curriculumRes.data.length > 0) {
              chaptersData = curriculumRes.data.map((ch: any) => ({
                ...ch,
                expanded: true,
              }));
            }
          }
        } catch (e) {
          console.error("Lỗi khi tải chương trình học từ API:", e);
        }

        // Nếu API rỗng hoặc lỗi, dùng dữ liệu mẫu
        if (chaptersData.length === 0) {
          chaptersData = [
            {
              id: "ch-1",
              title: "Chương 1: Giới thiệu & Tổng quan khóa học",
              expanded: true,
              lessons: [
                { id: "les-1-1", title: "1.1: Mục tiêu và phương pháp học hiệu quả", duration: "08:24", type: "video", orderIndex: 1 },
                { id: "les-1-2", title: "1.2: Cài đặt và thiết lập môi trường", duration: "15:45", type: "video", orderIndex: 2 },
                { id: "les-1-3", title: "1.3: Bài test trắc nghiệm chương 1", duration: "10 câu", type: "quiz", orderIndex: 3 },
              ]
            },
            {
              id: "ch-2",
              title: "Chương 2: Kiến thức nền tảng và Tư duy thiết kế",
              expanded: true,
              lessons: [
                { id: "les-2-1", title: "2.1: Quy trình Wireframing chuyên sâu", duration: "22:10", type: "video", orderIndex: 1 },
                { id: "les-2-2", title: "2.2: Phân tích trải nghiệm UX người dùng", duration: "18:30", type: "video", orderIndex: 2 },
                { id: "les-2-3", title: "2.3: Đọc thêm: Design Thinking Framework", duration: "12 trang", type: "reading", orderIndex: 3 },
              ]
            }
          ];
        }

        setChapters(chaptersData);

        // Find first lesson to activate
        const allLessons = chaptersData.flatMap((ch: any) => ch.lessons || []);
        if (allLessons.length > 0) {
          setActiveLesson(allLessons[0]);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu không gian học tập:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mounted, courseId, user?.id]);

  // Load documents whenever active lesson changes
  useEffect(() => {
    if (!activeLesson?.id) return;
    const fetchDocs = async () => {
      try {
        if (activeLesson.id.startsWith("les-")) {
          setRelatedDocs([
            { id: "doc-1", title: "Tài liệu học tập chi tiết.pdf", type: "pdf", fileUrl: "#", downloadCount: 42, size: 1048576, createdAt: "2026-06-29" },
            { id: "doc-2", title: "Slide bài giảng lý thuyết.pptx", type: "slide", fileUrl: "#", downloadCount: 15, size: 2097152, createdAt: "2026-06-29" }
          ] as any);
          return;
        }
        const res = await documentService.getDocuments({ lessonId: activeLesson.id });
        if (res.success && res.data) {
          setRelatedDocs(res.data);
        } else {
          setRelatedDocs([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải tài liệu liên quan:", err);
      }
    };
    fetchDocs();
  }, [activeLesson?.id]);

  // Save notes to LocalStorage
  const handleSaveNotes = () => {
    if (!courseId) return;
    const notesKey = `notes_${user?.id}_${courseId}`;
    localStorage.setItem(notesKey, notes);
    alert("Đã lưu ghi chú cá nhân thành công!");
  };

  const toggleChapter = (id: string) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, expanded: !ch.expanded } : ch))
    );
  };

  const toggleComplete = (lessonId: string) => {
    if (!courseId) return;
    const storageKey = `completed_lessons_${user?.id}_${courseId}`;
    let newCompleted = [...completedLessonIds];
    if (newCompleted.includes(lessonId)) {
      newCompleted = newCompleted.filter((id) => id !== lessonId);
    } else {
      newCompleted.push(lessonId);
    }
    setCompletedLessonIds(newCompleted);
    localStorage.setItem(storageKey, JSON.stringify(newCompleted));
  };

  const selectLesson = (lesson: any) => {
    setActiveLesson(lesson);
  };

  // Progress calculations
  const totalLessons = chapters.flatMap((ch) => ch.lessons || []).length;
  const completedLessons = chapters.flatMap((ch) => ch.lessons || []).filter((l) => completedLessonIds.includes(l.id)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const getLessonIcon = (lessonType: string) => {
    if (lessonType === "quiz") return "quiz";
    if (lessonType === "reading") return "auto_stories";
    return "play_circle";
  };

  if (!mounted) return null;

  if (!courseId) {
    return (
      <div className="bg-surface-bright text-on-surface min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 shadow-md">
          <span className="material-symbols-outlined text-[64px] text-primary mb-4">school</span>
          <h2 className="text-headline-md font-bold mb-2">Vui lòng chọn khóa học</h2>
          <p className="text-on-surface-variant mb-6">Bạn cần chọn một khóa học từ bảng điều khiển để truy cập không gian học tập.</p>
          <Link href="/student/dashboard" className="px-6 py-3 bg-primary text-on-primary rounded-xl font-label-md hover:opacity-90 transition-all inline-block">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

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
          <Link href={`/student/courses/learning-space?courseId=${courseId}`} className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg font-label-md transition-all duration-200">
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
                <h2 className="text-headline-md font-headline-md text-on-surface leading-tight">
                  {loading ? "Đang tải..." : courseInfo?.name || "Khóa học"}
                </h2>
                <p className="text-xs text-on-surface-variant">Mã khóa học: {courseInfo?.code || "—"}</p>
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

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-3">progress_activity</span>
            <p className="text-on-surface-variant">Đang tải cấu trúc chương trình học tập...</p>
          </div>
        ) : (
          <main className="p-margin-desktop flex-1">
            <div className="max-w-container-max mx-auto">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left: Video Player + Notes */}
                <div className="xl:col-span-2 space-y-5">
                  {/* Video/Reading Player */}
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                    {activeLesson ? (
                      <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center cursor-pointer group" onClick={() => setIsPlaying(!isPlaying)}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        
                        <div className={`w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white/30 ${isPlaying ? "opacity-0 group-hover:opacity-100" : ""}`}>
                          <span className="material-symbols-outlined text-white text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isPlaying ? "pause" : "play_arrow"}
                          </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                          <div>
                            <p className="text-white text-sm font-semibold">{activeLesson.title}</p>
                            <p className="text-white/70 text-xs">{activeLesson.duration || "Nội dung học tập"}</p>
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

                        <div className="absolute top-4 right-4 flex gap-2">
                          <button className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all">
                            <span className="material-symbols-outlined text-[20px]">settings</span>
                          </button>
                          <button className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all">
                            <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                          </button>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <div className="h-full w-1/3 bg-primary rounded-r-full" />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-surface-container-low flex flex-col items-center justify-center text-on-surface-variant p-6">
                        <span className="material-symbols-outlined text-[48px] mb-2">class</span>
                        <p>Vui lòng chọn một bài học để bắt đầu học.</p>
                      </div>
                    )}
                  </div>

                  {/* Current Lesson Info */}
                  {activeLesson && (
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <h3 className="font-headline-md text-on-surface font-semibold text-lg">{activeLesson.title}</h3>
                          <p className="text-xs text-on-surface-variant mt-1">
                            Loại bài học: {activeLesson.type === "video" ? "Video bài giảng" : activeLesson.type === "quiz" ? "Bài kiểm tra" : "Tài liệu đọc"}
                          </p>
                          {activeLesson.contentSummary && (
                            <p className="text-sm text-on-surface mt-3 bg-surface-container-low/50 p-3 rounded-lg border border-outline-variant/20">
                              {activeLesson.contentSummary}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleComplete(activeLesson.id)}
                          className={`px-4 py-2 rounded-xl font-label-md flex items-center gap-2 transition-all flex-shrink-0 self-start sm:self-auto ${
                            completedLessonIds.includes(activeLesson.id)
                              ? "bg-tertiary/10 text-tertiary border border-tertiary/30"
                              : "bg-primary text-on-primary hover:opacity-90"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {completedLessonIds.includes(activeLesson.id) ? "check_circle" : "radio_button_unchecked"}
                          </span>
                          {completedLessonIds.includes(activeLesson.id) ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
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
                      placeholder="Viết ghi chú cho khóa học này..."
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-on-surface-variant">Lưu trên thiết bị này</span>
                      <button onClick={handleSaveNotes} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">save</span>
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
                      <h3 className="font-headline-md text-on-surface flex items-center gap-2 font-semibold">
                        <span className="material-symbols-outlined text-primary text-[20px]">list</span>
                        Nội dung khóa học
                      </h3>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      {chapters.map((chapter, index) => {
                        const chapterCompleted = (chapter.lessons || []).length > 0 && (chapter.lessons || []).every((l: any) => completedLessonIds.includes(l.id));
                        const chapterCompletedCount = (chapter.lessons || []).filter((l: any) => completedLessonIds.includes(l.id)).length;
                        const chapterTotalCount = (chapter.lessons || []).length;
                        const chapterProgress = chapterTotalCount > 0 ? Math.round((chapterCompletedCount / chapterTotalCount) * 100) : 0;
                        return (
                          <div key={chapter.id} className="border-b border-outline-variant/15 last:border-b-0">
                            <button
                              onClick={() => toggleChapter(chapter.id)}
                              className="w-full p-4 flex items-center gap-3 hover:bg-surface-container-low/30 transition-all text-left"
                            >
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                chapterCompleted ? "bg-tertiary/10 text-tertiary" : "bg-primary/10 text-primary"
                              }`}>
                                {chapterCompleted ? <span className="material-symbols-outlined text-[16px]">check</span> : index + 1}
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
                                {(chapter.lessons || []).map((lesson: any) => {
                                  const isCurrent = activeLesson?.id === lesson.id;
                                  const isCompleted = completedLessonIds.includes(lesson.id);
                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => selectLesson(lesson)}
                                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                                        isCurrent
                                          ? "bg-primary/10 border border-primary/20"
                                          : isCompleted
                                          ? "bg-surface-container-low/50 hover:bg-surface-container-low"
                                          : "hover:bg-surface-container-low/50"
                                      }`}
                                    >
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        isCompleted
                                          ? "bg-tertiary/20 text-tertiary"
                                          : isCurrent
                                          ? "bg-primary text-on-primary"
                                          : "bg-surface-container-high text-on-surface-variant"
                                      }`}>
                                        {isCompleted ? (
                                          <span className="material-symbols-outlined text-[14px]">check</span>
                                        ) : (
                                          <span className="material-symbols-outlined text-[14px]">{getLessonIcon(lesson.type || "video")}</span>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-xs truncate ${isCurrent ? "font-bold text-primary" : isCompleted ? "text-on-surface-variant" : "text-on-surface"}`}>
                                          {lesson.title}
                                        </p>
                                      </div>
                                      <span className="text-xs text-on-surface-variant flex-shrink-0">{lesson.duration || "Video"}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Related Documents */}
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                    <h3 className="font-headline-md text-on-surface mb-4 flex items-center gap-2 font-semibold">
                      <span className="material-symbols-outlined text-primary text-[20px]">attach_file</span>
                      Tài liệu bài học
                    </h3>
                    <div className="space-y-2">
                      {relatedDocs.length === 0 ? (
                        <p className="text-xs text-on-surface-variant py-4 text-center">Bài học này chưa đính kèm tài liệu.</p>
                      ) : (
                        relatedDocs.map((doc, i) => {
                          const fi = getFileIcon(doc.type);
                          return (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low/50 transition-all cursor-pointer group border border-outline-variant/10">
                              <span className={`material-symbols-outlined ${fi.color}`}>{fi.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-on-surface truncate group-hover:text-primary transition-colors">{doc.title}</p>
                                <p className="text-[10px] text-on-surface-variant">{fi.label}</p>
                              </div>
                              <a
                                href={doc.fileUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                              >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                              </a>
                            </div>
                          );
                        })
                      )}
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
        )}
      </div>
    </div>
  );
}

export default function LearningSpacePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-bright">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-3">progress_activity</span>
        <p className="text-on-surface-variant font-body-md">Đang tải không gian học tập...</p>
      </div>
    }>
      <LearningSpaceContent />
    </Suspense>
  );
}
