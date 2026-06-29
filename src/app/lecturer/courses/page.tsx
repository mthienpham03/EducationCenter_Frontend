"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { courseService } from "@/lib/api/service";
import CourseFormModal from "@/components/courses/CourseFormModal";

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
  raw?: any;
}

const MOCK_COURSES: Course[] = [
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
];

export default function LecturerCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await courseService.getCourses();
      
      const localCoursesStr = localStorage.getItem("local_lecturer_courses");
      const localCourses = localCoursesStr ? JSON.parse(localCoursesStr) : [];
      
      const mappedLocal: Course[] = localCourses.map((c: any, idx: number) => {
        const gradients = [
          "from-primary/80 to-primary-container",
          "from-secondary/80 to-secondary-container",
          "from-tertiary/80 to-tertiary-container",
        ];
        let formattedStatus: "Active" | "Draft" | "Archived" = "Active";
        if (c.status === "draft") formattedStatus = "Draft";
        if (c.status === "archived") formattedStatus = "Archived";
        return {
          id: c.id,
          title: c.name,
          category: c.code || "Khóa học mới",
          studentsCount: 0,
          chaptersCount: 0,
          duration: "0 giờ",
          status: formattedStatus,
          description: c.description || "Khóa học vừa được tạo mẫu.",
          rating: 0,
          reviewsCount: 0,
          gradient: gradients[idx % gradients.length],
          raw: c, // store raw local info
        };
      });

      if (res.success && res.data && res.data.length > 0) {
        const mapped: Course[] = res.data.map((c: any, idx: number) => {
          const gradients = [
            "from-primary/80 to-primary-container",
            "from-secondary/80 to-secondary-container",
            "from-tertiary/80 to-tertiary-container",
          ];
          let formattedStatus: "Active" | "Draft" | "Archived" = "Active";
          if (c.status === "draft") formattedStatus = "Draft";
          if (c.status === "archived") formattedStatus = "Archived";

          return {
            id: c.id,
            title: c.name,
            category: c.code || "Khóa học",
            studentsCount: 0,
            chaptersCount: 6,
            duration: "12 giờ",
            status: formattedStatus,
            description: c.description || "Chưa có mô tả cho khóa học này.",
            rating: 5.0,
            reviewsCount: 10,
            gradient: gradients[idx % gradients.length],
            raw: c,
          };
        });
        setCourses([...mappedLocal, ...mapped]);
      } else {
        setCourses([...mappedLocal, ...MOCK_COURSES]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách khóa học:", error);
      const localCoursesStr = localStorage.getItem("local_lecturer_courses");
      const localCourses = localCoursesStr ? JSON.parse(localCoursesStr) : [];
      const mappedLocal: Course[] = localCourses.map((c: any, idx: number) => {
        const gradients = [
          "from-primary/80 to-primary-container",
          "from-secondary/80 to-secondary-container",
          "from-tertiary/80 to-tertiary-container",
        ];
        let formattedStatus: "Active" | "Draft" | "Archived" = "Active";
        if (c.status === "draft") formattedStatus = "Draft";
        if (c.status === "archived") formattedStatus = "Archived";
        return {
          id: c.id,
          title: c.name,
          category: c.code || "Khóa học mới",
          studentsCount: 0,
          chaptersCount: 0,
          duration: "0 giờ",
          status: formattedStatus,
          description: c.description || "Khóa học vừa được tạo mẫu.",
          rating: 0,
          reviewsCount: 0,
          gradient: gradients[idx % gradients.length],
          raw: c,
        };
      });
      setCourses([...mappedLocal, ...MOCK_COURSES]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleEditClick = (course: Course) => {
    setActiveMenuId(null);
    setEditingCourse(course.raw || {
      id: course.id,
      name: course.title,
      code: course.category,
      description: course.description,
      status: course.status.toLowerCase(),
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (courseId: string) => {
    setActiveMenuId(null);
    if (!confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return;

    if (courseId.startsWith("local-course-")) {
      const localCoursesStr = localStorage.getItem("local_lecturer_courses");
      const localCourses = localCoursesStr ? JSON.parse(localCoursesStr) : [];
      const updated = localCourses.filter((c: any) => c.id !== courseId);
      localStorage.setItem("local_lecturer_courses", JSON.stringify(updated));
      alert("Đã xóa khóa học mẫu thành công!");
      fetchCourses();
    } else {
      alert("Vì bạn đăng nhập bằng tài khoản Giảng viên, chỉ Admin mới có quyền xóa khóa học trên cơ sở dữ liệu hệ thống.");
    }
  };

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
        <button
          onClick={() => {
            setEditingCourse(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-on-primary font-label-md px-stack-md py-stack-sm rounded-lg flex items-center gap-base shadow-sm hover:opacity-90 transition-all transform hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Tạo Khóa Học Mới
        </button>
      </div>

      {/* Modal tạo / chỉnh sửa khóa học */}
      <CourseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
        }}
        onSuccess={fetchCourses}
        editingCourse={editingCourse}
      />

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
          <div className="w-12 h-12 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">toggle_on</span>
          </div>
          <div>
            <p className="text-caption text-on-surface-variant font-semibold">Đang hoạt động</p>
            <p className="text-headline-md font-headline-md text-on-surface font-bold mt-1">{activeCoursesCount}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex items-center gap-4 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.06)] transition-all">
          <div className="w-12 h-12 rounded-lg bg-yellow-500/10 text-yellow-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">grade</span>
          </div>
          <div>
            <p className="text-caption text-on-surface-variant font-semibold">Đánh giá trung bình</p>
            <p className="text-headline-md font-headline-md text-on-surface font-bold mt-1">4.85</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex flex-col sm:flex-row gap-stack-md items-center justify-between">
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm khóa học theo tên hoặc mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-stack-sm w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="draft">Bản nháp</option>
            <option value="archived">Lưu trữ</option>
          </select>
        </div>
      </div>

      {/* Courses Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/30">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">sentiment_dissatisfied</span>
          <p className="text-on-surface-variant font-body-md">Không tìm thấy khóa học phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/30 hover:shadow-[0px_10px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col overflow-hidden group"
            >
              {/* Card Header Header Visual */}
              <div className={`h-40 bg-gradient-to-br ${course.gradient} p-stack-md flex flex-col justify-between relative overflow-hidden`}>
                <div className="flex justify-between items-start z-10">
                  <span className="bg-surface/90 text-on-surface backdrop-blur-md px-3 py-1 rounded-full text-caption font-semibold shadow-sm">
                    {course.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-caption font-bold ${
                    course.status === "Active" 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                      : course.status === "Draft"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                  }`}>
                    {course.status === "Active" ? "Đang hoạt động" : course.status === "Draft" ? "Bản nháp" : "Đã lưu trữ"}
                  </span>
                </div>
                <h3 className="font-headline-md text-xl text-white font-bold z-10 line-clamp-2 drop-shadow-sm">
                  {course.title}
                </h3>
                {/* Decorative background shape */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              </div>

              {/* Card Body */}
              <div className="p-stack-md flex-1 flex flex-col justify-between space-y-stack-md relative">
                <p className="text-body-md text-on-surface-variant line-clamp-3 text-sm">
                  {course.description}
                </p>

                {/* Course Metadata */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant font-medium">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary">group</span>
                    <span>{course.studentsCount} Học viên</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-secondary">import_contacts</span>
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
                <div className="pt-2 flex gap-2 relative">
                  <Link
                    href={`/lecturer/courses/${course.id}/curriculum`}
                    className="flex-1 bg-primary text-on-primary font-label-md py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all text-center shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">settings</span>
                    Quản lý chương trình
                  </Link>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === course.id ? null : course.id)}
                      className="px-3 py-2.5 border border-outline-variant hover:bg-surface-container-low rounded-lg text-on-surface-variant flex items-center justify-center transition-all h-full"
                      title="Cài đặt khóa học"
                    >
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>

                    {activeMenuId === course.id && (
                      <div className="absolute right-0 bottom-full mb-2 w-36 bg-surface-container-lowest border border-outline-variant/50 rounded-lg shadow-lg z-50 overflow-hidden py-1 animate-scale-up">
                        <button
                          onClick={() => handleEditClick(course)}
                          className="w-full px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container transition-all flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(course.id)}
                          className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error-container transition-all flex items-center gap-2 border-t border-outline-variant/20"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
