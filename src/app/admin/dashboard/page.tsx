const metrics = [
  { label: "Khóa học đang mở", value: 24, accent: "#87CEFA" },
  { label: "Học viên đang học", value: 1_320, accent: "#0288d1" },
  { label: "Giảng viên active", value: 34, accent: "#4f7ccf" },
  { label: "Lịch sắp tới", value: 18, accent: "#3b82f6" },
];

const reports = [
  { title: "Khóa học phổ biến", value: "React nâng cao", detail: "120 học viên" },
  { title: "Khoá sắp khai giảng", value: "UI/UX cơ bản", detail: "bắt đầu 12/06" },
  { title: "Yêu cầu nội dung", value: "Thiết kế slide", detail: "2 tài liệu chưa duyệt" },
];

const topCourses = [
  { name: "React nâng cao", students: 120, progress: "75%" },
  { name: "Node.js toàn tập", students: 98, progress: "60%" },
  { name: "Quản lý dự án Agile", students: 86, progress: "42%" },
];

const upcomingSchedules = [
  { course: "Lập trình Python", time: "10:00 - 11:30 | 30/05" },
  { course: "Kỹ năng thuyết trình", time: "14:00 - 15:30 | 31/05" },
  { course: "Thiết kế UX", time: "09:00 - 10:30 | 01/06" },
];

export default function AdminDashboardPage() {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-8 rounded-4xl bg-white/90 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0288d1]">Bảng điều khiển</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950">Tổng quan quản lý khóa học</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Theo dõi trạng thái hoạt động của khóa học, học viên, giảng viên và lịch biểu trong hệ thống.
              </p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-3xl bg-[#87CEFA] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-sky-400/20">
              Trạng thái hệ thống: <span className="rounded-full bg-white/20 px-3 py-1 text-[#0f172a]">Hoạt động tốt</span>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200/50">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                <div className="h-3 w-16 rounded-full" style={{ backgroundColor: metric.accent }} />
              </div>
              <p className="mt-6 text-4xl font-semibold text-slate-950">{metric.value.toLocaleString("vi-VN")}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-4xl bg-white p-6 shadow-sm shadow-slate-200/50">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Báo cáo nhanh</h2>
                <p className="mt-1 text-sm text-slate-500">Những chỉ số quan trọng cần theo dõi.</p>
              </div>
              <button className="rounded-2xl bg-[#87CEFA] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-400/20 hover:bg-[#6ec5f2]">
                Xem chi tiết
              </button>
            </div>
            <div className="space-y-4">
              {reports.map((item) => (
                <div key={item.title} className="rounded-3xl border border-[#e2f2ff] bg-[#f8feff] p-4">
                  <p className="text-sm font-semibold text-[#0369a1]">{item.title}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-4xl bg-white p-6 shadow-sm shadow-slate-200/50">
              <h2 className="text-xl font-semibold text-slate-950">Khóa học hàng đầu</h2>
              <div className="mt-5 space-y-4">
                {topCourses.map((course) => (
                  <div key={course.name} className="rounded-3xl border border-[#e2f2ff] p-4">
                    <p className="font-semibold text-slate-900">{course.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{course.students} học viên • tiến độ {course.progress}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-4xl bg-white p-6 shadow-sm shadow-slate-200/50">
              <h2 className="text-xl font-semibold text-slate-950">Lịch sắp tới</h2>
              <div className="mt-5 space-y-3">
                {upcomingSchedules.map((item) => (
                  <div key={item.course} className="rounded-3xl border border-[#e2f2ff] p-4">
                    <p className="font-semibold text-slate-900">{item.course}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
