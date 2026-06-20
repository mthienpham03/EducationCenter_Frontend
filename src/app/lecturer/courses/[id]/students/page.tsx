"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Course, ClassEntity, Enrollment } from "@/lib/types/api.types";

interface EnrollmentWithClass extends Enrollment {
  className?: string;
}

export default function CourseStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [students, setStudents] = useState<EnrollmentWithClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch course details
        const courseRes = await api.course.getCourseById(courseId);
        if (courseRes.success && courseRes.data) {
          setCourse(courseRes.data);
        }

        // Fetch classes for this course
        const classesRes = await api.course.getClassesByCourse(courseId);
        if (classesRes.success && classesRes.data) {
          setClasses(classesRes.data);
          
          // Fetch all students for all classes
          let allStudents: EnrollmentWithClass[] = [];
          
          // Use Promise.all for faster fetching if there are many classes
          const studentsPromises = classesRes.data.map(async (cls) => {
            const studentsRes = await api.course.getStudentsByClass(cls.id);
            if (studentsRes.success && studentsRes.data) {
              return studentsRes.data.map((s: any) => ({
                ...s,
                classId: cls.id,
                className: cls.name,
                student: {
                  fullName: s.fullName,
                  email: s.email,
                  phone: s.phone,
                  avatarUrl: null
                }
              }));
            }
            return [];
          });
          
          const results = await Promise.all(studentsPromises);
          allStudents = results.flat();
          
          setStudents(allStudents);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu học viên:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClassId === "all" || s.classId === selectedClassId;
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (s.student?.fullName?.toLowerCase() || "").includes(searchLower) ||
      (s.student?.studentProfile?.studentCode?.toLowerCase() || "").includes(searchLower) ||
      (s.student?.email?.toLowerCase() || "").includes(searchLower) ||
      (s.student?.phone || "").includes(searchLower);
      
    return matchesClass && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-stack-md max-w-container-max mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface-variant font-body-md">Đang tải danh sách học viên...</p>
      </div>
    );
  }

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md">
      {/* Header section with back button */}
      <div>
        <Link 
          href="/lecturer/courses" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary-container transition-colors mb-4 font-label-md"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Quay lại danh sách khóa học
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Danh sách học viên</h1>
            <p className="font-body-md text-on-surface-variant mt-1">
              Khóa học: <span className="font-semibold text-primary">{course?.name || "Đang tải..."}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-lg bg-secondary-container/20 text-secondary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl">group</span>
        </div>
        <div>
          <p className="text-caption text-on-surface-variant font-semibold">Tổng số học viên</p>
          <p className="font-headline-sm font-bold text-on-surface">{filteredStudents.length}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã HV, email hoặc SĐT..."
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg pl-10 pr-4 py-2 text-body-md text-on-surface outline-none focus:border-primary transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-2 text-label-md text-on-surface outline-none focus:border-primary transition-all w-full sm:w-48 shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang học</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="transferred">Chuyển lớp</option>
          </select>
          <select
            className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-2 text-label-md text-on-surface outline-none focus:border-primary transition-all w-full sm:w-48 shadow-sm"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/50">person_off</span>
            </div>
            <h3 className="font-headline-md text-on-surface font-bold">Chưa có học viên nào</h3>
            <p className="font-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
              Khóa học này hiện chưa có học viên đăng ký hoặc lớp học bạn chọn trống.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md border-b border-outline-variant/30">
                  <th className="p-4 font-semibold w-16 text-center">STT</th>
                  <th className="p-4 font-semibold">Học viên</th>
                  <th className="p-4 font-semibold">Mã HV</th>
                  <th className="p-4 font-semibold">Liên hệ</th>
                  <th className="p-4 font-semibold">Lớp học</th>
                  <th className="p-4 font-semibold">Trạng thái</th>
                  <th className="p-4 font-semibold">Ngày tham gia</th>
                  <th className="p-4 font-semibold w-40">Tiến độ</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr 
                    key={`${student.classId}-${student.studentId}`}
                    className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors group"
                  >
                    <td className="p-4 text-body-md text-on-surface-variant text-center">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-headline-sm overflow-hidden shrink-0 border border-primary/20">
                          {student.student?.avatarUrl ? (
                            <img src={student.student.avatarUrl} alt={student.student.fullName} className="w-full h-full object-cover" />
                          ) : (
                            student.student?.fullName?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>
                        <div>
                          <p className="font-label-lg text-on-surface group-hover:text-primary transition-colors font-semibold">
                            {student.student?.fullName || "Không xác định"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-body-md text-on-surface-variant font-mono">
                      {student.student?.studentProfile?.studentCode || "--"}
                    </td>
                    <td className="p-4">
                      <p className="text-body-md text-on-surface">{student.student?.email || "--"}</p>
                      <p className="text-caption text-on-surface-variant mt-0.5">{student.student?.phone || ""}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary-container/20 text-secondary-container text-caption font-semibold border border-secondary-container/20">
                        {student.className || "Không xác định"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-caption font-semibold border ${
                        student.status === 'active' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                        student.status === 'completed' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                        student.status === 'cancelled' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                      }`}>
                        {student.status === 'active' ? 'Đang học' :
                         student.status === 'completed' ? 'Đã hoàn thành' :
                         student.status === 'cancelled' ? 'Đã hủy' :
                         student.status === 'transferred' ? 'Chuyển lớp' : 'Chưa rõ'}
                      </span>
                    </td>
                    <td className="p-4 text-body-md text-on-surface-variant">
                      {new Date(student.enrolledAt || student.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500" 
                            style={{ width: `${student.completedPercent || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-caption text-on-surface-variant font-medium w-8">
                          {student.completedPercent || 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
