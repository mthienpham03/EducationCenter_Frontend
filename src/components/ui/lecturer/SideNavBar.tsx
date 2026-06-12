"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNavBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Bảng điều khiển", icon: "dashboard", path: "/lecturer/dashboard" },
    { name: "Khóa học", icon: "library_books", path: "/lecturer/courses" },
    { name: "Tài liệu", icon: "description", path: "/lecturer/documents" },
    { name: "Bài kiểm tra", icon: "quiz", path: "/lecturer/quizzes" },
    { name: "Lịch học", icon: "event", path: "/lecturer/schedules" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low dark:bg-surface-container flex flex-col py-stack-md px-stack-sm z-50 overflow-y-auto">
      <div className="flex flex-col gap-base mb-stack-lg px-base">
        <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">Cổng EduCenter</span>
        <span className="font-label-md text-label-md text-on-surface-variant">Bảng điều khiển Giảng viên</span>
      </div>
      <nav className="flex-grow">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-base p-base mb-1 cursor-pointer transition-all rounded-lg ${
                isActive
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-stack-md">
        <button className="w-full bg-secondary-container text-on-secondary-container font-label-md py-base px-stack-md rounded-lg flex items-center justify-center gap-base hover:opacity-90 transition-opacity mb-stack-md">
          <span className="material-symbols-outlined">add</span>
          Khóa học mới
        </button>
        <Link
          href="/lecturer/profile"
          className={`flex items-center gap-base p-base mb-1 cursor-pointer transition-all rounded-lg ${
            pathname === "/lecturer/profile"
              ? "bg-primary-container text-on-primary-container font-bold"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
          }`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">Cài đặt</span>
        </Link>
      </div>
    </aside>
  );
}
