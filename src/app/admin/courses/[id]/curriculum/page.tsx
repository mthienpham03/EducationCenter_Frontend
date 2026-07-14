"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api/service';
import { curriculumApi } from '@/lib/api/curriculum.api';
import { documentsApi } from '@/lib/api/documents.api';
import { toast } from 'react-toastify';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Link from 'next/link';

export default function AdminCourseCurriculum() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lessonDocs, setLessonDocs] = useState<Record<string, any[]>>({});
  
  // UI states
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  // Modals state
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [selectedChapterForLesson, setSelectedChapterForLesson] = useState<string>('');

  // Form states
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDesc, setChapterDesc] = useState('');
  
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSummary, setLessonSummary] = useState('');
  const [lessonStatus, setLessonStatus] = useState('draft');

  // Confirm states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => Promise.resolve());
  const [confirmTitle, setConfirmTitle] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const courseRes = await api.course.getCourseById(courseId);
      if (courseRes.success) setCourse(courseRes.data);

      const chaptersRes = await curriculumApi.getChapters(courseId);
      if (chaptersRes.success) setChapters(chaptersRes.data || []);

      try {
        const docsRes = await documentsApi.getDocuments({ courseId });
        if (docsRes.success && docsRes.data) {
          const grouped: Record<string, any[]> = {};
          docsRes.data.forEach(doc => {
            if (doc.lesson?.id) {
              if (!grouped[doc.lesson.id]) grouped[doc.lesson.id] = [];
              grouped[doc.lesson.id].push(doc);
            }
          });
          setLessonDocs(grouped);
        }
      } catch (err) {
        console.error("Could not fetch documents", err);
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu chương trình học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // ================= CHAPTER ACTIONS =================
  const openAddChapter = () => {
    setEditingChapter(null);
    setChapterTitle('');
    setChapterDesc('');
    setIsChapterModalOpen(true);
  };

  const openEditChapter = (chapter: any) => {
    setEditingChapter(chapter);
    setChapterTitle(chapter.title);
    setChapterDesc(chapter.description || '');
    setIsChapterModalOpen(true);
  };

  const saveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChapter) {
        await curriculumApi.updateChapter(courseId, editingChapter.id, { title: chapterTitle, description: chapterDesc });
        toast.success("Cập nhật chương học thành công");
      } else {
        await curriculumApi.createChapter(courseId, { title: chapterTitle, description: chapterDesc });
        toast.success("Tạo chương học thành công");
      }
      setIsChapterModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const deleteChapter = async (chapterId: string) => {
    try {
      await curriculumApi.deleteChapter(courseId, chapterId);
      toast.success("Đã xóa chương học");
      fetchData();
    } catch (error) {
      toast.error("Không thể xóa chương học");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const confirmDeleteChapter = (chapter: any) => {
    setConfirmTitle(`Bạn có chắc muốn xóa chương "${chapter.title}" và tất cả bài học bên trong?`);
    setConfirmAction(() => () => deleteChapter(chapter.id));
    setIsConfirmOpen(true);
  };

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const moveChapter = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === chapters.length - 1)) return;
    
    const newChapters = [...chapters];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newChapters[index], newChapters[targetIndex]] = [newChapters[targetIndex], newChapters[index]];
    
    // Optimistic UI update
    setChapters(newChapters);
    
    try {
      await curriculumApi.reorderChapters(courseId, { orderedIds: newChapters.map(c => c.id) });
      toast.success("Đã cập nhật thứ tự chương");
    } catch (error) {
      toast.error("Lỗi khi sắp xếp chương");
      fetchData(); // Revert
    }
  };

  // ================= LESSON ACTIONS =================
  const openAddLesson = (chapterId: string) => {
    setSelectedChapterForLesson(chapterId);
    setEditingLesson(null);
    setLessonTitle('');
    setLessonSummary('');
    setLessonStatus('draft');
    setIsLessonModalOpen(true);
  };

  const openEditLesson = (chapterId: string, lesson: any) => {
    setSelectedChapterForLesson(chapterId);
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonSummary(lesson.contentSummary || '');
    setLessonStatus(lesson.status || 'draft');
    setIsLessonModalOpen(true);
  };

  const saveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await curriculumApi.updateLesson(courseId, selectedChapterForLesson, editingLesson.id, { 
          title: lessonTitle, 
          contentSummary: lessonSummary, 
          status: lessonStatus 
        });
        toast.success("Cập nhật bài học thành công");
      } else {
        await curriculumApi.createLesson(courseId, selectedChapterForLesson, { 
          title: lessonTitle, 
          contentSummary: lessonSummary, 
          status: lessonStatus 
        });
        toast.success("Tạo bài học thành công");
      }
      setIsLessonModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const deleteLesson = async (chapterId: string, lessonId: string) => {
    try {
      await curriculumApi.deleteLesson(courseId, chapterId, lessonId);
      toast.success("Đã xóa bài học");
      fetchData();
    } catch (error) {
      toast.error("Không thể xóa bài học");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const confirmDeleteLesson = (chapterId: string, lesson: any) => {
    setConfirmTitle(`Bạn có chắc muốn xóa bài học "${lesson.title}"?`);
    setConfirmAction(() => () => deleteLesson(chapterId, lesson.id));
    setIsConfirmOpen(true);
  };

  const moveLesson = async (chapterId: string, lessonIndex: number, direction: 'up' | 'down') => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter || !chapter.lessons) return;
    
    if ((direction === 'up' && lessonIndex === 0) || (direction === 'down' && lessonIndex === chapter.lessons.length - 1)) return;
    
    const newLessons = [...chapter.lessons];
    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    
    // Swap
    [newLessons[lessonIndex], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[lessonIndex]];
    
    // Optimistic UI update
    const newChapters = chapters.map(c => c.id === chapterId ? { ...c, lessons: newLessons } : c);
    setChapters(newChapters);
    
    try {
      await curriculumApi.reorderLessons(courseId, chapterId, { orderedIds: newLessons.map(l => l.id) });
      toast.success("Đã cập nhật thứ tự bài học");
    } catch (error) {
      toast.error("Lỗi khi sắp xếp bài học");
      fetchData(); // Revert
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-stack-lg max-w-container-max mx-auto space-y-stack-md">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/admin/courses" className="text-on-surface-variant hover:text-primary transition-colors flex items-center">
          <span className="material-symbols-outlined mr-1">arrow_back</span>
          Quay lại danh sách
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Chương trình học</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Khóa học: <span className="font-bold text-on-surface">{course?.name}</span>
          </p>
        </div>
        <button 
          onClick={openAddChapter}
          className="bg-primary text-on-primary font-label-md px-stack-md py-stack-sm rounded-lg flex items-center gap-base hover:opacity-90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>add</span>
          Thêm Chương mới
        </button>
      </div>

      <div className="space-y-4">
        {chapters.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-12 text-center text-on-surface-variant">
            Khóa học này chưa có chương nào. Hãy tạo chương đầu tiên!
          </div>
        ) : (
          chapters.map((chapter, chapterIdx) => (
            <div key={chapter.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
              {/* Chapter Header */}
              <div 
                className="bg-surface-container-low/50 p-4 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer hover:bg-surface-container-low transition-colors"
                onClick={() => toggleChapter(chapter.id)}
              >
                <div className="flex flex-1 items-center gap-4">
                  <div className="flex items-center text-on-surface-variant transition-transform duration-200" style={{ transform: collapsedChapters[chapter.id] ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                  <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => moveChapter(chapterIdx, 'up')}
                      disabled={chapterIdx === 0}
                      className="text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:hover:text-on-surface-variant transition-colors p-1 rounded hover:bg-surface-container"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_upward</span>
                    </button>
                    <button 
                      onClick={() => moveChapter(chapterIdx, 'down')}
                      disabled={chapterIdx === chapters.length - 1}
                      className="text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:hover:text-on-surface-variant transition-colors p-1 rounded hover:bg-surface-container"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_downward</span>
                    </button>
                  </div>
                  <div>
                    <h3 className="font-title-md font-bold text-on-surface">{chapter.title}</h3>
                    {chapter.description && <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{chapter.description}</p>}
                  </div>
                </div>
                
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => openAddLesson(chapter.id)}
                    className="text-sm bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-1 font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> Bài học
                  </button>
                  <button 
                    onClick={() => openEditChapter(chapter)}
                    className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container"
                    title="Sửa chương"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button 
                    onClick={() => confirmDeleteChapter(chapter)}
                    className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-lg hover:bg-error-container/30"
                    title="Xóa chương"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>

              {/* Lessons List */}
              {!collapsedChapters[chapter.id] && (
                <div className="p-4 space-y-2 bg-surface animate-in slide-in-from-top-2 duration-200">
                {!chapter.lessons || chapter.lessons.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-4 italic">Chưa có bài học nào trong chương này.</p>
                ) : (
                  chapter.lessons.map((lesson: any, lessonIdx: number) => (
                    <div key={lesson.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-outline-variant/30 hover:border-primary/30 hover:shadow-sm transition-all bg-surface-container-lowest gap-3 group">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <button 
                            onClick={() => moveLesson(chapter.id, lessonIdx, 'up')}
                            disabled={lessonIdx === 0}
                            className="text-outline hover:text-primary disabled:opacity-30 disabled:hover:text-outline transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">arrow_drop_up</span>
                          </button>
                          <button 
                            onClick={() => moveLesson(chapter.id, lessonIdx, 'down')}
                            disabled={lessonIdx === chapter.lessons.length - 1}
                            className="text-outline hover:text-primary disabled:opacity-30 disabled:hover:text-outline transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
                          </button>
                        </div>
                        <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>play_lesson</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-body-md font-semibold text-on-surface">{lesson.title}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lesson.status === 'published' ? 'bg-success/10 text-success' : 'bg-outline-variant/30 text-on-surface-variant'}`}>
                              {lesson.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                            </span>
                          </div>
                          {lesson.contentSummary && <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{lesson.contentSummary}</p>}
                          
                          {/* Documents list */}
                          {lessonDocs[lesson.id] && lessonDocs[lesson.id].length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {lessonDocs[lesson.id].map(doc => (
                                <Link 
                                  key={doc.id}
                                  href={`/admin/documents`}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] rounded hover:bg-tertiary-fixed-variant transition-colors"
                                  title="Quản lý tài liệu"
                                >
                                  <span className="material-symbols-outlined text-[12px]">description</span>
                                  <span className="truncate max-w-[150px]">{doc.title}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button 
                          onClick={() => openEditLesson(chapter.id, lesson)}
                          className="text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded hover:bg-surface-container"
                          title="Sửa bài học"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => confirmDeleteLesson(chapter.id, lesson)}
                          className="text-on-surface-variant hover:text-error transition-colors p-1.5 rounded hover:bg-error-container/30"
                          title="Xóa bài học"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Chapter Modal */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-sm text-on-surface">{editingChapter ? 'Sửa chương học' : 'Thêm chương mới'}</h3>
              <button 
                onClick={() => setIsChapterModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={saveChapter} className="p-6 space-y-4">
              <div>
                <label className="block text-label-md font-bold text-on-surface mb-2">Tiêu đề chương <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  required
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="VD: Chương 1: Giới thiệu"
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface"
                />
              </div>
              
              <div>
                <label className="block text-label-md font-bold text-on-surface mb-2">Mô tả (Không bắt buộc)</label>
                <textarea 
                  value={chapterDesc}
                  onChange={(e) => setChapterDesc(e.target.value)}
                  placeholder="Nhập mô tả ngắn gọn về chương học..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface resize-none"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsChapterModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-label-md"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity font-label-md shadow-sm"
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-lg rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-sm text-on-surface">{editingLesson ? 'Sửa bài học' : 'Thêm bài học mới'}</h3>
              <button 
                onClick={() => setIsLessonModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={saveLesson} className="p-6 space-y-4">
              <div>
                <label className="block text-label-md font-bold text-on-surface mb-2">Tiêu đề bài học <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="VD: Bài 1: Cài đặt môi trường"
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface"
                />
              </div>
              
              <div>
                <label className="block text-label-md font-bold text-on-surface mb-2">Tóm tắt nội dung (Không bắt buộc)</label>
                <textarea 
                  value={lessonSummary}
                  onChange={(e) => setLessonSummary(e.target.value)}
                  placeholder="Nhập tóm tắt nội dung bài học..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface resize-none"
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-2">Trạng thái</label>
                <select 
                  value={lessonStatus}
                  onChange={(e) => setLessonStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary transition-colors text-on-surface"
                >
                  <option value="draft">Nháp (Draft)</option>
                  <option value="published">Đã xuất bản (Published)</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-label-md"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity font-label-md shadow-sm"
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Xác nhận xóa"
        message={confirmTitle}
        onConfirm={confirmAction}
        onCancel={() => setIsConfirmOpen(false)}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}