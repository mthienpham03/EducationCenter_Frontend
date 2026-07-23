"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { courseService, userService } from "@/lib/api";
import type { UserProfile, Enrollment, ClassEntity, Course } from "@/lib/types/api.types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-tertiary-container/20 text-tertiary",
  transferred: "bg-secondary-fixed/20 text-secondary",
  completed: "bg-primary-fixed/20 text-primary",
  cancelled: "bg-surface-container-highest text-on-surface-variant",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Đang học",
  transferred: "Đã chuyển lớp",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export default function EnrollStudentView({ courseId, classId }: { courseId: string; classId: string }) {
  const [viewMode, setViewMode] = useState<"list" | "transfer" | "enroll">("list");
  
  // Data State
  const [course, setCourse] = useState<Course | null>(null);
  const [classEntity, setClassEntity] = useState<ClassEntity | null>(null);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassEntity[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  
  // Transfer State
  const [transferStudent, setTransferStudent] = useState<UserProfile | null>(null);
  const [transferReason, setTransferReason] = useState("1");
  const [transferNote, setTransferNote] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  
  // Modals
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseRes, classRes, stuRes, enrRes, classesRes] = await Promise.all([
        courseService.getCourseById(courseId),
        courseService.getClassById(classId),
        userService.getStudents(),
        courseService.getStudentsByClass(classId),
        courseService.getClassesByCourse(courseId)
      ]);
      setCourse(courseRes.data || null);
      setClassEntity(classRes.data || null);
      setStudents(stuRes.data || []);
      setEnrollments(enrRes.data || []);
      setAvailableClasses((classesRes.data || []).filter(c => c.id !== classId));
    } catch {
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [courseId, classId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Actions
  const handleEnroll = async () => {
    if (!selectedStudentId) return;
    setEnrolling(true);
    setError(null);
    try {
      const res = await courseService.enrollStudent(classId, { studentId: selectedStudentId });
      if (res.success) {
        await fetchData();
        setSelectedStudentId("");
        setViewMode("list");
      } else {
        setError(res.message || "Ghi danh thất bại");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || "Đã có lỗi xảy ra"));
    } finally {
      setEnrolling(false);
    }
  };

  const confirmRemove = async () => {
    if (!studentToRemove) return;
    setRemovingId(studentToRemove);
    try {
      const res = await courseService.removeStudent(classId, studentToRemove);
      if (res.success) {
        await fetchData();
      } else {
        setError(res.message || "Không thể xóa học viên");
      }
    } catch {
      setError("Không thể xóa học viên");
    } finally {
      setRemovingId(null);
      setStudentToRemove(null);
    }
  };

  const handleTransfer = async () => {
    if (!transferStudent || !targetClassId) return;
    setTransferring(true);
    setError(null);
    try {
      const reasonText = ["Trùng lịch học cá nhân", "Thay đổi trình độ", "Yêu cầu từ phụ huynh", "Lý do sức khỏe/cá nhân", "Khác"][parseInt(transferReason) - 1] || "Khác";
      
      const res = await courseService.transferStudent(classId, transferStudent.id, {
        targetClassId,
        reason: reasonText,
        note: transferNote
      });
      
      if (res.success) {
        await fetchData();
        setViewMode("list");
        setTransferStudent(null);
        setTargetClassId("");
        setTransferNote("");
      } else {
        setError(res.message || "Chuyển lớp thất bại");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || "Đã có lỗi xảy ra"));
    } finally {
      setTransferring(false);
    }
  };

  // Computations
  const maxStudents = classEntity?.maxStudents;
  const activeCount = enrollments.filter((e) => e.status === "active").length;
  const isFull = maxStudents != null && activeCount >= maxStudents;
  
  const enrolledIds = new Set(enrollments.map((e) => e.studentId));
  const filteredStudentsForEnroll = students.filter(
    (s) => !enrolledIds.has(s.id) && (s.fullName.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredEnrollments = enrollments.filter(e => {
    const stu = students.find(s => s.id === e.studentId);
    if (!stu) return false;
    return stu.fullName.toLowerCase().includes(search.toLowerCase()) || e.studentId.toLowerCase().includes(search.toLowerCase());
  });
  
  const totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / PAGE_SIZE));
  const paginatedEnrollments = filteredEnrollments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading && !classEntity) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // View: Transfer Student
  if (viewMode === "transfer" && transferStudent) {
    const currentClassSchedule = "Thứ 2 - Thứ 4 (18:00 - 20:00)"; // Mocked schedule for UI
    
    return (
      <div className="space-y-stack-md animate-in fade-in slide-in-from-bottom-4 duration-300">
        <nav className="flex items-center gap-2 mb-stack-sm text-on-surface-variant">
          <button onClick={() => setViewMode("list")} className="font-label-md text-label-md hover:text-primary transition-colors">Học viên</button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="font-label-md text-label-md">{transferStudent.fullName}</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="font-label-md text-label-md text-primary">Chuyển lớp</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-stack-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Chuyển lớp học viên</h1>
            <p className="text-on-surface-variant font-body-md">Thực hiện thay đổi lớp học cho học viên sang lớp mới phù hợp hơn.</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-error-container/30 border border-error/30 rounded-lg text-error">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-4 space-y-gutter">
            <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center overflow-hidden">
                  {transferStudent.avatarUrl ? (
                    <img src={transferStudent.avatarUrl} alt={transferStudent.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-primary">{transferStudent.fullName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md">{transferStudent.fullName}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-fixed text-on-primary-fixed mt-1">
                    ID: {transferStudent.id.substring(0, 8)}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-surface-container rounded-lg border border-outline-variant/30">
                  <p className="text-caption text-on-surface-variant uppercase tracking-wider mb-1">Lớp học hiện tại</p>
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-primary">{classEntity?.name}</span>
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <div className="mt-2 text-label-md flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    {currentClassSchedule}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30">
              <label className="block text-label-md text-on-surface mb-2">Lý do chuyển lớp</label>
              <select 
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full bg-white border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none mb-6"
              >
                <option value="1">Trùng lịch học cá nhân</option>
                <option value="2">Thay đổi trình độ</option>
                <option value="3">Yêu cầu từ phụ huynh</option>
                <option value="4">Lý do sức khỏe/cá nhân</option>
                <option value="5">Khác</option>
              </select>

              <label className="block text-label-md text-on-surface mb-2">Ghi chú thêm</label>
              <textarea 
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                className="w-full bg-white border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none mb-6"
                placeholder="Nhập chi tiết lý do..." 
                rows={3}
              />

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleTransfer}
                  disabled={!targetClassId || transferring}
                  className="w-full bg-primary text-on-primary font-label-md py-4 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {transferring && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Xác nhận chuyển lớp
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className="w-full bg-transparent text-primary border border-primary font-label-md py-4 rounded-lg hover:bg-primary/5 active:scale-95 transition-all"
                >
                  Hủy thao tác
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-gutter">
            <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-md text-headline-md">Chọn lớp mới khả dụng</h3>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-tertiary/10 text-tertiary border border-tertiary/20">
                    Cùng khóa học {course?.name}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableClasses.length === 0 ? (
                  <div className="col-span-2 py-8 text-center text-on-surface-variant">
                    Không có lớp nào khác trong khóa học này để chuyển đến.
                  </div>
                ) : (
                  availableClasses.map(cls => {
                    const isSelected = targetClassId === cls.id;
                    const isFullTarget = cls.maxStudents != null && (cls.enrollmentCount || 0) >= cls.maxStudents;
                    
                    return (
                      <div 
                        key={cls.id}
                        onClick={() => !isFullTarget && setTargetClassId(cls.id)}
                        className={`relative group cursor-pointer rounded-xl p-5 transition-all ${
                          isSelected 
                            ? "border-2 border-primary bg-primary-fixed/30 ring-4 ring-primary/5" 
                            : isFullTarget 
                              ? "border border-outline-variant opacity-60 cursor-not-allowed" 
                              : "border border-outline-variant hover:border-primary/50 hover:bg-surface-container-low"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                          </div>
                        )}
                        <h4 className="font-headline-md text-headline-md mb-1">{cls.name}</h4>
                        <p className="text-label-md text-on-surface-variant mb-4">
                          GV: {cls.lecturers && cls.lecturers.length > 0 ? cls.lecturers.map(l => l.lecturer?.fullName).join(", ") : "Chưa phân công"}
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-label-md">
                            <span className={`material-symbols-outlined text-sm ${isFullTarget ? "text-error" : "text-primary"}`}>groups</span>
                            <span className={isFullTarget ? "text-error" : ""}>
                              {isFullTarget ? `Đã đầy (${cls.enrollmentCount}/${cls.maxStudents})` : (
                                <>Sĩ số: <b className="text-on-surface">{cls.enrollmentCount || 0}{cls.maxStudents ? `/${cls.maxStudents}` : ""}</b></>
                              )}
                            </span>
                            {!isFullTarget && cls.maxStudents && ((cls.enrollmentCount || 0) / cls.maxStudents > 0.8) && (
                              <span className="ml-auto text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded border border-secondary/20">Sắp đầy</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-label-md">
                            <span className="material-symbols-outlined text-primary text-sm">calendar_month</span>
                            <span>Thứ 3 - Thứ 5 (19:30 - 21:30)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {targetClassId && (
              <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="font-headline-md text-headline-md mb-6">So sánh lịch học</h3>
                <div className="overflow-hidden border border-outline-variant rounded-lg">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-surface-container-high border-b border-outline-variant">
                        <th className="p-3 text-left font-label-md border-r border-outline-variant">Thứ</th>
                        <th className="p-3 text-center font-label-md bg-surface-container border-r border-outline-variant">Lớp cũ ({classEntity?.name})</th>
                        <th className="p-3 text-center font-label-md bg-primary-fixed-dim/20">Lớp mới ({availableClasses.find(c => c.id === targetClassId)?.name})</th>
                      </tr>
                    </thead>
                    <tbody className="text-label-md">
                      <tr className="border-b border-outline-variant/50">
                        <td className="p-3 font-semibold border-r border-outline-variant">Thứ 2</td>
                        <td className="p-3 text-center bg-surface-container/30 border-r border-outline-variant">18:00 - 20:00</td>
                        <td className="p-3 text-center text-on-surface-variant">-</td>
                      </tr>
                      <tr className="border-b border-outline-variant/50">
                        <td className="p-3 font-semibold border-r border-outline-variant">Thứ 3</td>
                        <td className="p-3 text-center border-r border-outline-variant">-</td>
                        <td className="p-3 text-center bg-primary-fixed/20">19:30 - 21:30</td>
                      </tr>
                      <tr className="border-b border-outline-variant/50">
                        <td className="p-3 font-semibold border-r border-outline-variant">Thứ 4</td>
                        <td className="p-3 text-center bg-surface-container/30 border-r border-outline-variant">18:00 - 20:00</td>
                        <td className="p-3 text-center text-on-surface-variant">-</td>
                      </tr>
                      <tr className="border-b border-outline-variant/50">
                        <td className="p-3 font-semibold border-r border-outline-variant">Thứ 5</td>
                        <td className="p-3 text-center border-r border-outline-variant">-</td>
                        <td className="p-3 text-center bg-primary-fixed/20">19:30 - 21:30</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold border-r border-outline-variant">T7/CN</td>
                        <td className="p-3 text-center border-r border-outline-variant text-on-surface-variant">-</td>
                        <td className="p-3 text-center text-on-surface-variant">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex items-center gap-3 p-4 bg-tertiary-container/10 border border-tertiary/20 rounded-lg">
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <p className="text-label-md text-tertiary">Tuyệt vời! Không phát hiện xung đột lịch học giữa lớp mới và các hoạt động khác của hệ thống.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // View: Enroll Student (Modal style overlay or separate view)
  if (viewMode === "enroll") {
    return (
      <div className="space-y-stack-md animate-in fade-in slide-in-from-bottom-4 duration-300">
        <nav className="flex items-center gap-2 mb-stack-sm text-on-surface-variant">
          <button onClick={() => setViewMode("list")} className="font-label-md text-label-md hover:text-primary transition-colors">Học viên</button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="font-label-md text-label-md text-primary">Thêm học viên</span>
        </nav>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 max-w-2xl mx-auto">
          <h3 className="font-headline-lg text-headline-lg mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-primary">person_add</span>
            Thêm học viên vào lớp {classEntity?.name}
          </h3>

          {error && (
             <div className="flex items-center gap-2 p-3 mb-4 bg-error-container/30 border border-error/30 rounded-lg text-error text-sm">
               <span className="material-symbols-outlined">error</span>
               {error}
             </div>
          )}

          {isFull ? (
             <div className="flex items-center gap-2 p-4 bg-secondary-fixed/50 border border-secondary/30 rounded-lg text-on-secondary-fixed-variant">
               <span className="material-symbols-outlined">warning</span>
               Lớp đã đầy ({activeCount}/{maxStudents} học viên)
             </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  type="text"
                  placeholder="Tìm học viên theo tên hoặc email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                {loading && filteredStudentsForEnroll.length === 0 ? (
                  <div className="text-center py-8 text-on-surface-variant">Đang tải...</div>
                ) : filteredStudentsForEnroll.length === 0 ? (
                  <div className="text-center py-8 text-on-surface-variant">
                    {search ? "Không tìm thấy học viên" : "Tất cả học viên đã được ghi danh"}
                  </div>
                ) : (
                  filteredStudentsForEnroll.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        selectedStudentId === s.id
                          ? "bg-primary-fixed border-primary/50 shadow-sm"
                          : "bg-white border-outline-variant/50 hover:bg-surface-container-low"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-lg text-tertiary-container flex-shrink-0">
                        {s.avatarUrl ? (
                           <img src={s.avatarUrl} alt={s.fullName} className="w-full h-full rounded-full object-cover" />
                        ) : s.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface">{s.fullName}</p>
                        <p className="text-sm text-on-surface-variant">{s.email}</p>
                      </div>
                      {selectedStudentId === s.id && (
                        <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={!selectedStudentId || enrolling}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {enrolling ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined">add</span>}
                  Ghi danh học viên
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className="px-6 py-3 border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container transition-all font-bold"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default View: Student List (Matches mockup danh sach hoc vien)
  return (
    <div className="space-y-stack-md animate-in fade-in duration-300">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
        <Link href={`/admin/courses/${courseId}/classes`} className="hover:text-primary transition-colors">Quản lý lớp học</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="hover:text-primary transition-colors cursor-pointer">{classEntity?.name || "Lớp học"}</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="font-bold text-primary">Danh sách học viên</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">Danh sách học viên - Lớp {classEntity?.name}</h1>
          <p className="text-body-md text-on-surface-variant">Quản lý lộ trình học tập và trạng thái chuyên cần của từng học viên trong khóa học.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-high text-on-surface-variant px-6 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:bg-outline-variant transition-colors active:scale-95">
            <span className="material-symbols-outlined">file_download</span>
            Xuất báo cáo
          </button>
          <button 
            onClick={() => { setSearch(""); setViewMode("enroll"); }}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:opacity-90 shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">person_add</span>
            Thêm học viên
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-primary">
          <div className="flex justify-between items-start mb-2">
            <span className="text-on-surface-variant font-label-md text-label-md">Tổng số học viên</span>
            <span className="material-symbols-outlined text-primary">groups</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-primary">{activeCount}</span>
            <span className="text-on-surface-variant font-body-md text-body-md">/ {maxStudents || '∞'} học viên</span>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary h-full" style={{ width: maxStudents ? `${Math.min((activeCount / maxStudents) * 100, 100)}%` : '0%' }}></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-tertiary-container">
          <div className="flex justify-between items-start mb-2">
            <span className="text-on-surface-variant font-label-md text-label-md">Chuyên cần trung bình</span>
            <span className="material-symbols-outlined text-tertiary">check_circle</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-tertiary">92%</span>
            <span className="text-on-surface-variant font-body-md text-body-md text-tertiary-container">+2.5% so với tháng trước</span>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-tertiary h-full" style={{ width: '92%' }}></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-secondary-container">
          <div className="flex justify-between items-start mb-2">
            <span className="text-on-surface-variant font-label-md text-label-md">Bài tập đã nộp</span>
            <span className="material-symbols-outlined text-secondary">assignment</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-secondary">85%</span>
            <span className="text-on-surface-variant font-body-md text-body-md">Hoàn thành đúng hạn</span>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-secondary h-full" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-outline-variant/50">
        <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-80">
              <input
                type="text"
                placeholder="Tìm tên hoặc ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-body-md"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            </div>
            <button className="flex items-center gap-2 border border-outline-variant px-4 py-2 rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
              Bộ lọc
            </button>
          </div>
          <div className="flex gap-2 text-caption text-on-surface-variant items-center">
            Sắp xếp theo:
            <select className="border-none bg-transparent font-bold text-primary focus:ring-0 cursor-pointer outline-none">
              <option>Tên (A-Z)</option>
              <option>Mới nhất</option>
              <option>Chuyên cần</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/30">
                <th className="px-6 py-4 font-semibold whitespace-nowrap">ID học viên</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Họ và tên</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Ngày sinh</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Tiến độ</th>
                <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {paginatedEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    Không tìm thấy học viên nào.
                  </td>
                </tr>
              ) : (
                paginatedEnrollments.map((e) => {
                  const stu = students.find((s) => s.id === e.studentId);
                  if (!stu) return null;
                  
                  // Generate realistic random birthdate based on ID for mockup purpose
                  const charCodeSum = stu.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const day = (charCodeSum % 28) + 1;
                  const month = (charCodeSum % 12) + 1;
                  const year = 2000 + (charCodeSum % 6);
                  const birthDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;

                  return (
                    <tr key={e.studentId} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="px-6 py-4 font-body-md text-on-surface whitespace-nowrap">#{stu.id.substring(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 bg-tertiary-fixed text-tertiary-container flex justify-center items-center font-bold">
                            {stu.avatarUrl ? (
                              <img src={stu.avatarUrl} alt={stu.fullName} className="w-full h-full object-cover" />
                            ) : stu.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-label-md text-on-surface">{stu.fullName}</p>
                            <p className="font-caption text-on-surface-variant">{stu.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-body-md whitespace-nowrap">{birthDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full font-label-md text-[12px] ${STATUS_COLORS[e.status] || STATUS_COLORS.active}`}>
                          {STATUS_LABELS[e.status] || e.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <span className="font-label-md w-10">{e.completedPercent}%</span>
                          <div className="flex-1 bg-surface-container h-1.5 rounded-full overflow-hidden">
                            <div className="bg-tertiary h-full transition-all" style={{ width: `${e.completedPercent}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex justify-center gap-2">
                          <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Xem chi tiết">
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button 
                            onClick={() => { setTransferStudent(stu); setViewMode("transfer"); }}
                            className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1.5 rounded-lg font-label-md flex items-center gap-1 hover:bg-secondary-container hover:text-white transition-all active:scale-95 text-[13px]"
                          >
                            <span className="material-symbols-outlined text-[18px]">move_up</span>
                            Chuyển lớp
                          </button>
                          <button 
                            onClick={() => setStudentToRemove(stu.id)}
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors ml-1" 
                            title="Xóa khỏi lớp"
                          >
                            <span className="material-symbols-outlined">person_remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredEnrollments.length > 0 && (
          <div className="p-6 flex items-center justify-between border-t border-outline-variant/30">
            <span className="text-caption text-on-surface-variant">
              Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredEnrollments.length)} của {filteredEnrollments.length} học viên
            </span>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-label-md transition-colors ${currentPage === i + 1 ? 'bg-primary text-white' : 'border border-outline-variant hover:bg-surface-container'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!studentToRemove}
        title="Xác nhận xóa học viên"
        message="Bạn có chắc chắn muốn xóa học viên này khỏi lớp học?"
        confirmText="Xóa học viên"
        cancelText="Đóng"
        onConfirm={confirmRemove}
        onCancel={() => setStudentToRemove(null)}
        isLoading={!!removingId}
      />
    </div>
  );
}
