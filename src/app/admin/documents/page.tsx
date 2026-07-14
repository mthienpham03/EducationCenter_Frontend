"use client";

import React, { useState, useEffect, useRef } from 'react';
import { documentsApi, DocumentEntity } from '@/lib/api/documents.api';
export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('restricted');
  const [status, setStatus] = useState('draft');
  const [lessonId, setLessonId] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentsApi.getDocuments();
      if (res.success && res.data) {
        setDocuments(res.data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      alert("Không thể tải danh sách tài liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Vui lòng chọn tệp tin cần tải lên");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      formData.append('visibility', visibility);
      formData.append('status', status);
      if (lessonId) formData.append('lessonId', lessonId);

      const res = await documentsApi.uploadDocument(formData);
      if (res.success) {
        alert("Tải lên tài liệu thành công");
        setIsModalOpen(false);
        resetForm();
        fetchDocuments(); // refresh list
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "Lỗi khi tải lên tài liệu");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setVisibility('restricted');
    setStatus('draft');
    setLessonId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    
    try {
      const res = await documentsApi.deleteDocument(id);
      if (res.success) {
        alert("Đã xóa tài liệu");
        fetchDocuments();
      }
    } catch (error) {
      alert("Không thể xóa tài liệu");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="p-stack-lg max-w-container-max mx-auto space-y-stack-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Quản lý tài liệu</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Tải lên và quản lý tất cả giáo trình, tài liệu tham khảo cho toàn hệ thống.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary font-label-md px-stack-md py-stack-sm rounded-lg flex items-center gap-base hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>upload</span>
          Tải lên tài liệu
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/30">
          <h3 className="font-headline-md text-lg text-on-surface">Danh sách tài liệu đã tải lên</h3>
        </div>
        
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">Chưa có tài liệu nào trên hệ thống.</div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {documents.map((doc) => (
              <div key={doc.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-low/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                      {doc.type === 'PDF' ? 'picture_as_pdf' : doc.type === 'PPT' ? 'slideshow' : doc.type === 'Video' ? 'movie' : 'description'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">{doc.title}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-caption text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{doc.type}</span>
                      <span className={`text-caption px-2 py-0.5 rounded-full ${doc.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>{doc.status}</span>
                      <span className="text-caption text-on-surface-variant">&bull; Tải lên ngày {formatDate(doc.createdAt)}</span>
                      {doc.owner && (
                         <span className="text-caption text-on-surface-variant">&bull; Người đăng: {doc.owner.fullName}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {doc.lesson && (
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-lg">
                      <span className="material-symbols-outlined text-sm text-primary">play_lesson</span>
                      <span className="text-caption text-on-surface-variant max-w-[200px] truncate" title={doc.lesson.title}>{doc.lesson.title}</span>
                    </div>
                  )}
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-3 text-on-surface-variant bg-surface-container hover:bg-primary hover:text-on-primary rounded-lg transition-all" title="Xem tài liệu">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>visibility</span>
                  </a>
                  <button onClick={() => handleDelete(doc.id)} className="p-3 text-error bg-surface-container hover:bg-error-container hover:text-error rounded-lg transition-all" title="Xóa tài liệu">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-headline-md font-headline-md text-on-surface">Tải lên tài liệu mới</h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-6">
              <div>
                <label className="block text-label-md font-bold text-on-surface mb-2">Tệp tin *</label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx,.mp4,.mov,.avi,.mkv"
                  className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-primary hover:file:bg-primary/20"
                  required
                />
                <p className="text-caption text-on-surface-variant mt-2">Định dạng hỗ trợ: PDF (tối đa 10MB), PPT (20MB), Video (50MB).</p>
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-2">Tiêu đề tài liệu</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề (nếu để trống sẽ dùng tên file)"
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface"
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-2">Trạng thái</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface"
                >
                  <option value="draft">Nháp (Draft)</option>
                  <option value="published">Xuất bản (Published)</option>
                  <option value="restricted">Hạn chế (Restricted)</option>
                  <option value="archived">Lưu trữ (Archived)</option>
                </select>
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-2">Quyền hiển thị</label>
                <select 
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface"
                >
                  <option value="restricted">Chỉ dành cho học viên tham gia (Restricted)</option>
                  <option value="public">Công khai (Public)</option>
                </select>
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-2">Liên kết bài học (ID - Tùy chọn)</label>
                <input 
                  type="text" 
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                  placeholder="Nhập ID bài học (UUID) nếu muốn liên kết"
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-6 py-2 rounded-lg text-primary hover:bg-primary-container transition-colors font-label-md"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading || !file}
                  className="px-6 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      Đang tải lên...
                    </>
                  ) : 'Tải lên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
