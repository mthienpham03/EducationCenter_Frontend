"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { axiosClient } from "@/lib/api/axios";

interface Course {
  id: string;
  title: string;
  category: string;
  studentsCount: number;
  chaptersCount: number;
  duration: string;
  status: "Active" | "Draft" | "Archived";
  description: string;
  rating: number;
  reviewsCount: number;
  gradient: string;
}

export default function LecturerCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Giả lập gọi API lấy danh sách khóa học của giảng viên này
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Trong tương lai, khi có API thật:
        // const res = await axiosClient.get("/lecturer/courses");
        // setCourses(res.data);
        
        // Mock data chất lượng cao và đồng bộ với thiết kế
        setCourses([
          {
            id: "ielts-mastery",
            title: "IELTS Mastery (Standard Edition)",
            category: "IELTS Prep",
            studentsCount: 48,
            chaptersCount: 12,
            duration: "18.5 giờ",
            status: "Active",
            description: "Chương trình đào tạo toàn diện 4 kỹ năng IELTS chuẩn Cambridge, cam kết đầu ra 6.5+ cho học viên.",
            rating: 4.9,
            reviewsCount: 24,
            gradient: "from-primary/80 to-primary-container",
          },
          {
            id: "ielts-writing",
            title: "IELTS Writing Intensive",
            category: "IELTS Prep",
            studentsCount: 32,
            chaptersCount: 8,
            duration: "12 giờ",
            status: "Active",
            description: "Khóa học chuyên sâu phát triển tư duy viết, phân tích biểu đồ và nghị luận xã hội kèm nhận xét chi tiết.",
            rating: 4.8,
            reviewsCount: 18,
            gradient: "from-secondary/80 to-secondary-container",
          },
          {
            id: "toeic-750",
            title: "TOEIC Target 750+",
            category: "TOEIC Prep",
            studentsCount: 0,
            chaptersCount: 6,
            duration: "10 giờ",
            status: "Draft",
            description: "Hệ thống từ vựng cốt lõi và các bẫy thường gặp trong phần nghe/đọc của bài thi TOEIC định dạng mới.",
            rating: 0,
            reviewsCount: 0,
            gradient: "from-tertiary/80 to-tertiary-container",
          },
        ]);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter & Search logic
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalStudents = courses.reduce((acc, curr) => acc + curr.studentsCount, 0);
  const activeCoursesCount = courses.filter(c => c.status === "Active").length;

  if (loading) {
    return (
      <div className="p-stack-md max-w-container-max mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface-variant font-body-md">Đang tải danh sách khóa học...</p>
      </div>
    );
  }

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md mb-2">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Quản lý khóa học</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Tổng quan và quản lý nội dung các chương trình đào tạo của bạn
          </p>
        </div>
        <button className="bg-primary text-on-primary font-label-md px-stack-md py-stack-sm rounded-lg flex items-center gap-base shadow-sm hover:opacity-90 transition-all transform hover:-translate-y-0.5">
          <span className="material-symbols-outlined">add_circle</span>
          Tạo Khóa Học Mới
        </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex items-center gap-4 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.06)] transition-all">
          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">library_books</span>
          </div>
          <div>
            <p className="text-caption text-on-surface-variant font-semibold">Tổng số khóa học</p>
            <p className="text-headline-md font-headline-md text-on-surface font-bold mt-1">{courses.length}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex items-center gap-4 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.06)] transition-all">
          <div className="w-12 h-12 rounded-lg bg-secondary-container/10 text-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
          <div>
            <p className="text-caption text-on-surface-variant font-semibold">Tổng học viên</p>
            <p className="text-headline-md font-headline-md text-on-surface font-bold mt-1">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex items-center gap-4 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.06)] transition-all">
          <div className="w-12 h-12 rounded-lg bg-tertiary-container/10 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">toggle_on</span>
          </div>
          <div>
            <p className="text-caption text-on-surface-variant font-semibold">Đang hoạt động</p>
            <p className="text-headline-md font-headline-md text-on-surface font-bold mt-1">{activeCoursesCount}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex items-center gap-4 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.06)] transition-all">
          <div className="w-12 h-12 rounded-lg bg-yellow-500/10 text-yellow-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">star</span>
          </div>
          <div>
            <p className="text-caption text-on-surface-variant font-semibold">Đánh giá trung bình</p>
            <p className="text-headline-md font-headline-md text-on-surface font-bold mt-1">4.85</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm khóa học theo tên hoặc mô tả..."
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg pl-10 pr-4 py-2 text-body-md text-on-surface outline-none focus:border-primary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-2 text-label-md text-on-surface outline-none focus:border-primary transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Active (Hoạt động)</option>
            <option value="draft">Draft (Bản nháp)</option>
          </select>
        </div>
      </div>

      {/* Courses List Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">search_off</span>
          <h3 className="font-headline-md text-on-surface">Không tìm thấy khóa học nào</h3>
          <p className="font-body-md text-on-surface-variant mt-2">
            Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_25px_rgba(0,0,0,0.04)] border border-outline-variant/20 overflow-hidden hover:shadow-[0px_12px_35px_rgba(0,0,0,0.08)] hover:border-primary/20 transition-all flex flex-col group"
            >
              {/* Card Thumbnail / Header with dynamic gradient */}
              <div className={`h-40 bg-gradient-to-tr ${course.gradient} p-6 flex flex-col justify-between text-white relative overflow-hidden`}>
                {/* Visual grid decorations */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex justify-between items-start z-10">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-caption font-semibold">
                    {course.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-caption font-bold ${
                    course.status === "Active" 
                      ? "bg-green-500/20 text-green-300 border border-green-400/30" 
                      : "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
                  }`}>
                    {course.status === "Active" ? "Đang hoạt động" : course.status === "Draft" ? "Bản nháp" : "Lưu trữ"}
                  </span>
                </div>
                <div className="z-10">
                  <h3 className="font-headline-md text-lg font-bold line-clamp-1">{course.title}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-body-md text-on-surface-variant line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-outline-variant/30 text-caption font-semibold text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary">group</span>
                    <span>{course.studentsCount} Học viên</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-secondary-container">menu_book</span>
                    <span>{course.chaptersCount} Chương học</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-tertiary">schedule</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-yellow-500">star</span>
                    <span>{course.rating > 0 ? `${course.rating} (${course.reviewsCount})` : "Chưa có đánh giá"}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 flex gap-2">
                  <Link
                    href={`/lecturer/courses/${course.id}/curriculum`}
                    className="flex-1 bg-primary text-on-primary font-label-md py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all text-center shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">settings</span>
                    Quản lý chương trình
                  </Link>
                  <button 
                    className="px-3 border border-outline-variant hover:bg-surface-container-low rounded-lg text-on-surface-variant flex items-center justify-center transition-all"
                    title="Cài đặt khóa học"
                  >
                    <span className="material-symbols-outlined text-lg">more_vert</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
