import type { ReactNode } from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#87CEFA] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-[#bbe7ff] bg-white p-5 lg:w-72 lg:border-r lg:border-b-0">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0288d1]">Quản trị hệ thống</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Admin Education</h2>
            <p className="mt-2 text-sm text-slate-600">Giao diện quản lý tài khoản giảng viên và học viên.</p>
          </div>

          <nav className="space-y-2 text-sm text-slate-700">
            <a href="/admin/accounts" className="block rounded-2xl px-4 py-3 text-slate-900 transition hover:bg-[#d6f1ff]">
              Quản lý tài khoản
            </a>
            <a href="/admin/courses" className="block rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-[#d6f1ff]">
              Khóa học
            </a>
            <a href="/admin/students" className="block rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-[#d6f1ff]">
              Học viên
            </a>
            <a href="/admin/lecturers" className="block rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-[#d6f1ff]">
              Giảng viên
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
