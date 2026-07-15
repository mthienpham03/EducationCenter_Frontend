"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api/service";
import { curriculumApi } from "@/lib/api/curriculum.api";
import { documentsApi, DocumentEntity } from "@/lib/api/documents.api";
import Link from "next/link";
import DocumentViewer from "@/components/courses/DocumentViewer";

interface Lesson {
  id: string;
  title: string;
  contentSummary?: string;
  status: string;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export default function StudentCurriculumPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessonDocs, setLessonDocs] = useState<Record<string, DocumentEntity[]>>({});
  const [loading, setLoading] = useState(true);

  // Layout states
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeDocument, setActiveDocument] = useState<DocumentEntity | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course info
        const courseRes = await api.course.getCourseById(courseId);
        if (courseRes.success) {
          setCourse(courseRes.data);
        }

        // Fetch chapters
        const chaptersRes = await curriculumApi.getChapters(courseId);
        if (chaptersRes.success && chaptersRes.data) {
          setChapters(chaptersRes.data);
          
          // Expand first chapter by default
          if (chaptersRes.data.length > 0) {
            setExpandedChapters({ [chaptersRes.data[0].id]: true });
          }
        }

        // Fetch documents
        try {
          // fetch documents specifically marked as enrolled/public for the course
          // According to backend logic, Student can fetch documents in lessons they have access to.
          const docsRes = await documentsApi.getDocuments({ courseId });
          if (docsRes.success && docsRes.data) {
            const grouped: Record<string, DocumentEntity[]> = {};
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
        console.error("Failed to load learning space data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleSelectLesson = (lesson: Lesson, document?: DocumentEntity) => {
    setActiveLesson(lesson);
    if (document) {
      setActiveDocument(document);
    } else {
      // If lesson clicked without specific doc, try to select the first document if available
      const docs = lessonDocs[lesson.id];
      if (docs && docs.length > 0) {
        setActiveDocument(docs[0]);
      } else {
        setActiveDocument(null);
      }
    }
  };

  const handleQuizClick = (lesson: Lesson) => {
    // In the future, real quizz linking logic here
    // For now, redirecting to a quiz page placeholder
    router.push(`/student/courses/quizzes/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col p-4 md:p-6 gap-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <Link href="/student/courses" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 mb-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Khóa học của tôi
          </Link>
          <h1 className="font-headline-md text-on-surface line-clamp-1">{course?.name || "Đang tải khóa học..."}</h1>
        </div>
      </div>

      {/* Main Content Area: 2 Columns */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* Left Column: Viewer (70%) */}
        <div className="flex-1 lg:w-2/3 xl:w-3/4 flex flex-col min-h-0">
          <DocumentViewer 
            document={activeDocument} 
            lessonSummary={activeLesson?.contentSummary} 
          />
        </div>

        {/* Right Column: Curriculum Tree (30%) */}
        <div className="lg:w-1/3 xl:w-1/4 flex flex-col bg-surface rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm shrink-0 min-h-[400px]">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest shrink-0">
            <h2 className="font-title-md font-bold text-on-surface">Mục lục khóa học</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Tiến độ: {chapters.length > 0 ? "Đang học" : "Chưa có nội dung"}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chapters.length === 0 ? (
              <p className="text-center text-on-surface-variant text-sm mt-8">Khóa học này chưa có nội dung.</p>
            ) : (
              chapters.map((chapter) => (
                <div key={chapter.id} className="border border-outline-variant/30 rounded-lg overflow-hidden bg-surface-container-lowest">
                  {/* Chapter Header */}
                  <div 
                    className="flex items-center justify-between p-3 bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer select-none"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <h3 className="font-title-sm font-bold text-on-surface flex-1 pr-2 line-clamp-2">
                      {chapter.title}
                    </h3>
                    <span 
                      className="material-symbols-outlined text-on-surface-variant transition-transform duration-200 shrink-0"
                      style={{ transform: expandedChapters[chapter.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      expand_more
                    </span>
                  </div>

                  {/* Lessons List */}
                  {expandedChapters[chapter.id] && (
                    <div className="border-t border-outline-variant/20 bg-surface">
                      {!chapter.lessons || chapter.lessons.length === 0 ? (
                        <p className="text-xs text-on-surface-variant p-3 italic">Chưa có bài học</p>
                      ) : (
                        chapter.lessons.map((lesson) => {
                          const isLessonActive = activeLesson?.id === lesson.id;
                          const docs = lessonDocs[lesson.id] || [];
                          
                          return (
                            <div key={lesson.id} className="flex flex-col border-b border-outline-variant/10 last:border-0">
                              <div 
                                className={`flex items-start p-3 cursor-pointer transition-colors ${isLessonActive ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-surface-container-lowest border-l-4 border-l-transparent'}`}
                                onClick={() => handleSelectLesson(lesson)}
                              >
                                <span className={`material-symbols-outlined text-[18px] mr-2 mt-0.5 ${isLessonActive ? 'text-primary' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                  {docs.length > 0 ? (docs[0].type.includes('video') ? 'play_circle' : 'article') : 'play_lesson'}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-body-sm line-clamp-2 ${isLessonActive ? 'text-primary font-bold' : 'text-on-surface font-medium'}`}>
                                    {lesson.title}
                                  </p>
                                  {/* Documents sub-list */}
                                  {docs.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {docs.map(doc => (
                                        <div 
                                          key={doc.id}
                                          title={doc.title}
                                          className={`text-[11px] flex items-center gap-1.5 p-1 rounded hover:bg-outline-variant/20 transition-colors cursor-pointer min-w-0 ${activeDocument?.id === doc.id ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectLesson(lesson, doc);
                                          }}
                                        >
                                          <span className="material-symbols-outlined text-[14px] shrink-0">
                                            {doc.type.includes('video') ? 'smart_display' : 'picture_as_pdf'}
                                          </span>
                                          <span className="truncate flex-1">{doc.title}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Placeholder for Quizzes in lesson */}
                                  <div 
                                    className="text-[11px] flex items-center gap-1.5 p-1 mt-1 rounded hover:bg-tertiary/10 text-tertiary transition-colors cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuizClick(lesson);
                                    }}
                                  >
                                    <span className="material-symbols-outlined text-[14px]">quiz</span>
                                    <span>Bài kiểm tra (nếu có)</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
