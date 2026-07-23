"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { documentService, courseService } from "@/lib/api/service";

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) return { icon: "picture_as_pdf", color: "text-red-600", bg: "bg-red-50" };
  if (["doc", "docx"].includes(ext)) return { icon: "description", color: "text-blue-600", bg: "bg-blue-50" };
  if (["xls", "xlsx"].includes(ext)) return { icon: "table_chart", color: "text-green-600", bg: "bg-green-50" };
  if (["ppt", "pptx"].includes(ext)) return { icon: "slideshow", color: "text-orange-500", bg: "bg-orange-50" };
  if (["jpg", "jpeg", "png", "gif", "svg"].includes(ext)) return { icon: "image", color: "text-purple-600", bg: "bg-purple-50" };
  if (["mp4", "avi", "mov"].includes(ext)) return { icon: "movie", color: "text-pink-600", bg: "bg-pink-50" };
  return { icon: "draft", color: "text-gray-600", bg: "bg-gray-50" };
}

function getDocumentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["ppt", "pptx"].includes(ext)) return "slide";
  if (["jpg", "jpeg", "png", "gif", "svg"].includes(ext)) return "image";
  if (["mp4", "avi", "mov"].includes(ext)) return "video";
  return "other";
}

export default function LecturerDocumentUploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [status, setStatus] = useState("published");
  const [visibility, setVisibility] = useState("enrolled_only");
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [uploadCourseId, setUploadCourseId] = useState("");
  const [uploadChapterId, setUploadChapterId] = useState("");
  const [uploadChapters, setUploadChapters] = useState<any[]>([]);
  const [uploadLessons, setUploadLessons] = useState<any[]>([]);

  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");


  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await courseService.getCourses();
        if (res.success && res.data) {
          const courseList = (res.data as unknown as { id: string; name: string }[]).map((c) => ({
            id: c.id,
            name: c.name,
          }));
          setCourses(courseList);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách khóa học:", err);
      }
    };
    loadCourses();
  }, []);

  const handleCourseChange = async (courseId: string) => {
    setUploadCourseId(courseId);
    setUploadChapterId("");
    setLessonId("");
    setUploadChapters([]);
    setUploadLessons([]);
    if (!courseId) return;

    try {
      const res = await courseService.getChaptersAndLessons(courseId);
      if (res.success && res.data) {
        setUploadChapters(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách chương học:", err);
    }
  };

  const handleChapterChange = (chapterId: string) => {
    setUploadChapterId(chapterId);
    setLessonId("");
    const selectedChapter = uploadChapters.find((ch) => ch.id === chapterId);
    if (selectedChapter && selectedChapter.lessons) {
      setUploadLessons(selectedChapter.lessons);
    } else {
      setUploadLessons([]);
    }
  };

  const handleCreateChapter = async () => {
    if (!uploadCourseId || !newChapterTitle.trim()) return;
    try {
      const res = await courseService.createChapter(uploadCourseId, { title: newChapterTitle, orderIndex: uploadChapters.length + 1 });
      if (res.success && res.data) {
        setUploadChapters([...uploadChapters, res.data]);
        setUploadChapterId(res.data.id);
        setIsCreatingChapter(false);
        setNewChapterTitle("");
        setUploadLessons([]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Tạo chương thất bại");
    }
  };

  const handleCreateLesson = async () => {
    if (!uploadCourseId || !uploadChapterId || !newLessonTitle.trim()) return;
    try {
      const res = await courseService.createLesson(uploadCourseId, uploadChapterId, { title: newLessonTitle, type: "video", orderIndex: uploadLessons.length + 1 });
      if (res.success && res.data) {
        const newLesson = res.data;
        setUploadLessons([...uploadLessons, newLesson]);
        setLessonId(newLesson.id);
        setIsCreatingLesson(false);
        setNewLessonTitle("");
        setUploadChapters(uploadChapters.map(ch => ch.id === uploadChapterId ? { ...ch, lessons: [...(ch.lessons || []), newLesson] } : ch));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Tạo bài học thất bại");
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (files.length === 0 || !lessonId.trim()) {
      setErrorMsg("Vui lòng chọn file và bài học liên kết.");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setErrorMsg(null);
    let uploaded = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const docTitle = title || file.name;
        const docType = getDocumentType(file.name);

        setProgress(Math.round(((i + 0.3) / files.length) * 100));

        await documentService.uploadDocument(file, {
          lessonId: lessonId.trim(),
          title: docTitle,
          type: docType,
          visibility,
          status,
        });

        uploaded++;
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setUploadedCount(uploaded);
      setIsDone(true);
    } catch (err: any) {
      console.error("Upload failed:", err);
      const msg = err.response?.data?.message || err.message || "Upload thất bại. Vui lòng thử lại.";
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setTitle("");
    setDescription("");
    setLessonId("");
    setUploadCourseId("");
    setUploadChapterId("");
    setUploadChapters([]);
    setUploadLessons([]);
    setTags("");
    setIsDone(false);
    setProgress(0);
    setErrorMsg(null);
    setUploadedCount(0);
  };

  if (isDone) {
    return (
      <div className="p-stack-md max-w-container-max mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-tertiary/10 flex items-center justify-center mb-6 animate-scale-up">
            <span className="material-symbols-outlined text-[40px] text-tertiary">check_circle</span>
          </div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2 animate-fade-in">Tải lên thành công!</h2>
          <p className="text-on-surface-variant font-body-md mb-8 animate-fade-in">
            {uploadedCount} tài liệu đã được tải lên thành công.
          </p>
          <div className="flex gap-3 animate-fade-in">
            <button onClick={handleReset} className="px-6 py-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md rounded-xl hover:bg-surface-container-low transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Tải thêm
            </button>
            <Link href="/lecturer/documents" className="px-6 py-3 bg-primary text-on-primary font-label-md rounded-xl hover:opacity-90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">folder_open</span>
              Về danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/lecturer/documents" className="p-2 rounded-xl hover:bg-surface-container-low transition-all text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Tải lên tài liệu</h1>
            <p className="font-body-md text-on-surface-variant mt-0.5">Thêm tài liệu mới cho học viên</p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-error">{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)} className="ml-auto p-1 hover:bg-error/10 rounded-lg">
            <span className="material-symbols-outlined text-error text-[18px]">close</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Drag & Drop + File list */}
        <div className="lg:col-span-3 space-y-5">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10"
                : "border-outline-variant hover:border-primary/50 hover:bg-surface-container-low/30 bg-surface-container-lowest"
            }`}
          >
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-all ${isDragging ? "bg-primary/10 text-primary scale-110" : "bg-surface-container-low text-outline"}`}>
              <span className="material-symbols-outlined text-[40px]">{isDragging ? "file_download" : "cloud_upload"}</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">{isDragging ? "Thả file tại đây!" : "Kéo & thả file vào khu vực này"}</h3>
            <p className="text-on-surface-variant text-sm mb-4">hoặc nhấn để chọn file từ máy tính</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["PDF", "DOCX", "XLSX", "PPTX", "Hình ảnh", "Video"].map((type) => (
                <span key={type} className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-xs rounded-full">{type}</span>
              ))}
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center">
                <h3 className="font-label-md font-semibold text-on-surface">{files.length} file đã chọn</h3>
                <button onClick={() => setFiles([])} className="text-xs text-error hover:underline">Xóa tất cả</button>
              </div>
              <div className="divide-y divide-outline-variant/15 max-h-[300px] overflow-y-auto">
                {files.map((f, i) => {
                  const fi = getFileIcon(f.name);
                  const sizeStr = f.size >= 1048576 ? (f.size / 1048576).toFixed(1) + " MB" : (f.size / 1024).toFixed(0) + " KB";
                  return (
                    <div key={i} className="p-4 flex items-center gap-3 hover:bg-surface-container-low/30 transition-all">
                      <div className={`w-10 h-10 rounded-lg ${fi.bg} ${fi.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="material-symbols-outlined text-[20px]">{fi.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">{f.name}</p>
                        <p className="text-xs text-on-surface-variant">{sizeStr}</p>
                      </div>
                      {!isUploading && (
                        <button onClick={() => removeFile(i)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-surface-container-lowest rounded-xl border border-primary/20 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
                  <span className="font-label-md text-on-surface">Đang tải lên...</span>
                </div>
                <span className="text-lg font-bold text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-on-surface-variant mt-2">Đang xử lý {files.length} file — vui lòng không đóng trang</p>
            </div>
          )}
        </div>

        {/* Right: Metadata Form */}
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 sticky top-20">
            <h3 className="font-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
              Thông tin tài liệu
            </h3>

            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1.5">Tiêu đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề tài liệu..."
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1.5">Mô tả</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về nội dung tài liệu..."
                rows={3}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all"
              />
            </div>

            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1.5">Khóa học <span className="text-error">*</span></label>
              <select
                value={uploadCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary cursor-pointer transition-all"
              >
                <option value="">Chọn khóa học...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {uploadCourseId && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-label-md font-semibold text-on-surface">Chương học <span className="text-error">*</span></label>
                  {!isCreatingChapter ? (
                    <button onClick={() => setIsCreatingChapter(true)} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">add</span>Thêm mới
                    </button>
                  ) : (
                    <button onClick={() => setIsCreatingChapter(false)} className="text-xs text-on-surface-variant hover:underline">
                      Hủy
                    </button>
                  )}
                </div>
                {isCreatingChapter ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChapterTitle}
                      onChange={(e) => setNewChapterTitle(e.target.value)}
                      placeholder="Tên chương học..."
                      className="flex-1 px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <button onClick={handleCreateChapter} disabled={!newChapterTitle.trim()} className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md hover:opacity-90 disabled:opacity-50">
                      Tạo
                    </button>
                  </div>
                ) : (
                  <select
                    value={uploadChapterId}
                    onChange={(e) => handleChapterChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary cursor-pointer transition-all"
                  >
                    <option value="">Chọn chương học...</option>
                    {uploadChapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>{ch.title}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {uploadChapterId && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-label-md font-semibold text-on-surface">Bài học <span className="text-error">*</span></label>
                  {!isCreatingLesson ? (
                    <button onClick={() => setIsCreatingLesson(true)} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">add</span>Thêm mới
                    </button>
                  ) : (
                    <button onClick={() => setIsCreatingLesson(false)} className="text-xs text-on-surface-variant hover:underline">
                      Hủy
                    </button>
                  )}
                </div>
                {isCreatingLesson ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="Tên bài học..."
                      className="flex-1 px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <button onClick={handleCreateLesson} disabled={!newLessonTitle.trim()} className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md hover:opacity-90 disabled:opacity-50">
                      Tạo
                    </button>
                  </div>
                ) : (
                  <select
                    value={lessonId}
                    onChange={(e) => setLessonId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary cursor-pointer transition-all"
                  >
                    <option value="">Chọn bài học...</option>
                    {uploadLessons.map((l) => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-label-md font-semibold text-on-surface block mb-1.5">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary cursor-pointer transition-all"
                >
                  <option value="draft">Bản nháp</option>
                  <option value="published">Xuất bản</option>
                  <option value="restricted">Hạn chế</option>
                </select>
              </div>
              <div>
                <label className="text-label-md font-semibold text-on-surface block mb-1.5">Quyền xem</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary cursor-pointer transition-all"
                >
                  <option value="enrolled_only">Học viên đã ghi danh</option>
                  <option value="public">Công khai</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1.5">Tags (phân cách bằng dấu phẩy)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ielts, writing, task1..."
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {tags && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.split(",").map((tag, i) => tag.trim() && (
                    <span key={i} className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">{tag.trim()}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-outline-variant/20 flex flex-col gap-3">
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading || !lessonId.trim()}
                className="w-full py-3 bg-primary text-on-primary font-label-md rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                Tải lên {files.length > 0 ? `(${files.length} file)` : ""}
              </button>
              <Link href="/lecturer/documents" className="w-full py-3 border border-outline-variant text-on-surface font-label-md rounded-xl hover:bg-surface-container-low transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Quay về danh sách
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
