import Link from "next/link";
import type { PropsWithChildren } from "react";

const navItems = [
  { label: "Dashboard", href: "/student/dashboard" },
  { label: "My Courses", href: "/student/courses" },
  { label: "Class Schedules", href: "/student/schedules" },
];

export default function StudentLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#faf5ff] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 border-b border-slate-200 bg-[#f3e8ff] py-8 lg:w-[320px] lg:border-b-0 lg:border-r lg:bg-[#e9d5ff]">
          <div className="mx-auto max-w-[320px] px-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-600">Học viên</p>
                <h2 className="mt-4 text-2xl font-semibold text-slate-950">Student Portal</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Xem lộ trình học tập, lịch học, lịch kiểm tra của lớp.
                </p>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-3xl border border-transparent bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-slate-900"
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
