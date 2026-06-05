"use client";

import Link from "next/link";

export default function LecturerDashboardPage() {
  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Bảng điều khiển</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Chào mừng trở lại! Xem nhanh các số liệu thống kê giảng dạy của bạn hôm nay.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between h-48">
          <div>
            <span className="material-symbols-outlined text-3xl text-primary mb-2">schedule</span>
            <h3 className="font-headline-md text-lg text-on-surface">Lịch dạy tiếp theo</h3>
            <p className="text-body-md text-on-surface-variant mt-1">IELTS Mastery - Phòng 204</p>
          </div>
          <p className="text-caption font-semibold text-primary">Hôm nay, 18:30 - 20:30</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between h-48">
          <div>
            <span className="material-symbols-outlined text-3xl text-secondary mb-2">pending_actions</span>
            <h3 className="font-headline-md text-lg text-on-surface">Bài tập cần chấm</h3>
            <p className="text-body-md text-on-surface-variant mt-1">12 bài luận Writing Task 1 mới nộp</p>
          </div>
          <Link href="/lecturer/documents" className="text-caption font-semibold text-secondary hover:underline">
            Chấm bài ngay &rarr;
          </Link>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between h-48">
          <div>
            <span className="material-symbols-outlined text-3xl text-tertiary mb-2">campaign</span>
            <h3 className="font-headline-md text-lg text-on-surface">Thông báo mới</h3>
            <p className="text-body-md text-on-surface-variant mt-1">Họp chuyên môn cuối tháng 6</p>
          </div>
          <p className="text-caption font-semibold text-tertiary">Ngày 28 tháng 6</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <h3 className="font-headline-md text-lg text-on-surface mb-4">Hoạt động gần đây</h3>
        <div className="space-y-4">
          <div className="flex gap-4 items-start pb-4 border-b border-outline-variant/20">
            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
            <div>
              <p className="text-body-md text-on-surface">Cập nhật chương trình <strong>IELTS Mastery (Standard Edition)</strong></p>
              <p className="text-caption text-on-surface-variant">2 giờ trước</p>
            </div>
          </div>
          <div className="flex gap-4 items-start pb-4 border-b border-outline-variant/20">
            <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
            <div>
              <p className="text-body-md text-on-surface">Học viên <strong>Nguyễn Văn A</strong> đã nộp bài tập &ldquo;Comparing Bar Charts&rdquo;</p>
              <p className="text-caption text-on-surface-variant">5 giờ trước</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-2 h-2 rounded-full bg-tertiary mt-2"></div>
            <div>
              <p className="text-body-md text-on-surface">Đăng ký mới: <strong>Trần Thị B</strong> tham gia lớp IELTS Writing</p>
              <p className="text-caption text-on-surface-variant">1 ngày trước</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
