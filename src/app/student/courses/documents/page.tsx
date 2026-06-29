"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { documentService, courseService } from "@/lib/api/service";
import { type DocumentItem } from "@/lib/api/documents.api";

function getFileIcon(type: string) {
  if (type === "pdf") return { icon: "picture_as_pdf", color: "text-red-600", bg: "bg-red-50", label: "PDF" };
  if (type === "doc") return { icon: "description", color: "text-blue-600", bg: "bg-blue-50", label: "DOCX" };
  if (type === "slide") return { icon: "slideshow", color: "text-orange-500", bg: "bg-orange-50", label: "PPTX" };
  if (type === "image") return { icon: "image", color: "text-purple-600", bg: "bg-purple-50", label: "IMG" };
  if (type === "video") return { icon: "movie", color: "text-pink-600", bg: "bg-pink-50", label: "VIDEO" };
  return { icon: "draft", color: "text-gray-600", bg: "bg-gray-50", label: "FILE" };
}

const FILE_TYPES = ["Tất cả", "PDF", "DOCX", "PPTX", "Hình ảnh", "Video", "Khác"];

export default function StudentDocumentsPage() {
  const user = useAuthStore((s) => s.user);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Tất cả");
  const [selectedCourse, setSelectedCourse] = useState("Tất cả");
  const [courses, setCourses] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load documents từ API
  const loadDocuments = async (courseId?: string) => {
    try {
      setLoading(true);
      const params = courseId && courseId !== "Tất cả" ? { courseId } : undefined;
      const res = await documentService.getDocuments(params);
      if (res.success) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách tài liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await courseService.getCourses();
      if (res.success && res.data) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách khóa học:", err);
    }
  };

  useEffect(() => {
    loadDocuments(selectedCourse === "Tất cả" ? undefined : selectedCourse);
  }, [selectedCourse]);

  useEffect(() => {
    loadCourses();
  }, []);

  // Filter
  const filteredDocs = documents.filter((doc) => {
    const matchSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    let matchType = true;
    if (selectedType === "PDF") matchType = doc.type === "pdf";
    else if (selectedType === "DOCX") matchType = doc.type === "doc";
    else if (selectedType === "PPTX") matchType = doc.type === "slide";
    else if (selectedType === "Hình ảnh") matchType = doc.type === "image";
    else if (selectedType === "Video") matchType = doc.type === "video";
    else if (selectedType === "Khác") matchType = doc.type === "other";
    return matchSearch && matchType;
  });

  // Group by owner (lecturer)
  const groupedDocs = filteredDocs.reduce<Record<string, DocumentItem[]>>((acc, doc) => {
    const key = doc.owner?.fullName || "Không rõ";
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

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
            <span className="material-symbols-outlined">school</span>
            <span>Quản lý khóa học</span>
          </Link>
          <Link href="/student/courses/documents" className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg font-label-md transition-all duration-200">
            <span className="material-symbols-outlined">folder_open</span>
            <span>Tài liệu</span>
          </Link>
          <Link href="/student/courses/quizzes" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">quiz</span>
            <span>Bài kiểm tra</span>
          </Link>
          <Link href="/student/schedules" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">calendar_month</span>
            <span>Lịch học</span>
          </Link>
          <Link href="/student/courses/progress" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">insights</span>
            <span>Tiến độ học tập</span>
          </Link>
          <Link href="/student/courses/learning-space" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 rounded-lg font-label-md">
            <span className="material-symbols-outlined">cast_for_education</span>
            <span>Không gian học tập</span>
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-72 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 w-full z-40 flex justify-between items-center px-margin-desktop py-4 bg-surface shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/student/dashboard" className="p-2 rounded-lg hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </Link>
            <h2 className="text-headline-md font-headline-md text-on-surface">Tài liệu học tập</h2>
          </div>
          <div className="flex items-center gap-3">
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

        <main className="p-margin-desktop flex-1">
          <div className="max-w-container-max mx-auto space-y-6">
            {/* Search & Filters */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm tài liệu..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="flex gap-3 flex-wrap items-center">
                  <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary cursor-pointer">
                    <option value="Tất cả">Tất cả khóa học</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary cursor-pointer">
                    {FILE_TYPES.map((t) => <option key={t} value={t}>{t === "Tất cả" ? "Loại file" : t}</option>)}
                  </select>
                  <div className="flex bg-surface-container-low rounded-xl border border-outline-variant/50 overflow-hidden">
                    <button onClick={() => setViewMode("grid")} className={`p-2.5 transition-all ${viewMode === "grid" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"}`}>
                      <span className="material-symbols-outlined text-[20px]">grid_view</span>
                    </button>
                    <button onClick={() => setViewMode("list")} className={`p-2.5 transition-all ${viewMode === "list" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"}`}>
                      <span className="material-symbols-outlined text-[20px]">view_list</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">description</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-on-surface">{filteredDocs.length}</p>
                  <p className="text-xs text-on-surface-variant">Tài liệu</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-on-surface">{Object.keys(groupedDocs).length}</p>
                  <p className="text-xs text-on-surface-variant">Giảng viên</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-on-surface">Miễn phí</p>
                  <p className="text-xs text-on-surface-variant">Tải xuống</p>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-12 text-center">
                <span className="material-symbols-outlined text-[48px] text-primary animate-spin block mb-3">progress_activity</span>
                <p className="text-on-surface-variant">Đang tải danh sách tài liệu...</p>
              </div>
            ) : Object.keys(groupedDocs).length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-12 text-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">search_off</span>
                <p className="text-on-surface-variant">
                  {documents.length === 0 ? "Chưa có tài liệu nào cho các khóa học của bạn." : "Không tìm thấy tài liệu nào phù hợp."}
                </p>
              </div>
            ) : (
              Object.entries(groupedDocs).map(([ownerName, docs]) => (
                <div key={ownerName} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <div className="p-5 border-b border-outline-variant/20 bg-surface-container-low/30 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">person</span>
                    <h3 className="font-headline-md text-on-surface">{ownerName}</h3>
                    <span className="ml-auto text-xs text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">{docs.length} tài liệu</span>
                  </div>

                  {viewMode === "grid" ? (
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {docs.map((doc) => {
                        const fi = getFileIcon(doc.type);
                        return (
                          <div key={doc.id} className="group bg-surface-container-low/30 rounded-xl border border-outline-variant/20 p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-12 h-12 rounded-xl ${fi.bg} ${fi.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                                <span className="material-symbols-outlined">{fi.icon}</span>
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{doc.title}</h4>
                                <span className="text-xs text-on-surface-variant">{fi.label}</span>
                              </div>
                            </div>
                            {doc.lesson && (
                              <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">
                                <span className="material-symbols-outlined text-[12px] align-middle mr-1">menu_book</span>
                                {doc.lesson.title}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                                <span className="material-symbols-outlined text-[14px]">person</span>
                                {doc.owner?.fullName || "—"}
                              </div>
                              <span className="text-xs text-on-surface-variant">{formatDate(doc.createdAt)}</span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-outline-variant/20 flex gap-2">
                              <a
                                href={doc.fileUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 bg-primary text-on-primary rounded-lg text-xs font-medium hover:opacity-90 transition-all flex items-center justify-center gap-1 active:scale-95"
                              >
                                <span className="material-symbols-outlined text-[16px]">download</span>
                                Tải xuống
                              </a>
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2 px-3 border border-outline-variant/50 text-on-surface-variant rounded-lg text-xs hover:bg-surface-container-low transition-all active:scale-95"
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="divide-y divide-outline-variant/15">
                      {docs.map((doc) => {
                        const fi = getFileIcon(doc.type);
                        return (
                          <div key={doc.id} className="p-5 flex items-center gap-4 hover:bg-surface-container-low/30 transition-all group">
                            <div className={`w-11 h-11 rounded-xl ${fi.bg} ${fi.color} flex items-center justify-center flex-shrink-0`}>
                              <span className="material-symbols-outlined">{fi.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-on-surface truncate">{doc.title}</h4>
                              <p className="text-xs text-on-surface-variant truncate">
                                {doc.lesson ? doc.lesson.title : "—"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-on-surface-variant">{fi.label}</span>
                                <span className="text-xs text-outline">•</span>
                                <span className="text-xs text-on-surface-variant">{formatDate(doc.createdAt)}</span>
                                <span className="text-xs text-outline">•</span>
                                <span className="text-xs text-on-surface-variant">{doc.owner?.fullName || "—"}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <a
                                href={doc.fileUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2 px-4 bg-primary text-on-primary rounded-lg text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1 active:scale-95"
                              >
                                <span className="material-symbols-outlined text-[16px]">download</span>
                                Tải xuống
                              </a>
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all"
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
