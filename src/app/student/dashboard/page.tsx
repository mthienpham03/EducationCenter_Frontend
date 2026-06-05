export default function StudentDashboardPage() {
  const metrics = [
    { label: "Khóa học tham gia", value: 2, accent: "#c084fc" },
    { label: "Bài kiểm tra cần làm", value: 1, accent: "#a855f7" },
    { label: "Tài liệu đã tải xuống", value: 14, accent: "#818cf8" },
    { label: "Điểm trung bình học tập", value: "8.5 / 10", accent: "#6366f1" },
  ];

  const classSchedules = [
    { course: "Lập trình React nâng cao", time: "08:00 - 10:00 | Thứ 2 - Thứ 4 - Thứ 6", room: "Phòng học ảo Zoom 1" },
    { course: "Kỹ năng mềm cho lập trình viên", time: "14:00 - 16:00 | Thứ 7 hàng tuần", room: "Phòng học ảo Zoom 3" },
  ];

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <header className="mb-8 rounded-4xl bg-white/90 p-8 shadow-xl shadow-purple-200/40 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a855f7]">Học viên Portal</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-950">Bảng điều khiển học tập cá nhân</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Theo dõi lịch học cá nhân, tiến độ hoàn thành các khóa học và kết quả kiểm tra đánh giá từ giảng viên.
              </p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-3xl bg-[#c084fc] px-5 py-3 text-sm font-semibold text-white shadow-sm">
              Lớp học tiếp theo: <span className="rounded-full bg-white/20 px-3 py-1 text-[#0f172a]">08:00 Thứ Hai</span>
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
          {/* Lịch học tuần này */}
          <div className="rounded-4xl bg-white p-6 shadow-sm shadow-slate-200/50">
            <h2 className="text-xl font-bold text-slate-950 mb-5">Lịch học tuần này</h2>
            <div className="space-y-4">
              {classSchedules.map((item) => (
                <div key={item.course} className="rounded-3xl border border-[#f3e8ff] bg-[#faf5ff] p-4">
                  <p className="font-semibold text-slate-900">{item.course}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.time}</p>
                  <p className="mt-2 text-xs text-purple-700 bg-purple-100/50 px-2.5 py-1 rounded-full inline-block font-medium">
                    📍 {item.room}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Hộp thoại thông báo & nhắc nhở */}
          <div className="rounded-4xl bg-white p-6 shadow-sm shadow-slate-200/50 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950 mb-5">Nhắc nhở học tập</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-red-50 border border-red-100 text-red-800 text-sm">
                  <strong>Hạn chót:</strong> Bạn có bài kiểm tra trắc nghiệm môn "React nâng cao" cần hoàn thành trước 23:59 hôm nay.
                </div>
                <div className="p-4 rounded-3xl bg-green-50 border border-green-100 text-green-800 text-sm">
                  <strong>Học tập:</strong> Giảng viên vừa đăng tải tài liệu học tập mới cho chương 4 môn Node.js.
                </div>
              </div>
            </div>
            <button className="mt-6 w-full py-3 bg-[#c084fc] text-white font-semibold rounded-2xl hover:bg-[#b572fa] transition-colors">
              Xem bảng điểm chi tiết
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
