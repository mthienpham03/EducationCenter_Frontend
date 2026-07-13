"use client";

import React, { useEffect, useState } from "react";
import { studentApi, StudentEnrollment } from "@/lib/api/student.api";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await studentApi.getMyEnrollments();
        if (res.success) {
          setEnrollments(res.data);
        } else {
          setError("Không thể lấy danh sách khóa học");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Đã xảy ra lỗi khi tải khóa học");
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-container text-on-error-container rounded-lg font-body-md shadow-sm">
        <p className="flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </p>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-8 text-center">
        <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-5xl text-outline">school</span>
        </div>
        <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">Chưa có khóa học nào</h3>
        <p className="max-w-md font-body-md text-on-surface-variant">
          Bạn chưa được ghi danh vào lớp học nào. Hãy liên hệ với Quản trị viên nếu bạn nghĩ đây là một sự nhầm lẫn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Khóa học của tôi</h1>
          <p className="font-body-md text-on-surface-variant mt-1">Danh sách các khóa học và lớp học bạn đang tham gia</p>
        </div>
        <div className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-label-md font-semibold inline-flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">library_books</span>
          Tổng số: {enrollments.length} khóa học
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enr) => (
          <div
            key={`${enr.courseId}-${enr.classId}`}
            className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col hover:-translate-y-1"
          >
            {/* Header Image/Gradient */}
            <div className="h-32 bg-gradient-to-br from-primary to-tertiary relative overflow-hidden">
              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "20px 20px" }}></div>
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                <span className="inline-flex bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/30 shadow-sm">
                  {enr.courseCode}
                </span>
                <span className="inline-flex bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  {enr.className}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {enr.courseName}
              </h3>
              
              <div className="mt-auto space-y-4 pt-4 border-t border-outline-variant/20">
                <div className="flex justify-between items-center text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span> Ghi danh</span>
                  <span className="font-medium text-on-surface">{dayjs(enr.enrolledAt).format("DD/MM/YYYY")}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">trending_up</span> Tiến độ</span>
                    <span className="font-bold text-primary">{enr.completedPercent}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${enr.completedPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/30 flex justify-between items-center group-hover:bg-primary-fixed/5 transition-colors">
              <Link 
                href={`/student/courses/${enr.courseId}/classes/${enr.classId}`}
                className="w-full text-center py-2.5 rounded-lg bg-primary text-white font-label-md font-semibold hover:shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                Vào Lớp Học
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
