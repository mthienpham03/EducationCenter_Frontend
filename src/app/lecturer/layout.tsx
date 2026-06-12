import type { ReactNode } from "react";

export default function LecturerLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#87CEFA] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-[#bbe7ff] bg-white p-5 lg:w-72 lg:border-r lg:border-b-0">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0288d1]">Khu vực Giảng dạy</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Giảng viên</h2>
            <p className="mt-2 text-sm text-slate-600">Quản lý lớp học, tài liệu và điểm số.</p>
          </div>

          <nav className="space-y-2 text-sm text-slate-700">
            <a href="/lecturer/dashboard" className="block rounded-2xl px-4 py-3 text-slate-900 transition hover:bg-[#d6f1ff]">
              Trang chủ
            </a>
            <a href="/lecturer/courses" className="block rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-[#d6f1ff]">
              Khóa học phân công
            </a>
            <a href="/lecturer/documents" className="block rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-[#d6f1ff]">
              Quản lý Tài liệu
            </a>
            <a href="/lecturer/quizzes" className="block rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-[#d6f1ff]">
              Bài thi / Quizzes
            </a>
            <a href="/lecturer/schedules" className="block rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-[#d6f1ff]">
              Lịch dạy
            </a>
          </nav>
        </aside>

        <main className="flex-1 bg-transparent p-5 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}