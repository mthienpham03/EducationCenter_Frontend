export default function LecturerDashboardPage() {
  const metrics = [
    { label: "Lớp học đang dạy", value: 3, accent: "#87CEFA" },
    { label: "Tổng số học viên", value: 85, accent: "#0288d1" },
    { label: "Bài kiểm tra đã tạo", value: 12, accent: "#4f7ccf" },
    { label: "Tài liệu đã tải lên", value: 28, accent: "#3b82f6" },
  ];

  const upcomingClasses = [
    { name: "Lập trình React nâng cao - Ca 1", time: "08:00 - 10:00 | Hôm nay" },
    { name: "Lập trình Node.js cơ bản - Ca 2", time: "14:00 - 16:00 | Ngày mai" },
    { name: "Chuyên đề Fullstack Web - Ca 1", time: "08:00 - 10:00 | 10/06" },
  ];

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <header className="mb-8 rounded-4xl bg-white/90 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0288d1]">Giảng viên Portal</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-950">Tổng quan công việc giảng dạy</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Theo dõi tiến trình bài học, quản lý danh sách học viên và tổ chức các bài kiểm tra đánh giá chất lượng.
              </p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-3xl bg-[#87CEFA] px-5 py-3 text-sm font-semibold text-white shadow-sm">
              Ca dạy tiếp theo: <span className="rounded-full bg-white/20 px-3 py-1 text-[#0f172a]">08:00 - 10:00</span>
            </div>
          </div>
        </header>

        {/* Metrics */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200/50">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                <div className="h-3 w-16 rounded-full" style={{ backgroundColor: metric.accent }} />
              </div>
              <p className="mt-6 text-4xl font-semibold text-slate-950">{metric.value}</p>
            </div>
          ))}
        </section>

        {/* Detail Panel */}
        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          {/* Lịch dạy sắp tới */}
          <div className="rounded-4xl bg-white p-6 shadow-sm shadow-slate-200/50">
            <h2 className="text-xl font-bold text-slate-950 mb-5">Lịch giảng dạy sắp tới</h2>
            <div className="space-y-4">
              {upcomingClasses.map((item) => (
                <div key={item.name} className="rounded-3xl border border-[#e2f2ff] bg-[#f8feff] p-4">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Thông báo nội bộ & Hướng dẫn */}
          <div className="rounded-4xl bg-white p-6 shadow-sm shadow-slate-200/50 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950 mb-5">Ghi chú & Hướng dẫn nhanh</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-yellow-50 border border-yellow-100 text-yellow-800 text-sm">
                  <strong>Cần làm:</strong> Bạn có 2 bài tập của lớp React nâng cao chưa chấm điểm. Hãy hoàn thành trước ngày 08/06.
                </div>
                <div className="p-4 rounded-3xl bg-purple-50 border border-purple-100 text-purple-800 text-sm">
                  <strong>Thông báo:</strong> Hệ thống sẽ bảo trì định kỳ vào Chủ Nhật tuần này từ 02:00 - 04:00 sáng.
                </div>
              </div>
            </div>
            <button className="mt-6 w-full py-3 bg-[#87CEFA] text-white font-semibold rounded-2xl hover:bg-[#6ec5f2] transition-colors">
              Báo cáo sự cố giảng dạy
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
