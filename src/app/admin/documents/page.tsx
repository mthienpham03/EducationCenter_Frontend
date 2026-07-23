"use client";

import React, { useState, useEffect, useRef } from 'react';
import { documentsApi, DocumentEntity } from '@/lib/api/documents.api';
import { api } from '@/lib/api/service';
import { usersApi } from '@/lib/api/users.api';
import { axiosClient } from '@/lib/api/axios';
import * as ApiTypes from "@/lib/types/api.types";
import { toast } from 'react-toastify';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('enrolled');
  const [status, setStatus] = useState('draft');
  const [changeNote, setChangeNote] = useState('');
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  
  // Classification
  const [courses, setCourses] = useState<ApiTypes.Course[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [lessonId, setLessonId] = useState('');
  
  // Confirm Dialog states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  
  // Filter states
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCourseId, setFilterCourseId] = useState('');
  const [filterChapterId, setFilterChapterId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterChapters, setFilterChapters] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const versionFileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: import('@/lib/api/documents.api').GetDocumentsParams = {};
      if (filterSearch) params.search = filterSearch;
      if (filterCourseId) params.courseId = filterCourseId;
      if (filterChapterId) params.chapterId = filterChapterId;
      if (filterStatus) params.status = filterStatus;

      const res = await documentsApi.getDocuments(params);
      if (res.success && res.data) {
        setDocuments(res.data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Không thể tải danh sách tài liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.course.getCourses();
      if (res.success && res.data) {
        setCourses(res.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchChapters = async (courseId: string) => {
    try {
      const res = await axiosClient.get(`/courses/${courseId}/chapters`);
      if (res.data.success) {
        setChapters(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await usersApi.getUsers(undefined, 'student');
      if (res.success && res.data) {
        setStudentsList(res.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDocuments();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSearch, filterCourseId, filterChapterId, filterStatus]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchChapters(selectedCourseId);
      setSelectedChapterId('');
      setLessonId('');
      setLessons([]);
    } else {
      setChapters([]);
      setSelectedChapterId('');
      setLessonId('');
      setLessons([]);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedChapterId) {
      const chapter = chapters.find(c => c.id === selectedChapterId);
      if (chapter && chapter.lessons) {
        setLessons(chapter.lessons);
      } else {
        setLessons([]);
      }
      setLessonId('');
    } else {
      setLessons([]);
      setLessonId('');
    }
  }, [selectedChapterId, chapters]);

  useEffect(() => {
    if (filterCourseId) {
      axiosClient.get(`/courses/${filterCourseId}/chapters`)
        .then(res => {
          if (res.data.success) {
            setFilterChapters(res.data.data);
          }
        })
        .catch(err => console.error(err));
    } else {
      setFilterChapters([]);
    }
    setFilterChapterId('');
  }, [filterCourseId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.warning("Vui lòng chọn tệp tin cần tải lên");
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
      if (visibility === 'restricted' && assignedStudentIds.length > 0) {
        formData.append('assignedStudentIds', JSON.stringify(assignedStudentIds));
      }

      const res = await documentsApi.uploadDocument(formData);
      if (res.success) {
        toast.success("Tải lên tài liệu thành công");
        setIsUploadModalOpen(false);
        resetForm();
        fetchDocuments();
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải lên tài liệu");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.warning("Vui lòng chọn tệp tin phiên bản mới");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (changeNote) formData.append('changeNote', changeNote);

      const res = await documentsApi.addDocumentVersion(selectedDocId, formData);
      if (res.success) {
        toast.success("Cập nhật phiên bản thành công");
        setIsVersionModalOpen(false);
        resetForm();
        fetchDocuments();
      }
    } catch (error: any) {
      console.error("Add version error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật phiên bản");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setVisibility('enrolled');
    setStatus('draft');
    setLessonId('');
    setSelectedCourseId('');
    setSelectedChapterId('');
    setChangeNote('');
    setSelectedDocId('');
    setAssignedStudentIds([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (versionFileInputRef.current) versionFileInputRef.current.value = '';
  };

  const requestDelete = (id: string) => {
    setDocToDelete(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!docToDelete) return;
    
    try {
      const res = await documentsApi.deleteDocument(docToDelete);
      if (res.success) {
        toast.success("Đã xóa tài liệu");
        fetchDocuments();
      }
    } catch (error) {
      toast.error("Không thể xóa tài liệu");
    } finally {
      setIsConfirmOpen(false);
      setDocToDelete(null);
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
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-primary text-on-primary font-label-md px-stack-md py-stack-sm rounded-lg flex items-center gap-base hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>upload</span>
          Tải lên tài liệu
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="p-6 border-b border-outline-variant/20 flex flex-col gap-4 bg-surface-container-low/30">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-md text-lg text-on-surface">Danh sách tài liệu đã tải lên</h3>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <input 
                type="text" 
                placeholder="Tìm kiếm tài liệu..." 
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div>
              <select 
                value={filterCourseId}
                onChange={(e) => setFilterCourseId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm"
              >
                <option value="">-- Tất cả khóa học --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <select 
                value={filterChapterId}
                onChange={(e) => setFilterChapterId(e.target.value)}
                disabled={!filterCourseId || filterChapters.length === 0}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm disabled:opacity-50"
              >
                <option value="">-- Tất cả chương --</option>
                {filterChapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm"
              >
                <option value="">-- Mọi trạng thái --</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Nháp</option>
                <option value="restricted">Bị giới hạn</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>
          </div>
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
                  
                  <button 
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setIsVersionModalOpen(true);
                    }} 
                    className="p-3 text-secondary bg-surface-container hover:bg-secondary-container hover:text-secondary rounded-lg transition-all" 
                    title="Cập nhật phiên bản mới"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>history</span>
                  </button>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-3 text-on-surface-variant bg-surface-container hover:bg-primary hover:text-on-primary rounded-lg transition-all" title="Xem tài liệu">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>visibility</span>
                  </a>
                  <button onClick={() => requestDelete(doc.id)} className="p-3 text-error bg-surface-container hover:bg-error-container hover:text-error rounded-lg transition-all" title="Xóa tài liệu">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Xóa tài liệu"
        message="Bạn có chắc chắn muốn xóa tài liệu này? Thao tác này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={executeDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setDocToDelete(null);
        }}
      />

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-headline-md font-headline-md text-on-surface">Tải lên tài liệu mới</h2>
              <button onClick={() => { setIsUploadModalOpen(false); resetForm(); }} className="text-on-surface-variant hover:text-on-surface">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-2">Trạng thái</label>
                  <select 
                    value={status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setStatus(newStatus);
                      if (newStatus !== 'published') {
                        setVisibility('restricted');
                      } else {
                        setVisibility('enrolled');
                      }
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface"
                  >
                    <option value="draft">Nháp (Draft)</option>
                    <option value="published">Đã xuất bản (Published)</option>
                    <option value="restricted">Bị giới hạn (Restricted)</option>
                    <option value="archived">Lưu trữ (Archived)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-2">Phạm vi hiển thị</label>
                  <select 
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    disabled={status !== 'published'}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface disabled:opacity-50 disabled:bg-surface-container"
                  >
                    <option value="public">Công khai (Public)</option>
                    <option value="enrolled">Học viên khóa học (Enrolled)</option>
                    <option value="restricted">Giới hạn danh sách (Restricted)</option>
                  </select>
                </div>
              </div>

              {/* Student Assignment */}
              {visibility === 'restricted' && (
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-label-lg font-bold text-on-surface">Cấp quyền truy cập cho Sinh viên</h4>
                    <span className="text-label-sm text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                      Đã chọn: {assignedStudentIds.length}
                    </span>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto border border-outline-variant rounded-lg bg-surface">
                    {studentsList.length === 0 ? (
                      <div className="p-4 text-center text-on-surface-variant text-sm">Không có sinh viên nào trong hệ thống</div>
                    ) : (
                      <div className="divide-y divide-outline-variant/50">
                        {studentsList.map(student => (
                          <label key={student.id} className="flex items-center gap-3 p-3 hover:bg-surface-container-low cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={assignedStudentIds.includes(student.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAssignedStudentIds(prev => [...prev, student.id]);
                                } else {
                                  setAssignedStudentIds(prev => prev.filter(id => id !== student.id));
                                }
                              }}
                              className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant"
                            />
                            <div className="flex-1">
                              <p className="font-label-md text-on-surface leading-tight">{student.fullName}</p>
                              <p className="text-body-sm text-on-surface-variant">{student.email}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Classification */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-4">
                <h4 className="font-label-lg font-bold text-on-surface">Phân loại tài liệu</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-label-md text-on-surface mb-2">Khóa học</label>
                    <select 
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface text-sm"
                    >
                      <option value="">-- Chọn Khóa học --</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-label-md text-on-surface mb-2">Chương học</label>
                    <select 
                      value={selectedChapterId}
                      onChange={(e) => setSelectedChapterId(e.target.value)}
                      disabled={!selectedCourseId || chapters.length === 0}
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface text-sm disabled:opacity-50"
                    >
                      <option value="">-- Chọn Chương --</option>
                      {chapters.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-label-md text-on-surface mb-2">Bài học</label>
                    <select 
                      value={lessonId}
                      onChange={(e) => setLessonId(e.target.value)}
                      disabled={!selectedChapterId || lessons.length === 0}
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface text-sm disabled:opacity-50"
                    >
                      <option value="">-- Chọn Bài học (Tùy chọn) --</option>
                      {lessons.map(l => (
                        <option key={l.id} value={l.id}>{l.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
                <button 
                  type="button" 
                  onClick={() => { setIsUploadModalOpen(false); resetForm(); }}
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

      {/* Add Version Modal */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-headline-md font-headline-md text-on-surface">Cập nhật phiên bản mới</h2>
              <button onClick={() => { setIsVersionModalOpen(false); resetForm(); }} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddVersion} className="p-6 space-y-6">
              <div>
                <label className="block text-label-md font-bold text-on-surface mb-2">Tệp tin mới *</label>
                <input 
                  type="file" 
                  ref={versionFileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx,.mp4,.mov,.avi,.mkv"
                  className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-primary hover:file:bg-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-2">Ghi chú thay đổi (Tùy chọn)</label>
                <textarea 
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="Ví dụ: Cập nhật sửa lỗi chính tả ở slide 5..."
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface h-24 resize-none"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
                <button 
                  type="button" 
                  onClick={() => { setIsVersionModalOpen(false); resetForm(); }}
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
                  ) : 'Tải lên phiên bản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
