import React from "react";
import Link from "next/link";

// Mock Data cho Báo cáo Điểm thi (Quiz Results)
const QUIZ_RESULTS_DATA = [
  {
    id: "QZ-001",
    title: "Kiểm tra giữa kỳ Front-End",
    course: "Lập trình Web Cơ bản",
    participants: 120,
    averageScore: 7.5,
    passRate: 85, // %
    highScores: 24, // Số sinh viên dạt điểm giỏi >8
    status: "Đã đánh giá",
  },
  {
    id: "QZ-002",
    title: "Test nhỏ HTML/CSS",
    course: "Frontend Master",
    participants: 45,
    averageScore: 8.2,
    passRate: 98,
    highScores: 15,
    status: "Đã đánh giá",
  },
  {
    id: "QZ-003",
    title: "Thi cuối kỳ ReactJS",
    course: "ReactJS Advanced",
    participants: 0,
    averageScore: 0,
    passRate: 0,
    highScores: 0,
    status: "Chưa diễn ra",
  },
  {
    id: "QZ-004",
    title: "Trắc nghiệm UI/UX",
    course: "Thiết kế Giao diện",
    participants: 18,
    averageScore: 5.4,
    passRate: 40,
    highScores: 2,
    status: "Đang chấm điểm",
  },
];

const statusClass = (status: string) => {
  if (status === "Đã đánh giá") return "text-green-600 font-semibold";
  if (status === "Đang chấm điểm") return "text-[#d97706] font-semibold";
  return "text-slate-500 font-semibold";
};

export default function QuizResultsReportPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="rounded-3xl border border-[#bbe7ff] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0288d1]">Thống kê</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Báo cáo Điểm thi</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Tổng hợp phổ điểm trung bình, xếp loại và tỷ lệ đỗ của các bài thi đã diễn ra.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex items-center justify-center rounded-2xl border border-[#bbe7ff] bg-white px-5 py-3 text-sm font-semibold text-[#0369a1] transition hover:bg-[#f8feff]">
              📊 Tải Báo cáo PDF
            </button>
          </div>
        </div>
      </header>

      {/* Thống kê Tổng quan */}
      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Điểm trung bình toàn hệ thống</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">7.2 <span className="text-lg text-slate-500 font-normal">/10</span></p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tỷ lệ qua môn chung</p>
          <p className="mt-4 text-3xl font-semibold text-green-600">78.5%</p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tổng bài kiểm tra đã lưu</p>
          <p className="mt-4 text-3xl font-semibold text-[#0288d1]">1,450</p>
        </div>
        <div className="rounded-3xl border border-[#bbe7ff] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Khen thưởng (Giỏi)</p>
          <p className="mt-4 text-3xl font-semibold text-[#d97706]">312 <span className="text-lg font-normal text-slate-500">HV</span></p>
        </div>
      </section>

      {/* Bảng Kết quả Bài thi */}
      <section className="rounded-3xl border border-[#bbe7ff] bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900">Thống kê theo Bài thi / Quiz mới nhất</h2>
          <input
            type="search"
            placeholder="Tìm kiếm bài thi..."
            className="w-full sm:w-64 rounded-2xl border border-[#bbe7ff] bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/30"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-[#bbe7ff] text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Báo cáo Bài thi</th>
                <th scope="col" className="px-4 py-3 font-medium text-center">Trạng thái chấm</th>
                <th scope="col" className="px-4 py-3 font-medium text-center">Điểm TB</th>
                <th scope="col" className="px-4 py-3 font-medium text-center">Tỷ lệ đỗ</th>
                <th scope="col" className="px-4 py-3 font-medium text-center">Học viên Giỏi</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbe7ff]/50">
              {QUIZ_RESULTS_DATA.map((quiz) => (
                <tr key={quiz.id} className="transition hover:bg-[#f8feff]">
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900">{quiz.title}</div>
                    <div className="text-xs text-[#0369a1] mt-1">{quiz.course}</div>
                    <div className="text-xs text-slate-500 mt-1">Lượt tham gia: {quiz.participants}</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={statusClass(quiz.status)}>{quiz.status}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-lg font-semibold text-slate-900">{quiz.averageScore}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${quiz.passRate >= 50 ? 'bg-green-100 text-green-700' : quiz.passRate === 0 ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-700'}`}>
                      {quiz.passRate}%
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-slate-700 font-medium">
                    {quiz.highScores}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="inline-block rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                      Xem phổ điểm
                    </button>
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