import React from "react";

// Mock Data cho Báo cáo Tiến độ (Progress)
const PROGRESS_DATA = [
  {
    id: "COURSE-001",
    name: "Lập trình Web Cơ bản",
    teacher: "Nguyễn Văn A",
    totalStudents: 120,
    completed: 45,
    inProgress: 70,
    dropped: 5,
    averageProgress: 65, // %
  },
  {
    id: "COURSE-002",
    name: "ReactJS Advanced",
    teacher: "Lê Minh C",
    totalStudents: 85,
    completed: 10,
    inProgress: 75,
    dropped: 0,
    averageProgress: 35, // %
  },
  {
    id: "COURSE-003",
    name: "Thiết kế UI/UX",
    teacher: "Trần Thị B",
    totalStudents: 150,
    completed: 140,
    inProgress: 10,
    dropped: 0,
    averageProgress: 95, // %
  },
  {
    id: "COURSE-004",
    name: "NodeJS & Express",
    teacher: "Nguyễn Văn A",
    totalStudents: 60,
    completed: 0,
    inProgress: 55,
    dropped: 5,
    averageProgress: 15, // %
  },
];

export default function ProgressReportPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="rounded-3xl border border-[#bbe7ff] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0288d1]">Thống kê</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Báo cáo Tiến độ Học tập</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Theo dõi và đánh giá tiến độ hoàn thành khóa học của toàn bộ sinh viên trên hệ thống.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex items-center justify-center rounded-2xl border border-[#bbe7ff] bg-white px-5 py-3 text-sm font-semibold text-[#0369a1] transition hover:bg-[#f8feff]">
              📥 Xuất File Excel
            </button>
          </div>
        </div>
      </header>

      {/* Thống kê Tổng quan */}
      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tổng HV đang học</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">415</p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tỷ lệ hoàn thành (Average)</p>
          <p className="mt-4 text-3xl font-semibold text-green-600">52.5%</p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">HV đã tốt nghiệp</p>
          <p className="mt-4 text-3xl font-semibold text-[#0288d1]">195</p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tỷ lệ bỏ học</p>
          <p className="mt-4 text-3xl font-semibold text-red-500">2.4%</p>
        </div>
      </section>

      {/* Bảng Tiến độ */}
      <section className="rounded-3xl border border-[#bbe7ff] bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900">Chi tiết theo danh sách Khóa học</h2>
          <select className="w-full sm:w-auto rounded-2xl border border-[#bbe7ff] bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30">
            <option value="2026">Năm 2026</option>
            <option value="2025">Năm 2025</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-[#bbe7ff] text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Mã KH</th>
                <th scope="col" className="px-4 py-3 font-medium w-1/3">Khóa học / Giảng viên</th>
                <th scope="col" className="px-4 py-3 font-medium text-center">HV Tham gia</th>
                <th scope="col" className="px-4 py-3 font-medium text-center">Hoàn thành</th>
                <th scope="col" className="px-4 py-3 font-medium w-1/3">Tiến độ trung bình</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbe7ff]/50">
              {PROGRESS_DATA.map((course) => (
                <tr key={course.id} className="transition hover:bg-[#f8feff]">
                  <td className="px-4 py-4 text-slate-900 font-medium">{course.id}</td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900">{course.name}</div>
                    <div className="text-xs text-slate-500 mt-1">GV: {course.teacher}</div>
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-slate-700">{course.totalStudents}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-green-600 font-semibold">{course.completed}</span> / <span className="text-slate-500">{course.totalStudents}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div 
                          className="bg-[#0288d1] h-2.5 rounded-full" 
                          style={{ width: `${course.averageProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-8">{course.averageProgress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}