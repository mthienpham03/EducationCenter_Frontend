import Link from "next/link";
import type { PropsWithChildren } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "User Management", href: "/admin/users" },
  { label: "Student Management", href: "/admin/students" },
  { label: "Teaching Assignment", href: "/admin/lecturers" },
  { label: "Course Management", href: "/admin/courses" },
  { label: "Content Management", href: "/admin/documents" },
  { label: "Assessment", href: "/admin/quizzes" },
  { label: "Scheduling", href: "/admin/schedules" },
  { label: "Notifications", href: "/admin/notifications" },
];

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#e6f5ff] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-slate-200 bg-[#ebf6ff] py-8 lg:w-[320px] lg:border-b-0 lg:border-r lg:bg-[#dbeefe]">
          <div className="mx-auto max-w-[320px] px-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Quản trị hệ thống</p>
                <h2 className="mt-4 text-2xl font-semibold text-slate-950">Admin Education</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Xem xét, điều chỉnh trạng thái và quản lý các module chính của hệ thống.
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

        <main className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
