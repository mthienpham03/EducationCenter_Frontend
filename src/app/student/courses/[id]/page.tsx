"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api/service";
import { studentApi, StudentEnrollment } from "@/lib/api/student.api";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export default function ClassDashboardPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<StudentEnrollment | null>(null);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Enrollments to find classId
        const enrollmentsRes = await studentApi.getMyEnrollments();
        let currentEnrollment: StudentEnrollment | null = null;
        
        if (enrollmentsRes.success) {
          currentEnrollment = enrollmentsRes.data.find(e => e.courseId === courseId) || null;
          setEnrollment(currentEnrollment);
        }

        // 2. Fetch Course Info
        const courseRes = await api.course.getCourseById(courseId);
        if (courseRes.success) {
          setCourse(courseRes.data);
        }

        // 3. If enrolled, fetch class and lecturer info
        if (currentEnrollment) {
          const classId = currentEnrollment.classId;
          
          const classRes = await api.course.getClassById(classId);
          if (classRes.success) {
            setClassInfo(classRes.data);
          }

          const lecturersRes = await api.course.getLecturersByClass(classId);
          if (lecturersRes.success) {
            setLecturers(lecturersRes.data || []);
          }
        } else {
          setError("Bạn chưa ghi danh vào khóa học này.");
        }
      } catch (err) {
        console.error("Error fetching class dashboard:", err);
        setError("Không thể tải thông tin lớp học. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !course || !classInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined text-6xl text-error">error</span>
        <h2 className="text-title-lg font-bold text-on-surface">Đã có lỗi xảy ra</h2>
        <p className="text-on-surface-variant">{error || "Không tìm thấy dữ liệu khóa học."}</p>
        <button 
          onClick={() => router.push('/student/dashboard')}
          className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors"
        >
          Trở về Bảng điều khiển
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20 space-y-6">
      {/* Header Banner */}
      <div className="relative w-full h-[240px] md:h-[300px] rounded-2xl overflow-hidden shadow-sm group">
        <div className="absolute inset-0">
          <img 
            src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"} 
            alt="Course Banner" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-primary text-on-primary text-label-sm rounded-full font-medium">
                {course.code}
              </span>
              <span className="px-3 py-1 bg-surface/20 backdrop-blur-md text-white text-label-sm rounded-full border border-white/20">
                {classInfo.name}
              </span>
            </div>
            <h1 className="text-display-sm md:text-display-md font-bold text-white mb-2 leading-tight">
              {course.name}
            </h1>
            <p className="text-white/80 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              Ngày tham gia: {dayjs(enrollment?.enrolledAt).format("DD/MM/YYYY")}
            </p>
          </div>
          
          <Link 
            href={`/student/courses/${courseId}/curriculum`}
            className="flex-shrink-0 flex items-center justify-center gap-2 px-8 py-3 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 hover:-translate-y-1"
          >
            <span className="material-symbols-outlined">play_arrow</span>
            Vào Không gian Học tập
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Lecturers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
            <h3 className="text-title-md font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">donut_large</span>
              Tiến độ học tập
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${enrollment?.completedPercent || 0}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
              <span className="text-title-lg font-bold text-primary w-16 text-right">
                {enrollment?.completedPercent || 0}%
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
            <h3 className="text-title-md font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">info</span>
              Giới thiệu Khóa học
            </h3>
            <div className="prose prose-sm md:prose-base prose-p:text-on-surface-variant max-w-none">
              {course.description ? (
                <div dangerouslySetInnerHTML={{ __html: course.description.replace(/\n/g, "<br/>") }} />
              ) : (
                <p className="text-on-surface-variant italic">Chưa có thông tin mô tả cho khóa học này.</p>
              )}
            </div>
          </div>

          {/* Lecturers */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
            <h3 className="text-title-md font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">school</span>
              Giảng viên phụ trách
            </h3>
            {lecturers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lecturers.map((assignment, idx) => {
                  const lecturer = assignment.lecturer;
                  return (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/30 hover:border-primary/30 hover:bg-primary/5 transition-colors group">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-variant flex-shrink-0 border-2 border-transparent group-hover:border-primary transition-colors">
                        {lecturer?.avatarUrl ? (
                          <img src={lecturer.avatarUrl} alt={lecturer.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-bold text-xl">
                            {lecturer?.fullName?.charAt(0) || "G"}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-body-lg">{lecturer?.fullName}</h4>
                        <p className="text-label-md text-primary bg-primary/10 px-2 py-0.5 rounded inline-block mt-1">
                          {assignment.role === "main" ? "Giảng viên chính" : "Trợ giảng"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                Lớp học chưa được phân công giảng viên.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          
          {/* Class Info */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
            <h3 className="text-title-md font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Thông tin Lớp học
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">group</span>
                <div>
                  <p className="text-label-sm text-on-surface-variant">Sĩ số</p>
                  <p className="font-medium text-on-surface">
                    {classInfo.enrollmentCount || 0} / {classInfo.maxStudents || "Không giới hạn"} học viên
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">event_available</span>
                <div>
                  <p className="text-label-sm text-on-surface-variant">Khai giảng dự kiến</p>
                  <p className="font-medium text-on-surface">
                    {classInfo.expectedStartDate ? dayjs(classInfo.expectedStartDate).format("DD/MM/YYYY") : "Chưa xác định"}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">flag</span>
                <div>
                  <p className="text-label-sm text-on-surface-variant">Trạng thái lớp</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded text-label-sm font-medium ${
                    classInfo.status === 'active' ? 'bg-success/10 text-success' :
                    classInfo.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                    classInfo.status === 'completed' ? 'bg-tertiary/10 text-tertiary' :
                    'bg-surface-variant text-on-surface-variant'
                  }`}>
                    {classInfo.status === 'active' ? 'Đang học' :
                     classInfo.status === 'scheduled' ? 'Sắp mở' :
                     classInfo.status === 'completed' ? 'Đã kết thúc' : classInfo.status}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Schedule (Mocked) */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
              </span>
            </div>
            <h3 className="text-title-md font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              Lịch học tuần này
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-surface-container-low rounded-xl border-l-4 border-l-primary flex gap-3">
                <div className="flex flex-col items-center justify-center bg-surface-container-highest rounded-lg p-2 min-w-[50px]">
                  <span className="text-label-sm font-bold text-on-surface-variant">T2</span>
                  <span className="text-title-sm font-bold text-primary">18</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-body-md">Lý thuyết chung</p>
                  <p className="text-label-sm text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    18:00 - 20:30 • Phòng Lab 01
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-surface-container-low rounded-xl border-l-4 border-l-tertiary flex gap-3">
                <div className="flex flex-col items-center justify-center bg-surface-container-highest rounded-lg p-2 min-w-[50px]">
                  <span className="text-label-sm font-bold text-on-surface-variant">T4</span>
                  <span className="text-title-sm font-bold text-primary">20</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-body-md">Thực hành</p>
                  <p className="text-label-sm text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    18:00 - 20:30 • Phòng Lab 03
                  </p>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-4 py-2 border border-outline text-primary font-label-md rounded-lg hover:bg-primary/5 transition-colors">
              Xem toàn bộ lịch học
            </button>
          </div>

          {/* Notifications (Mocked) */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
            <h3 className="text-title-md font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">campaign</span>
              Thông báo Lớp
            </h3>
            
            <div className="space-y-4">
              <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-[-1rem] before:w-px before:bg-outline-variant last:before:hidden">
                <span className="absolute left-[3px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-lowest"></span>
                <p className="text-label-sm text-primary font-medium mb-1">Hôm nay, 08:30</p>
                <div className="bg-surface-container-low p-3 rounded-lg rounded-tl-none">
                  <p className="font-medium text-body-sm text-on-surface">Cập nhật tài liệu Chương 2</p>
                  <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                    Giảng viên đã upload thêm tài liệu tham khảo cho chương 2. Các bạn vào Không gian học tập để xem nhé.
                  </p>
                </div>
              </div>
              
              <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-[-1rem] before:w-px before:bg-outline-variant last:before:hidden">
                <span className="absolute left-[3px] top-1.5 w-2.5 h-2.5 rounded-full bg-outline ring-4 ring-surface-container-lowest"></span>
                <p className="text-label-sm text-on-surface-variant font-medium mb-1">12/07/2026, 14:00</p>
                <div className="bg-surface-container-low p-3 rounded-lg rounded-tl-none opacity-80">
                  <p className="font-medium text-body-sm text-on-surface">Chào mừng đến với lớp học!</p>
                  <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                    Chào mừng các bạn đã đăng ký lớp. Buổi học đầu tiên sẽ bắt đầu vào tuần sau.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
