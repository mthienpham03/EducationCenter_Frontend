"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { axiosClient } from "@/lib/api/axios";

// Kiểu dữ liệu giả định
interface Lesson {
  id: string;
  title: string;
  type: "video" | "document" | "quiz";
  meta: string;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export default function CurriculumPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Gọi API lấy thông tin curriculum (sử dụng axiosClient chuẩn)
    const fetchCurriculum = async () => {
      try {
        setLoading(true);
        // Đây là API mẫu, bạn cần thay bằng endpoint thực tế trên backend
        // const res = await axiosClient.get(`/courses/${courseId}/curriculum`);
        // setChapters(res.data);
        
        // Mock data cho demo vì chưa biết API thật
        setChapters([
          {
            id: "chap1",
            title: "Introduction to IELTS Writing Task 1",
            order: 1,
            lessons: [
              { id: "l1", title: "Video: Overview of Assessment Criteria", type: "video", meta: "12:45 • Video MP4" },
              { id: "l2", title: "Document: Analyzing Line Graphs", type: "document", meta: "PDF • 2.4 MB" },
            ],
          },
          {
            id: "chap2",
            title: "Data Comparison and Contrasting",
            order: 2,
            lessons: [
              { id: "l3", title: "Quiz: Comparing Bar Charts", type: "quiz", meta: "10 Câu hỏi • Nâng cao" },
            ],
          },
        ]);
      } catch (error) {
        console.error("Lỗi khi gọi API", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [courseId]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  if (loading) return <div className="p-stack-md max-w-container-max mx-auto text-center">Đang tải...</div>;

  return (
    <div className="p-stack-md max-w-container-max mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md mb-stack-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Cấu trúc chương trình học</h1>
          <p className="font-body-md text-on-surface-variant mt-2">Course ID: {courseId}</p>
        </div>
        <div className="flex items-center gap-stack-sm">
          <button className="bg-primary text-on-primary font-label-md px-stack-md py-stack-sm rounded-lg flex items-center gap-base shadow-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined">add_circle</span>
            Thêm Chương Mới
          </button>
        </div>
      </div>

      {/* Bento Layout for Curriculum Management */}
      <div className="space-y-stack-md">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="chapter-card bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/10 transition-all overflow-hidden group"
          >
            <div className="p-stack-md flex items-center gap-stack-md bg-surface-container-low/30">
              <span className="material-symbols-outlined drag-handle text-outline-variant">drag_indicator</span>
              <div className="flex flex-col flex-grow">
                <span className="font-label-md text-primary">Chương {chapter.order}</span>
                <h3 className="font-headline-md text-on-surface">{chapter.title}</h3>
              </div>
              <div className="flex items-center gap-base">
                <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors" title="Chỉnh sửa">
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors" title="Ẩn">
                  <span className="material-symbols-outlined">visibility_off</span>
                </button>
                <button className="p-2 text-error hover:bg-error-container rounded-lg transition-colors" title="Xóa">
                  <span className="material-symbols-outlined">delete</span>
                </button>
                <button
                  className="ml-base p-2 text-on-surface-variant bg-surface-container-high rounded-full transition-transform transform"
                  style={{ transform: expandedChapters[chapter.id] ? "rotate(180deg)" : "rotate(0deg)" }}
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
              </div>
            </div>

            {/* Lesson List */}
            <div className={`lesson-list divide-y divide-outline-variant p-stack-md bg-surface-container-lowest ${expandedChapters[chapter.id] ? 'hidden' : 'block'}`}>
              {chapter.lessons.map((lesson) => (
                <div key={lesson.id} className="py-stack-sm flex items-center gap-stack-md group/item">
                  <span className="material-symbols-outlined text-outline-variant cursor-grab">drag_handle</span>
                  
                  {/* Icon thay đổi theo type */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    lesson.type === 'video' ? 'bg-primary-container/10 text-primary' :
                    lesson.type === 'document' ? 'bg-tertiary-container/10 text-tertiary' :
                    'bg-secondary-container/10 text-secondary'
                  }`}>
                    <span className="material-symbols-outlined">
                      {lesson.type === 'video' ? 'play_circle' : lesson.type === 'document' ? 'description' : 'quiz'}
                    </span>
                  </div>

                  <div className="flex flex-col flex-grow">
                    <p className="font-body-md font-semibold text-on-surface">{lesson.title}</p>
                    <p className="font-caption text-on-surface-variant">{lesson.meta}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button className="p-1.5 text-on-surface-variant hover:bg-surface-container-low rounded-md">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button className="p-1.5 text-error hover:bg-error-container/50 rounded-md">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Lesson Button */}
              <div className="pt-stack-sm">
                <button className="text-primary font-label-md flex items-center gap-base py-2 px-stack-md rounded-lg border-2 border-dashed border-primary/20 hover:bg-primary/5 transition-all w-full justify-center">
                  <span className="material-symbols-outlined">add</span>
                  Thêm bài học mới
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State/Dropzone for new chapters */}
        <div className="border-2 border-dashed border-outline-variant rounded-xl p-stack-lg flex flex-row items-center justify-center gap-stack-md text-on-surface-variant hover:bg-surface-container-low/50 transition-colors cursor-pointer group">
          <span className="material-symbols-outlined text-headline-xl group-hover:scale-110 transition-transform">add_circle</span>
          <div className="text-center md:text-left">
            <p className="font-headline-md text-on-surface">Kéo thả để sắp xếp chương</p>
            <p className="font-body-md">Hoặc nhấp vào đây để thêm một chương mới vào cuối chương trình</p>
          </div>
        </div>
      </div>

      {/* Footer Stats Section */}
      <div className="p-stack-md grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack-lg mt-stack-lg">
        <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col items-center">
          <span className="text-headline-xl font-headline-xl text-primary">12</span>
          <span className="text-label-md font-label-md text-on-surface-variant">Chương học</span>
        </div>
        <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col items-center">
          <span className="text-headline-xl font-headline-xl text-secondary">48</span>
          <span className="text-label-md font-label-md text-on-surface-variant">Video & Tài liệu</span>
        </div>
        <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col items-center">
          <span className="text-headline-xl font-headline-xl text-tertiary">05</span>
          <span className="text-label-md font-label-md text-on-surface-variant">Bài kiểm tra</span>
        </div>
        <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col items-center">
          <span className="text-headline-xl font-headline-xl text-on-surface">18.5 giờ</span>
          <span className="text-label-md font-label-md text-on-surface-variant">Tổng thời lượng</span>
        </div>
      </div>
    </div>
  );
}
