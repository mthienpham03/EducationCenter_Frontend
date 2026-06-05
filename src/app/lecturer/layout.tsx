import Link from "next/link";
import type { PropsWithChildren } from "react";

const navItems = [
  { label: "Dashboard", href: "/lecturer/dashboard" },
  { label: "Course Management", href: "/lecturer/courses" },
  { label: "Content Management", href: "/lecturer/documents" },
  { label: "Assessment", href: "/lecturer/quizzes" },
  { label: "Scheduling", href: "/lecturer/schedules" },
];

export default function LecturerLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#f0f9ff] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 border-b border-slate-200 bg-[#e0f2fe] py-8 lg:w-[320px] lg:border-b-0 lg:border-r lg:bg-[#bae6fd]">
          <div className="mx-auto max-w-[320px] px-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Giảng viên</p>
                <h2 className="mt-4 text-2xl font-semibold text-slate-950">Lecturer Portal</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Quản lý giảng dạy, học liệu, bài thi và lịch biểu của bạn.
                </p>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-3xl border border-transparent bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
