"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { documentService, type DocumentItem } from "@/lib/api/documents.api";
import { courseService } from "@/lib/api/service";

// File type icon mapping
function getFileIcon(type: string, fileName?: string) {
  const ext = fileName ? fileName.split(".").pop()?.toLowerCase() || "" : type;
  if (["pdf"].includes(ext) || type === "pdf") return { icon: "picture_as_pdf", color: "text-red-600", bg: "bg-red-50" };
  if (["doc", "docx"].includes(ext) || type === "doc") return { icon: "description", color: "text-blue-600", bg: "bg-blue-50" };
  if (["xls", "xlsx"].includes(ext)) return { icon: "table_chart", color: "text-green-600", bg: "bg-green-50" };
  if (["ppt", "pptx"].includes(ext) || type === "slide") return { icon: "slideshow", color: "text-orange-500", bg: "bg-orange-50" };
  if (["jpg", "jpeg", "png", "gif", "svg"].includes(ext) || type === "image") return { icon: "image", color: "text-purple-600", bg: "bg-purple-50" };
  if (["mp4", "avi", "mov"].includes(ext) || type === "video") return { icon: "movie", color: "text-pink-600", bg: "bg-pink-50" };
  if (["zip", "rar", "7z"].includes(ext)) return { icon: "folder_zip", color: "text-amber-600", bg: "bg-amber-50" };
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

const FILE_TYPES = ["Tất cả", "PDF", "DOCX", "XLSX", "PPTX", "Hình ảnh", "Video", "Khác"];

export default function LecturerDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("Tất cả");
  const [selectedCourse, setSelectedCourse] = useState("Tất cả");
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCourse, setUploadCourse] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadLessonId, setUploadLessonId] = useState("");
  const [uploadStatus, setUploadStatus] = useState("published");
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents từ API
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentService.getDocuments();
      if (res.success) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách tài liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load courses
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

  useEffect(() => {
    loadDocuments();
    loadCourses();
  }, []);

  // Show toast
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filter logic
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesType = true;
    const docType = doc.type;
    if (selectedFileType === "PDF") matchesType = docType === "pdf";
    else if (selectedFileType === "DOCX") matchesType = docType === "doc";
    else if (selectedFileType === "PPTX") matchesType = docType === "slide";
    else if (selectedFileType === "Hình ảnh") matchesType = docType === "image";
    else if (selectedFileType === "Video") matchesType = docType === "video";
    else if (selectedFileType === "Khác") matchesType = docType === "other";

    const matchesCourse = selectedCourse === "Tất cả" || doc.lesson?.title?.includes(selectedCourse) || false;
    return matchesSearch && matchesType && (selectedCourse === "Tất cả" || matchesCourse);
  });

  // Stats
  const totalDocs = documents.length;
  const courseNames = [...new Set(documents.map((d) => d.owner?.fullName || "").filter(Boolean))];
  const totalCourses = courseNames.length || courses.length;

  const handleDelete = async (id: string) => {
    try {
      const res = await documentService.deleteDocument(id);
      if (res.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        showToast("Xóa tài liệu thành công!");
      }
    } catch (err) {
      console.error("Lỗi khi xóa tài liệu:", err);
      showToast("Xóa tài liệu thất bại!");
    }
    setDeleteModalId(null);
  };

  // Upload
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0 || !uploadLessonId) return;
    setIsUploading(true);
    setUploadProgress(10);

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        const title = uploadTitle || file.name;
        const type = getDocumentType(file.name);

        setUploadProgress(Math.round(((i + 0.5) / uploadFiles.length) * 100));

        await documentService.uploadDocument(file, {
          lessonId: uploadLessonId,
          title,
          type,
          visibility: "enrolled_only",
          status: uploadStatus,
        });

        setUploadProgress(Math.round(((i + 1) / uploadFiles.length) * 100));
      }

      showToast(`Tải lên ${uploadFiles.length} tài liệu thành công!`);
      setShowUploadModal(false);
      setUploadFiles([]);
      setUploadTitle("");
      setUploadDesc("");
      setUploadLessonId("");
      await loadDocuments();
    } catch (err) {
      console.error("Lỗi upload:", err);
      showToast("Upload thất bại! Kiểm tra lại thông tin.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[200] bg-tertiary text-on-tertiary px-6 py-3 rounded-xl shadow-lg animate-fade-in flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
            <span className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined">folder_open</span>
            </span>
            Quản lý Tài liệu
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Tải lên, quản lý và chia sẻ tài liệu giảng dạy cho học viên.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/lecturer/documents/upload"
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-surface-container-low transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
            Trang Upload
          </Link>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-primary text-on-primary font-label-md px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
            Tải Lên Tài Liệu
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:border-primary/20 transition-all">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{totalDocs}</p>
            <p className="text-label-md text-on-surface-variant">Tổng tài liệu</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:border-primary/20 transition-all">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined">published_with_changes</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{documents.filter((d) => d.status === "published").length}</p>
            <p className="text-label-md text-on-surface-variant">Đã xuất bản</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:border-primary/20 transition-all">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{totalCourses}</p>
            <p className="text-label-md text-on-surface-variant">Khóa học liên kết</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tài liệu theo tên..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary cursor-pointer"
            >
              {FILE_TYPES.map((t) => (
                <option key={t} value={t}>{t === "Tất cả" ? "Loại file" : t}</option>
              ))}
            </select>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="Tất cả">Tất cả</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/30">
          <h3 className="font-headline-md text-lg text-on-surface">
            Danh sách tài liệu
            <span className="ml-2 text-sm font-normal text-on-surface-variant">({filteredDocs.length} tài liệu)</span>
          </h3>
          <button onClick={loadDocuments} className="p-2 hover:bg-surface-container-low rounded-lg transition-all text-on-surface-variant" title="Tải lại">
            <span className="material-symbols-outlined text-[20px]">refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-primary animate-spin block mb-3">progress_activity</span>
            <p className="text-on-surface-variant font-body-md">Đang tải danh sách tài liệu...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">search_off</span>
            <p className="text-on-surface-variant font-body-md">
              {documents.length === 0 ? "Chưa có tài liệu nào. Hãy tải lên tài liệu đầu tiên!" : "Không tìm thấy tài liệu nào phù hợp."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {filteredDocs.map((doc) => {
              const fi = getFileIcon(doc.type);
              return (
                <div key={doc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-low/30 transition-all group">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-11 h-11 rounded-xl ${fi.bg} ${fi.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="material-symbols-outlined">{fi.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-body-md font-semibold text-on-surface truncate">{doc.title}</h4>
                      <p className="text-xs text-on-surface-variant truncate">
                        {doc.lesson ? `Bài học: ${doc.lesson.title}` : "Chưa gắn bài học"}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-on-surface-variant">{doc.type.toUpperCase()}</span>
                        <span className="text-xs text-outline">•</span>
                        <span className="text-xs text-on-surface-variant">{formatDate(doc.createdAt)}</span>
                        <span className="text-xs text-outline">•</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          doc.status === "published" ? "bg-tertiary/10 text-tertiary" :
                          doc.status === "draft" ? "bg-amber-100 text-amber-700" :
                          doc.status === "archived" ? "bg-gray-100 text-gray-600" :
                          "bg-red-50 text-red-600"
                        }`}>
                          {doc.status === "published" ? "Đã xuất bản" :
                           doc.status === "draft" ? "Bản nháp" :
                           doc.status === "archived" ? "Lưu trữ" : doc.status}
                        </span>
                        {doc.owner && (
                          <>
                            <span className="text-xs text-outline">•</span>
                            <span className="text-xs text-on-surface-variant">{doc.owner.fullName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-on-surface-variant hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
                        title="Xem trước"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </a>
                      <a
                        href={doc.fileUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-on-surface-variant hover:bg-tertiary/10 hover:text-tertiary rounded-lg transition-all"
                        title="Tải xuống"
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </a>
                      <button
                        onClick={() => setDeleteModalId(doc.id)}
                        className="p-2 text-on-surface-variant hover:bg-error/10 hover:text-error rounded-lg transition-all"
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-fade-in" onClick={() => setDeleteModalId(null)}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">Xác nhận xóa</h3>
            </div>
            <p className="text-on-surface-variant mb-6">
              Bạn có chắc chắn muốn xóa tài liệu <strong>&quot;{documents.find((d) => d.id === deleteModalId)?.title}&quot;</strong>? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModalId(null)} className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-low transition-all">
                Hủy
              </button>
              <button onClick={() => handleDelete(deleteModalId)} className="px-5 py-2.5 rounded-xl bg-error text-on-error font-label-md hover:opacity-90 transition-all">
                Xóa tài liệu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-fade-in" onClick={() => { if (!isUploading) { setShowUploadModal(false); setUploadFiles([]); } }}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">cloud_upload</span>
                Tải lên tài liệu
              </h3>
              {!isUploading && (
                <button onClick={() => { setShowUploadModal(false); setUploadFiles([]); }} className="p-1 hover:bg-surface-container-low rounded-lg transition-all">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              )}
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-5 ${
                isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-outline-variant hover:border-primary/50 hover:bg-surface-container-low/50"
              }`}
            >
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
              <span className={`material-symbols-outlined text-[48px] mb-3 block transition-colors ${isDragging ? "text-primary" : "text-outline"}`}>
                {isDragging ? "file_download" : "cloud_upload"}
              </span>
              <p className="font-body-md text-on-surface font-semibold">
                {isDragging ? "Thả file tại đây!" : "Kéo & thả file vào đây"}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">hoặc nhấn để chọn file • PDF, DOCX, XLSX, PPTX, hình ảnh, video</p>
            </div>

            {/* Selected files */}
            {uploadFiles.length > 0 && (
              <div className="mb-5 space-y-2">
                <p className="text-label-md font-semibold text-on-surface">File đã chọn:</p>
                {uploadFiles.map((f, i) => {
                  const fi = getFileIcon(getDocumentType(f.name), f.name);
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                      <span className={`material-symbols-outlined ${fi.color}`}>{fi.icon}</span>
                      <span className="text-sm text-on-surface flex-1 truncate">{f.name}</span>
                      <span className="text-xs text-on-surface-variant">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                      {!isUploading && (
                        <button onClick={() => setUploadFiles((prev) => prev.filter((_, idx) => idx !== i))} className="p-1 text-on-surface-variant hover:text-error">
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Metadata form */}
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-label-md font-semibold text-on-surface block mb-1">Tiêu đề (tùy chọn)</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Nhập tiêu đề cho tài liệu..."
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-label-md font-semibold text-on-surface block mb-1">ID Bài học (lessonId) <span className="text-error">*</span></label>
                <input
                  type="text"
                  value={uploadLessonId}
                  onChange={(e) => setUploadLessonId(e.target.value)}
                  placeholder="Nhập UUID bài học..."
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-on-surface-variant mt-1">Lấy từ danh sách bài học trong quản lý chương trình</p>
              </div>
              <div>
                <label className="text-label-md font-semibold text-on-surface block mb-1">Trạng thái</label>
                <select
                  value={uploadStatus}
                  onChange={(e) => setUploadStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="draft">Bản nháp</option>
                  <option value="published">Xuất bản</option>
                  <option value="restricted">Hạn chế</option>
                </select>
              </div>
            </div>

            {/* Upload progress */}
            {isUploading && (
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface-variant">Đang tải lên...</span>
                  <span className="font-bold text-primary">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 justify-end">
              {!isUploading && (
                <button onClick={() => { setShowUploadModal(false); setUploadFiles([]); }} className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-low transition-all">
                  Hủy
                </button>
              )}
              <button
                onClick={handleUpload}
                disabled={uploadFiles.length === 0 || isUploading || !uploadLessonId}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Đang tải...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    Tải lên
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
